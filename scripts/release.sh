#!/bin/bash
# Usage: ./scripts/release.sh <version>
# Example: ./scripts/release.sh 1.0.0

set -e

VERSION=$1

if [ -z "$VERSION" ]; then
  echo "Usage: $0 <version>"
  echo "Example: $0 1.0.0"
  exit 1
fi

TAG="v$VERSION"

# Check for uncommitted changes
if ! git diff --quiet || ! git diff --cached --quiet; then
  echo "Error: uncommitted changes found. Commit or stash them before releasing."
  exit 1
fi

# Check current branch
BRANCH=$(git rev-parse --abbrev-ref HEAD)
if [ "$BRANCH" != "main" ] && [ "$BRANCH" != "develop" ]; then
  echo "Warning: releasing from branch '$BRANCH' (expected main or develop)"
  read -p "Continue? [y/N] " confirm
  [[ "$confirm" =~ ^[Yy]$ ]] || exit 1
fi

echo "Creating release $TAG from branch $BRANCH..."

git tag -a "$TAG" -m "Release $TAG"
echo "Tag $TAG created locally."

read -p "Push tag to origin? [y/N] " push_confirm
if [[ "$push_confirm" =~ ^[Yy]$ ]]; then
  git push origin "$TAG"
  echo "Tag pushed. GitHub Actions will build and publish the release."
else
  echo "Tag not pushed. Run: git push origin $TAG"
fi
