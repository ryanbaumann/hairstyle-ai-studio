#!/bin/bash

# WARNING: This script rewrites Git history. It is recommended to run this on a fresh clone or backup of your repository.
# You will need git-filter-repo installed:
#   brew install git-filter-repo
#   or pip install git-filter-repo

# 1. Remove internal tooling files completely from the repository history
git filter-repo \
  --path deploy.exp \
  --path deploy_pty.py \
  --path zipline-config.json \
  --path dump.cjs \
  --path metadata.json \
  --invert-paths \
  --force

# 2. Set up replacements for internal terminology
cat << 'EOF' > replacements.txt
window.aistudio==>
zipline==>deploy
aistudio.openSelectKey==>
EOF

# 3. Replace terminology across all commits
git filter-repo --replace-text replacements.txt --force

# Cleanup
rm replacements.txt

echo "✅ Git history has been successfully scrubbed."
echo "You can now add your new public remote and force push:"
echo "  git remote add origin https://github.com/yourusername/hairstyle-ai-studio.git"
echo "  git push -u origin main --force"
