#!/usr/bin/env bash
set -euo pipefail

# --- settings ---
TIMESTAMP="$(date +'%Y%m%d-%H%M%S')"
BACKUP_DIR="backups/$TIMESTAMP"
MSG="backup: $TIMESTAMP"

mkdir -p "$BACKUP_DIR"

echo ">> Saving local envs"
[[ -f .env.local ]] && cp .env.local "$BACKUP_DIR/.env.local.$TIMESTAMP"
[[ -f .env ]] && cp .env "$BACKUP_DIR/.env.$TIMESTAMP"

echo ">> Pulling Vercel envs"
vercel env pull "$BACKUP_DIR/.env.vercel.$TIMESTAMP" >/dev/null || echo "⚠️  Skipping Vercel env pull"

echo ">> Copying Firebase rules"
[[ -f firebase/firestore.rules ]] && cp firebase/firestore.rules "$BACKUP_DIR/firestore.rules.$TIMESTAMP"
[[ -f firebase/storage.rules ]] && cp firebase/storage.rules "$BACKUP_DIR/storage.rules.$TIMESTAMP"

echo ">> Git snapshot + tag"
git add -A
git commit -m "$MSG" || echo "Nothing to commit."
git tag -a "backup-$TIMESTAMP" -m "$MSG" || true
git push origin HEAD --tags

echo "✅ Backup complete → $BACKUP_DIR"

