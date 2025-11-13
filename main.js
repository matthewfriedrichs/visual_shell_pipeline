// --- IMPORTS ---
import { renderPipelineSteps } from './modules/ui.js';
import { processPipeline } from './modules/pipeline.js';
import { parseCommandString } from './modules/parser.js';
import { handleFileLoad, loadSheet } from './modules/importer.js';

// --- STATE ---
let pipelineSteps = [];

// --- ELEMENT SELECTORS ---
const inputDataEl = document.getElementById('input-data');
const livePreviewEl = document.getElementById('live-preview');
const pipelineStepsEl = document.getElementById('pipeline-steps');
const addStepSelectEl = document.getElementById('add-step-select');
const addStepBtnEl = document.getElementById('add-step-btn');
const generatedCommandEl = document.getElementById('generated-command-box');
const copyCommandBtnEl = document.getElementById('copy-command-btn');
const parseCommandInputEl = document.getElementById('parse-command-input');
const parseCommandBtnEl = document.getElementById('parse-command-btn');
const formatCommandCheckEl = document.getElementById('format-command-check');
const previewErrorEl = document.getElementById('preview-error');

// File Uploader Elements
const fileUploaderEl = document.getElementById('file-uploader');
const sheetSelectorContainerEl = document.getElementById('sheet-selector-container');
const sheetSelectorEl = document.getElementById('sheet-selector');
const loadSheetBtnEl = document.getElementById('load-sheet-btn');

// NEW: Theme Toggle Elements
const themeToggleBtn = document.getElementById('theme-toggle');
const moonIcon = document.getElementById('moon-icon');
const sunIcon = document.getElementById('sun-icon');


// --- CORE LOGIC & HANDLERS ---

function updateOutput() {
    try {
        const inputText = inputDataEl.value;
        const outputText = processPipeline(inputText, pipelineSteps);

        if (outputText.startsWith("Error:")) {
            previewErrorEl.textContent = outputText;
            previewErrorEl.classList.remove('hidden');
            livePreviewEl.textContent = '';
        } else {
            previewErrorEl.textContent = '';
            previewErrorEl.classList.add('hidden');
            livePreviewEl.textContent = outputText;
        }
        updateGeneratedCommand();
    } catch (err) {
        console.error("Error updating output:", err);
        previewErrorEl.textContent = `A critical error occurred: ${err.message}`;
        previewErrorEl.classList.remove('hidden');
    }
}

function buildShellCommand(isFormatted) {
    const joiner = isFormatted ? " | \\\n  " : " | ";

    return pipelineSteps.reduce((cmd, step) => {
        let stepCmd = '';
        // (Switch statement for building command - no changes)
        switch (step.type) {
            case 'cut':
                const d = step.options.d === '\t' ? "$'\\t'" : `'${(step.options.d || ',')}'`;
                stepCmd = `cut -d${d} -f'${(step.options.f || '')}'`;
                break;
            case 'grep':
                const flags = [
                    step.options.i ? '-i' : '',
                    step.options.v ? '-v' : '',
                    step.options.F ? '-F' : '',
                ].filter(Boolean).join(' ');
                const pattern = step.options.v ? step.options.v : (step.options.pattern || '');
                stepCmd = `grep ${flags} '${pattern}'`;
                break;
            case 'sort':
                stepCmd = `sort ${step.options.r ? '-r' : ''}`;
                break;
            case 'uniq':
                stepCmd = `uniq`;
                break;
            case 'head':
                stepCmd = `head -n ${step.options.n || 10}`;
                break;
            case 'tail':
                stepCmd = `tail -n ${step.options.n || 10}`;
                break;
            case 'tr':
                const trFlags = [
                    step.options.d ? '-d' : '',
                    step.options.s ? '-s' : '',
                ].filter(Boolean).join('');
                stepCmd = `tr ${trFlags} '${step.options.set1 || ''}' '${step.options.set2 || ''}'`;
                break;
            case 'wc':
                const wcFlags = [
                    step.options.l ? '-l' : '',
                    step.options.w ? '-w' : '',
                    step.options.c ? '-c' : '',
                ].filter(Boolean).join(' ');
                stepCmd = `wc ${wcFlags}`;
                break;
            case 'awk':
                const f = step.options.F === '\t' ? "$'\\t'" : `'${(step.options.F || '')}'`;
                const awkF = step.options.F ? `-F${f} ` : '';
                stepCmd = `awk ${awkF}'${step.options.program || '{ print $0 }'}'`;
                break;
        }
        return cmd + joiner + stepCmd;
    }, "cat YOUR_FILE.csv");
}

function updateGeneratedCommand() {
    const format = formatCommandCheckEl.checked;
    const command = buildShellCommand(format);
    generatedCommandEl.textContent = command;
}

