#!/bin/bash
set -euo pipefail

cd "$(dirname "${BASH_SOURCE[0]}")"

# Finder / non-login shells do not include Homebrew. pnpm is not installed;
# node and npm live here. Next reads .env.local itself — do not source it.
export PATH="/opt/homebrew/bin:${PATH}"

PORT="${PORT:-3000}"
HOST="127.0.0.1"
URL="http://${HOST}:${PORT}"

if [[ ! -x node_modules/.bin/next ]]; then
  npm exec --yes pnpm@10.33.0 install
fi

# A second `next dev` on the same port fails and fights the existing server.
if lsof -nP -iTCP:"${PORT}" -sTCP:LISTEN -t >/dev/null 2>&1; then
  echo "${URL}"
  open "${URL}"
  exit 0
fi

echo "${URL}"

# Bounded background wait. An unbounded loop would keep running after a
# failed start and is unnecessary once the port is up.
(
  for ((i = 0; i < 40; i++)); do
    if nc -z "${HOST}" "${PORT}" >/dev/null 2>&1; then
      open "${URL}"
      exit 0
    fi
    sleep 0.5
  done
) &

exec ./node_modules/.bin/next dev --webpack --hostname "${HOST}" --port "${PORT}"
