#!/bin/bash

# =============================================================================
# OpenClaw Skills - Vercel Deployment Script
# =============================================================================
# Project ID: prj_nLrlrqnaCGLyk2U10NtGKBI1i8uk
# Usage: ./deploy.sh [--production] [--preview]
# =============================================================================

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_ID="prj_nLrlrqnaCGLyk2U10NtGKBI1i8uk"
PROJECT_NAME="openclaw-skills"
DEPLOY_MODE="preview"  # Default to preview

# =============================================================================
# Functions
# =============================================================================

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo ""
    echo "=============================================="
    echo "  OpenClaw Skills - Vercel Deployment"
    echo "=============================================="
    echo ""
}

# =============================================================================
# Pre-deployment Checks
# =============================================================================

pre_deployment_checks() {
    log_info "Running pre-deployment checks..."
    
    # Check if Vercel CLI is installed
    if ! command -v vercel &> /dev/null; then
        log_error "Vercel CLI not found. Installing..."
        npm install -g vercel
    fi
    
    # Check if we're in the correct directory
    if [ ! -f "package.json" ]; then
        log_error "Not in project root directory (package.json not found)"
        exit 1
    fi
    
    # Verify project ID is configured
    if [ ! -f ".vercel/project.json" ]; then
        log_warning "Project not linked. Will link during deployment..."
    fi
    
    # Check Node.js version
    NODE_VERSION=$(node -v)
    log_info "Node.js version: $NODE_VERSION"
    
    log_success "Pre-deployment checks passed!"
}

# =============================================================================
# Build
# =============================================================================

run_build() {
    log_info "Building project..."
    
    # Clean previous build
    if [ -d ".next" ]; then
        log_info "Cleaning previous build..."
        rm -rf .next
    fi
    
    # Run TypeScript check
    log_info "Running TypeScript check..."
    npx tsc --noEmit
    
    # Run lint
    log_info "Running lint..."
    npm run lint || log_warning "Lint warnings found (non-blocking)"
    
    # Build the project
    log_info "Building Next.js application..."
    npm run build
    
    if [ $? -eq 0 ]; then
        log_success "Build completed successfully!"
    else
        log_error "Build failed!"
        exit 1
    fi
}

# =============================================================================
# Tests
# =============================================================================

run_tests() {
    log_info "Running tests..."
    
    # Run unit tests (exclude worktree tests that have pre-existing issues)
    npm run test -- --exclude ".dmux/**" --run
    
    if [ $? -eq 0 ]; then
        log_success "All tests passed!"
    else
        log_error "Tests failed!"
        exit 1
    fi
}

# =============================================================================
# Vercel Deployment
# =============================================================================

deploy_to_vercel() {
    log_info "Deploying to Vercel..."
    log_info "Project ID: $PROJECT_ID"
    log_info "Deploy mode: $DEPLOY_MODE"
    
    # Ensure .vercel directory exists with proper config
    if [ ! -f ".vercel/project.json" ]; then
        log_info "Linking to Vercel project..."
        vercel link --yes
    fi
    
    # Build Vercel command - use --yes to auto-confirm
    if [ "$DEPLOY_MODE" = "production" ]; then
        log_info "Deploying to PRODUCTION..."
        vercel --prod --yes
    else
        log_info "Deploying to PREVIEW..."
        vercel --yes
    fi
    
    if [ $? -eq 0 ]; then
        log_success "Deployment successful!"
    else
        log_error "Deployment failed!"
        exit 1
    fi
}

# =============================================================================
# Verification
# =============================================================================

verify_deployment() {
    log_info "Verifying deployment..."
    
    # Get deployment URL from Vercel CLI
    DEPLOYMENT_URL=$(vercel --yes 2>/dev/null | grep -oE "https://[a-zA-Z0-9-]+\.vercel\.app" | head -1 || echo "")
    
    if [ -z "$DEPLOYMENT_URL" ]; then
        # Try to get from project list
        DEPLOYMENT_URL=$(vercel project ls 2>/dev/null | grep "$PROJECT_NAME" | head -1 | awk '{print $NF}')
    fi
    
    if [ -n "$DEPLOYMENT_URL" ]; then
        log_success "Deployment URL: $DEPLOYMENT_URL"
        
        # Test if the deployment is responding
        log_info "Testing deployment response..."
        HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$DEPLOYMENT_URL" 2>/dev/null || echo "000")
        
        if [ "$HTTP_CODE" = "200" ]; then
            log_success "Deployment is responding with HTTP 200!"
        elif [ "$HTTP_CODE" = "301" ] || [ "$HTTP_CODE" = "302" ]; then
            log_success "Deployment is responding (redirect: $HTTP_CODE)"
        else
            log_warning "Deployment responding with HTTP $HTTP_CODE"
        fi
    else
        log_warning "Could not determine deployment URL"
    fi
    
    log_success "Verification complete!"
}

# =============================================================================
# Main
# =============================================================================

main() {
    print_header
    
    # Parse arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            --production)
                DEPLOY_MODE="production"
                shift
                ;;
            --preview)
                DEPLOY_MODE="preview"
                shift
                ;;
            --skip-tests)
                SKIP_TESTS=true
                shift
                ;;
            --skip-build)
                SKIP_BUILD=true
                shift
                ;;
            *)
                echo "Unknown option: $1"
                echo "Usage: $0 [--production] [--preview] [--skip-tests] [--skip-build]"
                exit 1
                ;;
        esac
    done
    
    # Run pre-deployment checks
    pre_deployment_checks
    
    # Run build (skip if requested)
    if [ "$SKIP_BUILD" != "true" ]; then
        run_build
    else
        log_warning "Skipping build..."
    fi
    
    # Run tests (skip if requested)
    if [ "$SKIP_TESTS" != "true" ]; then
        run_tests
    else
        log_warning "Skipping tests..."
    fi
    
    # Deploy to Vercel
    deploy_to_vercel
    
    # Verify deployment
    verify_deployment
    
    echo ""
    echo "=============================================="
    log_success "Deployment completed successfully!"
    echo "=============================================="
    echo ""
}

# Run main function
main "$@"
