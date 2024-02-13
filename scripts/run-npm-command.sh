#!/bin/bash
# Description: A basic shell script to run package.json commands
echo "Starting the script..."

# Check if an npm script name is provided
if [ -z "$1" ]; then
    echo "Error: Please provide an npm script name."
    exit 1
fi

script_name=$1
echo "Running npm script: $script_name"
npm run $script_name

echo "Script completed."
