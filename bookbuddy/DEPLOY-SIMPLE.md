# 🚀 Deploy to Azure VM - Simple Guide

## Quick Start (No SSH Keys Needed!)

### Step 1: Push Code to GitHub

On your Mac:

```bash
cd /Users/norman/Book_Buddy/bookbuddy

# Commit your changes
git add .
git commit -m "Ready for Azure deployment"

# Push to GitHub
git push origin main

# OR use the helper script
./git-deploy.sh
```

### Step 2: Deploy on Azure VM

Connect to your VM and deploy:

```bash
# Connect to Azure VM (you'll need to enter your password)
ssh azureuser@20.189.115.22

# First time only - clone the repository
git clone https://github.com/Norman7781/Book_Buddy.git

# Navigate to project
cd Book_Buddy/bookbuddy

# Create environment file
nano .env.local
```

Add this content to `.env.local`:

```env
MONGODB_URI=your-mongodb-connection-string
DB_NAME=booksheet
COLLECTION_NAME=book_inventory
JWT_SECRET=your-secret-key-here
```

Save and exit: `Ctrl+X`, then `Y`, then `Enter`

```bash
# Deploy!
./deploy.sh
```

### Step 3: Access Your App

Open in browser:

- https://wad-6611201.eastasia.cloudapp.azure.com/bookbuddy

---

## Updating Your App

When you make changes:

### On Mac:

```bash
cd /Users/norman/Book_Buddy/bookbuddy
git add .
git commit -m "Description of changes"
git push origin main
```

### On Azure VM:

```bash
ssh azureuser@20.189.115.22
cd ~/Book_Buddy/bookbuddy
git pull
./deploy.sh
```

---

## Checking App Status

On Azure VM:

```bash
# Check if app is running
pm2 status

# View logs
pm2 logs bookbuddy

# Restart app
pm2 restart bookbuddy
```

---

## Troubleshooting

### App not accessible?

1. Check if it's running:

   ```bash
   ssh azureuser@20.189.115.22
   pm2 status
   ```

2. View logs for errors:

   ```bash
   pm2 logs bookbuddy --lines 50
   ```

3. Restart the app:
   ```bash
   pm2 restart bookbuddy
   ```

### Can't SSH to VM?

- Make sure you're using the correct password
- Check that the VM is running in Azure Portal
- Verify port 22 is open in Network Security Group

### Git pull fails?

```bash
# Reset to latest version
cd ~/Book_Buddy/bookbuddy
git fetch origin
git reset --hard origin/main
./deploy.sh
```

---

## Need More Help?

- **SSH Setup**: See `SSH-SETUP.md`
- **Full Deployment Guide**: See `DEPLOYMENT.md`
- **Quick Reference**: See `QUICKSTART.md`

---

## Your Deployment Info

- **VM IP**: 20.189.115.22
- **VM Domain**: wad-6611201.eastasia.cloudapp.azure.com
- **App URL**: https://wad-6611201.eastasia.cloudapp.azure.com/bookbuddy
- **Port**: 3001
- **Base Path**: /bookbuddy
- **Process Manager**: PM2
