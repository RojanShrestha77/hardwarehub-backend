#!/bin/sh
# set -e means: stop immediately if any command fails.
# Without this, if migrations fail the server would still start with a broken DB.
set -e

echo "Running database migrations..."
bun run db:migrate

echo "Starting server..."
exec bun run src/index.ts
