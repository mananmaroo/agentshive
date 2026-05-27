# AgentStack Deployment Guide - Vercel

## Quick Start: Deploy in 3 Steps

### Step 1: Prepare Your Repository
```bash
cd C:\Users\maroo\Downloads\agentstack

# Initialize git if not already done
git init
git add .
git commit -m "Initial AgentStack deployment"

# Add remote (create empty repo on GitHub first)
git remote add origin https://github.com/YOUR_USERNAME/agentstack.git
git branch -M main
git push -u origin main
```

### Step 2: Connect to Vercel
1. Go to **https://vercel.com/dashboard**
2. Click **"Add New Project"**
3. Select **"Import Git Repository"**
4. Choose your **agentstack** repository from GitHub
5. Click **"Import"**

### Step 3: Configure Environment Variables
In the Vercel dashboard, add these environment variables:

```
NEXT_PUBLIC_SUPABASE_URL = https://ildxgsvyvoipgoynijja.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlsZHhnc3Z5dm9pcGdveW5pamphIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk3NTcyNzIsImV4cCI6MjA5NTMzMzI3Mn0.mJ9E70VI68dMonQRz3ewDieV2aKT_y5ecrNodh8yv6I
SUPABASE_SERVICE_ROLE_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlsZHhnc3Z5dm9pcGdveW5pamphIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTc1NzI3MiwiZXhwIjoyMDk1MzMzMjcyfQ.zFMzKRr0LUOumNG4Gd3BIE2tUoPQcGje0RnERn5usB8
```

Then click **"Deploy"**!

---

## Detailed Step-by-Step Guide

### 1. Create GitHub Repository

**Option A: Use GitHub Web Interface**
1. Go to https://github.com/new
2. Create repository: `agentstack`
3. Set to **Public**
4. Click **"Create repository"**

**Option B: Using Git CLI**
```bash
# Create local repo
cd C:\Users\maroo\Downloads\agentstack
git init
git add .
git commit -m "Initial AgentStack deployment"

# Add GitHub remote (replace YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/agentstack.git
git branch -M main
git push -u origin main
```

### 2. Link Supabase to Vercel

**Supabase Configuration:**
- Project URL: `https://ildxgsvyvoipgoynijja.supabase.co`
- Anon Key: Already in `.env.local`
- Service Role Key: Already in `.env.local`

These are already configured! Just add to Vercel environment variables.

### 3. Deploy to Vercel

**Web Dashboard Method (Easiest):**
1. Go to https://vercel.com/dashboard
2. Click **"Add New..."** → **"Project"**
3. Click **"Import Git Repository"**
4. Authorize GitHub if needed
5. Select **agentstack** repo
6. Click **"Import"**

**Configure Project:**
- **Framework Preset**: Next.js ✓ (auto-detected)
- **Root Directory**: `./agentstack` (if needed)
- **Build Command**: `npm run build` ✓ (default)
- **Install Command**: `npm install` ✓ (default)

**Add Environment Variables:**
Click **"Environment Variables"** and add:

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
```

**Deploy:**
Click **"Deploy"** and wait 2-3 minutes!

---

## After Deployment

### Update Supabase Settings

1. Go to https://app.supabase.com → Your Project
2. Navigate to **Settings** → **API**
3. Update **URL Prefixes** under **Allowed URLs**:
   ```
   https://agentstack.vercel.app
   ```

### Update OAuth Redirect URLs

1. Supabase Dashboard → **Authentication** → **Providers** → **GitHub**
2. Set Authorization callback URL:
   ```
   https://agentstack.vercel.app/auth/callback
   ```

### Verify Domain

Your app will be live at:
```
https://agentstack.vercel.app
```

(or custom domain if configured)

---

## Troubleshooting

### Build Fails

**Error: "next: not found"**
- Solution: Make sure `next` is in `package.json` dependencies
- Run: `npm install next`

**Error: "Module not found"**
- Solution: Install missing dependencies
- Run: `npm install` locally, then push to GitHub

### Deployment Hangs

- Check Vercel dashboard for logs
- Wait 5+ minutes (first build is slower)
- Check git status - ensure all changes are pushed

### Environment Variables Not Working

1. Verify variables are added in Vercel dashboard
2. Redeploy after adding variables (Settings → Deployments → Redeploy)
3. Clear cache: **Settings** → **Advanced** → **Clear Cache**

### Database Connection Issues

- Verify Supabase is running (check Status page)
- Ensure IP allowlist includes Vercel IPs (usually automatic)
- Check API keys are correct and not expired

---

## Post-Deployment Checklist

- [ ] App loads at https://agentstack.vercel.app
- [ ] Login works (test with demo account)
- [ ] Can create new agent
- [ ] API routes respond (test with curl)
- [ ] Supabase data persists
- [ ] Ratings/comments save
- [ ] Search/filter work
- [ ] Dashboard loads user data
- [ ] Profile editing works
- [ ] File upload works (if storage configured)

---

## Custom Domain Setup

1. In Vercel Dashboard → **Project Settings** → **Domains**
2. Click **"Add Domain"**
3. Enter your domain: `agentstack.com`
4. Update DNS records at your registrar:
   ```
   CNAME: agentstack.com → cname.vercel-dns.com
   ```
5. Wait 5-10 minutes for DNS propagation

---

## Environment Variables Reference

| Variable | Value | Required |
|----------|-------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://ildxgsvyvoipgoynijja.supabase.co` | ✅ Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon key | ✅ Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Your Supabase service role key | ✅ Yes |

---

## Local Testing Before Deploy

```bash
# Test build locally
npm run build

# Test production build
npm run start

# Visit http://localhost:3000 to verify
```

---

## Monitoring & Analytics

**Monitor Deployment:**
- Vercel Dashboard → **Deployments**
- Real-time logs under each deployment
- Error tracking with Source Maps

**Performance:**
- Vercel Analytics (free tier)
- Web Vitals monitoring
- Deployment analytics

---

## Support & Resources

- **Vercel Docs**: https://vercel.com/docs
- **Next.js Docs**: https://nextjs.org/docs
- **Supabase Docs**: https://supabase.com/docs
- **GitHub Issues**: https://github.com/YOUR_USERNAME/agentstack/issues

---

## Rollback

If deployment breaks:
1. Vercel Dashboard → **Deployments**
2. Find previous working deployment
3. Click **"..." → "Promote to Production"**

---

**Estimated Deploy Time**: 3-5 minutes ⏱️

**Cost**: FREE (both Vercel & Supabase hobby tier)

Good luck! 🚀
