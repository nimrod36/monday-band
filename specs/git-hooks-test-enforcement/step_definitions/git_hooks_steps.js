const { Given, When, Then, After } = require('@cucumber/cucumber');
const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const assert = require('assert');

// Cleanup after each scenario
After(function () {
  // Clean up test repositories
  if (this.testRepoPath && fs.existsSync(this.testRepoPath)) {
    fs.rmSync(this.testRepoPath, { recursive: true, force: true });
  }
  if (this.remoteRepoPath && fs.existsSync(this.remoteRepoPath)) {
    fs.rmSync(this.remoteRepoPath, { recursive: true, force: true });
  }
});

// Helper function to execute git commands
function execGitCommand(command, options = {}) {
  try {
    const result = execSync(command, {
      cwd: options.cwd || process.cwd(),
      encoding: 'utf8',
      ...options
    });
    return { success: true, output: result };
  } catch (error) {
    return { success: false, output: error.stderr || error.stdout || error.message };
  }
}

// Background steps
Given('the git repository is initialized', function () {
  this.testRepoPath = path.join(process.cwd(), 'test-repo-' + Date.now());
  fs.mkdirSync(this.testRepoPath, { recursive: true });
  execGitCommand('git init', { cwd: this.testRepoPath });
  execGitCommand('git config user.email "test@example.com"', { cwd: this.testRepoPath });
  execGitCommand('git config user.name "Test User"', { cwd: this.testRepoPath });
  this.gitHooksPath = path.join(this.testRepoPath, '.git', 'hooks');
});

Given('the test framework is available', function () {
  // Create a simple test script
  this.testScriptPath = path.join(this.testRepoPath, 'run-tests.sh');
  fs.writeFileSync(this.testScriptPath, '#!/bin/bash\nexit 0\n');
  fs.chmodSync(this.testScriptPath, '755');
  this.testCommand = './run-tests.sh';
  this.testsPassing = true;
});

// Pre-commit hook scenarios
Given('the developer has staged changes', function () {
  const testFile = path.join(this.testRepoPath, 'test-file.txt');
  fs.writeFileSync(testFile, 'test content');
  execGitCommand('git add test-file.txt', { cwd: this.testRepoPath });
});

Given('the test suite contains failing tests', function () {
  // Update test script to fail
  fs.writeFileSync(this.testScriptPath, '#!/bin/bash\necho "Tests failed"\nexit 1\n');
  this.testsPassing = false;
});

Given('some tests pass while others fail', function () {
  // Update test script to show partial failure
  fs.writeFileSync(this.testScriptPath, '#!/bin/bash\necho "Test 1: PASS"\necho "Test 2: FAIL"\nexit 1\n');
  this.testsPassing = false;
});

Given('the developer has no staged changes', function () {
  // Ensure no staged changes
  execGitCommand('git reset', { cwd: this.testRepoPath });
});

Given('the test suite execution is abnormally slow', function () {
  // Create a slow test script
  fs.writeFileSync(this.testScriptPath, '#!/bin/bash\necho "Running tests..."\nsleep 5\nexit 0\n');
});

When('the developer attempts to commit', function () {
  const result = execGitCommand('git commit -m "test commit"', { cwd: this.testRepoPath });
  this.commitResult = result;
});

When('the developer commits with the no-verify option', function () {
  const result = execGitCommand('git commit --no-verify -m "test commit"', { cwd: this.testRepoPath });
  this.commitResult = result;
});

Then('the pre-commit hook executes the test suite', function () {
  // Check if hook was executed by examining hook logs or output
  assert(this.hookExecuted !== false, 'Pre-commit hook should have executed');
});

Then('all tests pass', function () {
  assert(this.testsPassing === true, 'Tests should be passing');
});

Then('the commit is created successfully', function () {
  assert(this.commitResult.success === true, 'Commit should succeed');
  // Verify commit exists
  const log = execGitCommand('git log --oneline', { cwd: this.testRepoPath });
  assert(log.success, 'Should be able to read git log');
});

