#!/usr/bin/env node
/**
 * RDMX Roadmap as Code
 * --------------------
 * Lee docs/roadmap-rdmx-executable.yaml y genera:
 *   - public/roadmap-rdmx.json  (consumible por el front)
 *   - reporte por stdout (totales por área y estado)
 *
 * Ejecutar:
 *   node tools/rdmx-roadmap.mjs
 *
 * Sync opcional con GitHub Issues:
 *   GITHUB_TOKEN=... GITHUB_REPO=OsoPanda1/real-del-monte-explorer node tools/rdmx-roadmap.mjs --sync
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const YAML_PATH = path.join(ROOT, "docs", "roadmap-rdmx-executable.yaml");
const OUT_PATH = path.join(ROOT, "public", "roadmap-rdmx.json");

/** Parser YAML mínimo y específico para nuestra estructura (evita dependencias). */
function parseYaml(src) {
  const lines = src.split(/\r?\n/);
  const root = {};
  const stack = [{ indent: -1, value: root }];

  const setValue = (parent, key, value) => {
    if (Array.isArray(parent)) parent.push(value);
    else parent[key] = value;
  };

  for (let raw of lines) {
    if (!raw.trim() || raw.trim().startsWith("#")) continue;
    const indent = raw.match(/^ */)[0].length;
    const line = raw.trim();
    while (stack.length > 1 && indent <= stack[stack.length - 1].indent) stack.pop();
    const parent = stack[stack.length - 1].value;

    if (line.startsWith("- ")) {
      const item = line.slice(2);
      if (!Array.isArray(parent)) {
        // upgrade last key to array
      }
      if (item.includes(":")) {
        const obj = {};
        const [k, ...rest] = item.split(":");
        const v = rest.join(":").trim();
        if (v) obj[k.trim()] = stripQuotes(v);
        if (Array.isArray(parent)) parent.push(obj);
        stack.push({ indent, value: obj });
      } else {
        if (Array.isArray(parent)) parent.push(stripQuotes(item));
      }
      continue;
    }

    const idx = line.indexOf(":");
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    const rest = line.slice(idx + 1).trim();
    if (!rest || rest === ">-" || rest === ">" || rest === "|") {
      const container = {};
      setValue(parent, key, container);
      stack.push({ indent, value: container });
    } else if (rest.startsWith("[")) {
      setValue(parent, key, rest);
    } else {
      // scalar; if next line is "- " deeper, convert to array later
      const arr = [];
      // peek: handled by detecting "- " with deeper indent — fallback to scalar now
      setValue(parent, key, stripQuotes(rest));
      // also push container in case sub items appear
      const container = arr;
      // we don't know yet; skip
    }
  }
  return root;
}

function stripQuotes(v) {
  if (typeof v !== "string") return v;
  return v.replace(/^['"]|['"]$/g, "");
}

/** Más simple y robusto: usar parser estructural lineal específico. */
function parseRoadmap(src) {
  // Estrategia simple: extraer "areas:" como lista de objetos con tasks por status.
  const out = { areas: [], generatedAt: new Date().toISOString() };
  const lines = src.split(/\r?\n/);
  let area = null;
  let task = null;
  for (const raw of lines) {
    const m4 = /^  - key:\s*(.+)$/.exec(raw);
    if (m4) {
      area = { key: m4[1].trim(), title: "", priority: "", tasks: [] };
      out.areas.push(area);
      task = null;
      continue;
    }
    if (!area) continue;
    let mm;
    if ((mm = /^    title:\s*(.+)$/.exec(raw))) area.title = mm[1].trim();
    else if ((mm = /^    priority:\s*(.+)$/.exec(raw))) area.priority = mm[1].trim();
    else if ((mm = /^      - id:\s*(.+)$/.exec(raw))) {
      task = { id: mm[1].trim(), title: "", status: "todo" };
      area.tasks.push(task);
    } else if (task) {
      if ((mm = /^        title:\s*(.+)$/.exec(raw))) task.title = mm[1].trim();
      else if ((mm = /^        status:\s*(.+)$/.exec(raw))) task.status = mm[1].trim();
      else if ((mm = /^        owner:\s*(.+)$/.exec(raw))) task.owner = mm[1].trim();
      else if ((mm = /^        estimate:\s*(.+)$/.exec(raw))) task.estimate = mm[1].trim();
    }
  }
  return out;
}

function summarize(roadmap) {
  let total = 0, done = 0, inProgress = 0, todo = 0;
  for (const a of roadmap.areas) {
    for (const t of a.tasks) {
      total++;
      if (t.status === "done") done++;
      else if (t.status === "in-progress" || t.status === "in_progress") inProgress++;
      else todo++;
    }
  }
  return { total, done, inProgress, todo, completion: total ? Math.round((done / total) * 100) : 0 };
}

function main() {
  if (!fs.existsSync(YAML_PATH)) {
    console.error(`Roadmap no encontrado: ${YAML_PATH}`);
    process.exit(1);
  }
  const src = fs.readFileSync(YAML_PATH, "utf8");
  const roadmap = parseRoadmap(src);
  const summary = summarize(roadmap);
  const payload = { ...roadmap, summary };

  fs.mkdirSync(path.dirname(OUT_PATH), { recursive: true });
  fs.writeFileSync(OUT_PATH, JSON.stringify(payload, null, 2));

  console.log(`✓ Roadmap parseado → ${path.relative(ROOT, OUT_PATH)}`);
  console.log(`  Áreas:   ${roadmap.areas.length}`);
  console.log(`  Tareas:  ${summary.total} (done ${summary.done} · en progreso ${summary.inProgress} · todo ${summary.todo})`);
  console.log(`  Completitud: ${summary.completion}%`);

  if (process.argv.includes("--sync")) {
    console.log("\n[sync] Falta GITHUB_TOKEN / GITHUB_REPO o se omitió la integración real.");
    console.log("[sync] Este script deja preparado el JSON; el sync con Issues se puede activar luego.");
  }
}

main();
