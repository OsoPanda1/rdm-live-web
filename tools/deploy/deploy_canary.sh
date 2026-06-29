#!/usr/bin/env bash
set -euo pipefail

if [[ -z "${NODE0_HOST:-}" || -z "${NODE0_USER:-}" ]]; then
  echo "NODE0_HOST y NODE0_USER son requeridos"
  exit 1
fi

echo "[canary] Simulación de deploy hacia ${NODE0_USER}@${NODE0_HOST}"
