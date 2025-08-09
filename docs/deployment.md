# Deployment Guide

## GitHub Actions CD Setup

### 1. Create Cloudflare API Token

1. Go to [Cloudflare API Tokens](https://dash.cloudflare.com/profile/api-tokens)
2. Click "Create Token"  
3. Use "Custom token" template
4. Configure permissions:
   - **Account**: `Cloudflare Workers:Edit`
   - **Zone**: `Zone:Read` (if using custom domains)
   - **Account Resources**: Include your account
5. Copy the generated token

### 2. Add GitHub Secret

1. Go to your GitHub repository
2. Navigate to Settings > Secrets and variables > Actions
3. Click "New repository secret"
4. Name: `CLOUDFLARE_API_TOKEN`
5. Value: Paste your Cloudflare API token
6. Click "Add secret"

### 3. Configure Production Environment Variables

Set these in the Cloudflare Dashboard for production deployment:

**API Worker (`cloth-api-prod`):**
- `AUTH_USERNAME`: `admin`
- `AUTH_PASSWORD`: Your secure production password

**Frontend Worker (`cloth-frontend-prod`):**
- No additional environment variables needed

### 4. Deploy

Push to `main` branch to trigger automatic deployment:

```sh
git push origin main
```

Or manually trigger deployment:
- Go to Actions tab in GitHub
- Select "CD" workflow
- Click "Run workflow"

## Manual Deployment

If you prefer manual deployment:

```sh
# Deploy both workers
bin/deploy

# Test deployments
bin/test-smoke
```

## Deployment URLs

After deployment, your services will be available at:

- **API Worker**: `https://cloth-api-prod.{your-subdomain}.workers.dev`
- **Frontend Worker**: `https://cloth-frontend-prod.{your-subdomain}.workers.dev`

## Custom Domains

To use custom domains:

1. Add custom domains in Cloudflare Workers dashboard
2. Update smoke test URLs in `bin/test-smoke`
3. Update frontend API URL in `apps/ui/app/routes/_index.tsx`