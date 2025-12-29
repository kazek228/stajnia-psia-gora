# ===========================================
# 🚀 DEPLOYMENT GUIDE - Stajnia Psia Góra
# ===========================================

## Quick Deploy Options

### 🚂 Option 1: Railway (Recommended - Easiest)

Railway provides automatic builds, PostgreSQL database, and custom domains.

1. **Create Account**: https://railway.app
2. **Install Railway CLI**:
   ```bash
   npm install -g @railway/cli
   railway login
   ```

3. **Deploy Backend**:
   ```bash
   cd server
   railway init
   railway add --database postgresql
   railway up
   ```

4. **Deploy Frontend**:
   ```bash
   cd client
   railway init
   railway up
   ```

5. **Set Environment Variables** in Railway Dashboard:
   - `DATABASE_URL` (auto-set by Railway)
   - `JWT_SECRET` (generate a strong secret)
   - `NODE_ENV=production`

**Cost**: ~$5/month for hobby projects

---

### 🔷 Option 2: Render (Free Tier Available)

1. **Create Account**: https://render.com

2. **Create PostgreSQL Database**:
   - Dashboard → New → PostgreSQL
   - Copy the connection string

3. **Deploy Backend**:
   - New → Web Service
   - Connect GitHub repo
   - Root Directory: `server`
   - Build Command: `npm install && npx prisma generate && npx prisma db push`
   - Start Command: `npm start`
   - Add environment variables

4. **Deploy Frontend**:
   - New → Static Site
   - Root Directory: `client`
   - Build Command: `npm install && npm run build`
   - Publish Directory: `dist`
   - Add `VITE_API_URL` env variable pointing to backend

---

### ▲ Option 3: Vercel + Railway

Best performance for React apps.

**Frontend (Vercel)**:
```bash
cd client
npx vercel
```

**Backend (Railway)**:
```bash
cd server
railway init
railway add --database postgresql
railway up
```

---

## Pre-Deployment Checklist

### 1. Switch to PostgreSQL
Copy `schema.production.prisma` to `schema.prisma`:
```bash
cd server/prisma
cp schema.production.prisma schema.prisma
```

### 2. Update Environment Variables
Create `.env.production`:
```env
DATABASE_URL="postgresql://user:password@host:5432/dbname"
JWT_SECRET="your-super-secret-key-min-32-chars"
NODE_ENV="production"
PORT=3001
```

### 3. Update API URL in Frontend
For production, update `client/src/services/api.ts`:
```typescript
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
});
```

### 4. Add Build Scripts
Already configured in package.json!

---

## Environment Variables Reference

### Backend (server)
| Variable | Description | Example |
|----------|-------------|---------|
| DATABASE_URL | PostgreSQL connection string | postgresql://... |
| JWT_SECRET | Secret for JWT tokens | random-32-char-string |
| NODE_ENV | Environment | production |
| PORT | Server port | 3001 |

### Frontend (client)
| Variable | Description | Example |
|----------|-------------|---------|
| VITE_API_URL | Backend API URL | https://api.yourdomain.com |

---

## Docker Deployment (Alternative)

Use the provided Dockerfile and docker-compose.yml for containerized deployment:

```bash
docker-compose up -d
```

Works with: AWS ECS, Google Cloud Run, Azure Container Apps, DigitalOcean App Platform

---

## Post-Deployment

1. Run database migrations:
   ```bash
   npx prisma db push
   ```

2. Seed initial data:
   ```bash
   npx ts-node src/seed.ts
   ```

3. Test all endpoints

4. Set up custom domain (optional)

---

## Estimated Costs

| Provider | Free Tier | Paid |
|----------|-----------|------|
| Railway | $5 credit/month | ~$5-10/month |
| Render | Yes (with limits) | ~$7/month |
| Vercel | Yes (frontend) | Free for hobby |
| Fly.io | Yes (limited) | ~$5/month |

---

## Need Help?

- Railway Docs: https://docs.railway.app
- Render Docs: https://render.com/docs
- Vercel Docs: https://vercel.com/docs
