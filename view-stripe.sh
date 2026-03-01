#!/bin/bash
# 💳 Stripe Transactions Viewer
# Quick script to view all Stripe transactions

cd "$(dirname "$0")"

echo "🚀 Loading environment variables..."
if [ -f .env.local ]; then
    export $(cat .env.local | grep -v '^#' | xargs)
fi

echo "📡 Fetching Stripe transactions..."
npm run stripe:view
