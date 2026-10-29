#!/usr/bin/env bash
# Daily backup (cron: 30 3 * * * /srv/rig/app/deploy/backup.sh). Keeps 14 days.
set -euo pipefail
DEST=/srv/rig/backups
STAMP=$(date +%F)
mkdir -p "$DEST"
sqlite3 /srv/rig/app/data/rig.db ".backup '$DEST/rig-$STAMP.db'"
tar -czf "$DEST/uploads-$STAMP.tar.gz" -C /srv/rig/app uploads
tar -czf "$DEST/mail-$STAMP.tar.gz" -C /srv/rig mail
find "$DEST" -type f -mtime +14 -delete
