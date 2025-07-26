/**
 * Script Name: process-main
 * 
 * Script Summary:
 * Processes data for automated workflow processing.
 * 
 * Script Purpose:
 * - Process main data transformations
 * - Apply business rules and logic
 * - Ensure data consistency
 * 
 * Script Steps:
 * 1. Fetch source data
 * 2. Format output for presentation
 * 3. Send notifications or reports
 * 
 * Script Functions:
 * - run(): Executes main process
 * 
 * Script Dependencies:
 * - None (standalone script)
 * 
 * Google Services:
 * - None
 */

/**
 * Perform run operation
 */// Main Functions

// Main Functions

/**

 * Executes main process

 */

function run() {
  const config = {
    description:
    "Use this to get started with Gmail Processor. It stores an attachment to Google Drive.",
    settings: {
      markProcessedMethod: "mark-read",
      },
      global: {
        thread: {
          match: {
            query:
            "has:attachment -in:trash -in:drafts -in:spam after:{{date.now|formatDate('yyyy-MM-dd')}} is:unread subject:\"[GmailProcessor-Test] simple\"",
            },
            },
            },
            threads: [
            {
              match: {
                query: "from:${user.email}",
                },
                messages: [
                {
                  attachments: [
                  {
                    match: {
                      name: "^invoice\\.pdf$",
                      },
                      actions: [
                      {
                        name: "attachment.store",
                        args: {
                          location:
                          "/GmailProcessor-Tests/e2e/simple/{{message.date|formatDate('yyyy-MM-dd')}}/{{message.subject}}-{{attachment.name}}",
                          conflictStrategy: "keep",
                          },
                          },
                          ],
                          },
                          ],
                          },
                          ],
                          },
                          ],
                        }

                        return GmailProcessorLib.run(config, "dry-run")
                      }