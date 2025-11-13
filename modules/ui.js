// modules/ui.js

/**
 * Renders all current pipeline steps to the DOM.
 * @param {Array<object>} steps - The array of pipeline steps.
 * @param {HTMLElement} stepsEl - The DOM element to render into.
 */
export function renderPipelineSteps(steps, stepsEl) {
    stepsEl.innerHTML = ''; // Clear existing steps
    steps.forEach((step, index) => {
        const stepEl = document.createElement('div');
        // The .step-card class is now styled in style.css for dark mode
        stepEl.className = 'step-card border border-slate-200 dark:border-slate-700 p-4 rounded-lg shadow-sm';
        stepEl.setAttribute('data-id', step.id);
        stepEl.innerHTML = getStepHtml(step); // Uses the helper below
        stepsEl.appendChild(stepEl);
    });
}

// UPDATED: Added dark: variants to the class strings
const formInputClasses = "block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200 dark:placeholder-slate-400";
const formSelectClasses = "form-select block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200";
const btnOutlineClasses = "text-xs px-2 py-1 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-md shadow-sm dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600 dark:border-slate-600";


/**
 * Returns the HTML for a single step card.
 * This is a helper function and is not exported.
 * @param {object} step - The step object.
 * @returns {string} - The HTML string for the step card.
 */
