# Deployment Guide - GfG Club Site

## Netlify Deployment (Frontend)

### Prerequisites
- Node.js 18+ installed
- Git repository pushed to GitHub/GitLab/Bitbucket
- Netlify account (free tier available)

### Option 1: Deploy via Netlify CLI (Recommended)

1. **Install Netlify CLI**
   ```bash
   npm install -g netlify-cli
   ```

2. **Build the project**
   ```bash
   npm install
   npm run build
   ```

3. **Deploy to Netlify**
   ```bash
   netlify deploy
   ```
   - For production: `netlify deploy --prod`

### Option 2: Deploy via Git Integration

1. **Push your code to GitHub/GitLab/Bitbucket**
   ```bash
   git add .
   git commit -m "Prepare for Netlify deployment

Co-authored-by: Qwen-Coder <qwen-coder@alibabacloud.com>"
   git push origin main
   ```

2. **Connect to Netlify**
   - Go to [netlify.com](https://netlify.com)
   - Click "Add new site" → "Import an existing project"
   - Connect your Git provider
   - Select your repository

3. **Configure build settings**
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`

4. **Set environment variables** (in Netlify dashboard)
   - Go to Site settings → Environment variables
   - Add: `VITE_API_URL` = Your backend URL (e.g., `https://your-backend.herokuapp.com/api`)

5. **Deploy**
   - Click "Deploy site"
   - Netlify will automatically build and deploy

### Option 3: Manual Deploy (Drag & Drop)

1. **Build the project**
   ```bash
   npm run build
   ```

2. **Upload to Netlify**
   - Go to [app.netlify.com/drop](https://app.netlify.com/drop)
   - Drag and drop the `dist` folder

---

## Backend Deployment Options

### Option 1: Heroku (Recommended)

1. **Install Heroku CLI**
   ```bash
   # macOS
   brew tap heroku/brew && brew install heroku
   
   # Or via npm
   npm install -g heroku
   ```

2. **Login to Heroku**
   ```bash
   heroku login
   ```

3. **Create Heroku app**
   ```bash
   cd backend
   heroku create your-app-name
   ```

4. **Set environment variables**
   ```bash
   heroku config:set JWT_SECRET=your_secret_key
   heroku config:set FIREBASE_PROJECT_ID=your_project_id
   heroku config:set FIREBASE_CLIENT_EMAIL=your_client_email
   heroku config:set FIREBASE_PRIVATE_KEY="your_private_key"
   heroku config:set PORT=5000
   ```

5. **Deploy**
   ```bash
   git subtree push --prefix backend heroku main
   ```

### Option 2: Railway

1. Go to [railway.app](https://railway.app)
2. Connect GitHub repository
3. Select the `backend` folder as root
4. Add environment variables
5. Deploy automatically

### Option 3: Render

1. Go to [render.com](https://render.com)
2. Create new Web Service
3. Connect repository
4. Set root directory to `backend`
5. Build command: `npm install`
6. Start command: `node server.js`
7. Add environment variables

---

## Environment Variables

### Frontend (.env)
```bash
VITE_API_URL=http://localhost:5000/api  # Development
VITE_API_URL=https://your-backend.herokuapp.com/api  # Production
```

### Backend (.env)
```bash
PORT=5000
JWT_SECRET=your_jwt_secret_key
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=your_client_email
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."
```

---

## Post-Deployment Checklist

### Frontend
- [ ] Site loads without errors
- [ ] All routes work (refresh on any page should not 404)
- [ ] API calls connect to correct backend URL
- [ ] Authentication works (login/logout)
- [ ] All pages render correctly
- [ ] Images and assets load properly

### Backend
- [ ] Server starts without errors
- [ ] Database connection works (Firebase)
- [ ] All API endpoints respond
- [ ] Authentication tokens work
- [ ] CORS is configured for frontend domain
- [ ] Environment variables are set correctly

---

## Troubleshooting

### 404 on page refresh
- Ensure `_redirects` file is in `public` folder
- Check `netlify.toml` has SPA redirect rule

### API calls failing
- Check `VITE_API_URL` environment variable
- Ensure backend CORS allows frontend domain
- Verify backend is running and accessible

### Build fails
- Run `npm run build` locally to check for errors
- Check Node.js version compatibility
- Clear cache: `rm -rf node_modules package-lock.json && npm install`

### Firebase connection errors
- Verify service account credentials
- Check Firebase Admin SDK initialization
- Ensure environment variables are set correctly

---

## Useful Commands

```bash
# Local development
npm run dev              # Start frontend (port 3000)
cd backend && node server.js  # Start backend (port 5000)

# Build
npm run build           # Build for production
npm run preview         # Preview production build

# Netlify CLI
netlify deploy          # Deploy to draft URL
netlify deploy --prod   # Deploy to production
netlify open            # Open site dashboard
netlify logs            # View deployment logs
```

---

## Links

- [Netlify Documentation](https://docs.netlify.com)
- [Netlify CLI](https://docs.netlify.com/cli/get-started)
- [Heroku Deployment](https://devcenter.heroku.com/articles/deploying-nodejs)
- [Firebase Admin Setup](./backend/FIREBASE_SETUP.md)
