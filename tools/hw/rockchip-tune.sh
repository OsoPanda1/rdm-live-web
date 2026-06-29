#!/usr/bin/env bash
set -euo pipefail

echo "[hw-tune] Ajuste de governor a performance"
for cpu in /sys/devices/system/cpu/cpu[0-9]*; do
  if [[ -w "$cpu/cpufreq/scaling_governor" ]]; then
    echo performance | sudo tee "$cpu/cpufreq/scaling_governor" >/dev/null
  fi
done

echo "[hw-tune] Ajuste de vm.swappiness"
sudo sysctl -w vm.swappiness=10