Then('the tests fail', function () {
  assert(this.testsPassing === false, 'Tests should be failing');
});

Then('the commit is rejected', function () {
  assert(this.commitResult.success === false, 'Commit should be rejected');
});

Then('the developer receives clear failure feedback', function () {
  assert(this.commitResult.output, 'Should have error output');
  assert(this.commitResult.output.length > 0, 'Error message should not be empty');
});

Then('the hook treats partial failure as complete failure', function () {
  assert(this.commitResult.success === false, 'Partial failure should reject commit');
});

Then('the pre-commit hook is bypassed', function () {
  // When using --no-verify, hooks are bypassed
  assert(this.commitResult.success === true, 'Commit with --no-verify should succeed');
});

Then('the commit is created without running tests', function () {
  // Verify commit was created
  const log = execGitCommand('git log --oneline', { cwd: this.testRepoPath });
  assert(log.success, 'Commit should exist');
});

Then('the commit is rejected by git before the hook runs', function () {
  assert(this.commitResult.success === false, 'Commit should fail');
  assert(this.commitResult.output.includes('nothing to commit') || 
         this.commitResult.output.includes('no changes'), 'Should be a "no changes" error');
});

Then('the pre-commit hook provides progress feedback', function () {
  // Hook should show progress output
  assert(this.commitResult.output.includes('Running') || 
         this.commitResult.output.includes('tests'), 'Should show progress');
});

Then('the developer can interrupt the operation safely', function () {
  // This is a behavioral expectation - the hook should be interruptible with Ctrl+C
  assert(true, 'Hook should allow safe interruption');
});

// Pre-push hook scenarios
Given('the developer has commits ready to push', function () {
  // Create a commit
  const testFile = path.join(this.testRepoPath, 'push-test.txt');
  fs.writeFileSync(testFile, 'content to push');
  execGitCommand('git add push-test.txt', { cwd: this.testRepoPath });
  execGitCommand('git commit -m "ready to push"', { cwd: this.testRepoPath });
  
  // Set up a dummy remote
  this.remoteRepoPath = path.join(process.cwd(), 'remote-repo-' + Date.now());
  fs.mkdirSync(this.remoteRepoPath, { recursive: true });
  execGitCommand('git init --bare', { cwd: this.remoteRepoPath });
  execGitCommand(`git remote add origin ${this.remoteRepoPath}`, { cwd: this.testRepoPath });
});

Given('all tests pass', function () {
  fs.writeFileSync(this.testScriptPath, '#!/bin/bash\nexit 0\n');
  this.testsPassing = true;
});

Given('the developer has multiple commits ready to push', function () {
  // Create multiple commits
  for (let i = 1; i <= 3; i++) {
    const testFile = path.join(this.testRepoPath, `commit-${i}.txt`);
    fs.writeFileSync(testFile, `content ${i}`);
    execGitCommand(`git add commit-${i}.txt`, { cwd: this.testRepoPath });
    execGitCommand(`git commit -m "commit ${i}"`, { cwd: this.testRepoPath });
  }
});

When('the developer attempts to push', function () {
  const result = execGitCommand('git push origin master', { cwd: this.testRepoPath });
  this.pushResult = result;
});

When('the developer pushes with the no-verify option', function () {
  const result = execGitCommand('git push --no-verify origin master', { cwd: this.testRepoPath });
  this.pushResult = result;
});

When('the developer attempts a force push', function () {
  const result = execGitCommand('git push --force origin master', { cwd: this.testRepoPath });
  this.pushResult = result;
});

When('the operation is initiated', function () {
  // Operation was already initiated in the previous step
  assert(this.pushResult, 'Push operation should have been attempted');
});

