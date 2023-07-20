#!/bin/bash

# script for git commits so i don't have to constantly do all the commands in the terminal
# Function to perform the git commit and push
function git_commit_push() {
    git add .                      
    read -p "Enter your commit message: " commit_message
    git commit -m "$commit_message"   # Commit changes with the given commit message
    git push                        
}

# Call the function
git_commit_push

# to add permissions: chmod +x gitcommitpush.sh
# to run: ./gitcommitpush.sh