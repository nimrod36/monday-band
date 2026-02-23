# Git Hooks for Test Enforcement

This directory contains git hooks that automatically run tests before commits and pushes to ensure code quality.

## Features

- **Pre-commit hook**: Runs tests before allowing a commit
- **Pre-push hook**: Runs tests before allowing a push
- **Override option**: Can be bypassed with `--no-verify` flag
- **Clear feedback**: Provides informative messages about test results

## Installation

To install the git hooks, run:

```bash
./hooks/install.sh
```

This will:
- Copy the pre-commit and pre-push hooks to `.git/hooks/`
- Make them executable
- Detect and prompt about existing hooks

## Usage

### Normal workflow

Once installed, the hooks will automatically run when you commit or push:

```bash
git commit -m "Your commit message"
# 🧪 Running pre-commit tests...
# ✅ All tests passed!

git push origin main
# 🧪 Running pre-push tests...
# ✅ All tests passed!
```

### Bypass hooks (when needed)

If you need to commit or push without running tests:

```bash
git commit --no-verify -m "Your commit message"
git push --no-verify origin main
```

**Note**: Use `--no-verify` sparingly. It's meant for emergencies, not regular use.

## Uninstallation

To remove the git hooks:

```bash
./hooks/uninstall.sh
```

## How It Works

1. **Pre-commit**: Runs before a commit is created
   - Executes `npm test`
   - If tests pass, commit proceeds
   - If tests fail, commit is aborted with clear error message

2. **Pre-push**: Runs before pushing to a remote
   - Executes `npm test`
   - If tests pass, push proceeds
   - If tests fail, push is aborted with clear error message

## Requirements

- Git repository initialized
- Node.js and npm installed
- Test suite configured in `package.json` (via `npm test`)

## Troubleshooting

### Permission denied

If you get a permission error during installation:

```bash
chmod u+w .git/hooks
./hooks/install.sh
```

### Tests not found

Make sure your project has tests configured. Check that `npm test` works:

```bash
npm test
```

### Hook not running

Verify the hook is installed and executable:

```bash
ls -la .git/hooks/pre-commit
ls -la .git/hooks/pre-push
```

## Testing the Hooks

To run the BDD test suite for the git hooks feature:

```bash
npm run test:bdd -- specs/git-hooks-test-enforcement/git-hooks-test-enforcement.feature
```
