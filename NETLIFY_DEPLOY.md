# Quick Netlify Deployment Guide

## ✅ Configuration Files Created

All necessary files for Netlify deployment have been created:

1. **netlify.toml** - Build configuration and redirects
2. **public/_redirects** - SPA routing for React Router
3. **.env.example** - Environment variables template
4. **vite.config.ts** - Updated with proper base path and proxy
5. **src/services/api.ts** - Updated to use `VITE_API_URL` environment variable
6. **src/vite-env.d.ts** - TypeScript definitions for Vite

## 🚀 Deploy Now (3 Options)

### Option 1: Netlify CLI (Fastest)

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Deploy to draft URL (for testing)
netlify deploy

# Deploy to production
netlify deploy --prod
```

### Option 2: Git Integration (Automatic)

1. Push code to GitHub/GitLab/Bitbucket
2. Go to [netlify.com](https://netlify.com)
3. Click "Add new site" → "Import an existing project"
4. Connect your Git provider and select repository
5. Build settings:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
6. Add environment variable: `VITE_API_URL` = Your backend URL
7. Click "Deploy site"

### Option 3: Manual Upload

```bash
# Build the project
npm run build

# Upload dist folder to
# https://app.netlify.com/drop
```

## ⚙️ Environment Variables

### For Local Development
Create `.env` file:
```bash
VITE_API_URL=http://localhost:5000/api
```

### For Production (Set in Netlify Dashboard)
```bash
VITE_API_URL=https://your-backend.herokuapp.com/api
# or
VITE_API_URL=https://your-backend.railway.app/api
# or
VITE_API_URL=https://your-backend.onrender.com/api
```

## 📋 Build Verification

Build completed successfully! Output:
- `dist/index.html` - Main HTML file
- `dist/assets/` - CSS and JS bundles
- `dist/_redirects` - SPA routing rules

## 🔧 Backend Deployment

Your backend needs to be deployed separately. Recommended options:

1. **Heroku** - `heroku create && git push heroku main`
2. **Railway** - Connect GitHub repo
3. **Render** - Web service with `node server.js`

After deploying backend, update `VITE_API_URL` in Netlify.

## 🎯 Post-Deployment Checklist

- [ ] Site loads on Netlify URL
- [ ] Refresh on any page doesn't 404
- [ ] Login/Authentication works
- [ ] API calls connect to backend
- [ ] All pages render correctly
- [ ] Console has no errors

## 🆘 Troubleshooting

**404 on refresh:**
- Verify `_redirects` file is in `dist/` folder
- Check `netlify.toml` has redirect rules

**API errors:**
- Set `VITE_API_URL` environment variable in Netlify
- Ensure backend CORS allows your Netlify domain

**Build fails:**
- Run `npm run build` locally first
- Check Node.js version (18+)

---

**Ready to deploy!** 🎉

For detailed instructions, see `DEPLOYMENT.md`
