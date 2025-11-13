// modules/pipeline.js

/**
 * Takes the input text and applies all pipeline steps sequentially.
 * @param {string} text - The initial input text.
 * @param {Array<object>} pipelineSteps - The array of step objects.
 * @returns {string} - The final, processed text.
 */
export function processPipeline(text, pipelineSteps) {
    let currentText = text;
    let currentLines = currentText.split('\n');

    for (const step of pipelineSteps) {
        if (currentText.startsWith("Error: Preview not available")) {
            return currentText;
        }

        try {
            switch (step.type) {
                case 'cut':
                    currentLines = currentLines.map(line => {
                        const delimiter = step.options.d === '\t' ? /\t/ : (step.options.d || ',');
                        const parts = line.split(delimiter);
                        // FIX: Use (step.options.f || '') to prevent crash if f is undefined
                        const fields = (step.options.f || '').split(',').map(Number);
                        return fields.map(f => parts[f - 1] || '').join(step.options.d || ',');
                    });
                    break;
                case 'grep':
                    const searchTerm = step.options.v ? step.options.v : (step.options.pattern || '');
                    const isRegex = !step.options.F; // Not fixed string
                    const isCaseInsensitive = !!step.options.i;
                    let regexFlags = isCaseInsensitive ? 'i' : '';

                    let regex;
                    if (isRegex) {
                        regex = new RegExp(searchTerm, regexFlags);
                    } else {
                        // Escape special regex chars for fixed string search
                        const escapedSearchTerm = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                        regex = new RegExp(escapedSearchTerm, regexFlags);
                    }

                    currentLines = currentLines.filter(line => {
                        const match = regex.test(line);
                        return step.options.v ? !match : match; // Invert logic for -v
                    });
                    break;
                case 'sort':
                    // Simple string sort
                    currentLines.sort();
                    if (step.options.r) {
                        currentLines.reverse();
                    }
                    break;
                case 'uniq':
                    let newLines = [];
                    if (currentLines.length > 0) {
                        newLines.push(currentLines[0]);
                        for (let i = 1; i < currentLines.length; i++) {
                            if (currentLines[i] !== currentLines[i - 1]) {
                                newLines.push(currentLines[i]);
                            }
                        }
                    }
                    currentLines = newLines;
                    break;
                case 'head':
                    currentLines = currentLines.slice(0, Number(step.options.n || 10));
                    break;
                case 'tail':
                    currentLines = currentLines.slice(-Number(step.options.n || 10));
                    break;
                case 'tr':
                    const set1 = step.options.set1 || '';
                    const set2 = step.options.set2 || '';

                    if (step.options.d) { // Delete
                        const regex = new RegExp(`[${set1.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}]`, 'g');
                        currentLines = currentLines.map(line => line.replace(regex, ''));
                    } else if (step.options.s) { // Squeeze
                        const regex = new RegExp(`([${set1.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}])\\1+`, 'g');
                        currentLines = currentLines.map(line => line.replace(regex, '$1'));
                    } else { // Translate
                        currentLines = currentLines.map(line => {
                            let newLine = '';
                            for (const char of line) {
                                const index = set1.indexOf(char);
                                if (index !== -1) {
                                    newLine += set2[index] || ''; // Use char from set2
                                } else {
                                    newLine += char; // Keep original char
                                }
                            }
                            return newLine;
                        });
                    }
                    break;
                case 'wc':
                    const lineCount = currentLines.length;
                    const wordCount = currentLines.join(' ').split(/\s+/).filter(Boolean).length;
                    const charCount = currentText.length;

                    let wcOutput = [];
                    if (step.options.l) wcOutput.push(lineCount);
                    if (step.options.w) wcOutput.push(wordCount);
                    if (step.options.c) wcOutput.push(charCount);
                    if (wcOutput.length === 0) {
                        wcOutput = [lineCount, wordCount, charCount];
                    }
                    currentLines = [wcOutput.join('\t')];
                    break;
                case 'awk':
                    // Simplified awk preview for print
                    const awkProgram = step.options.program || '{ print $0 }';
                    const printMatch = awkProgram.match(/{ ?print (\$[0-9, ]+) ?}/);

                    if (printMatch) {
                        const fields = printMatch[1].split(',').map(f => f.trim().substring(1));
                        const delimiter = step.options.F === '\t' ? /\t/ : (step.options.F || /\s+/);
                        currentLines = currentLines.map(line => {
                            const parts = line.split(delimiter);
                            return fields.map(f => parts[f - 1] || '').join(' ');
                        });
                    } else {
                        // For complex awk, preview isn't possible
                        return "Error: Preview not available for complex awk programs. Check the generated command.";
                    }
                    break;
            }
        } catch (err) {
            console.error("Error processing step:", step, err);
            return `Error in step ${step.type}: ${err.message}`;
        }

        currentText = currentLines.join('\n');
    }

    return currentText;
}