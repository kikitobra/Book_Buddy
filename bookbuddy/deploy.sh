#!/bin/bash

# BookBuddy Deployment Script for Azure VM
# This script will build and deploy the application

echo "🚀 Starting BookBuddy Deployment..."

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo -e "${RED}❌ Error: .env.local file not found!${NC}"
    echo "Please create .env.local with your MongoDB credentials and other environment variables"
    exit 1
fi

echo -e "${YELLOW}📦 Installing dependencies...${NC}"
pnpm install

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Failed to install dependencies${NC}"
    exit 1
fi

echo -e "${YELLOW}🏗️  Building Next.js application...${NC}"
pnpm build

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Build failed${NC}"
    exit 1
fi

# Create logs directory if it doesn't exist
mkdir -p logs

echo -e "${YELLOW}🔄 Restarting application with PM2...${NC}"

# Check if PM2 is installed
if ! command -v pm2 &> /dev/null; then
    echo -e "${YELLOW}📦 Installing PM2 globally...${NC}"
    npm install -g pm2
fi

# Stop existing process if running
pm2 delete bookbuddy 2>/dev/null || true

# Start the application
pm2 start ecosystem.config.js

# Save PM2 process list
pm2 save

# Setup PM2 to start on system boot
pm2 startup

echo -e "${GREEN}✅ Deployment complete!${NC}"
echo -e "${GREEN}🌐 Application is running on port 3001${NC}"
echo -e "${GREEN}📍 Access at: https://wad-6611201.eastasia.cloudapp.azure.com/bookbuddy${NC}"
echo ""
echo "Useful PM2 commands:"
echo "  pm2 status          - Check application status"
echo "  pm2 logs bookbuddy  - View application logs"
echo "  pm2 restart bookbuddy - Restart the application"
echo "  pm2 stop bookbuddy  - Stop the application"