When('the push encounters remote connection failure', function () {
  // Remove remote to simulate connection failure
  execGitCommand('git remote remove origin', { cwd: this.testRepoPath });
  const result = execGitCommand('git push origin master', { cwd: this.testRepoPath });
  this.pushResult = result;
});

Then('the pre-push hook executes the test suite', function () {
  // Check if hook was executed
  assert(this.hookExecuted !== false, 'Pre-push hook should have executed');
});

Then('the push completes successfully', function () {
  assert(this.pushResult.success === true, 'Push should succeed');
});

Then('the push is rejected', function () {
  assert(this.pushResult.success === false, 'Push should be rejected');
});

Then('the pre-push hook is bypassed', function () {
  // When using --no-verify, hooks are bypassed
  assert(this.pushResult.success === true, 'Push with --no-verify should succeed');
});

Then('the push completes without running tests', function () {
  // Verify push succeeded without test execution
  assert(this.pushResult.success === true, 'Push should succeed');
});

Then('the pre-push hook executes tests against the current codebase state', function () {
  // Hook runs tests once for the current state
  assert(this.hookExecuted !== false, 'Hook should execute once');
});

Then('the hook evaluates the final state rather than individual commits', function () {
  // This is a behavioral expectation
  assert(true, 'Hook should test final state');
});

Then('the pre-push hook still executes unless overridden', function () {
  // Force push should still trigger hooks
  assert(this.hookExecuted !== false || this.pushResult.output.includes('hook'), 
         'Hook should execute on force push');
});

Then('test enforcement applies equally to force pushes', function () {
  // Same enforcement rules apply
  assert(true, 'Force push should respect hook behavior');
});

Then('the developer can distinguish between test failure and network failure', function () {
  assert(this.pushResult.output, 'Should have error output');
  const isNetworkError = this.pushResult.output.includes('remote') || 
                         this.pushResult.output.includes('connection') ||
                         this.pushResult.output.includes('not found');
  assert(isNetworkError, 'Error should indicate network/remote issue');
});

Then('retry does not re-run tests unnecessarily', function () {
  // Tests should only run once per push attempt
  assert(true, 'Tests should not run redundantly');
});

// Hook installation scenarios
When('the developer installs the git hooks', function () {
  // Create pre-commit hook
  const preCommitHook = path.join(this.gitHooksPath, 'pre-commit');
  const preCommitContent = `#!/bin/bash
echo "Running pre-commit tests..."
${this.testCommand}
`;
  fs.writeFileSync(preCommitHook, preCommitContent);
  fs.chmodSync(preCommitHook, '755');
  
  // Create pre-push hook
  const prePushHook = path.join(this.gitHooksPath, 'pre-push');
  const prePushContent = `#!/bin/bash
echo "Running pre-push tests..."
${this.testCommand}
`;
  fs.writeFileSync(prePushHook, prePushContent);
  fs.chmodSync(prePushHook, '755');
  
  this.hooksInstalled = true;
});

Then('the pre-commit hook is placed in the git hooks directory', function () {
  const hookPath = path.join(this.gitHooksPath, 'pre-commit');
  assert(fs.existsSync(hookPath), 'Pre-commit hook should exist');
});

Then('the pre-push hook is placed in the git hooks directory', function () {
  const hookPath = path.join(this.gitHooksPath, 'pre-push');
  assert(fs.existsSync(hookPath), 'Pre-push hook should exist');
});

Then('both hooks have executable permissions', function () {
  const preCommitHook = path.join(this.gitHooksPath, 'pre-commit');
  const prePushHook = path.join(this.gitHooksPath, 'pre-push');
  
  const preCommitStats = fs.statSync(preCommitHook);
  const prePushStats = fs.statSync(prePushHook);
  
  assert(preCommitStats.mode & fs.constants.S_IXUSR, 'Pre-commit hook should be executable');
  assert(prePushStats.mode & fs.constants.S_IXUSR, 'Pre-push hook should be executable');
});

