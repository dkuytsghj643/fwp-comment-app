#!/bin/bash
# ─────────────────────────────────────────────────────────────────────────────
# FWP Comment App — one-time setup
# Creates a NEW GitHub repo and NEW Vercel project, completely separate
# from flathead-fisher or anything else you have.
#
# Prerequisites on your machine:
#   brew install gh         (GitHub CLI)
#   npm install -g vercel   (Vercel CLI)
# ─────────────────────────────────────────────────────────────────────────────
set -e

APP_NAME="fwp-comment-app"
echo "→ Setting up $APP_NAME"

# ── 1. Extract the archive next to this script ───────────────────────────────
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

# ── 2. Init git and push to a brand-new GitHub repo ──────────────────────────
git init
git add -A
git commit -m "Initial commit — FWP 2027-28 comment app"

echo ""
echo "→ Logging in to GitHub (opens browser)…"
gh auth login

echo "→ Creating new GitHub repo '$APP_NAME' (public)…"
gh repo create "$APP_NAME" --public --source=. --remote=origin --push

echo "✓ GitHub repo created and pushed."

# ── 3. Deploy to a brand-new Vercel project ───────────────────────────────────
echo ""
echo "→ Logging in to Vercel (opens browser)…"
vercel login

echo "→ Deploying to Vercel as new project '$APP_NAME'…"
# --yes  skips all interactive prompts and creates a new project automatically
# No .vercel/project.json exists, so Vercel creates a fresh project
vercel deploy --yes --name "$APP_NAME" --prod

echo ""
echo "✓ Done! Your app is live."
echo ""
echo "─────────────────────────────────────────────────────────────────────"
echo "IMPORTANT — set your Anthropic API key so comment drafting works:"
echo ""
echo "  vercel env add ANTHROPIC_API_KEY production"
echo "  (paste your key from https://console.anthropic.com)"
echo ""
echo "Then trigger a redeploy:"
echo "  vercel deploy --prod"
echo "─────────────────────────────────────────────────────────────────────"
