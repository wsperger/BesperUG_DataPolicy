#!/usr/bin/env python3

import os
import pyperclip

# List of files to exclude
EXCLUDE_FILES = ['development.py', os.path.basename(__file__)]

# List of folders to exclude
EXCLUDE_FOLDERS = ['upcoming']

def main():
    output = ''
    for root, dirs, files in os.walk('.'):
        # Modify dirs in-place to skip EXCLUDE_FOLDERS
        dirs[:] = [d for d in dirs if d not in EXCLUDE_FOLDERS and not d.startswith('.git')]

        for file in files:
            # Get relative file path
            file_path = os.path.join(root, file)
            rel_path = os.path.relpath(file_path, '.')

            # Skip files in EXCLUDE_FILES
            if file in EXCLUDE_FILES:
                continue

            # Skip hidden files (optional)
            if file.startswith('.'):
                continue

            # Add a comment indicating the file name and location
            output += f'# File: {rel_path}\n'
            try:
                with open(file_path, 'r') as f:
                    content = f.read()
                output += content + '\n\n'
            except Exception as e:
                output += f'# Could not read file: {e}\n\n'

    if output:
        # Copy the output to clipboard
        pyperclip.copy(output)
        print('The repository structure and files have been copied to your clipboard.')
    else:
        print('No files found to copy.')

if __name__ == '__main__':
    main()
