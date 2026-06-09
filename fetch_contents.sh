#!/bin/bash
OWNER="OsoPanda1"

fetch_file() {
  REPO=$1
  PATH=$2
  echo "--- FILE: $REPO/$PATH ---"
  curl -s -H "Authorization: Bearer $GITHUB_TOKEN" "https://api.github.com/repos/$OWNER/$REPO/contents/$PATH" | jq -r .content | base64 -d
  echo -e "\n--- END FILE ---\n"
}

# rdm-smart-city-os
fetch_file "rdm-smart-city-os" "src/components/CinematicIntro.tsx"
fetch_file "rdm-smart-city-os" "src/components/Map3D.tsx"
fetch_file "rdm-smart-city-os" "src/components/RealitoOrb.tsx"
fetch_file "rdm-smart-city-os" "src/components/PageTransition.tsx"
fetch_file "rdm-smart-city-os" "src/components/UnifiedMapBridge.tsx"
fetch_file "rdm-smart-city-os" "tailwind.config.js"

# real-del-monte-twin
fetch_file "real-del-monte-twin" "src/components/CinematicIntro.tsx"
fetch_file "real-del-monte-twin" "src/components/ExperienceHub.tsx"
fetch_file "real-del-monte-twin" "src/components/RealitoChat.tsx"
