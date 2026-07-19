import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Collect all asset files (excluding musica/)
const assetsDir = path.join(__dirname, 'src', 'assets');
const allFiles = [];

function walk(dir, prefix) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== 'musica') walk(fullPath, path.join(prefix, entry.name));
    } else {
      const stat = fs.statSync(fullPath);
      const rel = path.join(prefix, entry.name).replace(/\\/g, '/');
      allFiles.push({ path: rel, size: stat.size });
    }
  }
}
walk(assetsDir, '');

// Collect all references from src/
const srcDir = path.join(__dirname, 'src');
const refs = new Set();

function walkSrc(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!entry.name.startsWith('.') && entry.name !== 'node_modules') walkSrc(fullPath);
    } else if (/\.(tsx|ts|jsx|js|css|html|json|md)$/.test(entry.name)) {
      const content = fs.readFileSync(fullPath, 'utf-8');
      // import/reference patterns: "@/assets/..." or "../assets/..." or "assets/..."
      const re1 = /['"](?:@\/)?assets\/([^'"]+)['"]/g;
      let m;
      while ((m = re1.exec(content)) !== null) {
        refs.add(m[1].split('?')[0].split('#')[0]);
      }
      // new URL("../assets/...", ...)
      const re2 = /new\s+URL\s*\(\s*['"](?:\.\.\/)?assets\/([^'"]+)['"]/g;
      while ((m = re2.exec(content)) !== null) {
        refs.add(m[1].split('?')[0].split('#')[0]);
      }
    }
  }
}
walkSrc(srcDir);

// Compare
console.log('=== ALL FILES (excluding musica/) sorted by size ===');
allFiles.sort((a, b) => b.size - a.size);
let unusedTotal = 0;
const unusedFiles = [];

for (const f of allFiles) {
  const kb = (f.size / 1024).toFixed(1);
  const isReferenced = refs.has(f.path);
  const mark = isReferenced ? '' : '  ** UNUSED **';
  if (!isReferenced) {
    unusedTotal += f.size;
    unusedFiles.push(f);
  }
  console.log(kb.padStart(8) + ' KB  ' + f.path + mark);
}

console.log('\n=== SUMMARY ===');
console.log('Total files:     ' + allFiles.length);
console.log('Referenced:      ' + (allFiles.length - unusedFiles.length));
console.log('Unused:          ' + unusedFiles.length);
console.log('Unused size:     ' + (unusedTotal / 1024).toFixed(1) + ' KB (' + (unusedTotal / 1024 / 1024).toFixed(2) + ' MB)');

console.log('\n=== UNUSED FILES (sorted by size) ===');
unusedFiles.sort((a, b) => b.size - a.size);
unusedFiles.forEach(f => {
  console.log(((f.size / 1024).toFixed(1) + ' KB').padStart(8) + '  ' + f.path);
});
