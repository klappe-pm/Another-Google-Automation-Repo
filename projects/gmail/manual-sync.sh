#!/bin/bash

echo "=== Gmail Automation Scripts Ready for Manual Upload ==="
echo "Project URL: https://script.google.com/home/projects/1MhC1spUX-j1HfITDj6g68G2EobqbiZDiIpJJAxCEQOBAozERJPMoiXuq/edit"
echo ""
echo "Files to upload (47 total):"
echo ""

cd src
ls -1 *.gs | sort | nl

echo ""
echo "=== Instructions ==="
echo "1. Open the Apps Script project above"
echo "2. For each .gs file listed, create a new script file in the Apps Script editor"
echo "3. Copy the content from each local .gs file to the corresponding Apps Script file"
echo "4. The files are already organized alphabetically as shown above"
echo ""
echo "=== Alternative: Try clasp again ==="
echo "If the API issue resolves, run: clasp push --force"
