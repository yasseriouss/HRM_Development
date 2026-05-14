#!/usr/bin/env bash
# Copy schema + data from remote Postgres (e.g. Neon) into local Docker Postgres.
# Prerequisites: Docker. From repo root: chmod +x scripts/db-pull-remote-to-local.sh
#
# Remote URL: export REMOTE_DATABASE_URL="postgresql://..." or put DATABASE_URL in server/.env

set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
REMOTE="${REMOTE_DATABASE_URL:-}"
if [[ -z "${REMOTE}" && -f "${ROOT}/server/.env" ]]; then
  REMOTE="$(grep -E '^[[:space:]]*DATABASE_URL=' "${ROOT}/server/.env" | head -1 | cut -d= -f2- | tr -d '\r' | sed 's/^["'\'']//; s/["'\'']$//')"
fi
if [[ -z "${REMOTE}" ]]; then
  echo "Set REMOTE_DATABASE_URL or DATABASE_URL in server/.env" >&2
  exit 1
fi

cd "${ROOT}"
docker compose up -d postgres 2>/dev/null || docker-compose up -d postgres
sleep 2

docker run --rm -e REMOTE_DATABASE_URL="${REMOTE}" postgres:17-alpine \
  sh -c 'pg_dump "$REMOTE_DATABASE_URL" --no-owner --no-acl --clean --if-exists' \
  | docker exec -i hrm-postgres psql -U hrm -d hrm_skill_matrix -v ON_ERROR_STOP=1

echo ""
echo "Done. Set server/.env DATABASE_URL to:"
echo "  postgresql://hrm:password123@127.0.0.1:5432/hrm_skill_matrix?sslmode=disable"
