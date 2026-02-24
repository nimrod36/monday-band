# Auto Feature Branch and PR Workflow

This GitHub Actions workflow automates the feature development kickoff process by:

1. **Creating a feature branch** from new GitHub issues
2. **Generating BDD test plans** using AI (GitHub Copilot/Models API)
3. **Opening a draft PR** with the test plan and placeholders

## How It Works

### Trigger
The workflow runs automatically when a new issue is **opened** or **reopened**.

### Process Flow

```
GitHub Issue Created
    ↓
Workflow Triggered
    ↓
Phase 1: Learn Feature Request
  - AI analyzes the issue using learn-feature-request.prompt.md
  - Generates structured understanding of requirements
    ↓
Phase 2: Create Test Plan  
  - AI generates Gherkin scenarios using create-test-plan.prompt.md
  - Follows Specification by Example principles
  - Creates declarative, behavior-focused scenarios
    ↓
Create Feature Branch
  - Branch name: feature/issue-{number}-{title-slug}
    ↓
Commit Test Files
  - specs/issue-{number}-{feature}/<feature>.feature
  - specs/issue-{number}-{feature}/step_definitions/{feature}_steps.js
    ↓
Open Draft PR
  - Links to the original issue
  - Includes generated test plan
  - Provides next steps for implementation
    ↓
Comment on Issue
  - Confirms automation completed
  - Links to the PR and test plan
```

## Setup Requirements

### 1. GitHub Token Permissions

The workflow requires the following permissions (already configured in the workflow file):

```yaml
permissions:
  issues: write
  contents: write
  pull-requests: write
```

### 2. GitHub Models API Token

Create a GitHub secret called `MODELS_TOKEN` with access to GitHub Models API:

1. Go to **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret**
3. Name: `MODELS_TOKEN`
4. Value: Your GitHub Models API token (or Personal Access Token with `models: read` scope)

> **Note**: If `MODELS_TOKEN` is not set, the workflow falls back to using `GITHUB_TOKEN`, which may have limited access to the Models API.

### 3. Default Branch

The workflow creates branches from `main`. If your default branch is different (e.g., `master`, `develop`), update line 48:

```yaml
ref: 'heads/main'  # Change to your default branch
```

## Usage

### Automatic Usage

Simply create a new issue! The workflow will:

1. Automatically detect the issue creation
2. Generate a feature branch
3. Create BDD test scenarios
4. Open a draft PR

### Manual Trigger (Optional)

You can also trigger the workflow manually from the Actions tab if you want to re-run it for an existing issue.

## Generated Files

For an issue titled "Add user authentication", the workflow creates:

```
specs/
  issue-42-add-user-authentication/
    add-user-authentication.feature      # BDD scenarios
    step_definitions/
      add-user-authentication_steps.js   # Step definition placeholders
```

## Example Output

### Feature File (`*.feature`)
```gherkin
Feature: User Authentication
  As a user
  I want to authenticate securely
  So that I can access protected resources

  Background:
    Given the authentication system is initialized

  Scenario: Successful login with valid credentials
    When the user logs in with valid credentials
    Then the user should be authenticated
    And a session token should be generated

  Scenario: Failed login with invalid credentials
    When the user logs in with invalid credentials
    Then authentication should fail
    And an error message should be displayed
```

### Step Definitions (`*_steps.js`)
```javascript
const { Given, When, Then } = require('@cucumber/cucumber');

Given('the authentication system is initialized', function () {
  // TODO: Setup authentication system
});

When('the user logs in with valid credentials', function () {
  // TODO: Implement login action
});

Then('the user should be authenticated', function () {
  // TODO: Verify authentication
});
```

## Developer Workflow

After the PR is created:

1. **Review the BDD scenarios** in the feature file
2. **Implement step definitions** in the `step_definitions/` folder
3. **Run tests** to see them fail: `npm test`
4. **Implement the feature** to make tests pass
5. **Verify** all scenarios pass: `npm run test:bdd`
6. **Mark PR as ready** for review
7. **Merge** after approval

## Customization

### Modify AI Prompts

Edit the prompt files to customize how test plans are generated:

- `.github/prompts/learn-feature-request.prompt.md` - Requirements analysis
- `.github/prompts/create-test-plan.prompt.md` - Test plan generation
- `.github/prompts/kickoff-feature.prompt.md` - Overall kickoff process

### Change Branch Naming

Modify line 40 to change the branch naming pattern:

```javascript
const branchName = `feature/issue-${issueNumber}-${issueTitle...}`;
```

### Adjust Test File Location

Change line 228-229 to modify where feature files are created:

```javascript
const featurePath = `specs/issue-${issueNumber}-${featureName}`;
```

## Troubleshooting

### Workflow Fails with "Branch already exists"

This is handled gracefully. The workflow will continue and update the existing branch.

### Test Plan Quality Issues

The AI-generated test plans are a starting point. Always review and refine them:

- Ensure declarative style (behavior, not implementation)
- Check for complete coverage (happy path + edge cases)
- Verify business value is clear

### Models API Errors

If you see authentication errors:
1. Verify `MODELS_TOKEN` is set correctly
2. Check token has `models: read` permission
3. Ensure you're within GitHub Models API rate limits

## Best Practices

1. **Review Before Implementing**: Always review generated scenarios before coding
2. **Refine Scenarios**: Update the Gherkin if it doesn't match your understanding
3. **Keep Declarative**: Maintain behavior-focused language in scenarios
4. **Test First**: Implement step definitions and watch tests fail before feature coding
5. **Iterate**: Use git hooks to ensure tests pass before committing

## Related Documentation

- [Git Hooks Implementation](../docs/GIT_HOOKS_IMPLEMENTATION.md)
- [Hooks Usage Guide](../hooks/README.md)
- [BDD Testing Guidelines](../../.github/copilot-instructions.md)

## Disabling the Workflow

To temporarily disable automatic branch creation:

1. Go to **Actions** → **Auto Feature Branch and PR**
2. Click the **⋯** menu → **Disable workflow**

Or delete/rename the workflow file: `.github/workflows/auto-feature-branch-and-pr.yml`
