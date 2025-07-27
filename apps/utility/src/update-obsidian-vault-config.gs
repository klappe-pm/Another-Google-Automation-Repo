/**
 * Script Name: update- obsidian- vault- config
 *
 * Script Summary:
 * Processes files for automated workflow processing.
 *
 * Script Purpose:
 *
 * Script Steps:
 * 1. Fetch source data
 * 2. Process and transform data
 * 3. Execute main operation
 * 4. Handle errors and edge cases
 * 5. Log completion status
 *
 * Script Dependencies:
 * - None (standalone script)
 *
 * Google Services:
 * - None
 * /

- - Title: Obsidian Vault Config Replacement Script

- - Script Summary
- - This script is designed to manage Obsidian vault configurations by replacing the `.obsidian` directory in all folders within the Documents directory,
- - except for the "Obsidian Vault Configs" folder. The purpose is to ensure that all Obsidian vaults use the same configuration.
- - The script solves the problem of inconsistent configurations across multiple Obsidian vaults by standardizing them.
- - A successful script execution involves locating the "Obsidian Vault Configs" folder, verifying the presence of the `.obsidian` directory,
- - and replacing the `.obsidian` directory in all other folders within the Documents directory.

- - Functions- Alphabetical
- - display dialog: Displays a dialog box with a message and buttons.
- - do shell script: Executes a shell script command.
- - exit repeat: Exits a repeat loop.
- - if: Conditional statement to execute code based on a condition.
- - on error: Error handling for try blocks.
- - path to: Returns the path to a specified folder.
- - POSIX path of: Returns the POSIX path of a specified file or folder.
- - quoted form of: Returns the quoted form of a string.
- - repeat with: Loops through a list of items.
- - set: Assigns a value to a variable.
- - tell application: Sends commands to an application.
- - try: Attempts to execute a block of code and catches errors.

- - Functions- Ordered
- - 1. path to: Define the Documents folder path.
- - 2. set: Define the target folder and file names.
- - 3. tell application "Finder": Locate the "Obsidian Vault Configs" folder.
- - 4. if: Check if the target folder path is empty.
- - 5. display dialog: Display an error message if the target folder is not found.
- - 6. set: Define the target file path.
- - 7. do shell script: Verify the presence of the `.obsidian` directory.
- - 8. if: Check if the `.obsidian` directory is not found.
- - 9. display dialog: Display an error message if the `.obsidian` directory is not found.
- - 10. tell application "Finder": Get the list of folders in Documents.
- - 11. repeat with: Loop through the folders to process.
- - 12. set: Define the current folder path.
- - 13. set: Define the obsidian folder path.
- - 14. do shell script: Check if the `.obsidian` directory exists.
- - 15. try: Attempt to replace the `.obsidian` directory.
- - 16. do shell script: Remove the existing `.obsidian` directory.
- - 17. do shell script: Copy the new `.obsidian` directory.
- - 18. on error: Catch and display errors.
- - 19. display dialog: Display a success message.

- - Script- Steps
- - 1. Define the Documents folder path.
- - 2. Define the target folder and file names.
- - 3. Locate the "Obsidian Vault Configs" folder within the Documents folder.
- - 4. Check if the "Obsidian Vault Configs" folder is found.
- - 5. If not found, display an error message and exit.
- - 6. Define the path to the `.obsidian` directory within the "Obsidian Vault Configs" folder.
- - 7. Verify the presence of the `.obsidian` directory.
- - 8. If not found, display an error message and exit.
- - 9. Get the list of folders in the Documents directory, excluding the "Obsidian Vault Configs" folder.
- - 10. Loop through each folder in the list.
- - 11. Define the path to the current folder and the `.obsidian` directory within it.
- - 12. Check if the `.obsidian` directory exists in the current folder.
- - 13. If it exists, attempt to replace it with the `.obsidian` directory from the "Obsidian Vault Configs" folder.
- - 14. Remove the existing `.obsidian` directory.
- - 15. Copy the new `.obsidian` directory to the current folder.
- - 16. Catch and display any errors that occur during the replacement process.
- - 17. Display a success message once the replacement is complete.

- - Helper Functions
- - None

- - Define the Documents folder path
set documentsFolder to (path to documents folder) as text

- - Define the target folder and file names
set targetFolderName to "Obsidian Vault Configs"
set targetFileName to ".obsidian"

- - Locate the "Obsidian Vault Configs" folder
set targetFolderPath to ""
tell application "Finder"
set folderList to folders of folder documentsFolder
repeat with aFolder in folderList
if name of aFolder is targetFolderName then
set targetFolderPath to aFolder as alias
exit repeat
end if
end repeat
end tell

if targetFolderPath is "" then
display dialog "The folder 'Obsidian Vault Configs' was not found in the Documents folder." buttons {"OK"} default button "OK"
return
end if

- - Verify the presence of the .obsidian directory
set targetFilePath to (targetFolderPath as text) & targetFileName
if not (do shell script "test - d " & quoted form of POSIX path of targetFilePath & "; echo $?") is "0" then
display dialog "The directory '.obsidian' was not found in the 'Obsidian Vault Configs' folder." buttons {"OK"} default button "OK"
return
end if

- - Get the list of folders in Documents
set foldersToProcess to {}
tell application "Finder"
set foldersToProcess to every folder of folder documentsFolder whose name is not targetFolderName
end tell

- - Replace .obsidian in other folders
repeat with aFolder in foldersToProcess
set currentFolderPath to aFolder as alias
set obsidianFolderPath to (currentFolderPath as text) & targetFileName
- - Check if .obsidian exists and replace it
if (do shell script "test - d " & quoted form of POSIX path of obsidianFolderPath & "; echo $?") is "0" then
try
- - Use `cp - R` to copy the directory
do shell script "rm - rf " & quoted form of POSIX path of obsidianFolderPath
do shell script "cp - R " & quoted form of POSIX path of targetFilePath & " " & quoted form of POSIX path of currentFolderPath
on error errMsg
display dialog "Error replacing '.obsidian' in folder: " & (name of aFolder) & ". Error: " & errMsg buttons {"OK"} default button "OK"
end try
end if
end repeat

display dialog "Replacement of '.obsidian' directories is complete." buttons {"OK"} default button "OK"

- - Logging and Debugging
log "Script execution completed successfully."