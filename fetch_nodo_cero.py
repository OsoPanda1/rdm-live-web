import os
import requests
import base64
import json

token = os.environ.get("GITHUB_TOKEN")
owner = "OsoPanda1"
repo = "rdm-digital-nodo-cero"

files_to_fetch = [
    "app/page.tsx",
    "components/sections/Hero.tsx",
    "components/ui/GlassCard.tsx",
    "styles/globals.css",
    "tailwind.config.ts"
]

headers = {"Authorization": f"Bearer {token}"}

for file_path in files_to_fetch:
    url = f"https://api.github.com/repos/{owner}/{repo}/contents/{file_path}"
    response = requests.get(url, headers=headers)
    if response.status_code == 200:
        content_b64 = response.json().get("content", "")
        content = base64.b64decode(content_b64).decode("utf-8")
        print(f"--- FILE: {repo}/{file_path} ---")
        print(content)
        print("\n--- END FILE ---\n")
    else:
        # If specific file not found, let's list the directory
        dir_path = "/".join(file_path.split("/")[:-1])
        print(f"FAILED TO FETCH {file_path}, listing {dir_path} instead:")
        url_dir = f"https://api.github.com/repos/{owner}/{repo}/contents/{dir_path}"
        resp_dir = requests.get(url_dir, headers=headers)
        if resp_dir.status_code == 200:
            print([item['name'] for item in resp_dir.json()])
        else:
            print(f"Directory {dir_path} not found either.")

