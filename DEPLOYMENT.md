# 🚀 HireLens Backend Deployment Guide

## Prerequisites

- Node.js 18+ installed
- MongoDB Atlas account (or MongoDB instance)
- Cloudinary account for image uploads

## Environment Variables

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

Required variables:
- `PORT`: Server port (default: 3500)
- `NODE_ENV`: Environment (development/production)
- `MONGO_URL`: MongoDB connection string
- `JWT_ACCESS_SECRET`: Secret for access tokens (use strong random string)
- `JWT_REFRESH_SECRET`: Secret for refresh tokens (use strong random string)
- `CLOUDINARY_CLOUD_NAME`: Your Cloudinary cloud name
- `CLOUDINARY_API_KEY`: Your Cloudinary API key
- `CLOUDINARY_API_SECRET`: Your Cloudinary API secret
- `FRONTEND_URL`: Your frontend URL (for CORS and Socket.IO)

## Local Development

```bash
# Install dependencies
npm install

# Seed database with sample data
npm run reset

# Start development server (with nodemon)
npm run dev
```

## Production Deployment

### 1. Build and Deploy

```bash
# Install production dependencies only
npm install --production

# Start production server
npm start
```

### 2. Using PM2 (Recommended)

```bash
# Install PM2 globally
npm install -g pm2

# Start with PM2
pm2 start src/index.js --name hirelens-backend

# Save PM2 configuration
pm2 save

# Setup PM2 to start on system boot
pm2 startup
```

### 3. Environment Configuration

For production, set these environment variables:

```bash
NODE_ENV=production
PORT=3500
MONGO_URL=your_production_mongodb_url
JWT_ACCESS_SECRET=your_strong_secret
JWT_REFRESH_SECRET=your_strong_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
FRONTEND_URL=https://yourdomain.com
```

### 4. Reverse Proxy (Nginx)

Example Nginx configuration:

```nginx
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:3500;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## Deployment Platforms

### Railway

1. Connect your GitHub repository
2. Add environment variables in Railway dashboard
3. Deploy automatically on push

### Render

1. Create new Web Service
2. Connect repository
3. Set build command: `npm install`
4. Set start command: `npm start`
5. Add environment variables

### Heroku

```bash
# Login to Heroku
heroku login

# Create app
heroku create hirelens-backend

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set MONGO_URL=your_mongodb_url
# ... set other variables

# Deploy
git push heroku main
```

## Health Check

The server provides a health check endpoint:

```
GET /health
```

Response:
```json
{
  "status": "ok",
  "timestamp": "2025-01-01T00:00:00.000Z",
  "uptime": 123.456,
  "environment": "production"
}
```

## Security Features

✅ Rate limiting (100 requests per 15 minutes)
✅ Stricter auth rate limiting (5 requests per 15 minutes)
✅ MongoDB injection protection
✅ Security headers (Helmet)
✅ CORS protection
✅ Request size limits (10MB)
✅ Input sanitization

## Monitoring

Consider adding:
- Error tracking: Sentry
- Uptime monitoring: UptimeRobot, Pingdom
- Log management: LogDNA, Papertrail
- Performance monitoring: New Relic, DataDog

## Backup Strategy

1. Enable MongoDB Atlas automated backups
2. Set up daily backups
3. Store backups in separate location
4. Test restore process regularly

## Troubleshooting

### Database Connection Issues
- Check MongoDB Atlas IP whitelist
- Verify connection string
- Check network connectivity

### CORS Errors
- Verify FRONTEND_URL environment variable
- Check frontend URL matches exactly

### Socket.IO Connection Issues
- Verify FRONTEND_URL is set correctly
- Check firewall settings
- Ensure WebSocket support is enabled

## Support

For issues, check:
- Server logs: `pm2 logs hirelens-backend`
- Health endpoint: `/health`
- MongoDB Atlas logs
