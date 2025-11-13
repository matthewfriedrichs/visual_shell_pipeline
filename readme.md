# **Visual Shell Pipeline**

Visual Shell Pipeline is a "no-code" browser-based tool for building, previewing, and understanding complex shell commands. It allows you to visually chain together common shell utilities (like cut, grep, and sort), see a live preview of their effect on your data, and generate the real, runnable shell command.

This tool is perfect for data-munging, log analysis, and learning how shell pipelines work without the risk of modifying your original files.

[Try it out now on GitHub Pages!](https://matthewfriedrichs.github.io/visual_shell_pipeline/)

## **Features**

* **100% Browser-Based:** A single HTML file. No server, no installation, and no data ever leaves your computer.  
* **Multiple Data Inputs:**  
  * **Excel Importer:** Load .xlsx or .xls files directly.  
  * **Sheet Selection:** Choose which sheet to import from your Excel workbook.  
  * **CSV Importer:** Loads .csv files.  
  * **Text Area:** Paste any text, log data, or CSV data directly.  
* **Visual Pipeline:** Add, remove, and re-order common shell commands as "steps."  
* **Live Data Preview:** The output preview updates instantly as you add or modify steps.  
* **Command Generation:** Automatically generates the complete, copy-and-paste-ready shell command.  
  * **Readable Format:** A formatted, multi-line command for easy reading.  
  * **Single-Line:** A toggle to get the single-line command for execution.  
* **Command Parsing (Reverse-Engineering):**  
  * Have a confusing shell command? Paste it into the "Parse" box, and the tool will automatically build the visual pipeline steps, showing you *exactly* what it does.  
* **Spreadsheet-Style Logic:**  
  * The awk step includes templates for common spreadsheet functions like SUM, AVERAGE, filtering rows (IF), and creating new columns (C \= A \+ B).

## **Supported Pipeline Steps**

* **cut:** Select specific columns (fields) from your data.  
* **grep:** Filter lines by matching text or regular expressions.  
* **sort:** Sort lines alphabetically or numerically (with reverse).  
* **uniq:** Remove adjacent duplicate lines.  
* **head:** Get the first N lines of the output.  
* **tail:** Get the last N lines of the output.  
* **tr:** Translate, delete, or squeeze characters.  
* **wc:** Count lines, words, or characters.  
* **awk:** Perform advanced, column-based processing (the "spreadsheet logic" tool).

## **How to Use**

1. **Download:** Get the visual\_shell.html file.  
2. **Open:** Double-click the file to open it in any modern web browser.  
3. **Load Your Data:**  
   * **Option A (Upload):** Use the "Load Data" section to upload an Excel or CSV file. If it's Excel, select the sheet you want to load.  
   * **Option B (Paste):** Paste your sample data (CSV, log file, etc.) directly into the "1. Input Data" text box.  
4. **Build Your Pipeline:**  
   * Go to the "2. Pipeline Steps" section.  
   * Select a tool (e.g., cut) from the dropdown and click "Add Step."  
   * A new card will appear. Configure its options (e.g., for cut, set the Delimiter to , and Fields to 1,3).  
5. **Watch the Live Preview:**  
   * As you add and change steps, the "3. Live Preview" box on the right will instantly update to show you the result of your *entire* pipeline.  
6. **Get Your Command:**  
   * Look at the "4. Generated Shell Command" box at the bottom.  
   * Uncheck "Format for readability" to see the final single-line command.  
   * Click "Copy" and paste this command into your terminal.  
   * **Remember to replace YOUR\_FILE.csv with the *actual* path to your large file.**

## **How it Works**

This tool is built with plain HTML, CSS (using Tailwind CSS for styling), and JavaScript. It uses the [SheetJS (xlsx.js)](https://github.com/SheetJS/sheetjs) library to parse Excel files entirely in the browser.

All processing, from file parsing to the pipeline preview, is done on your local machine. No data is ever sent to a server, ensuring your information remains private.