#!/usr/bin/env bash
# ==============================================================================
# Script Name: rockchip-tune.sh
# Description: Optimiza el rendimiento de hardware para placas Rockchip
#              (ajusta el governor de CPU a "performance" y vm.swappiness).
# ==============================================================================

set -euo pipefail

# Definición de colores para la salida en consola
readonly COLOR_INFO="\033[1;34m"
readonly COLOR_SUCCESS="\033[1;32m"
readonly COLOR_WARN="\033[1;33m"
readonly COLOR_ERROR="\033[1;31m"
readonly COLOR_RESET="\033[0m"

log_info()    { echo -e "${COLOR_INFO}[INFO]${COLOR_RESET} $*"; }
log_success() { echo -e "${COLOR_SUCCESS}[OK]${COLOR_RESET} $*"; }
log_warn()    { echo -e "${COLOR_WARN}[WARN]${COLOR_RESET} $*"; }
log_error()   { echo -e "${COLOR_ERROR}[ERROR]${COLOR_RESET} $*" >&2; }

# Verificar privilegios de superusuario
check_privileges() {
    if [[ $EUID -ne 0 ]]; then
        log_error "Este script debe ejecutarse con privilegios de administrador (sudo)."
        exit 1
    fi
}

# Ajustar el governor de CPU a performance
tune_cpu_governor() {
    log_info "Iniciando ajuste del governor de CPU a 'performance'..."
    
    local updated_count=0
    local total_cpus=0

    for cpu in /sys/devices/system/cpu/cpu[0-9]*; do
        [[ -d "$cpu" ]] || continue
        total_cpus=$((total_cpus + 1))
        
        local gov_path="$cpu/cpufreq/scaling_governor"
        if [[ -f "$gov_path" ]]; then
            if [[ -w "$gov_path" ]]; then
                if echo "performance" > "$gov_path"; then
                    log_success "CPU configurado correctamente: $(basename "$cpu")"
                    updated_count=$((updated_count + 1))
                else
                    log_warn "No se pudo escribir en $gov_path"
                fi
            else
                log_warn "El archivo $gov_path no tiene permisos de escritura."
            fi
        else
            log_warn "Governor no disponible para $(basename "$cpu") (núcleo offline o no soportado)."
        fi
    done

    if [[ $updated_count -eq 0 ]]; then
        log_warn "No se pudo actualizar ningún governor de CPU. Comprueba si cpufreq está activo."
    else
        log_success "Se actualizaron $updated_count de $total_cpus núcleos detectados."
    fi
}

# Ajustar vm.swappiness del sistema
tune_vm_swappiness() {
    local target_swappiness=10
    log_info "Ajustando vm.swappiness a $target_swappiness..."
    
    if sysctl -w vm.swappiness="$target_swappiness" >/dev/null; then
        log_success "vm.swappiness actualizado correctamente a $target_swappiness."
    else
        log_error "Fallo al configurar vm.swappiness mediante sysctl."
        exit 1
    fi
}

# Función principal
main() {
    check_privileges
    log_info "=== Iniciando optimización de hardware [Rockchip] ==="
    tune_cpu_governor
    tune_vm_swappiness
    log_info "=== Optimización completada con éxito ==="
}

main "$@"
