# AI Testing Setup

This repository uses automated AI testing with [testers-ai](https://www.npmjs.com/package/testers-ai) to validate deployments.

## Workflows

### 1. `ai-tests.yml` - Production Testing
- Runs after successful production deployments
- Can be manually triggered via workflow_dispatch
- Tests the main production URL: https://band-msg.vercel.app

### 2. `vercel-ai-tests.yml` - Deployment Testing
- Runs after every Vercel deployment (including preview deployments)
- Tests both production and preview URLs
- Comments on PRs with test results for preview deployments

## Required Secrets

Add these secrets to your GitHub repository:

1. **TEST_USERNAME** - Username for test account
   - Go to: Settings → Secrets and variables → Actions → New repository secret
   - Name: `TEST_USERNAME`
   - Value: Your test user's username

2. **TEST_PASSWORD** - Password for test account
   - Go to: Settings → Secrets and variables → Actions → New repository secret
   - Name: `TEST_PASSWORD`
   - Value: Your test user's password

## Setting Up Secrets

### Via GitHub UI:
1. Go to your repository on GitHub
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add `TEST_USERNAME` with your test username
5. Add `TEST_PASSWORD` with your test password

### Via GitHub CLI:
```bash
gh secret set TEST_USERNAME --body "your-test-username"
gh secret set TEST_PASSWORD --body "your-test-password"
```

## Manual Testing

You can manually trigger tests:

### Test Production:
```bash
gh workflow run ai-tests.yml
```

### Test Specific URL:
```bash
gh workflow run ai-tests.yml -f url=https://your-deployment-url.vercel.app
```

### Test Vercel Deployment:
```bash
gh workflow run vercel-ai-tests.yml -f deployment_url=https://your-preview-url.vercel.app
```

## Test Coverage

The AI tests validate:
- ✅ Login functionality
- ✅ Channel navigation
- ✅ Message sending
- ✅ Channel creation
- ✅ Settings menu accessibility
- ✅ Mobile responsiveness
- ✅ Reactions and threads

## Viewing Results

Test results are uploaded as artifacts and can be viewed:
1. Go to **Actions** tab
2. Click on the workflow run
3. Download the **ai-test-results** artifact

## Troubleshooting

### Tests failing?
- Verify TEST_USERNAME and TEST_PASSWORD secrets are set correctly
- Check that the test user account exists and is approved
- Ensure the deployment is fully ready (workflows wait 30-45 seconds)

### Need to update test scenarios?
Edit the `--custom-prompt` parameter in the workflow files to modify what the AI tests.

## Integration with Vercel

The workflows automatically detect Vercel deployments via the `deployment_status` event. No additional Vercel configuration is needed beyond your existing setup.
