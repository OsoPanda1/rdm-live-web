#!/bin/bash
REPOS=("rdm-smart-city-os" "rdm-digital-nodo-cero" "real-del-monte-twin")
OWNER="OsoPanda1"

for REPO in "${REPOS[@]}"; do
  echo "--- Repo: $REPO ---"
  
  # Fetch recursive tree of the main/master branch
  # First get the SHA of the default branch
  DEFAULT_BRANCH=$(curl -s -H "Authorization: Bearer $GITHUB_TOKEN" "https://api.github.com/repos/$OWNER/$REPO" | jq -r .default_branch)
  
  echo "Default branch: $DEFAULT_BRANCH"
  
  # Get the tree
  curl -s -H "Authorization: Bearer $GITHUB_TOKEN" "https://api.github.com/repos/$OWNER/$REPO/git/trees/$DEFAULT_BRANCH?recursive=1" | jq -r '.tree[] | select(.path | startswith("src/components") or startswith("src/pages") or startswith("src/styles") or startswith("public/assets")) | .path'
  
  echo ""
done
