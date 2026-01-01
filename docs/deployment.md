# SkillPilot Deployment Process

This document describes the automated deployment workflow for the SkillPilot application on Linux servers.

## Overview

The deployment process ensures that:
1.  The latest code is pulled from Git.
2.  **Vocabulary Decks** are correctly deployed from the curriculum source-of-truth to the application's data folder.
3.  **Whitepaper assets** (Markdown + images) are deployed into the app's public folder.
4.  The React frontend is rebuilt with the new data.
5.  The system service is restarted.

## The Deployment Script (`scripts/deploy.sh`)

We use a bash script to automate these steps.

```bash
#!/bin/bash
set -e

# 1. Navigate to Project Root
cd /home/enpasos/skillpilot

# 2. Get Latest Code
echo "Hole Updates..."
git pull

# 3. Deploy Vocabulary Decks (NEW)
# This copies json files from curricula/.../json/ to app/public/data/
echo "Deploying Vocabulary Decks..."
python3 scripts/deploy_decks.py

# 4. Deploy Whitepaper Assets (NEW)
# This copies docs/whitepaper and referenced images into app/public
echo "Deploying Whitepaper assets..."
python3 scripts/deploy_whitepaper.py

# 5. Build Frontend
cd app
echo "Baue Anwendung..."
npm run build

# 6. Restart Service
echo "Starte Service neu..."
sudo systemctl restart skillpilot

echo "Fertig!"
```

## Why this order?

1.  **`git pull`**: Ensures we have the latest `json` curriculum files and the `deploy_decks.py` script.
2.  **`deploy_decks.py`**: Must run **before** `npm run build`. This script places the `cefr_*_deck.json` files into `app/public/data/`.
3.  **`deploy_whitepaper.py`**: Must run **before** `npm run build`. This script places the Whitepaper Markdown and images into `app/public/`.
4.  **`npm run build`**: The build process parses the `public/` directory and bundles assets. By having the decks and whitepaper assets in place first, we ensure they are available in the final production build.
5.  **`systemctl restart`**: Reloads the backend (Spring Boot) or web server to serve the new application.

## Prerequisites on Server

- **Python 3**: Required to run `scripts/deploy_decks.py` and `scripts/deploy_whitepaper.py`.
- **Node.js & npm**: Required for building the frontend.
- **Git**: Required for pulling updates.
- **Sudo Access**: Required for restarting the system service.