function getStepHtml(step) {
    // UPDATED: Added dark: variants for text
    const commonHeader = `
        <div class="flex justify-between items-center mb-3">
            <h3 class="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">${step.type}</h3>
            <button data-action="remove" class="text-slate-400 hover:text-red-500" title="Remove step">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
            </button>
        </div>
    `;

    switch (step.type) {
        case 'cut':
            return `
                ${commonHeader}
                <div class="grid grid-cols-2 gap-3">
                    <div>
                        <label for="cut_d_${step.id}" class="block text-sm font-medium text-slate-700 dark:text-slate-300">Delimiter (-d)</label>
                        <input type="text" name="d" id="cut_d_${step.id}" value="${step.options.d || ','}" class="${formInputClasses} mt-1 text-sm">
                        <div class="flex flex-wrap gap-2 mt-2">
                            <button class="${btnOutlineClasses} delimiter-btn" data-target="cut_d_${step.id}" data-value=",">CSV (,)</button>
                            <button class="${btnOutlineClasses} delimiter-btn" data-target="cut_d_${step.id}" data-value="\t">TSV (Tab)</button>
                            <button class="${btnOutlineClasses} delimiter-btn" data-target="cut_d_${step.id}" data-value=" ">Space</button>
                        </div>
                    </div>
                    <div>
                        <label for="cut_f_${step.id}" class="block text-sm font-medium text-slate-700 dark:text-slate-300">Fields (-f)</label>
                        <input type="text" name="f" id="cut_f_${step.id}" value="${step.options.f || ''}" class="${formInputClasses} mt-1 text-sm" placeholder="e.g., 1,3">
                    </div>
                </div>
            `;
        case 'grep':
            return `
                ${commonHeader}
                <div class="space-y-3">
                    <div>
                        <label for="grep_pattern_${step.id}" class="block text-sm font-medium text-slate-700 dark:text-slate-300">Pattern</label>
                        <input type="text" name="pattern" id="grep_pattern_${step.id}" value="${step.options.pattern || ''}" class="${formInputClasses} mt-1" placeholder="Text or regex to find">
                    </div>
                    <div class="flex items-center gap-4">
                        <div class="flex items-center">
                            <input type="checkbox" name="i" id="grep_i_${step.id}" ${step.options.i ? 'checked' : ''} class="h-4 w-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500">
                            <label for="grep_i_${step.id}" class="ml-2 block text-sm text-slate-700 dark:text-slate-300">Case-insensitive (-i)</label>
                        </div>
                        <div class="flex items-center">
                            <input type="checkbox" name="v" id="grep_v_${step.id}" ${step.options.v ? 'checked' : ''} class="h-4 w-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500">
                            <label for="grep_v_${step.id}" class="ml-2 block text-sm text-slate-700 dark:text-slate-300">Invert match (-v)</label>
                        </div>
                        <div class="flex items-center">
                            <input type="checkbox" name="F" id="grep_F_${step.id}" ${step.options.F ? 'checked' : ''} class="h-4 w-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500">
                            <label for="grep_F_${step.id}" class="ml-2 block text-sm text-slate-700 dark:text-slate-300">Fixed string (-F)</label>
                        </div>
                    </div>
                </div>
            `;
        case 'sort':
            return `
                ${commonHeader}
                <div class="flex items-center">
                    <input type="checkbox" name="r" id="sort_r_${step.id}" ${step.options.r ? 'checked' : ''} class="h-4 w-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500">
                    <label for="sort_r_${step.id}" class="ml-2 block text-sm text-slate-700 dark:text-slate-300">Reverse order (-r)</label>
                </div>
            `;
        case 'uniq':
            // UPDATED: Added dark: variants for text
            return `${commonHeader}<p class="text-sm text-slate-600 dark:text-slate-400">Removes adjacent duplicate lines. (Use 'sort' first for a unique list)</p>`;
        case 'head':
            return `
                ${commonHeader}
                <div>
                    <label for="head_n_${step.id}" class="block text-sm font-medium text-slate-700 dark:text-slate-300">Number of lines (-n)</label>
                    <input type="number" name="n" id="head_n_${step.id}" value="${step.options.n || 10}" class="${formInputClasses} mt-1 w-24">
                </div>
            `;
        case 'tail':
            return `
                ${commonHeader}
                <div>
                    <label for="tail_n_${step.id}" class="block text-sm font-medium text-slate-700 dark:text-slate-300">Number of lines (-n)</label>
                    <input type="number" name="n" id="tail_n_${step.id}" value="${step.options.n || 10}" class="${formInputClasses} mt-1 w-24">
                </div>
            `;
        case 'tr':
            return `
                ${commonHeader}
                <div class="space-y-3">
                    <div>
                        <label for="tr_set1_${step.id}" class="block text-sm font-medium text-slate-700 dark:text-slate-300">Characters 1 (SET1)</label>
                        <input type="text" name="set1" id="tr_set1_${step.id}" value="${step.options.set1 || ''}" class="${formInputClasses} mt-1 text-sm font-mono" placeholder="e.g., abc">
                    </div>
                    <div>
                        <label for="tr_set2_${step.id}" class="block text-sm font-medium text-slate-700 dark:text-slate-300">Characters 2 (SET2)</label>
                        <input type="text" name="set2" id="tr_set2_${step.id}" value="${step.options.set2 || ''}" class="${formInputClasses} mt-1 text-sm font-mono" placeholder="e.g., ABC">
                    </div>
                     <div class="flex items-center gap-4">
                        <div class="flex items-center">
                            <input type="checkbox" name="d" id="tr_d_${step.id}" ${step.options.d ? 'checked' : ''} class="h-4 w-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500">
                            <label for="tr_d_${step.id}" class="ml-2 block text-sm text-slate-700 dark:text-slate-300">Delete (-d) SET1</label>
                        </div>
                        <div class="flex items-center">
                            <input type="checkbox" name="s" id="tr_s_${step.id}" ${step.options.s ? 'checked' : ''} class="h-4 w-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500">
                            <label for="tr_s_${step.id}" class="ml-2 block text-sm text-slate-700 dark:text-slate-300">Squeeze (-s) SET1</text-sm>
                        </div>
                    </div>
                </div>
            `;
        case 'wc':
            return `
                ${commonHeader}
                <p class="text-sm text-slate-600 dark:text-slate-400 mb-3">Counts lines, words, and/or characters. (Default is all three)</p>
                 <div class="flex items-center gap-4">
                    <div class="flex items-center">
                        <input type="checkbox" name="l" id="wc_l_${step.id}" ${step.options.l ? 'checked' : ''} class="h-4 w-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500">
                        <label for="wc_l_${step.id}" class="ml-2 block text-sm text-slate-700 dark:text-slate-300">Lines (-l)</label>
                    </div>
                    <div class="flex items-center">
                        <input type="checkbox" name="w" id="wc_w_${step.id}" ${step.options.w ? 'checked' : ''} class="h-4 w-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500">
                        <label for="wc_w_${step.id}" class="ml-2 block text-sm text-slate-700 dark:text-slate-300">Words (-w)</label>
                    </div>
                    <div class="flex items-center">
                        <input type="checkbox" name="c" id="wc_c_${step.id}" ${step.options.c ? 'checked' : ''} class="h-4 w-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500">
                        <label for="wc_c_${step.id}" class="ml-2 block text-sm text-slate-700 dark:text-slate-300">Characters (-c)</label>
                    </div>
                </div>
            `;
        case 'awk':
            const program = step.options.program || '{ print $0 }';
            return `
                ${commonHeader}
                <div class="space-y-3">
                    <div>
                        <label for="awk_F_${step.id}" class="block text-sm font-medium text-slate-700 dark:text-slate-300">Field Separator (-F)</label>
                        <input type="text" name="F" id="awk_F_${step.id}" value="${step.options.F || ''}" class="${formInputClasses} mt-1 text-sm" placeholder="Default: whitespace">
                        <div class="flex flex-wrap gap-2 mt-2">
                            <button class="${btnOutlineClasses} delimiter-btn" data-target="awk_F_${step.id}" data-value=",">CSV (,)</button>
                            <button class="${btnOutlineClasses} delimiter-btn" data-target="awk_F_${step.id}" data-value="\t">TSV (Tab)</button>
                            <button class="${btnOutlineClasses} delimiter-btn" data-target="awk_F_${step.id}" data-value="">Whitespace</button>
                        </div>
                    </div>
                    <div>
                        <label for="awk_template_${step.id}" class="block text-sm font-medium text-slate-700 dark:text-slate-300">Program Templates</label>
                        <select id="awk_template_${step.id}" data-target="awk_program_${step.id}" class="${formSelectClasses} awk-template-select mt-1">
                            <option value="" selected>Select a template...</option>
                            <option value='{ print $1, $3 }'>Print Columns (e.g., 1 and 3)</option>
                            <option value='$1 > 100 { print $0 }'>Filter Rows (e.g., col 1 > 100)</option>
                            <option value='{ $3 = $1 + $2; print $0 }'>New Column (e.g., col 3 = col 1 + 2)</option>
                            <option value='BEGIN { total=0 } { total+=$1 } END { print total }'>Sum a Column (e.g., col 1)</option>
                            <option value='BEGIN { c=0; t=0 } { c++; t+=$1 } END { print t/c }'>Average a Column (e.g., col 1)</option>
                        </select>
                    </div>
                    <div>
                        <label for="awk_program_${step.id}" class="block text-sm font-medium text-slate-700 dark:text-slate-300">AWK Program</label>
                        <textarea name="program" id="awk_program_${step.id}" class="${formInputClasses} mt-1 font-mono text-sm" rows="3">${program}</textarea>
                        <p class="mt-1 text-xs text-slate-500 dark:text-slate-400">Note: Live preview only supports basic 'print' commands. Generated command will be correct.</p>
                    </div>
                </div>
            `;
        default:
            return `${commonHeader}<p>Unknown step type: ${step.type}</p>`;
    }
}