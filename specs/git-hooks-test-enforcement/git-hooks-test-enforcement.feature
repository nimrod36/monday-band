Feature: Git Hooks for Test Enforcement
  As a development team
  We want automated test execution before commits and pushes
  So that code quality gates are enforced at the source control level

  Background:
    Given the git repository is initialized
    And the test framework is available

  Rule: Pre-commit hook prevents commits when tests fail

    Scenario: Successful commit with passing tests
      Given the developer has staged changes
      When the developer attempts to commit
      Then the pre-commit hook executes the test suite
      And all tests pass
      And the commit is created successfully

    Scenario: Blocked commit due to failing tests
      Given the developer has staged changes
      And the test suite contains failing tests
      When the developer attempts to commit
      Then the pre-commit hook executes the test suite
      And the tests fail
      And the commit is rejected
      And the developer receives clear failure feedback

    Scenario: Blocked commit with partial test failures
      Given the developer has staged changes
      And some tests pass while others fail
      When the developer attempts to commit
      Then the pre-commit hook executes the test suite
      And the hook treats partial failure as complete failure
      And the commit is rejected

    Scenario: Commit with override bypasses tests
      Given the developer has staged changes
      When the developer commits with the no-verify option
      Then the pre-commit hook is bypassed
      And the commit is created without running tests

    Scenario: Commit attempt with no staged changes
      Given the developer has no staged changes
      When the developer attempts to commit
      Then the commit is rejected by git before the hook runs

    Scenario: Hook execution exceeds reasonable time threshold
      Given the developer has staged changes
      And the test suite execution is abnormally slow
      When the developer attempts to commit
      Then the pre-commit hook provides progress feedback
      And the developer can interrupt the operation safely

  Rule: Pre-push hook prevents pushes when tests fail

    Scenario: Successful push with passing tests
      Given the developer has commits ready to push
      When the developer attempts to push
      Then the pre-push hook executes the test suite
      And all tests pass
      And the push completes successfully

    Scenario: Blocked push due to failing tests
      Given the developer has commits ready to push
      And the test suite contains failing tests
      When the developer attempts to push
      Then the pre-push hook executes the test suite
      And the tests fail
      And the push is rejected
      And the developer receives clear failure feedback

    Scenario: Push with override bypasses tests
      Given the developer has commits ready to push
      When the developer pushes with the no-verify option
      Then the pre-push hook is bypassed
      And the push completes without running tests

    Scenario: Push multiple commits with mixed test states
      Given the developer has multiple commits ready to push
      When the developer attempts to push
      Then the pre-push hook executes tests against the current codebase state
      And the hook evaluates the final state rather than individual commits

    Scenario: Force push respects hook behavior
      Given the developer attempts a force push
      When the operation is initiated
      Then the pre-push hook still executes unless overridden
      And test enforcement applies equally to force pushes

    Scenario: Push fails due to remote issues after tests pass
      Given the developer has commits ready to push
      And all tests pass
      When the push encounters remote connection failure
      Then the developer can distinguish between test failure and network failure
      And retry does not re-run tests unnecessarily

  Rule: Hook installation and configuration

    Scenario: Hooks are properly installed
      When the developer installs the git hooks
      Then the pre-commit hook is placed in the git hooks directory
      And the pre-push hook is placed in the git hooks directory
      And both hooks have executable permissions
      And the hooks reference the correct test command

    Scenario: Hook reinstallation updates existing hooks
      Given git hooks are already installed
      When the developer reinstalls or updates the hooks
      Then the existing hook files are replaced
      And the new hook configuration takes effect
      And no orphaned or duplicate hooks remain

    Scenario: Installation fails due to permission restrictions
      Given the hooks directory is not writable
      When the developer attempts to install hooks
      Then the installation reports a permission error
      And provides guidance on resolving the issue
      And no partial installation occurs

    Scenario: Test framework unavailable during hook execution
      Given the test framework is not accessible
      When a git hook attempts to run tests
      Then the hook reports the missing dependency clearly
      And the git operation is blocked
      And the developer receives installation guidance

    Scenario: Hooks directory contains conflicting files
      Given custom hook files already exist in the hooks directory
      When the developer installs the test enforcement hooks
      Then the installation detects the conflict
      And prompts for merge or overwrite decision
      And preserves developer intent

    Scenario: Zero tests in test suite
      Given the test suite contains no test cases
      When a hook executes the test suite
      Then the hook behavior is clearly defined
      And the git operation is not silently allowed

  Rule: Hook behavior observability and auditability

    Scenario: Hook execution is visible to the developer
      Given a git hook is executing tests
      When the tests are running
      Then the developer sees real-time progress indication
      And can identify which hook is executing

    Scenario: Hook bypass is detectable
      Given the developer uses the no-verify option
      When the commit or push completes
      Then the bypass is logged or visible in git output
      And teams can audit override usage patterns
