#!/usr/bin/env node
import fs from "node:fs/promises";

const OUTPUT = new URL("../docs/osopanda-related-repos.json", import.meta.url);
const USER = process.env.OSOPANDA_USER ?? "OsoPanda1";
const KEYWORDS = ["rdm", "digital", "tamv", "xr", "realito", "isabella", "geolocation", "twin"];

const requestUrl = `https://api.github.com/users/${USER}/repos?per_page=100`;

async function run() {
  const response = await fetch(requestUrl, {
    headers: {
      "Accept": "application/vnd.github+json",
      ...(process.env.GITHUB_TOKEN ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` } : {}),
    },
  });

  if (!response.ok) {
    throw new Error(`GITHUB_API_${response.status}`);
  }

  const repos = await response.json();
  const related = repos
    .filter((repo) => {
      const haystack = `${repo.name} ${repo.description ?? ""}`.toLowerCase();
      return KEYWORDS.some((keyword) => haystack.includes(keyword));
    })
    .slice(0, 12)
    .map((repo) => ({
      name: repo.name,
      htmlUrl: repo.html_url,
      description: repo.description,
      language: repo.language,
      updatedAt: repo.updated_at,
      topics: repo.topics ?? [],
    }));

  const payload = {
    generatedAt: new Date().toISOString(),
    source: requestUrl,
    user: USER,
    criteria: { keywords: KEYWORDS, maxRepos: 12 },
    totalFetched: repos.length,
    related,
  };

  await fs.writeFile(OUTPUT, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
  // eslint-disable-next-line no-console
  console.log(`Generated ${related.length} related repositories at ${OUTPUT.pathname}`);
}

run().catch((error) => {
  // eslint-disable-next-line no-console
  console.error("Failed to build fusion manifest:", error.message);
  process.exitCode = 1;
});
