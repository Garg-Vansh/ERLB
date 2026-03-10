#!/usr/bin/env bash
set -euo pipefail

if [[ -z "${MONGO_URI:-}" ]]; then
  echo "MONGO_URI is required"
  exit 1
fi

timestamp=$(date +"%Y%m%d-%H%M%S")
out_dir=${1:-"./backups"}
mkdir -p "$out_dir"

mongodump --uri="$MONGO_URI" --archive="$out_dir/erlb-$timestamp.archive" --gzip

echo "Backup created: $out_dir/erlb-$timestamp.archive"
