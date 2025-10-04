#!/bin/bash

# Alternative deployment method using Git
# This script helps you prepare and push code to GitHub for deployment

echo "📦 Preparing code for Git deployment..."

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Check if we're in a git repository (check both current and parent directory)
if [ -d .git ]; then
    GIT_DIR="."
elif [ -d ../.git ]; then
    GIT_DIR=".."
    echo -e "${YELLOW}ℹ️  Git repository found in parent directory${NC}"
    cd ..
else
    echo -e "${RED}❌ Not a git repository${NC}"
    echo "Please run this from the Book_Buddy directory or its subdirectory"
    exit 1
fi

# Check for uncommitted changes
if [[ -n $(git status -s) ]]; then
    echo -e "${YELLOW}📝 You have uncommitted changes${NC}"
    echo ""
    git status -s
    echo ""
    read -p "Do you want to commit these changes? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        read -p "Enter commit message: " commit_msg
        git add .
        git commit -m "$commit_msg"
        echo -e "${GREEN}✅ Changes committed${NC}"
    fi
fi

# Check if we're on main branch
current_branch=$(git branch --show-current)
if [ "$current_branch" != "main" ]; then
    echo -e "${YELLOW}⚠️  You're on branch: $current_branch${NC}"
    read -p "Do you want to switch to main? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        git checkout main
    fi
fi

# Push to GitHub
echo -e "${YELLOW}🚀 Pushing to GitHub...${NC}"
git push origin main

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Code pushed to GitHub successfully!${NC}"
    echo ""
    echo "Next steps on Azure VM:"
    echo "1. SSH into VM: ssh azureuser@20.189.115.22"
    echo "2. Clone or pull: "
    echo "   - First time: git clone https://github.com/Norman7781/Book_Buddy.git"
    echo "   - Updates: cd Book_Buddy/bookbuddy && git pull"
    echo "3. Deploy: cd Book_Buddy/bookbuddy && ./deploy.sh"
else
    echo -e "${RED}❌ Push failed${NC}"
    exit 1
fi
