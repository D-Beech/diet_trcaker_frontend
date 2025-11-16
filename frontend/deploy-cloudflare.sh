#!/bin/bash

# Cloudflare Pages Deployment Script for Diet Tracker Frontend
# Usage: ./deploy-cloudflare.sh

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

BUILD_DIR="build"
PROJECT_NAME="diet-tracker-datu"

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  Cloudflare Pages Deployment${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# Check if build directory exists
if [ ! -d "$BUILD_DIR" ]; then
    echo -e "${RED}Error: Build directory not found${NC}"
    echo "Run 'npm run build' first"
    exit 1
fi

echo -e "${YELLOW}Deploying to Cloudflare Pages...${NC}"
echo ""

# Deploy to Cloudflare Pages using npx
npx wrangler pages deploy "$BUILD_DIR" --project-name="$PROJECT_NAME"

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  Deployment Complete! 🚀${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${YELLOW}Your app will be available at:${NC}"
echo -e "${GREEN}https://$PROJECT_NAME.pages.dev${NC}"
echo ""
echo -e "${YELLOW}Important Next Steps:${NC}"
echo "1. Update CORS in Render backend:"
echo "   Go to https://dashboard.render.com"
echo "   Environment tab → ALLOWED_ORIGINS"
echo "   Set to: https://$PROJECT_NAME.pages.dev"
echo ""
echo "2. View your deployment:"
echo "   https://dash.cloudflare.com/"
echo ""
echo "3. (Optional) Add custom domain in Cloudflare dashboard"
echo ""
