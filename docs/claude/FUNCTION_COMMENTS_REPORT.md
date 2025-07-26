# Function Comments Report

Generated: 2025-07-26T19:22:40.607Z

## Summary
- Total files processed: 144
- Files with errors: 0
- Total functions commented: 924

## Files Updated

| File | Functions Commented |
|------|--------------------|
| apps/docs/src/embed-content-block.gs | 1 |
| apps/docs/src/export-docs-comments-sheets.gs | 2 |
| apps/docs/src/export-docs-file-list-to-sheets.gs | 1 |
| apps/docs/src/format-content.gs | 1 |
| apps/docs/src/format-documents.gs | 1 |
| apps/docs/src/markdown-export-docs-advanced.gs | 8 |
| apps/docs/src/markdown-export-docs-alt.gs | 8 |
| apps/docs/src/markdown-export-docs-obsidian.gs | 10 |
| apps/docs/src/markdown-export-docs.gs | 10 |
| apps/drive/src/clean-email-headers.gs | 7 |
| apps/drive/src/convert-shortcuts.gs | 1 |
| apps/drive/src/dedupe-file.gs | 3 |
| apps/drive/src/export-emails.gs | 8 |
| apps/drive/src/find-docs-by-alias.gs | 11 |
| apps/drive/src/folderids.gs | 2 |
| apps/drive/src/generate-file-tree.gs | 4 |
| apps/drive/src/generate-folder-tree.gs | 3 |
| apps/drive/src/index-docs-files.gs | 7 |
| apps/drive/src/index-drive-files.gs | 10 |
| apps/drive/src/index-files-v10-legacy.gs | 2 |
| apps/drive/src/index-sheets-folders-files.gs | 10 |
| apps/drive/src/list-folder-ids.gs | 3 |
| apps/drive/src/markdown-add-yaml-frontmatter-bulk.gs | 7 |
| apps/drive/src/markdown-add-yaml-frontmatter-multi.gs | 8 |
| apps/drive/src/markdown-categorize-yaml-folders.gs | 1 |
| apps/drive/src/markdown-create-files-from-rows.gs | 18 |
| apps/drive/src/markdown-create-from-sheets.gs | 18 |
| apps/drive/src/markdown-create-weekly-daily-notes-legacy.gs | 12 |
| apps/drive/src/markdown-create-weekly-daily-notes.gs | 12 |
| apps/drive/src/markdown-export-calendar-daily.gs | 12 |
| apps/drive/src/markdown-export-calendar-events.gs | 7 |
| apps/drive/src/markdown-export-calendar-meetings.gs | 7 |
| apps/drive/src/markdown-export-files.gs | 4 |
| apps/drive/src/markdown-export-tasklist-yaml.gs | 13 |
| apps/drive/src/markdown-export-tasks-obsidian.gs | 2 |
| apps/drive/src/markdown-export-tasks-todos.gs | 14 |
| apps/drive/src/markdown-export-tasks-yaml.gs | 13 |
| apps/drive/src/markdown-export-todos.gs | 14 |
| apps/drive/src/markdown-find-yaml-files.gs | 9 |
| apps/drive/src/markdown-find-yaml.gs | 9 |
| apps/drive/src/markdown-fix-formatting.gs | 12 |
| apps/drive/src/markdown-generate-from-sheets.gs | 18 |
| apps/drive/src/markdown-generate-weekly-notes.gs | 28 |
| apps/drive/src/markdown-index-comprehensive.gs | 19 |
| apps/drive/src/markdown-index-files-legacy.gs | 4 |
| apps/drive/src/markdown-index-files.gs | 7 |
| apps/drive/src/markdown-index-folders-files.gs | 10 |
| apps/drive/src/markdown-index-tree-legacy.gs | 3 |
| apps/drive/src/markdown-lint-files.gs | 12 |
| apps/drive/src/markdown-lint-line-spacing.gs | 5 |
| apps/drive/src/markdown-process-blank-links.gs | 5 |
| apps/drive/src/markdown-process-yaml.gs | 5 |
| apps/drive/src/markdown-update-metadata.gs | 2 |
| apps/drive/src/process-main.gs | 9 |
| apps/gmail/src/analyze-email-stats.gs | 3 |
| apps/gmail/src/analyze-emails-24months.gs | 1 |
| apps/gmail/src/analyze-label-statistics.gs | 5 |
| apps/gmail/src/analyze-label-stats.gs | 8 |
| apps/gmail/src/analyze-labeled-unlabeled.gs | 1 |
| apps/gmail/src/analyze-labels-data.gs | 6 |
| apps/gmail/src/analyze-labels-statistics-v1.gs | 1 |
| apps/gmail/src/analyze-labels-statistics.gs | 1 |
| apps/gmail/src/analyze-labels.gs | 5 |
| apps/gmail/src/analyze-metadata-24months.gs | 2 |
| apps/gmail/src/analyze-metadata.gs | 2 |
| apps/gmail/src/append-date-received.gs | 2 |
| apps/gmail/src/append-time-received.gs | 6 |
| apps/gmail/src/count-labels.gs | 1 |
| apps/gmail/src/count-unread-emails.gs | 1 |
| apps/gmail/src/count-unread-labels.gs | 1 |
| apps/gmail/src/create-album-hyperlinks.gs | 2 |
| apps/gmail/src/create-labels.gs | 8 |
| apps/gmail/src/dedupe-rows-v1.gs | 2 |
| apps/gmail/src/dedupe-rows-v2.gs | 2 |
| apps/gmail/src/dedupe-rows.gs | 2 |
| apps/gmail/src/delete-all-labels-utility.gs | 1 |
| apps/gmail/src/delete-all-labels.gs | 1 |
| apps/gmail/src/export-cal-v1.gs | 23 |
| apps/gmail/src/export-cal.gs | 28 |
| apps/gmail/src/export-event.gs | 27 |
| apps/gmail/src/export-gmail-labels-to-sheets.gs | 1 |
| apps/gmail/src/export-gmail-to-pdf.gs | 18 |
| apps/gmail/src/export-gmail-weekly-threads.gs | 2 |
| apps/gmail/src/export-labels-data.gs | 1 |
| apps/gmail/src/export-labels-gmail.gs | 1 |
| apps/gmail/src/export-lyft-uber-emails.gs | 16 |
| apps/gmail/src/extract-date-ranges-lyft-and-uber.gs | 11 |
| apps/gmail/src/extract-gmail-snippets.gs | 2 |
| apps/gmail/src/extract-gmail-threadid.gs | 2 |
| apps/gmail/src/extract-lyft-and-uber-data-v1.gs | 8 |
| apps/gmail/src/extract-lyft-and-uber-data-v2.gs | 10 |
| apps/gmail/src/extract-lyft-and-uber-data-v3.gs | 12 |
| apps/gmail/src/extract-lyft-and-uber-data.gs | 7 |
| apps/gmail/src/extract-subject.gs | 2 |
| apps/gmail/src/index-sheets-tabs-moc.gs | 2 |
| apps/gmail/src/insert-row-url-to-toc.gs | 1 |
| apps/gmail/src/mark-all-read.gs | 1 |
| apps/gmail/src/mark-emails-read.gs | 2 |
| apps/gmail/src/markdown-export-advanced-sheets.gs | 4 |
| apps/gmail/src/markdown-export-basic-sheets.gs | 4 |
| apps/gmail/src/markdown-export-docs-pdf.gs | 4 |
| apps/gmail/src/markdown-export-emails-pdf-sheets.gs | 4 |
| apps/gmail/src/markdown-export-emails.gs | 16 |
| apps/gmail/src/markdown-export-gmail-pdf.gs | 4 |
| apps/gmail/src/markdown-export-pdf.gs | 3 |
| apps/gmail/src/markdown-gmail-analysis-yaml.gs | 12 |
| apps/gmail/src/process-emails.gs | 2 |
| apps/gmail/src/process-labels-by-date.gs | 9 |
| apps/gmail/src/process-main.gs | 1 |
| apps/gmail/src/processor-gmail-labels-date.gs | 9 |
| apps/gmail/src/rename-tabs.gs | 1 |
| apps/gmail/src/send-gmail-labels-auto.gs | 10 |
| apps/gmail/src/send-gmail-labels-create.gs | 11 |
| apps/gmail/src/send-gmail-labels-maker.gs | 11 |
| apps/gmail/src/sort-sheets-columns.gs | 2 |
| apps/gmail/src/sort-sheets-tabs-alpha.gs | 2 |
| apps/gmail/src/sort-sheets-tabs-alphabetically.gs | 2 |
| apps/gmail/src/update-insert-or-sheets-row-url-to-toc.gs | 1 |
| apps/sheets/src/analyze-duration-distance.gs | 5 |
| apps/sheets/src/analyze-events-duration-distance.gs | 5 |
| apps/sheets/src/automate-date-checkboxes.gs | 3 |
| apps/sheets/src/combine-csv-files.gs | 1 |
| apps/sheets/src/create-sheets-tabs-tree-diagram.gs | 3 |
| apps/sheets/src/create-sheets-tree-diagram.gs | 3 |
| apps/sheets/src/dedupe-rows.gs | 9 |
| apps/sheets/src/export-calendar-after-date.gs | 3 |
| apps/sheets/src/export-calendar-date-range.gs | 3 |
| apps/sheets/src/export-calendar-distance-time.gs | 7 |
| apps/sheets/src/export-calendar.gs | 14 |
| apps/sheets/src/export-chat-daily-details.gs | 10 |
| apps/sheets/src/export-emails.gs | 25 |
| apps/sheets/src/export-event-gcp-distance-time.gs | 7 |
| apps/sheets/src/export-photos-and-videos.gs | 20 |
| apps/sheets/src/format-sheets-comprehensive-styling.gs | 2 |
| apps/sheets/src/index-sheets-general.gs | 3 |
| apps/sheets/src/index-sheets.gs | 3 |
| apps/sheets/src/process-sheets-date-automation.gs | 3 |
| apps/sheets/src/sort-sheets-utility-tab.gs | 2 |
| apps/sheets/src/style-tabs.gs | 2 |
| apps/tasks/src/export-tasks-obsidian.gs | 2 |
| apps/tasks/src/list-task-ids.gs | 1 |
| apps/utility/src/add-yaml-frontmatter.gs | 1 |
| apps/utility/src/check-api-key.gs | 1 |
| apps/utility/src/fetch-api-key.gs | 1 |

## Comment Format Applied

```javascript
/**
 * Brief description of what the function does
 * @param {Type} paramName - Description of the parameter
 * @returns {Type} Description of the return value
 */
function functionName(paramName) {
  // Implementation
}
```
