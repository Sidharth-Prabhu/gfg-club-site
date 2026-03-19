# 🚀 Deploy to Netlify - Step by Step

## ✅ Code is Pushed to GitHub!

Your code is now on GitHub at: `https://github.com/Sidharth-Prabhu/gfg-club-site`
Branch: `mvp`

---

## 📋 Deploy on Netlify (5 Minutes)

### Step 1: Login to Netlify
1. Go to [https://app.netlify.com](https://app.netlify.com)
2. Login with your GitHub account

### Step 2: Add New Site
1. Click **"Add new site"** button
2. Select **"Import an existing project"**

### Step 3: Connect GitHub
1. Click **"GitHub"**
2. Authorize Netlify to access your GitHub (if prompted)
3. Search for `gfg-club-site` repository
4. Click to select it

### Step 4: Configure Build Settings
Netlify will auto-detect most settings. Verify these:

| Setting | Value |
|---------|-------|
| **Branch to deploy** | `mvp` |
| **Build command** | `npm run build` |
| **Publish directory** | `dist` |

### Step 5: Add Environment Variables
Click **"Add variable"** and add:

```
Key: VITE_API_URL
Value: http://localhost:5000/api  (for now)
```

> **Note:** Update this later when you deploy your backend to production

### Step 6: Deploy!
1. Click **"Deploy site"**
2. Wait 1-2 minutes for build to complete
3. Click the site URL to view your deployed site!

---

## 🎉 Your Site is Live!

You'll get a URL like: `https://yoursite-name.netlify.app`

### Custom Domain (Optional)
1. Go to Site settings → Domain management
2. Click "Add custom domain"
3. Follow instructions to connect your domain

---

## 🔄 Auto-Deploy on Push

Netlify will automatically deploy when you push to the `mvp` branch!

```bash
# Make changes, then:
git add .
git commit -m "Your changes

Co-authored-by: Qwen-Coder <qwen-coder@alibabacloud.com>"
git push origin mvp

# Netlify will auto-deploy in ~2 minutes
```

---

## ⚙️ Update Backend URL Later

When you deploy your backend:

1. Go to Netlify Dashboard → Your Site
2. Site settings → Environment variables
3. Edit `VITE_API_URL`
4. Set to your production backend URL
5. Click "Save"
6. Trigger new deploy (or push a new commit)

---

## 🆘 Troubleshooting

**Build fails:**
- Check "Deploy log" in Netlify for errors
- Verify `npm run build` works locally

**404 on page refresh:**
- Verify `public/_redirects` was deployed
- Check Netlify function logs

**API errors:**
- Set `VITE_API_URL` environment variable
- Ensure backend CORS allows your Netlify domain

---

## 📊 Site Status

- [x] Code pushed to GitHub (`mvp` branch)
- [ ] Connected to Netlify
- [ ] Environment variables set
- [ ] Site deployed and working
- [ ] Backend URL configured (later)

**Next:** Follow steps 1-6 above to deploy on Netlify! 🎯
