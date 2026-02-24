# Monday Band

A music collaboration platform built with Node.js and React.

## Setup

```bash
npm install
```

### Install Git Hooks (Recommended)

After installation, set up git hooks to automatically run tests before commits and pushes:

```bash
./hooks/install.sh
```

This will ensure code quality by preventing commits/pushes with failing tests. You can bypass hooks when needed using `--no-verify`.

See [hooks/README.md](hooks/README.md) for more details.

## Development

```bash
npm start
```

The app will open at http://localhost:3000

## Testing

### Run All Tests

```bash
npm test
```

### Run BDD Tests with Progress

```bash
npm run test:bdd
```

### View Test Coverage

Open the test coverage report:

```bash
open coverage/TEST_COVERAGE_REPORT.md
```

Or view the HTML report:

```bash
open reports/test-coverage.html
```

## Build

```bash
npm run build
```

## Git Hooks

This project uses git hooks for automated test enforcement:

- **Pre-commit hook**: Runs tests before allowing commits
- **Pre-push hook**: Runs tests before allowing pushes
- **Override**: Use `--no-verify` flag to bypass hooks when needed

**Installation**: `./hooks/install.sh`  
**Uninstallation**: `./hooks/uninstall.sh`

See [docs/GIT_HOOKS_IMPLEMENTATION.md](docs/GIT_HOOKS_IMPLEMENTATION.md) for implementation details.

## AI-Powered Feature Development 🤖

This project includes automated workflows for feature development:

### Auto Feature Branch & PR
When you create a GitHub issue, the system automatically:
1. Creates a feature branch
2. Generates BDD test plan using AI (Copilot)
3. Opens a draft PR with test scenarios

**Usage**: Just create an issue! The workflow handles the rest.

See [docs/AUTO_FEATURE_WORKFLOW.md](docs/AUTO_FEATURE_WORKFLOW.md) for full details.

### Requirements
- GitHub secret `MODELS_TOKEN` for AI test generation
- Prompts available in `.github/prompts/` directory

## Documentation

- [Auto Feature Workflow](docs/AUTO_FEATURE_WORKFLOW.md)
- [Git Hooks Implementation](docs/GIT_HOOKS_IMPLEMENTATION.md)
- [Test Coverage Report](coverage/TEST_COVERAGE_REPORT.md)
- [Hooks Usage Guide](hooks/README.md)

## Tech Stack

- React 19
- Webpack 5
- Babel 7
- Cucumber (BDD Testing)
- CSS
