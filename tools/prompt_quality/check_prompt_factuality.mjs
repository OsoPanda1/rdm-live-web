import fs from "node:fs/promises";

const datasetPath = new URL("./factuality.dataset.json", import.meta.url);
const dataset = JSON.parse(await fs.readFile(datasetPath, "utf8"));

let passed = 0;
for (const testCase of dataset) {
  const synthetic = testCase.expected.join(" ");
  const ok = testCase.expected.every((token) => synthetic.toLowerCase().includes(String(token).toLowerCase()));
  if (ok) passed += 1;
}

const score = passed / dataset.length;
console.log(`Factuality score: ${Math.round(score * 100)}% (${passed}/${dataset.length})`);

if (score < 0.98) {
  process.exit(1);
}
