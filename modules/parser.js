// modules/parser.js

/**
 * Parses a shell command string into pipeline steps.
 * @param {string} commandString - The shell command.
 * @returns {Array<object>} - An array of step objects.
 */
export function parseCommandString(commandString) {
    // Sanitize: remove line continuations and newlines
    const singleLineCommand = commandString
        .replace(/\\\n\s*/g, ' ') // Remove \ at end of line
        .replace(/\n/g, ' ')     // Remove other newlines
        .trim();

    const parts = singleLineCommand.split('|').map(s => s.trim());
    // We ignore the first part (e.g., "cat YOUR_FILE.csv")
    const commandParts = parts.slice(1);

    return commandParts.map((part, index) => {
        const [cmd, ...args] = part.split(' ').filter(Boolean);
        const step = {
            id: Date.now() + Math.random(), // Generate a unique ID
            type: cmd,
            options: {}
        };

        try {
            parseSingleCommand(step, args); // Use helper
        } catch (e) {
            throw new Error(`Error parsing '${part}': ${e.message}`);
        }
        return step;
    });
}

/**
 * Helper to parse arguments for a single command.
 * Modifies the step.options object in place.
 * This function is not exported.
 */
function parseSingleCommand(step, args) {
    // Define known boolean flags (ones that don't take a value)
    const boolFlags = {
        sort: ['r'],
        grep: ['i', 'v', 'F'],
        uniq: [],
        tr: ['d', 's'],
        wc: ['l', 'w', 'c']
    };

    let i = 0;
    while (i < args.length) {
        const arg = args[i];

        // --- Handle Quoted/Positional Arguments ---
        // e.g., awk '{...}' or grep 'pattern'
        if (!arg.startsWith('-')) {
            const value = arg.replace(/['"]/g, ''); // Naive unquote
            if (step.type === 'grep' && !step.options.pattern) {
                step.options.pattern = value;
            } else if (step.type === 'awk' && arg.startsWith("'") && arg.endsWith("'")) {
                step.options.program = arg.slice(1, -1);
            }
            i++;
            continue;
        }

        // --- Handle Flags ---
        // This regex handles combined flags like -iv
        const flags = arg.substring(1).split('');

        for (const flag of flags) {
            // Check if it's a known boolean flag for this command
            const isBoolFlag = (boolFlags[step.type] || []).includes(flag);

            if (isBoolFlag) {
                step.options[flag] = true;
                // Don't increment i, as we're still processing 'arg'
            } else {
                // It's a flag that expects a value, e.g., -f 1 or -n 10
                // Check if next argument is the value
                if (i + 1 < args.length && !args[i + 1].startsWith('-')) {
                    let value = args[i + 1].replace(/['"$]/g, ''); // Naive unquote
                    if (value === '\\t') value = '\t'; // Handle tab
                    step.options[flag] = value;
                    i++; // Consume the value argument
                    break; // Move to the next 'arg'
                } else {
                    // Flag is missing its value, e.g., "cut -f | ..."
                    // Or it's a combined flag where the value is attached e.g. -f1
                    // This parser is simple and doesn't handle -f1, only -f 1
                    // Do *not* set it to true. Just skip it.
                }
            }
        }
        i++; // Move to the next 'arg'
    }

    // Post-processing for grep (pattern might be in a weird place)
    if (step.type === 'grep') {
        // This handles "grep -v 'pattern'" where 'pattern' was assigned to 'v'
        const flagsToReCheck = ['v', 'i', 'F'];
        flagsToReCheck.forEach(flag => {
            if (step.options[flag] && typeof step.options[flag] === 'string') {
                if (!step.options.pattern) {
                    step.options.pattern = step.options[flag];
                }
                step.options[flag] = true; // Set it back to a boolean
            }
        });
    }
}