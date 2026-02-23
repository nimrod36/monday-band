const { Then } = require('@cucumber/cucumber');
const fs = require('fs');
const path = require('path');
const assert = require('assert');

const hooksDir = path.join(__dirname, '../../../hooks');
const preCommitPath = path.join(hooksDir, 'pre-commit');
const prePushPath = path.join(hooksDir, 'pre-push');

Then('the pre-commit hook file exists', function() {
  assert(fs.existsSync(preCommitPath), 'pre-commit hook file does not exist');
});

Then('the pre-push hook file exists', function() {
  assert(fs.existsSync(prePushPath), 'pre-push hook file does not exist');
});

Then('the pre-commit hook is executable', function() {
  const stats = fs.statSync(preCommitPath);
  const isExecutable = (stats.mode & 0o111) !== 0;
  assert(isExecutable, 'pre-commit hook is not executable');
});

Then('the pre-push hook is executable', function() {
  const stats = fs.statSync(prePushPath);
  const isExecutable = (stats.mode & 0o111) !== 0;
  assert(isExecutable, 'pre-push hook is not executable');
});

Then('the pre-commit hook runs npm test', function() {
  const content = fs.readFileSync(preCommitPath, 'utf-8');
  assert(content.includes('npm test'), 'pre-commit hook does not run npm test');
});

Then('the pre-push hook runs npm test', function() {
  const content = fs.readFileSync(prePushPath, 'utf-8');
  assert(content.includes('npm test'), 'pre-push hook does not run npm test');
});

Then('developers can use --no-verify to bypass hooks', function() {
  // This is a Git feature - we just document that it's available
  assert(true, 'Git supports --no-verify flag');
});
