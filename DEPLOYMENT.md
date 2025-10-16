# Deployment Guide

This guide covers multiple deployment options for NewTumblr v0.10.3.

## Quick Comparison

| Platform | Cost | Difficulty | Best For |
|----------|------|------------|----------|
| **Render** | Free/$7/mo | ⭐ Easy | Quick deploy, managed DB |
| **Railway** | $5 credit/mo | ⭐ Easy | Best DX, modern platform |
| **Fly.io** | Free tier | ⭐⭐ Medium | Global edge deployment |
| **Vercel + Railway** | Free/Paid | ⭐⭐ Medium | Separate frontend/backend |
| **Docker VPS** | $5-10/mo | ⭐⭐⭐ Hard | Full control, cheapest |
| **AWS/GCP** | Variable | ⭐⭐⭐⭐ Expert | Enterprise, scalability |

---

## Option 1: Render (Recommended) ⭐

### Pros
- Easiest deployment
- Free tier available
- Managed PostgreSQL included
- Auto-deploy from Git
- SSL certificates automatic

### Setup Steps

1. **Create Render Account**
   - Go to https://render.com
   - Sign up with GitHub

2. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin YOUR_GITHUB_REPO
   git push -u origin master
   ```

3. **Deploy on Render**
   - Click "New" → "Blueprint"
   - Connect your GitHub repo
   - Render will auto-detect `render.yaml`
   - Click "Apply"

4. **Set Environment Variables**
   - Go to each service → Environment
   - Add any additional secrets (API keys, etc.)

5. **Run Migrations**
   - In the API service shell:
   ```bash
   npx prisma migrate deploy
   npx prisma db seed
   ```

### Cost
- **Free tier**: 750 hours/month (sleeps after 15min inactivity)
- **Paid**: $7/month for web service + $7/month for PostgreSQL

---

## Option 2: Railway ⭐

### Pros
- Best developer experience
- $5 free credit monthly
- One-click PostgreSQL
- Excellent logs/metrics

### Setup Steps

1. **Install Railway CLI**
   ```bash
   npm i -g @railway/cli
   railway login
   ```

2. **Initialize Project**
   ```bash
   railway init
   railway link
   ```

3. **Add PostgreSQL**
   ```bash
   railway add --plugin postgresql
   ```

4. **Deploy**
   ```bash
   railway up
   ```

5. **Set Environment Variables**
   ```bash
   railway variables set VITE_API_URL=https://your-app.up.railway.app
   ```

6. **Run Migrations**
   ```bash
   railway run npx prisma migrate deploy
   railway run npx prisma db seed
   ```

### Cost
- **Free**: $5 credit/month (~100 hours)
- **Pro**: $20/month flat rate

---

## Option 3: Fly.io (Global Edge)

### Pros
- Deploy to edge locations worldwide
- Great for global users
- Free tier: 3 VMs

### Setup Steps

1. **Install Fly CLI**
   ```bash
   brew install flyctl  # macOS
   # Or: curl -L https://fly.io/install.sh | sh
   ```

2. **Login & Launch**
   ```bash
   fly auth login
   fly launch
   ```

3. **Add PostgreSQL**
   ```bash
   fly postgres create
   fly postgres attach YOUR_DB_NAME
   ```

4. **Deploy**
   ```bash
   fly deploy
   ```

### Cost
- **Free**: 3 shared VMs + 1GB storage
- **Paid**: $1.94/mo per VM + storage

---

## Option 4: Vercel (Frontend) + Railway (Backend)

### Pros
- Best frontend performance (Vercel)
- Separate scaling for frontend/backend
- Generous free tiers

### Setup Steps

**Frontend (Vercel):**
1. Push to GitHub
2. Go to https://vercel.com
3. Import your repo
4. Set build command: `npm run build`
5. Set output directory: `dist`
6. Add env var: `VITE_API_URL=YOUR_RAILWAY_API_URL`

**Backend (Railway):**
1. Create new Railway project
2. Add GitHub repo
3. Add PostgreSQL plugin
4. Set root directory: `/` (not needed)
5. Set start command: `npm run server`
6. Run migrations in Railway shell

### Cost
- **Vercel Free**: 100GB bandwidth
- **Railway**: $5 credit/month

---

## Option 5: Docker on VPS (Self-Hosted)

### Pros
- Full control
- Cheapest long-term ($5-10/mo)
- No vendor lock-in

### Setup Steps

1. **Choose VPS Provider**
   - DigitalOcean Droplet ($6/mo)
   - Linode ($5/mo)
   - Vultr ($6/mo)
   - Hetzner (€4/mo - cheapest)

2. **Setup Server**
   ```bash
   # SSH into server
   ssh root@YOUR_SERVER_IP

   # Install Docker
   curl -fsSL https://get.docker.com -o get-docker.sh
   sh get-docker.sh

   # Install Docker Compose
   apt install docker-compose-plugin
   ```

3. **Clone & Deploy**
   ```bash
   git clone YOUR_REPO
   cd NewTumblrT3
   
   # Set environment variables
   echo "DB_PASSWORD=your_secure_password" > .env
   
   # Start services
   docker-compose up -d
   ```

4. **Setup Nginx (Reverse Proxy)**
   ```bash
   apt install nginx certbot python3-certbot-nginx
   
   # Configure Nginx
   nano /etc/nginx/sites-available/newtumblr
   ```

   ```nginx
   server {
       server_name yourdomain.com;
       
       location / {
           proxy_pass http://localhost:5173;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
       }
       
       location /api {
           proxy_pass http://localhost:3001;
           proxy_http_version 1.1;
           proxy_set_header Host $host;
           client_max_body_size 50M;
       }
   }
   ```

   ```bash
   ln -s /etc/nginx/sites-available/newtumblr /etc/nginx/sites-enabled/
   nginx -t
   systemctl restart nginx
   
   # Get SSL certificate
   certbot --nginx -d yourdomain.com
   ```

### Cost
- **VPS**: $5-10/month
- **Domain**: $10-15/year

---

## Option 6: AWS/GCP/Azure (Enterprise)

For large-scale production deployments with auto-scaling, monitoring, and multiple regions.

### Components
- **Frontend**: S3 + CloudFront (AWS) or Cloud Storage + CDN (GCP)
- **Backend**: EC2, ECS, or App Engine
- **Database**: RDS PostgreSQL or Cloud SQL
- **Load Balancer**: ALB or Cloud Load Balancing
- **CI/CD**: CodePipeline or Cloud Build

### Cost
- **Highly variable**: $50-500+/month depending on traffic
- **Free tiers available** for first 12 months

---

## Environment Variables Checklist

Make sure to set these on your deployment platform:

```bash
# Required
DATABASE_URL=postgresql://user:pass@host:5432/dbname
NODE_ENV=production

