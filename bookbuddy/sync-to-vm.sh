#!/bin/bash

# Script to sync code to Azure VM
# Usage: ./sync-to-vm.sh

VM_USER="azureuser"
VM_HOST="20.189.115.22"
VM_PATH="~/Book_Buddy/bookbuddy"

echo "🔄 Syncing code to Azure VM..."

# Sync files (excluding node_modules, .next, and other build artifacts)
rsync -avz --progress \
  --exclude 'node_modules' \
  --exclude '.next' \
  --exclude '.git' \
  --exclude 'logs' \
  --exclude '.env.local' \
  ./ ${VM_USER}@${VM_HOST}:${VM_PATH}/

if [ $? -eq 0 ]; then
    echo "✅ Code synced successfully!"
    echo ""
    echo "Next steps:"
    echo "1. SSH into the VM: ssh ${VM_USER}@${VM_HOST}"
    echo "2. Navigate to the directory: cd ${VM_PATH}"
    echo "3. Create/update .env.local with your MongoDB credentials"
    echo "4. Run deployment: ./deploy.sh"
else
    echo "❌ Sync failed!"
    exit 1
fi
