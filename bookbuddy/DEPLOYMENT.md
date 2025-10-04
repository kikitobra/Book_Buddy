# BookBuddy Deployment Guide for Azure VM

## Server Information

- **VM Name**: AzureNext.jsFinal
- **Public IP**: 20.189.115.22
- **Domain**: wad-6611201.eastasia.cloudapp.azure.com
- **Application URL**: https://wad-6611201.eastasia.cloudapp.azure.com/bookbuddy
- **Port**: 3001
- **OS**: Linux (Ubuntu 24.04)

## Prerequisites on Azure VM

1. **Node.js** (v18 or higher)
2. **pnpm** package manager
3. **PM2** process manager
4. **Git**
5. **MongoDB** connection string

## Deployment Steps

### 1. Connect to Azure VM

```bash
ssh azureuser@20.189.115.22
# or
ssh azureuser@wad-6611201.eastasia.cloudapp.azure.com
```

### 2. Install Node.js and pnpm (if not already installed)

```bash
# Install Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install pnpm
npm install -g pnpm

# Install PM2
npm install -g pm2
```

### 3. Clone the Repository

```bash
cd ~
git clone https://github.com/Norman7781/Book_Buddy.git
cd Book_Buddy/bookbuddy
```

### 4. Create Environment File

Create `.env.local` file with your MongoDB credentials:

```bash
nano .env.local
```

Add the following content (replace with your actual values):

```env
MONGODB_URI=mongodb+srv://your-username:your-password@your-cluster.mongodb.net/?retryWrites=true&w=majority
DB_NAME=booksheet
COLLECTION_NAME=book_inventory
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```

Save and exit (Ctrl+X, then Y, then Enter)

### 5. Run Deployment Script

```bash
chmod +x deploy.sh
./deploy.sh
```

This script will:

- Install dependencies
- Build the Next.js application
- Start the application on port 3001 using PM2
- Configure PM2 to restart on system reboot

### 6. Configure Nginx (if needed)

If you want to use Nginx as a reverse proxy:

```bash
sudo nano /etc/nginx/sites-available/bookbuddy
```

Add this configuration:

```nginx
server {
    listen 80;
    server_name wad-6611201.eastasia.cloudapp.azure.com;

    location /bookbuddy {
        proxy_pass http://localhost:3001;
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

Enable the site and restart Nginx:

```bash
sudo ln -s /etc/nginx/sites-available/bookbuddy /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 7. Open Port 3001 in Azure

1. Go to Azure Portal
2. Navigate to your VM → Networking → Network settings
3. Add inbound port rule:
   - Source: Any
   - Source port ranges: \*
   - Destination: Any
   - Service: Custom
   - Destination port ranges: 3001
   - Protocol: TCP
   - Action: Allow
   - Priority: 320
   - Name: Port_3001

## PM2 Commands

### Check Application Status

```bash
pm2 status
```

### View Logs

```bash
pm2 logs bookbuddy
pm2 logs bookbuddy --lines 100
```

### Restart Application

```bash
pm2 restart bookbuddy
```

### Stop Application

```bash
pm2 stop bookbuddy
```

### Start Application

```bash
pm2 start bookbuddy
```

### Monitor Application

```bash
pm2 monit
```

## Updating the Application

When you make changes to the code:

```bash
cd ~/Book_Buddy/bookbuddy
git pull origin main
./deploy.sh
```

## Troubleshooting

### Check if port 3001 is in use

```bash
sudo lsof -i :3001
```

### Check Nginx logs

```bash
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log
```

### Check application logs

```bash
pm2 logs bookbuddy --lines 50
cat logs/err.log
cat logs/out.log
```

### Restart everything

```bash
pm2 restart bookbuddy
sudo systemctl restart nginx
```

## Testing

After deployment, test the application:

1. **Direct access (port 3001)**:

   - http://wad-6611201.eastasia.cloudapp.azure.com:3001/bookbuddy

2. **Through Nginx (port 80)**:

   - http://wad-6611201.eastasia.cloudapp.azure.com/bookbuddy

3. **HTTPS (port 443)** - if SSL is configured:
   - https://wad-6611201.eastasia.cloudapp.azure.com/bookbuddy

## Security Notes

1. **Never commit `.env.local`** to Git (it's already in .gitignore)
2. **Use strong MongoDB passwords**
3. **Consider setting up SSL/TLS** with Let's Encrypt
4. **Keep your system updated**: `sudo apt update && sudo apt upgrade`
5. **Configure firewall** to only allow necessary ports

## Monitoring

Set up PM2 monitoring:

```bash
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

## Backup

Regular backups are recommended:

```bash
# Backup MongoDB
mongodump --uri="your-mongodb-uri" --out=/backup/mongodb/$(date +%Y%m%d)

# Backup application code
tar -czf ~/backups/bookbuddy-$(date +%Y%m%d).tar.gz ~/Book_Buddy/bookbuddy
```
