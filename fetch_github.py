import os
import requests
import base64
import json

token = os.environ.get("GITHUB_TOKEN")
owner = "OsoPanda1"
repos = ["rdm-smart-city-os", "real-del-monte-twin", "rdm-digital-nodo-cero"]
files_to_fetch = {
    "rdm-smart-city-os": [
        "src/components/CinematicIntro.tsx",
        "src/components/Map3D.tsx",
        "src/components/RealitoOrb.tsx",
        "src/components/PageTransition.tsx",
        "src/components/UnifiedMapBridge.tsx",
        "tailwind.config.js"
    ],
    "real-del-monte-twin": [
        "src/components/CinematicIntro.tsx",
        "src/components/ExperienceHub.tsx",
        "src/components/RealitoChat.tsx"
    ]
}

headers = {"Authorization": f"Bearer {token}"}

for repo, files in files_to_fetch.items():
    for file_path in files:
        url = f"https://api.github.com/repos/{owner}/{repo}/contents/{file_path}"
        response = requests.get(url, headers=headers)
        if response.status_code == 200:
            content_b64 = response.json().get("content", "")
            content = base64.b64decode(content_b64).decode("utf-8")
            print(f"--- FILE: {repo}/{file_path} ---")
            print(content)
            print("\n--- END FILE ---\n")
        else:
            print(f"FAILED TO FETCH {repo}/{file_path}: {response.status_code}")

