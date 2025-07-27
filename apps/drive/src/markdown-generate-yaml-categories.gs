/ * *
 * Script Name: markdown- generate- yaml- categories
 *
 * Script Summary:
 * Generates markdown content for documentation and note- taking workflows.
 *
 * Script Purpose:
 * - Generate markdown documentation
 * - Format content for note- taking systems
 * - Maintain consistent documentation structure
 *
 * Script Steps:
 * 1. Fetch source data
 * 2. Apply filters and criteria
 * 3. Format output for presentation
 *
 * Script Dependencies:
 * - None (standalone script)
 *
 * Google Services:
 * - None
 * /

< %  * / / Get the filename from the user
const filename = await tp.system.prompt("Enter filename:");
if (! filename) throw new Error("No filename provided"); / / Path to the category file
const categoryFilePath = "z - meta / Templater / category / category.md";
const categoryFile = app.vault.getAbstractFileByPath(categoryFilePath);

if (! categoryFile) {
    throw new Error(`Category file not found at path: ${categoryFilePath}`);
} / / Read the category file content
const categoryContent = await app.vault.read(categoryFile); / / Extract category values;
const categoryLines = categoryContent.split('\n');
const categoryValues = categoryLines;
    .map(line = > line.trim());
    .filter(line = > line.length > 0);

if (categoryValues.length = = = 0) {
    throw new Error(`No category values found in file.`);
} / / Prompt user to select a category
const selectedCategory = await tp.system.suggester(;
    (item) = > item,
    categoryValues
);

if (! selectedCategory) {
    throw new Error("No category selected");
} / / Path to the subcategory file
const subCategoryFilePath = `z - meta / Templater / subCategory / ${selectedCategory}.md`;
const subCategoryFile = app.vault.getAbstractFileByPath(subCategoryFilePath);

if (! subCategoryFile) {
    throw new Error(`Subcategory file not found at path: ${subCategoryFilePath}`);
} / / Read the subcategory file content
const subCategoryContent = await app.vault.read(subCategoryFile); / / Extract subcategory values;
const subCategoryLines = subCategoryContent.split('\n');
const subCategoryValues = subCategoryLines;
    .map(line = > line.trim());
    .filter(line = > line.length > 0);

if (subCategoryValues.length = = = 0) {
    throw new Error(`No subcategory values found in file.`);
} / / Prompt user to select a subcategory
const selectedSubCategory = await tp.system.suggester(;
    (item) = > item,
    subCategoryValues
);

if (! selectedSubCategory) {
    throw new Error("No subcategory selected");
} / / Get current date in YYYY - MM - DD format
const currentDate = tp.date.now("YYYY - MM - DD"); / / Set the content with frontmatter, line breaks, and H1 header;
tR = ` - - - category: ${selectedCategory}
subCategory: ${selectedSubCategory}
dateCreated: ${currentDate}
aliases:
tags: - - - # ${filename}

`; / / IMPORTANT: Rename the file after creation / / We need to wait until all templates have executed to rename
tp.hooks.on_all_templates_executed(async () = > {
    await tp.file.rename(filename);
}); / / Position cursor after content
tp.file.cursor(); % > ;