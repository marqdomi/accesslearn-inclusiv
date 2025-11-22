#!/bin/sh
# Docker entrypoint script for runtime configuration injection
# This script generates a config.js file with the API URL from environment variables
# and then starts nginx
#
# The VITE_API_URL environment variable is set by Azure Container Apps
# via the Bicep template (infra/phase2-apps.bicep)

# Log to stderr so it appears in container logs
log() {
  echo "[docker-entrypoint] $@" >&2
}

log "Starting entrypoint script..."

# Get API URL from environment variable (set by Azure Container Apps)
API_URL="${VITE_API_URL:-}"

log "VITE_API_URL from env: ${API_URL:-not set}"

# If VITE_API_URL is not set, use development fallback
if [ -z "$API_URL" ]; then
  log "⚠️  Warning: VITE_API_URL not set, using development fallback"
  API_URL="http://localhost:3000"
fi

# Remove trailing slash if present
API_URL="${API_URL%/}"

# Ensure API_URL ends with /api if it doesn't already
# (VITE_API_URL from Bicep is just the base URL, we need to add /api)
if [ "${API_URL%/api}" = "$API_URL" ]; then
  API_URL="${API_URL}/api"
fi

log "Final API_URL: ${API_URL}"

# Ensure the directory exists
mkdir -p /usr/share/nginx/html

# Generate config.js file
cat > /usr/share/nginx/html/config.js <<EOF
// Runtime configuration injected by docker-entrypoint.sh
// Generated at container startup from VITE_API_URL environment variable
window.__APP_CONFIG__ = {
  VITE_API_URL: "${API_URL}",
  VITE_API_BASE_URL: "${API_URL}"
};
EOF

log "✅ Runtime configuration injected to /usr/share/nginx/html/config.js"
log "Config file contents:"
cat /usr/share/nginx/html/config.js >&2

# Don't exec - nginx's entrypoint will handle starting nginx
# This script just runs before nginx starts
log "Config injection complete. nginx will start next."

