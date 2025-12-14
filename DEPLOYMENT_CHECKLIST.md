# Deployment Checklist

Use this checklist before deploying to Vercel.

## Pre-Deployment

### Local Testing
- [ ] Dependencies installed (`npm install`)
- [ ] `.env` file configured with local values
- [ ] Backend runs locally (`npm run dev`)
- [ ] Health endpoint accessible (`curl http://localhost:3001/api/health`)
- [ ] PDF generation endpoint tested locally
- [ ] CORS configuration verified with frontend

### Code Quality
- [ ] No hardcoded secrets in code
- [ ] All environment variables in `.env.example`
- [ ] Error handling implemented
- [ ] Console.log statements reviewed (remove sensitive data)
- [ ] API routes return appropriate status codes

## Vercel Setup

### Project Configuration
- [ ] Create new Vercel project or link existing
- [ ] Select correct root directory (`ff-job-schedule-backend`)
- [ ] Framework preset: `Other`
- [ ] Build command: Leave empty or `npm run vercel-build`
- [ ] Output directory: Leave empty
- [ ] Install command: `npm install`

### Environment Variables
Add these in Vercel Project Settings → Environment Variables:

- [ ] `NODE_ENV` = `production`
- [ ] `FRONTEND_URL` = Your frontend production URL (e.g., `https://yourapp.vercel.app`)
- [ ] `SUPABASE_URL` = Your Supabase project URL
- [ ] `SUPABASE_SERVICE_KEY` = Your Supabase service role key (⚠️ KEEP SECRET!)
- [ ] `SUPABASE_ANON_KEY` = Your Supabase anon key (if needed)


### Git Repository
- [ ] Code committed to Git
- [ ] `.env` is in `.gitignore` (✅ already configured)
- [ ] `.env.example` is committed
- [ ] Repository pushed to GitHub/GitLab/Bitbucket
- [ ] Vercel connected to repository

## First Deployment

### Deploy
- [ ] Run `vercel` command or deploy via Vercel dashboard
- [ ] Wait for build to complete
- [ ] Check deployment logs for errors
- [ ] Note the deployment URL

### Verify Deployment
- [ ] Visit `https://your-project.vercel.app/api`
- [ ] Test health endpoint: `https://your-project.vercel.app/api/health`
- [ ] Test PDF generation with curl or Postman
- [ ] Check Vercel function logs
- [ ] Verify no 500 errors in logs

### Frontend Integration
- [ ] Update frontend `VITE_BACKEND_URL` to production URL
- [ ] Test PDF generation from frontend
- [ ] Verify CORS is working
- [ ] Test authentication flow (if implemented)

## Post-Deployment

### Monitoring
- [ ] Set up Vercel error notifications
- [ ] Monitor function execution times
- [ ] Check memory usage (should be < 1024MB)
- [ ] Review function invocation logs
- [ ] Set up uptime monitoring (optional)

### Security
- [ ] Verify Supabase keys are not exposed
- [ ] Check CORS settings are restrictive (not `*` in production)
- [ ] Review rate limiting needs
- [ ] Consider adding API authentication
- [ ] Enable Vercel's DDoS protection

### Performance
- [ ] Test PDF generation speed
- [ ] Monitor cold start times
- [ ] Consider implementing caching
- [ ] Review function timeout settings (30s default)
- [ ] Optimize large PDF generation

### Documentation
- [ ] Update README with production URL
- [ ] Document any deployment-specific configurations
- [ ] Share API endpoints with frontend team
- [ ] Create internal documentation for API usage

## Troubleshooting

### Common Issues

**Playwright doesn't work in production:**
- Verify `chrome-aws-lambda` is in dependencies
- Check memory allocation (increase to 1024MB)
- Review function timeout (increase if needed)

**CORS errors:**
- Verify `FRONTEND_URL` matches exactly
- Check for trailing slashes
- Ensure CORS headers are set correctly

**Environment variables not working:**
- Redeploy after adding environment variables
- Check variable names for typos
- Verify they're set for correct environment (Production/Preview)

**Function timeout:**
- Increase in `vercel.json` (max 300s on Pro plan)
- Optimize PDF generation
- Consider async processing for large PDFs

**High memory usage:**
- Monitor function memory in Vercel dashboard
- Increase allocation if needed (max 1024MB on Pro, 3009MB on Enterprise)
- Optimize Playwright usage

## Rollback Plan

If deployment fails:
1. Check Vercel deployment logs
2. Revert to previous deployment via Vercel dashboard
3. Fix issues locally
4. Test thoroughly
5. Redeploy

## Updates and Maintenance

### Regular Updates
- [ ] Keep dependencies updated (`npm update`)
- [ ] Monitor for security vulnerabilities (`npm audit`)
- [ ] Update Playwright periodically
- [ ] Review Vercel platform updates

### Feature Additions
- [ ] Test new features locally first
- [ ] Use Vercel preview deployments for testing
- [ ] Update API documentation
- [ ] Notify frontend team of changes

## Contact and Support

- **Vercel Support**: https://vercel.com/support
- **Playwright Docs**: https://playwright.dev/docs/intro
- **Supabase Docs**: https://supabase.com/docs

---

Last Updated: {{ DATE }}
Deployment URL: {{ YOUR_DEPLOYMENT_URL }}