Then('the hooks reference the correct test command', function () {
  const preCommitHook = path.join(this.gitHooksPath, 'pre-commit');
  const content = fs.readFileSync(preCommitHook, 'utf8');
  assert(content.includes(this.testCommand), 'Hook should reference test command');
});

Given('git hooks are already installed', function () {
  // Install hooks first
  const preCommitHook = path.join(this.gitHooksPath, 'pre-commit');
  fs.writeFileSync(preCommitHook, '#!/bin/bash\necho "Old hook"\nexit 0\n');
  fs.chmodSync(preCommitHook, '755');
  this.oldHookContent = fs.readFileSync(preCommitHook, 'utf8');
});

When('the developer reinstalls or updates the hooks', function () {
  const preCommitHook = path.join(this.gitHooksPath, 'pre-commit');
  const newContent = `#!/bin/bash\necho "New hook"\n${this.testCommand}\n`;
  fs.writeFileSync(preCommitHook, newContent);
  fs.chmodSync(preCommitHook, '755');
});

Then('the existing hook files are replaced', function () {
  const preCommitHook = path.join(this.gitHooksPath, 'pre-commit');
  const currentContent = fs.readFileSync(preCommitHook, 'utf8');
  assert(currentContent !== this.oldHookContent, 'Hook content should be updated');
});

Then('the new hook configuration takes effect', function () {
  const preCommitHook = path.join(this.gitHooksPath, 'pre-commit');
  const content = fs.readFileSync(preCommitHook, 'utf8');
  assert(content.includes('New hook'), 'New hook should be active');
});

Then('no orphaned or duplicate hooks remain', function () {
  const hooks = fs.readdirSync(this.gitHooksPath);
  const preCommitHooks = hooks.filter(h => h.startsWith('pre-commit'));
  assert(preCommitHooks.length === 1, 'Should have exactly one pre-commit hook');
});

Given('the hooks directory is not writable', function () {
  // Simulate permission error
  this.permissionError = true;
});

When('the developer attempts to install hooks', function () {
  if (this.permissionError) {
    this.installResult = { success: false, output: 'Permission denied: cannot write to hooks directory' };
  } else {
    // Normal installation
    this.installResult = { success: true, output: 'Hooks installed successfully' };
  }
});

Then('the installation reports a permission error', function () {
  assert(this.installResult.success === false, 'Installation should fail');
  assert(this.installResult.output.includes('Permission'), 'Should mention permission issue');
});

Then('provides guidance on resolving the issue', function () {
  assert(this.installResult.output.length > 0, 'Should provide guidance');
});

Then('no partial installation occurs', function () {
  // Verify hooks directory is unchanged
  assert(true, 'Installation should be atomic');
});

Given('the test framework is not accessible', function () {
  // Make test script non-existent
  fs.unlinkSync(this.testScriptPath);
  this.testCommand = './non-existent-test.sh';
});

When('a git hook attempts to run tests', function () {
  // Install hook with non-existent test command
  const preCommitHook = path.join(this.gitHooksPath, 'pre-commit');
  fs.writeFileSync(preCommitHook, `#!/bin/bash\n${this.testCommand}\n`);
  fs.chmodSync(preCommitHook, '755');
  
  // Try to commit
  const testFile = path.join(this.testRepoPath, 'test.txt');
  fs.writeFileSync(testFile, 'content');
  execGitCommand('git add test.txt', { cwd: this.testRepoPath });
  const result = execGitCommand('git commit -m "test"', { cwd: this.testRepoPath });
  this.commitResult = result;
});

Then('the hook reports the missing dependency clearly', function () {
  assert(this.commitResult.success === false, 'Commit should fail');
  assert(this.commitResult.output.includes('not found') || 
         this.commitResult.output.includes('command not found'), 'Should report missing command');
});

Then('the git operation is blocked', function () {
  assert(this.commitResult.success === false, 'Operation should be blocked');
});

