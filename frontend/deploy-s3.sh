#!/bin/bash

# S3 Deployment Script for Diet Tracker Frontend
# Usage: ./deploy-s3.sh [bucket-name]

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
BUCKET_NAME="${1:-diet-tracker-app}"
REGION="${AWS_DEFAULT_REGION:-us-east-1}"
BUILD_DIR="build"

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  S3 Deployment Script${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo -e "${RED}Error: AWS CLI is not installed${NC}"
    echo "Install it with: sudo apt install awscli"
    echo "Or visit: https://aws.amazon.com/cli/"
    exit 1
fi

# Check if build directory exists
if [ ! -d "$BUILD_DIR" ]; then
    echo -e "${RED}Error: Build directory not found${NC}"
    echo "Run 'npm run build' first"
    exit 1
fi

echo -e "${YELLOW}Bucket name: ${NC}$BUCKET_NAME"
echo -e "${YELLOW}Region: ${NC}$REGION"
echo -e "${YELLOW}Build directory: ${NC}$BUILD_DIR"
echo ""

# Check if bucket exists
echo -e "${YELLOW}Checking if bucket exists...${NC}"
if aws s3 ls "s3://$BUCKET_NAME" 2>&1 | grep -q 'NoSuchBucket'; then
    echo -e "${YELLOW}Bucket does not exist. Creating...${NC}"

    # Create bucket
    if [ "$REGION" = "us-east-1" ]; then
        aws s3api create-bucket --bucket "$BUCKET_NAME" --region "$REGION"
    else
        aws s3api create-bucket --bucket "$BUCKET_NAME" --region "$REGION" \
            --create-bucket-configuration LocationConstraint="$REGION"
    fi

    echo -e "${GREEN}✓ Bucket created${NC}"
else
    echo -e "${GREEN}✓ Bucket exists${NC}"
fi

# Enable static website hosting
echo -e "${YELLOW}Enabling static website hosting...${NC}"
aws s3 website "s3://$BUCKET_NAME" --index-document index.html --error-document index.html
echo -e "${GREEN}✓ Static website hosting enabled${NC}"

# Set bucket policy for public read access
echo -e "${YELLOW}Setting bucket policy for public access...${NC}"
cat > /tmp/bucket-policy.json <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::$BUCKET_NAME/*"
    }
  ]
}
EOF

aws s3api put-bucket-policy --bucket "$BUCKET_NAME" --policy file:///tmp/bucket-policy.json
rm /tmp/bucket-policy.json
echo -e "${GREEN}✓ Bucket policy set${NC}"

# Disable block public access
echo -e "${YELLOW}Configuring public access settings...${NC}"
aws s3api put-public-access-block \
    --bucket "$BUCKET_NAME" \
    --public-access-block-configuration \
    "BlockPublicAcls=false,IgnorePublicAcls=false,BlockPublicPolicy=false,RestrictPublicBuckets=false"
echo -e "${GREEN}✓ Public access configured${NC}"

# Upload files
echo -e "${YELLOW}Uploading files to S3...${NC}"
aws s3 sync "$BUILD_DIR/" "s3://$BUCKET_NAME/" \
    --delete \
    --cache-control "public, max-age=31536000" \
    --exclude "*.html" \
    --exclude "manifest.webmanifest" \
    --exclude "sw.js" \
    --exclude "workbox-*.js"

# Upload HTML and service worker files with no-cache
aws s3 sync "$BUILD_DIR/" "s3://$BUCKET_NAME/" \
    --cache-control "no-cache" \
    --exclude "*" \
    --include "*.html" \
    --include "manifest.webmanifest" \
    --include "sw.js" \
    --include "workbox-*.js"

echo -e "${GREEN}✓ Files uploaded${NC}"

# Get website URL
WEBSITE_URL="http://$BUCKET_NAME.s3-website-$REGION.amazonaws.com"

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  Deployment Complete! 🚀${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${GREEN}Your app is live at:${NC}"
echo -e "${YELLOW}$WEBSITE_URL${NC}"
echo ""
echo -e "${YELLOW}Important Next Steps:${NC}"
echo "1. Update CORS in Render backend:"
echo "   Go to https://dashboard.render.com"
echo "   Update ALLOWED_ORIGINS to: $WEBSITE_URL"
echo ""
echo "2. Test your app:"
echo "   Open: $WEBSITE_URL"
echo ""
echo "3. (Optional) Set up CloudFront for HTTPS:"
echo "   - Create CloudFront distribution"
echo "   - Point to S3 bucket"
echo "   - Get free SSL certificate"
echo ""
