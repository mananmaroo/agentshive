# Agentshive Setup Guide

## Step 1: Seed Agents to Database

1. Open **Supabase Dashboard** → **SQL Editor**
2. Create a new query
3. Copy and paste the entire contents of `SEED_AGENTS.sql`
4. Click **Run**

This will:
- Create an `agentshive_team` system user
- Add 2 seed agents (Customer Feedback Agent + Job Application Agent)

## Step 2: Verify Deployment

1. Push code to GitHub (already done):
   ```bash
   cd C:\Users\maroo\Downloads\agentstack
   git status
   git add -A
   git commit -m "Add GitHub-style sidebar and donation page"
   git push origin main
   ```

2. Vercel will auto-deploy (2-3 minutes)

3. Visit your site: `https://agentshive.net/`

## Step 3: Test the UI

- [ ] **Browse Agents** - Click sidebar → Browse Agents, should see 2 agents
- [ ] **Agent Detail** - Click an agent, should see full details
- [ ] **Sidebar Navigation** - All links work, active page is highlighted
- [ ] **Responsive** - Test on mobile (sidebar should work)
- [ ] **Public Access** - Test in incognito/private window (no login) - should see agents

## Step 4: Verify RLS Policies

All tables have RLS enabled:
- ✅ agents - public read
- ✅ users - public read (username, avatar only)
- ✅ ratings - public read
- ✅ comments - public read
- ✅ comment_upvotes - public read
- ✅ agent_files - public read
- ✅ blog_posts - public read (published only)
- ✅ agent_requests - public read (own requests only)

## Current Pages & Features

### Navigation (Sidebar)
- Home
- Browse Agents
- Learn (Videos)
- Blog
- Categories
- FAQ
- Request Agent
- Donate

### User Features
- Sign Up / Login
- Profile page
- Upload agents
- Rate agents
- Comment on agents
- Request custom agents

### Public Features
- Browse agents
- View agent details
- Read ratings & comments
- Watch videos
- Read blog
- View categories
- View FAQs

## Next Steps (Optional)

1. **Customize agents** - Edit seed data in `SEED_AGENTS.sql`
2. **Add more pages** - Create new routes in `app/`
3. **Customize colors** - Tailwind theme is in `globals.css`
4. **Add analytics** - Integrate Supabase Analytics or third-party

## Troubleshooting

### Agents not showing
1. Check Supabase agents table has rows
2. Verify RLS policy: `agents_read` should have `USING (true)`
3. Check browser console for errors
4. Try incognito window (bypass cache)

### Sidebar not visible
1. Check main layout: `app/layout.tsx` has `<SidebarNav />`
2. Verify `app/components/sidebar-nav.tsx` exists
3. Clear Next.js cache: `npm run dev` or rebuild

### Donation page not linking
1. Check sidebar-nav.tsx has `/donate` route
2. Verify `app/donate/page.tsx` exists
3. Test direct URL: `/donate`

## Database Schema

```
users: id, username, email, avatar_url, bio, github_username, website_url, created_at, updated_at, deleted_at
agents: id, title, description, creator_id, category[], tags[], downloads_count, views_count, average_rating, rating_count, verified, featured, created_at, updated_at, deleted_at
ratings: id, agent_id, user_id, rating, created_at
comments: id, agent_id, user_id, content, upvotes, created_at, updated_at
comment_upvotes: id, comment_id, user_id, created_at
agent_files: id, agent_id, file_url, file_type, file_name, created_at, updated_at
blog_posts: id, title, content, author_id, category, published, created_at, updated_at
agent_requests: id, user_id, title, description, budget, status, created_at, updated_at
```

## Support

For issues:
1. Check GitHub: https://github.com/mananmaroo/agentshive
2. Contact: team@agentshive.net
3. Report bug: GitHub Issues

---

**Platform:** Agentshive — Open Registry for Claude Agents
**Built with:** Next.js 16, Supabase, Tailwind CSS, Vercel