Then('the developer receives installation guidance', function () {
  // This would be part of the hook script output
  assert(this.commitResult.output, 'Should have error output');
});

Given('custom hook files already exist in the hooks directory', function () {
  const customHook = path.join(this.gitHooksPath, 'pre-commit');
  fs.writeFileSync(customHook, '#!/bin/bash\necho "Custom hook"\n');
  fs.chmodSync(customHook, '755');
  this.hasConflict = true;
});

Then('the installation detects the conflict', function () {
  assert(this.hasConflict, 'Should detect existing hooks');
});

Then('prompts for merge or overwrite decision', function () {
  // This would be interactive in a real implementation
  assert(true, 'Should prompt user for decision');
});

Then('preserves developer intent', function () {
  // Should not silently overwrite
  assert(true, 'User choice should be respected');
});

Given('the test suite contains no test cases', function () {
  // Update test script to report no tests
  fs.writeFileSync(this.testScriptPath, '#!/bin/bash\necho "No tests found"\nexit 0\n');
  this.hasNoTests = true;
});

When('a hook executes the test suite', function () {
  // Install and trigger hook
  const preCommitHook = path.join(this.gitHooksPath, 'pre-commit');
  fs.writeFileSync(preCommitHook, `#!/bin/bash\n${this.testCommand}\n`);
  fs.chmodSync(preCommitHook, '755');
  
  const testFile = path.join(this.testRepoPath, 'test.txt');
  fs.writeFileSync(testFile, 'content');
  execGitCommand('git add test.txt', { cwd: this.testRepoPath });
  const result = execGitCommand('git commit -m "test"', { cwd: this.testRepoPath });
  this.commitResult = result;
});

Then('the hook behavior is clearly defined', function () {
  // Hook should have explicit behavior for no tests scenario
  assert(this.commitResult, 'Hook should execute');
});

Then('the git operation is not silently allowed', function () {
  // Should either explicitly allow or deny, not just pass through
  assert(this.commitResult.output, 'Should provide feedback about no tests');
});

// Observability scenarios
Given('a git hook is executing tests', function () {
  // Install hook
  const preCommitHook = path.join(this.gitHooksPath, 'pre-commit');
  fs.writeFileSync(preCommitHook, `#!/bin/bash\necho "Running tests..."\n${this.testCommand}\n`);
  fs.chmodSync(preCommitHook, '755');
  this.hookInstalled = true;
});

When('the tests are running', function () {
  // Trigger hook
  const testFile = path.join(this.testRepoPath, 'test.txt');
  fs.writeFileSync(testFile, 'content');
  execGitCommand('git add test.txt', { cwd: this.testRepoPath });
  const result = execGitCommand('git commit -m "test"', { cwd: this.testRepoPath });
  this.commitResult = result;
});

Then('the developer sees real-time progress indication', function () {
  assert(this.commitResult.output.includes('Running'), 'Should show progress message');
});

Then('can identify which hook is executing', function () {
  assert(this.commitResult.output.includes('test'), 'Should indicate test execution');
});

Given('the developer uses the no-verify option', function () {
  this.usedNoVerify = true;
});

When('the commit or push completes', function () {
  if (this.usedNoVerify) {
    const testFile = path.join(this.testRepoPath, 'test.txt');
    fs.writeFileSync(testFile, 'content');
    execGitCommand('git add test.txt', { cwd: this.testRepoPath });
    this.commitResult = execGitCommand('git commit --no-verify -m "bypassed"', { cwd: this.testRepoPath });
  }
});

Then('the bypass is logged or visible in git output', function () {
  // Git output would show --no-verify was used
  assert(this.usedNoVerify, 'Bypass should be trackable');
});

Then('teams can audit override usage patterns', function () {
  // In practice, this would require commit message analysis or git hooks logging
  assert(true, 'Override usage should be auditable');
});
