# 🚀 AgentStack - Vercel Deployment (5 Minutes)

## Step 1: Push Code to GitHub (2 minutes)

```bash
cd C:\Users\maroo\Downloads\agentstack

# Initialize git
git init
git add .
git commit -m "Initial AgentStack deployment to Vercel"

# Add your GitHub repo (replace YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/agentstack.git
git branch -M main
git push -u origin main
```

---

## Step 2: Deploy to Vercel (3 minutes)

### 🔗 Visit: https://vercel.com

1. **Click "Add New..."** → **"Project"**
2. **Click "Import Git Repository"**
3. **Authorize GitHub** (if first time)
4. **Select** your `agentstack` repository
5. **Click "Import"**

### ⚙️ Configure:

- Framework: **Next.js** (auto-detected) ✓
- Root Directory: Leave default ✓
- Build Command: `npm run build` ✓

**Click "Deploy"** - Takes 2-3 minutes ⏳

---

## Step 3: Add Environment Variables (1 minute)

After build starts, click **"Environment Variables"** in Vercel dashboard.

Add these 3 variables:

```
NEXT_PUBLIC_SUPABASE_URL
Value: https://ildxgsvyvoipgoynijja.supabase.co

NEXT_PUBLIC_SUPABASE_ANON_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlsZHhnc3Z5dm9pcGdveW5pamphIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk3NTcyNzIsImV4cCI6MjA5NTMzMzI3Mn0.mJ9E70VI68dMonQRz3ewDieV2aKT_y5ecrNodh8yv6I

SUPABASE_SERVICE_ROLE_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlsZHhnc3Z5dm9pcGdveW5pamphIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTc1NzI3MiwiZXhwIjoyMDk1MzMzMjcyfQ.zFMzKRr0LUOumNG4Gd3BIE2tUoPQcGje0RnERn5usB8
```

**Click "Save"** → **"Redeploy"**

---

## ✅ You're Live!

Your app is now deployed at:

```
https://agentstack.vercel.app
```

(or whatever Vercel assigns)

---

## 🧪 Test Your Deployment

1. **Visit your URL** - Should load the homepage
2. **Test Login**: Use demo account
   ```
   Email: aluminus99@gmail.com
   Password: Abcde@12345
   ```
3. **Test API**: `https://agentstack.vercel.app/api/agents`
4. **Check Dashboard**: Browse agents and dashboard

---

## 📋 Checklist

- [ ] GitHub repo created with code pushed
- [ ] Vercel project created and imported
- [ ] Environment variables added
- [ ] Build completed successfully
- [ ] App loads at Vercel URL
- [ ] Login works
- [ ] API returns data
- [ ] Dashboard shows agents

---

## 🔧 If Deploy Fails

**Check Vercel logs:**
- Vercel Dashboard → Your Project → **Deployments** tab
- Click on failed deployment → **"View Logs"**

**Common issues:**
- Missing `.env.local` variables → Add them in Vercel dashboard
- Node version mismatch → Vercel auto-handles this
- Package lock issues → Delete `package-lock.json` and redeploy

**Redeploy after fixes:**
- Settings → Deployments → Click **"..."** → **"Redeploy"**

---

## 🎉 What You Get

✅ Free hosting (Vercel hobby tier)
✅ Auto-scaling 
✅ Global CDN
✅ Git auto-deploy (push to main = auto-deploy)
✅ Preview deployments for branches
✅ Real-time logs & monitoring

---

## 📚 Full Guide

See **DEPLOYMENT_GUIDE.md** for detailed instructions, troubleshooting, and custom domain setup.

---

**Estimated Time: 5 minutes ⏱️**
**Cost: FREE** 💰
