#!/bin/bash

# Script to install git hooks

set -e

HOOKS_DIR=".git/hooks"
SOURCE_DIR="hooks"

echo "📦 Installing git hooks..."

# Check if .git directory exists
if [ ! -d ".git" ]; then
    echo "❌ Error: Not in a git repository"
    exit 1
fi

# Check if hooks directory is writable
if [ ! -w "$HOOKS_DIR" ]; then
    echo "❌ Error: Cannot write to $HOOKS_DIR"
    echo "💡 Try running: chmod u+w $HOOKS_DIR"
    exit 1
fi

# Check for existing hooks
if [ -f "$HOOKS_DIR/pre-commit" ] && ! grep -q "pre-commit tests" "$HOOKS_DIR/pre-commit" 2>/dev/null; then
    echo "⚠️  Warning: Existing pre-commit hook detected"
    read -p "Do you want to overwrite it? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "ℹ️  Skipping pre-commit hook installation"
        SKIP_PRE_COMMIT=true
    fi
fi

if [ -f "$HOOKS_DIR/pre-push" ] && ! grep -q "pre-push tests" "$HOOKS_DIR/pre-push" 2>/dev/null; then
    echo "⚠️  Warning: Existing pre-push hook detected"
    read -p "Do you want to overwrite it? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "ℹ️  Skipping pre-push hook installation"
        SKIP_PRE_PUSH=true
    fi
fi

# Install pre-commit hook
if [ "$SKIP_PRE_COMMIT" != "true" ]; then
    cp "$SOURCE_DIR/pre-commit" "$HOOKS_DIR/pre-commit"
    chmod +x "$HOOKS_DIR/pre-commit"
    echo "✅ Installed pre-commit hook"
fi

# Install pre-push hook
if [ "$SKIP_PRE_PUSH" != "true" ]; then
    cp "$SOURCE_DIR/pre-push" "$HOOKS_DIR/pre-push"
    chmod +x "$HOOKS_DIR/pre-push"
    echo "✅ Installed pre-push hook"
fi

echo ""
echo "🎉 Git hooks installation complete!"
echo ""
echo "ℹ️  The hooks will run tests before commits and pushes"
echo "💡 To bypass hooks, use: git commit --no-verify or git push --no-verify"
