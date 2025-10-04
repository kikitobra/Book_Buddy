# Quick Deployment Guide

## 🚀 Deploy to Azure VM in 3 Steps

### Step 1: Prepare Your Local Files

Make sure you have your `.env.local` file ready with MongoDB credentials.

### Step 2: Sync Code to VM

From your local machine:

```bash
cd /Users/norman/Book_Buddy/bookbuddy
./sync-to-vm.sh
```

Or manually using rsync:

```bash
rsync -avz --exclude 'node_modules' --exclude '.next' --exclude '.git' \
  ./ azureuser@20.189.115.22:~/Book_Buddy/bookbuddy/
```

### Step 3: Deploy on VM

SSH into your Azure VM:

```bash
ssh azureuser@20.189.115.22
```

Then deploy:

```bash
cd ~/Book_Buddy/bookbuddy

# Create .env.local if it doesn't exist
nano .env.local
# Add your MongoDB credentials and save

# Run deployment
./deploy.sh
```

## 🌐 Access Your Application

After deployment, access your app at:

- **Production URL**: https://wad-6611201.eastasia.cloudapp.azure.com/bookbuddy
- **Direct Port**: http://wad-6611201.eastasia.cloudapp.azure.com:3001/bookbuddy

## 📋 Quick Commands

### On VM (via SSH)

```bash
# Check status
pm2 status

# View logs
pm2 logs bookbuddy

# Restart
pm2 restart bookbuddy

# Stop
pm2 stop bookbuddy

# Start
pm2 start bookbuddy
```

## 🔧 Configuration Summary

- **Port**: 3001
- **Base Path**: /bookbuddy
- **Process Manager**: PM2
- **Environment**: Production
- **Auto-restart**: Enabled

## 📝 Important Files

- `next.config.ts` - Configured with basePath: "/bookbuddy"
- `ecosystem.config.js` - PM2 configuration
- `deploy.sh` - Deployment automation script
- `.env.local` - Environment variables (NOT in Git)

## 🔐 Security Checklist

- [ ] `.env.local` is on the server (not in Git)
- [ ] MongoDB credentials are secure
- [ ] JWT_SECRET is set and strong
- [ ] Port 3001 is open in Azure Network Security Group
- [ ] SSL/HTTPS is configured (optional but recommended)

## 🐛 Troubleshooting

**App not accessible?**

1. Check if PM2 is running: `pm2 status`
2. Check logs: `pm2 logs bookbuddy`
3. Check if port is listening: `sudo lsof -i :3001`
4. Check Azure NSG rules for port 3001

**Build errors?**

1. Check Node.js version: `node --version` (should be 18+)
2. Clear cache: `rm -rf .next node_modules && pnpm install`
3. Check environment variables in `.env.local`

**Database connection issues?**

1. Verify MongoDB URI in `.env.local`
2. Check if IP is whitelisted in MongoDB Atlas
3. Test connection: `node -e "require('mongodb').MongoClient.connect(process.env.MONGODB_URI).then(() => console.log('OK'))"`

## 📚 Full Documentation

See `DEPLOYMENT.md` for detailed instructions.