# Frontend (build-time)
VITE_API_URL=https://your-api-url.com

# Optional
PORT=3001
```

---

## Post-Deployment Checklist

- [ ] Run database migrations: `npx prisma migrate deploy`
- [ ] Seed test data: `npx prisma db seed`
- [ ] Test admin login: `admin` / `Admin123!`
- [ ] Update CORS settings if needed (in `server/index.ts`)
- [ ] Set up monitoring/logging
- [ ] Configure backups for PostgreSQL
- [ ] Set up custom domain
- [ ] Enable SSL/HTTPS
- [ ] Test mobile access (Tailscale for development)

---

## Recommended Choice

**For most users**: Start with **Railway** or **Render**
- Easy setup
- Free/cheap for testing
- Managed database
- Easy to upgrade

**For production**: **Vercel (Frontend) + Railway (Backend)**
- Best performance
- Professional
- Reasonable cost

**For hobbyists**: **Docker on Hetzner VPS**
- Cheapest
- Full control
- Learn DevOps

---

## Troubleshooting

### "PayloadTooLargeError" on deployed backend
- Increase body limit in server config (already set to 50MB in `server/index.ts`)
- For Nginx: add `client_max_body_size 50M;`

### Database connection errors
- Check `DATABASE_URL` format
- Ensure database is in same region as app
- Whitelist app IP in database firewall

### Frontend can't reach backend
- Check CORS settings in `server/index.ts`
- Verify `VITE_API_URL` is correct
- Test API health endpoint: `https://your-api.com/api/health`

### Images not downloading
- Check file permissions
- Verify external image URLs are accessible
- Increase timeout for fetch requests

---

## Support

For deployment issues:
1. Check platform-specific docs
2. Review logs in deployment dashboard
3. Test locally with production build: `npm run build && npm run preview`

**Current Version**: v0.10.3

