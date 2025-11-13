// modules/importer.js

// This state is local to this module
let workbook = null;

/**
 * Handles the file input 'change' event.
 * @param {Event} e - The file change event.
 * @param {HTMLTextAreaElement} inputEl - The textarea to put data into.
 * @param {HTMLElement} sheetContainerEl - The DOM element for the sheet selector.
 * @param {HTMLSelectElement} sheetSelectorEl - The dropdown for sheet names.
 * @param {Function} updateFn - The callback function to run after loading (e.g., updateOutput).
 */
export function handleFileLoad(e, inputEl, sheetContainerEl, sheetSelectorEl, updateFn) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    // Check for CSV, simple text read
    if (file.name.endsWith('.csv')) {
        reader.onload = (e) => {
            inputEl.value = e.target.result;
            updateFn(); // Call the callback
        };
        reader.readAsText(file);
        // Reset sheet selector
        workbook = null;
        sheetContainerEl.classList.add('hidden');
        return;
    }

    // Handle Excel files
    reader.onload = (e) => {
        const data = new Uint8Array(e.target.result);
        try {
            // Note: This relies on the global XLSX object from the SheetJS <script> tag
            workbook = XLSX.read(data, { type: 'array' });

            // Populate sheet selector
            sheetSelectorEl.innerHTML = '';
            workbook.SheetNames.forEach(sheetName => {
                const option = document.createElement('option');
                option.value = sheetName;
                option.textContent = sheetName;
                sheetSelectorEl.appendChild(option);
            });

            sheetContainerEl.classList.remove('hidden');
            // Automatically load the first sheet
            loadSheet(inputEl, sheetSelectorEl, updateFn); // Pass args along

        } catch (err) {
            console.error("Error reading workbook:", err);
            // TODO: Use a proper error display element instead of previewErrorEl
            // For now, we'll just log it.
            // previewErrorEl.textContent = "Error reading Excel file. Is the file corrupted?";
            // previewErrorEl.classList.remove('hidden');
        }
    };
    reader.readAsArrayBuffer(file);
}

/**
 * Loads the selected sheet from the workbook into the text area.
 * @param {HTMLTextAreaElement} inputEl - The textarea to put data into.
 * @param {HTMLSelectElement} sheetSelectorEl - The dropdown for sheet names.
 * @param {Function} updateFn - The callback function to run after loading (e.g., updateOutput).
 */
export function loadSheet(inputEl, sheetSelectorEl, updateFn) {
    if (!workbook) return;

    const sheetName = sheetSelectorEl.value;
    const sheet = workbook.Sheets[sheetName];
    if (sheet) {
        // Convert sheet to CSV
        const csvData = XLSX.utils.sheet_to_csv(sheet);
        inputEl.value = csvData;
        updateFn(); // Call the callback
    }
}