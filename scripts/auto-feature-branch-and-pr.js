// scripts/auto-feature-branch-and-pr.js
// Extracted from workflow for clarity and maintainability

const { getOctokit, context } = require('@actions/github');
const fs = require('fs');
const path = require('path');

async function main() {
  const github = getOctokit(process.env.GITHUB_TOKEN);
  
  // Support both issue trigger and manual workflow_dispatch
  let issueNumber, issueTitle, issueBody, issueLabels;
  
  if (context.eventName === 'workflow_dispatch') {
    // Manual trigger - fetch issue details
    issueNumber = context.payload.inputs.issue_number;
    const { data: issue } = await github.rest.issues.get({
      owner: context.repo.owner,
      repo: context.repo.repo,
      issue_number: issueNumber
    });
    issueTitle = issue.title;
    issueBody = issue.body || '';
    issueLabels = issue.labels.map(l => l.name).join(', ');
  } else {
    // Triggered by issue event
    issueNumber = context.payload.issue.number;
    issueTitle = context.payload.issue.title;
    issueBody = context.payload.issue.body || '';
    issueLabels = context.payload.issue.labels.map(l => l.name).join(', ');
  }

  // Create branch name from issue title
  const branchName = `feature/issue-${issueNumber}-${issueTitle
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 50)}`;

  console.log(`Creating branch: ${branchName}`);

  // Get the default branch SHA
  const { data: ref } = await github.rest.git.getRef({
    owner: context.repo.owner,
    repo: context.repo.repo,
    ref: 'heads/main'
  });

  // Create new branch
  try {
    await github.rest.git.createRef({
      owner: context.repo.owner,
      repo: context.repo.repo,
      ref: `refs/heads/${branchName}`,
      sha: ref.object.sha
    });
    console.log(`✅ Branch created: ${branchName}`);
  } catch (error) {
    if (error.status === 422) {
      console.log('Branch already exists, continuing...');
    } else {
      throw error;
    }
  }

  // Read prompt files
  let learnPrompt, createTestPlanPrompt;
  try {
    learnPrompt = fs.readFileSync('.github/prompts/learn-feature-request.prompt.md', 'utf8');
    createTestPlanPrompt = fs.readFileSync('.github/prompts/create-test-plan.prompt.md', 'utf8');
  } catch (error) {
    console.log('⚠️ Could not read prompt files, using simplified prompts');
    learnPrompt = 'Analyze the feature request and understand the requirements.';
    createTestPlanPrompt = 'Generate comprehensive Gherkin BDD test scenarios.';
  }

  // Phase 1: Learn Feature Request (Understanding)
  const learnSystemPrompt = `You are a Lead Developer and Requirements Shaper.\n\n${learnPrompt}\n\nAnalyze the feature request deeply and produce a structured understanding artifact.\nFocus on: business intent, scope boundaries, assumptions, and business rules.\n\nOutput a clear analysis document following the prompt structure.`;

  const learnUserPrompt = `Analyze this GitHub issue for feature development:\n\n**Issue #${issueNumber}: ${issueTitle}**\n**Labels**: ${issueLabels || 'None'}\n\n**Description**:\n${issueBody}\n\nProduce a structured understanding artifact that captures the business intent, scope boundaries, and key assumptions.`;

  console.log('🧠 Phase 1: Learning feature request...');

  const modelsToken = process.env.MODELS_TOKEN || process.env.GITHUB_TOKEN;
  let featureUnderstanding = '';

  try {
    const learnResponse = await fetch('https://models.inference.ai.azure.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${modelsToken}`
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: learnSystemPrompt },
          { role: 'user', content: learnUserPrompt }
        ],
        temperature: 0.7,
        max_tokens: 2000
      })
    });

    if (learnResponse.ok) {
      const learnData = await learnResponse.json();
      featureUnderstanding = learnData.choices[0].message.content;
      console.log('✅ Feature understanding generated');
    }
  } catch (error) {
    console.log('⚠️ Learn phase failed:', error.message);
  }

  // Phase 2: Create Test Plan (Gherkin scenarios)
  const testPlanSystemPrompt = `You are a Senior BDD Architect and Quality Lead.\n\n${createTestPlanPrompt}\n\nGenerate a comprehensive, declarative Gherkin test plan that serves as Living Documentation.\nFollow the Specification by Example approach.\n\nCRITICAL: Output ONLY the Gherkin feature file content, no markdown code fences, no explanations.\nStart directly with "Feature:" and follow standard Gherkin syntax.`;

  const testPlanUserPrompt = `Generate a comprehensive BDD test plan for this feature:\n\n**Issue #${issueNumber}: ${issueTitle}**\n**Labels**: ${issueLabels || 'None'}\n\n**Original Request**:\n${issueBody}\n\n${featureUnderstanding ? `\n**Feature Understanding**:\n${featureUnderstanding}\n` : ''}\n\nCreate a complete Gherkin feature file with:\n- Feature description with business value\n- Background (if needed)\n- Multiple scenarios covering happy path, edge cases, and error handling\n- Declarative steps (behavior-focused, not implementation-focused)\n\nOutput ONLY the Gherkin content, starting with "Feature:".`;

  console.log('📝 Phase 2: Creating test plan...');

  let testPlanContent = '';

  try {
    const testPlanResponse = await fetch('https://models.inference.ai.azure.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${modelsToken}`
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: testPlanSystemPrompt },
          { role: 'user', content: testPlanUserPrompt }
        ],
        temperature: 0.7,
        max_tokens: 3000
      })
    });

    if (testPlanResponse.ok) {
      const testPlanData = await testPlanResponse.json();
      testPlanContent = testPlanData.choices[0].message.content;
      // Clean up any markdown code fences if present
      testPlanContent = testPlanContent
        .replace(/```gherkin\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
      console.log('✅ Test plan generated');
    }
  } catch (error) {
    console.log('⚠️ Test plan generation failed:', error.message);
    testPlanContent = `Feature: ${issueTitle}\n\n  Scenario: Placeholder scenario\n    Given the feature is implemented\n    When the user interacts with the system\n    Then the expected behavior should occur`;
  }

  // Create feature directory and file
  const featureName = issueTitle
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  const featurePath = `specs/issue-${issueNumber}-${featureName}`;
  const featureFileName = `${featureName}.feature`;

  // Create the feature file content
  const featureFileContent = testPlanContent;

  // Get current file content to check if path exists
  let fileExists = false;
  try {
    await github.rest.repos.getContent({
      owner: context.repo.owner,
      repo: context.repo.repo,
      path: `${featurePath}/${featureFileName}`,
      ref: branchName
    });
    fileExists = true;
  } catch (error) {
    // File doesn't exist, which is expected
  }

  // Create or update the feature file on the new branch
  const fileOperation = fileExists ? 'update' : 'create';

  await github.rest.repos.createOrUpdateFileContents({
    owner: context.repo.owner,
    repo: context.repo.repo,
    path: `${featurePath}/${featureFileName}`,
    message: `Add BDD test plan for issue #${issueNumber}`,
    content: Buffer.from(featureFileContent).toString('base64'),
    branch: branchName,
    ...(fileExists && { sha: (await github.rest.repos.getContent({
      owner: context.repo.owner,
      repo: context.repo.repo,
      path: `${featurePath}/${featureFileName}`,
      ref: branchName
    })).data.sha })
  });

  console.log(`✅ Feature file created: ${featurePath}/${featureFileName}`);

  // Create step_definitions directory with placeholder
  const stepDefContent = `// Step definitions for: ${issueTitle}\n// Issue: #${issueNumber}\n\nconst { Given, When, Then } = require('@cucumber/cucumber');\n\n// TODO: Implement step definitions for the feature scenarios\n\nGiven('the feature is implemented', function () {\n  // TODO: Setup preconditions\n});\n\nWhen('the user interacts with the system', function () {\n  // TODO: Trigger the action\n});\n\nThen('the expected behavior should occur', function () {\n  // TODO: Verify the outcome\n});\n`;

  await github.rest.repos.createOrUpdateFileContents({
    owner: context.repo.owner,
    repo: context.repo.repo,
    path: `${featurePath}/step_definitions/${featureName}_steps.js`,
    message: `Add step definitions placeholder for issue #${issueNumber}`,
    content: Buffer.from(stepDefContent).toString('base64'),
    branch: branchName
  });

  console.log(`✅ Step definitions placeholder created`);

  // Create Pull Request
  const prBody = `## 🤖 Auto-generated Feature Branch\n\nThis PR was automatically created from issue #${issueNumber}.\n\n### 📋 Feature Overview\n${featureUnderstanding ? featureUnderstanding : issueBody}\n\n### 🧪 BDD Test Plan\nA comprehensive Gherkin test plan has been generated at:\n\`${featurePath}/${featureFileName}\`\n\n### ✅ Next Steps\n1. Review the generated BDD scenarios\n2. Implement the step definitions in \`${featurePath}/step_definitions/\`\n3. Implement the feature to make the tests pass\n4. Run tests: \`npm test\`\n5. Update this PR with your implementation\n\n### 🔗 Related\nCloses #${issueNumber}\n\n---\n*Generated by the Auto Feature Branch workflow using GitHub Copilot*`;

  const { data: pr } = await github.rest.pulls.create({
    owner: context.repo.owner,
    repo: context.repo.repo,
    title: `Feature: ${issueTitle} (#${issueNumber})`,
    head: branchName,
    base: 'main',
    body: prBody,
    draft: true
  });

  console.log(`✅ Pull request created: #${pr.number}`);

  // Add comment to the original issue
  await github.rest.issues.createComment({
    owner: context.repo.owner,
    repo: context.repo.repo,
    issue_number: issueNumber,
    body: `🤖 **Automated Feature Kickoff Complete!**\n\n✅ Branch created: \`${branchName}\`\n✅ BDD test plan generated: \`${featurePath}/${featureFileName}\`\n✅ Pull request opened: #${pr.number}\n\n**Next steps:**\n1. Review the [pull request](#${pr.number}) and generated test plan\n2. Implement the step definitions\n3. Implement the feature to satisfy the BDD scenarios\n4. Mark the PR as ready for review\n\nThe test plan was generated using the kickoff-feature workflow with AI-powered analysis.`
  });

  console.log('✅ Workflow complete!');
}

main().catch(err => {
  console.error('❌ Workflow failed:', err);
  process.exit(1);
});