function addStep(type) {
    let defaultOptions = {};
    // (Switch statement for default options - no changes)
    switch (type) {
        case 'cut':
            defaultOptions = { d: ',', f: '1' };
            break;
        case 'grep':
            defaultOptions = { pattern: 'search', i: false, v: false, F: false };
            break;
        case 'sort':
            defaultOptions = { r: false };
            break;
        case 'uniq':
            defaultOptions = {};
            break;
        case 'head':
            defaultOptions = { n: '10' };
            break;
        case 'tail':
            defaultOptions = { n: '10' };
            break;
        case 'tr':
            defaultOptions = { set1: '', set2: '', d: false, s: false };
            break;
        case 'wc':
            defaultOptions = { l: false, w: false, c: false };
            break;
        case 'awk':
            defaultOptions = { F: '', program: '{ print $0 }' };
            break;
    }
    pipelineSteps.push({
        id: Date.now() + Math.random(),
        type: type,
        options: defaultOptions
    });
    renderPipelineSteps(pipelineSteps, pipelineStepsEl);
    updateOutput();
}

function removeStep(id) {
    pipelineSteps = pipelineSteps.filter(step => step.id !== Number(id));
    renderPipelineSteps(pipelineSteps, pipelineStepsEl);
    updateOutput();
}

function updateStepOption(id, key, value) {
    const step = pipelineSteps.find(step => step.id === Number(id));
    if (step) {
        step.options[key] = value;
        updateOutput();
    }
}

// --- EVENT HANDLERS ---

function handleAddStep() {
    const selectedType = addStepSelectEl.value;
    if (selectedType) {
        addStep(selectedType);
        addStepSelectEl.value = '';
    }
}

function handleCopyCommand() {
    const command = buildShellCommand(false);

    navigator.clipboard.writeText(command).then(() => {
        copyCommandBtnEl.innerHTML = '<svg ...>...</svg> Copied!'; // (Abbreviated for clarity)
        setTimeout(() => {
            copyCommandBtnEl.innerHTML = '<svg ...>...</svg> Copy'; // (Abbreviated for clarity)
        }, 2000);
    }).catch(err => {
        console.error('Failed to copy: ', err);
        // Fallback
        const textarea = document.createElement('textarea');
        textarea.value = command;
        document.body.appendChild(textarea);
        textarea.select();
        try {
            document.execCommand('copy');
        } catch (err) {
            console.error('Fallback copy failed: ', err);
        }
        document.body.removeChild(textarea);
    });
}

function handleParseCommand() {
    const commandString = parseCommandInputEl.value;
    try {
        const newSteps = parseCommandString(commandString);
        pipelineSteps = newSteps;
        renderPipelineSteps(pipelineSteps, pipelineStepsEl);
        updateOutput();
        previewErrorEl.textContent = '';
        previewErrorEl.classList.add('hidden');
    } catch (err) {
        console.error("Failed to parse command:", err);
        previewErrorEl.textContent = `Parse Error: ${err.message}`;
        previewErrorEl.classList.remove('hidden');
    }
}

function handleStepClick(e) {
    // (Event delegation logic - no changes)
    if (e.target.closest('[data-action="remove"]')) {
        e.preventDefault();
        const stepEl = e.target.closest('.step-card');
        if (stepEl) {
            removeStep(stepEl.dataset.id);
        }
    }
    if (e.target.classList.contains('delimiter-btn')) {
        e.preventDefault();
        const targetInput = document.getElementById(e.target.dataset.target);
        if (targetInput) {
            targetInput.value = e.target.dataset.value;
            targetInput.dispatchEvent(new Event('input', { bubbles: true }));
        }
    }
    if (e.target.classList.contains('awk-template-select')) {
        const program = e.target.value;
        if (program) {
            const targetTextarea = document.getElementById(e.target.dataset.target);
            if (targetTextarea) {
                targetTextarea.value = program;
                targetTextarea.dispatchEvent(new Event('input', { bubbles: true }));
            }
        }
    }
}

function handleStepChange(e) {
    // (Event delegation logic - no changes)
    const stepEl = e.target.closest('.step-card');
    if (!stepEl) return;
    const id = Number(stepEl.dataset.id);
    const key = e.target.name;
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    if (key) {
        updateStepOption(id, key, value);
    }
}


// --- EVENT LISTENERS ---
inputDataEl.addEventListener('input', updateOutput);
addStepBtnEl.addEventListener('click', handleAddStep);
pipelineStepsEl.addEventListener('click', handleStepClick);
pipelineStepsEl.addEventListener('input', handleStepChange);
copyCommandBtnEl.addEventListener('click', handleCopyCommand);
parseCommandBtnEl.addEventListener('click', handleParseCommand);
formatCommandCheckEl.addEventListener('change', updateGeneratedCommand);

// File Uploader Listeners
fileUploaderEl.addEventListener('change', (e) => {
    handleFileLoad(e, inputDataEl, sheetSelectorContainerEl, sheetSelectorEl, updateOutput);
});
loadSheetBtnEl.addEventListener('click', () => {
    loadSheet(inputDataEl, sheetSelectorEl, updateOutput);
});

// NEW: Theme Toggle Listener
themeToggleBtn.addEventListener('click', () => {
    // Toggle the 'dark' class on the <body>
    document.body.classList.toggle('dark');

    // Toggle the visibility of the Sun/Moon icons
    moonIcon.classList.toggle('hidden');
    sunIcon.classList.toggle('hidden');
});

// Initial call
updateOutput();