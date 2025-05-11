#!/usr/bin/env bash
set -euo pipefail

: "${USERNAME:?USERNAME not set or empty}"
: "${REPO:?REPO not set or empty}"
BUILD_NUMBER="$(date '+%d.%m.%Y.%H.%M.%S')"
: "${ENVIRONMENT:="${1:-prod}"}" # test | staging | prod
: "${TAG:="${BUILD_NUMBER}-${ENVIRONMENT}"}"
CACHE_TAG="buildcache"
BUILDER_NAME="multiarch-builder"

FULL_IMAGE="$USERNAME/$REPO:$TAG"
CACHE_IMAGE="$USERNAME/$REPO:$CACHE_TAG"

printf '\n🚀  Building multi‑arch Docker image: %s (linux/amd64 + linux/arm64)\n' "$FULL_IMAGE"

if ! docker buildx inspect "$BUILDER_NAME" >/dev/null 2>&1; then
  echo "🔧  Creating buildx builder '$BUILDER_NAME' with docker-container driver…"
  docker buildx create --name "$BUILDER_NAME" --driver docker-container --use
else
  docker buildx use "$BUILDER_NAME"
fi

if ! docker buildx inspect "$BUILDER_NAME" | grep -q "linux/arm64"; then
  echo "🔧  Registering binfmt for cross‑arch builds…"
  docker run --privileged --rm tonistiigi/binfmt:latest --install all
  docker buildx inspect "$BUILDER_NAME" --bootstrap > /dev/null
fi

# === Docker Login ===
if ! docker info | grep -q "Username: $USERNAME"; then
  echo "🔐  Logging into Docker Hub…"
  docker login
fi

docker buildx build \
    --platform=linux/amd64 \
    -t "${USERNAME}/${REPO}:${TAG}" \
    -t "${USERNAME}/${REPO}:latest" \
    "${@:2}" \
    --push \
    "$1"


printf '\n✅  Done! Multi‑arch image pushed as: %s\n' "$FULL_IMAGE"