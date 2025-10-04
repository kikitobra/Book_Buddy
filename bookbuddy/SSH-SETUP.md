# SSH Key Setup for Azure VM

This guide will help you set up SSH key authentication so you can use the `sync-to-vm.sh` script without password prompts.

## Option 1: Use Git-Based Deployment (Recommended for Now)

Since SSH keys aren't set up yet, use the Git-based deployment method:

### On Your Mac:

```bash
cd /Users/norman/Book_Buddy/bookbuddy
./git-deploy.sh
```

This will push your code to GitHub.

### On Azure VM:

```bash
# First time - clone the repository
ssh azureuser@20.189.115.22
cd ~
git clone https://github.com/Norman7781/Book_Buddy.git
cd Book_Buddy/bookbuddy

# Create .env.local
nano .env.local
# Add your MongoDB credentials and save (Ctrl+X, Y, Enter)

# Deploy
./deploy.sh
```

### For Updates:

```bash
# On Mac - push changes
./git-deploy.sh

# On Azure VM - pull and redeploy
ssh azureuser@20.189.115.22
cd ~/Book_Buddy/bookbuddy
git pull
./deploy.sh
```

---

## Option 2: Set Up SSH Keys (For Direct rsync)

If you want to use the `sync-to-vm.sh` script, set up SSH keys:

### Step 1: Generate SSH Key (if you don't have one)

On your Mac:

```bash
# Check if you already have an SSH key
ls -la ~/.ssh/id_*.pub

# If no keys exist, generate one
ssh-keygen -t rsa -b 4096 -C "your_email@example.com"
# Press Enter to accept default location
# Enter a passphrase (or leave empty for no passphrase)
```

### Step 2: Copy SSH Key to Azure VM

Choose one of these methods:

**Method A: Using ssh-copy-id (Easiest)**

```bash
ssh-copy-id azureuser@20.189.115.22
# Enter your password when prompted
```

**Method B: Manual Copy**

```bash
# Display your public key
cat ~/.ssh/id_rsa.pub

# Copy the output, then SSH to VM and add it
ssh azureuser@20.189.115.22
mkdir -p ~/.ssh
chmod 700 ~/.ssh
nano ~/.ssh/authorized_keys
# Paste your public key on a new line
# Save and exit (Ctrl+X, Y, Enter)
chmod 600 ~/.ssh/authorized_keys
exit
```

### Step 3: Test SSH Connection

```bash
ssh azureuser@20.189.115.22
# Should connect without password prompt
```

### Step 4: Now You Can Use sync-to-vm.sh

```bash
cd /Users/norman/Book_Buddy/bookbuddy
./sync-to-vm.sh
```

---

## Option 3: Use Password Authentication with rsync

If you don't want to set up SSH keys but still want to use rsync, modify the sync script:

```bash
# Edit sync-to-vm.sh
nano sync-to-vm.sh
```

Add `--rsh="ssh -o PreferredAuthentications=password"` to the rsync command:

```bash
rsync -avz --progress \
  --rsh="ssh -o PreferredAuthentications=password" \
  --exclude 'node_modules' \
  --exclude '.next' \
  --exclude '.git' \
  --exclude 'logs' \
  --exclude '.env.local' \
  ./ ${VM_USER}@${VM_HOST}:${VM_PATH}/
```

---

## Troubleshooting SSH Issues

### Permission Denied (publickey)

This error means:

1. SSH key isn't set up, OR
2. The VM only allows key authentication

**Solution**: Use Option 1 (Git-based deployment) or set up SSH keys (Option 2)

### Connection Refused

```bash
# Check if SSH service is running on VM
ssh -v azureuser@20.189.115.22
```

### Timeout

1. Check if port 22 is open in Azure Network Security Group
2. Verify the VM is running in Azure Portal

### Key Permission Errors

```bash
# Fix SSH key permissions on Mac
chmod 700 ~/.ssh
chmod 600 ~/.ssh/id_rsa
chmod 644 ~/.ssh/id_rsa.pub
```

---

## Recommended Deployment Workflow

For the easiest deployment experience:

1. **Develop locally** - Make changes on your Mac
2. **Test locally** - Run `pnpm dev` to test
3. **Commit changes** - `git add . && git commit -m "Your message"`
4. **Push to GitHub** - `./git-deploy.sh` or `git push origin main`
5. **Deploy on VM**:
   ```bash
   ssh azureuser@20.189.115.22
   cd ~/Book_Buddy/bookbuddy
   git pull
   ./deploy.sh
   ```

This workflow:

- ✅ Works without SSH key setup
- ✅ Version controlled
- ✅ Can be accessed from anywhere
- ✅ Easy to rollback if needed

---

## Quick Reference

| Method      | Command on Mac    | When to Use                |
| ----------- | ----------------- | -------------------------- |
| Git Deploy  | `./git-deploy.sh` | Recommended - works always |
| Direct Sync | `./sync-to-vm.sh` | Need SSH keys setup first  |
| Manual      | `git push` + SSH  | Full control               |

---

## Security Best Practices

1. **Always use SSH keys** (not passwords) for production
2. **Use a passphrase** for your SSH key
3. **Don't share** your private key (`~/.ssh/id_rsa`)
4. **Backup** your SSH keys securely
5. **Rotate keys** periodically
