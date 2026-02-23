#!/bin/bash

# Script to uninstall git hooks

set -e

HOOKS_DIR=".git/hooks"

echo "🗑️  Uninstalling git hooks..."

# Check if .git directory exists
if [ ! -d ".git" ]; then
    echo "❌ Error: Not in a git repository"
    exit 1
fi

# Remove pre-commit hook
if [ -f "$HOOKS_DIR/pre-commit" ]; then
    rm "$HOOKS_DIR/pre-commit"
    echo "✅ Removed pre-commit hook"
fi

# Remove pre-push hook
if [ -f "$HOOKS_DIR/pre-push" ]; then
    rm "$HOOKS_DIR/pre-push"
    echo "✅ Removed pre-push hook"
fi

echo ""
echo "🎉 Git hooks uninstalled successfully!"
