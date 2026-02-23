Feature: Git Hooks for Test Enforcement
  Test that git hooks enforce test execution before commits and pushes

  Scenario: Hooks exist and are executable
    Then the pre-commit hook file exists
    And the pre-push hook file exists
    And the pre-commit hook is executable
    And the pre-push hook is executable
  
  Scenario: Pre-commit hook contains test command
    Then the pre-commit hook runs npm test
  
  Scenario: Pre-push hook contains test command
    Then the pre-push hook runs npm test
  
  Scenario: Hooks can be bypassed with --no-verify
    Then developers can use --no-verify to bypass hooks
