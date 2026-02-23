---
name: kickoff-feature
description: Initiates the feature development lifecycle by first ingesting the request, then generating the test plan.
---

# Feature Kickoff Process

The feature kickoff process consists of two preparatory steps to ensure the work begins with correct understanding and a high-integrity specification.

**Action:**

1. Call /learn-feature-request prompt  
   [.github/prompts/learn-feature-request.prompt.md]

2. Call /create-test-plan prompt  
   [.github/prompts/create-test-plan.prompt.md]

3. Halt. Do not continue to any further implementation or development steps beyond these prompts.
