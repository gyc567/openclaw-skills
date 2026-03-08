#!/bin/bash
# Pre-push build check script
# This script runs the build to check for errors before pushing to remote

set -e

echo "🔍 Running build check..."

# Run TypeScript type check
echo "📝 Running TypeScript check..."
npx tsc --noEmit

# Run lint check
echo "🔧 Running lint check..."
npm run lint

# Run build
echo "🏗️ Running production build..."
npm run build

echo "✅ All checks passed! Ready to push."
