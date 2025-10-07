#!/bin/bash

if [ ! -f "package-lock.json" ]; then
  echo "No package-lock.json found, skipping fix"
  exit 0
fi

# Check if nested dompurify exists in node_modules
if [ -d "node_modules/monaco-editor/node_modules/dompurify" ]; then
  echo "Fixing monaco-editor dompurify to use root version..."

  # Remove nested dompurify directory
  rm -rf node_modules/monaco-editor/node_modules/dompurify

  # Update package-lock.json
  node -e "
    const fs = require('fs');
    const lock = JSON.parse(fs.readFileSync('package-lock.json', 'utf8'));
    delete lock.packages['node_modules/monaco-editor/node_modules/dompurify'];
    if (lock.packages['node_modules/monaco-editor']) {
      lock.packages['node_modules/monaco-editor'].dependencies.dompurify = '^3.2.7';
    }
    fs.writeFileSync('package-lock.json', JSON.stringify(lock, null, 2) + '\n');
  "

  echo "✓ Fixed - monaco-editor now uses root dompurify@3.2.7"
elif grep -q '"node_modules/monaco-editor/node_modules/dompurify"' package-lock.json; then
  echo "Fixing package-lock.json..."

  # Update package-lock.json only
  node -e "
    const fs = require('fs');
    const lock = JSON.parse(fs.readFileSync('package-lock.json', 'utf8'));
    delete lock.packages['node_modules/monaco-editor/node_modules/dompurify'];
    if (lock.packages['node_modules/monaco-editor']) {
      lock.packages['node_modules/monaco-editor'].dependencies.dompurify = '^3.2.7';
    }
    fs.writeFileSync('package-lock.json', JSON.stringify(lock, null, 2) + '\n');
  "

  echo "✓ Fixed package-lock.json"
else
  echo "✓ Already using root dompurify"
fi
