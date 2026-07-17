# server_core.py — Nodo Cero: NetFlowX + Isabella AI + Arduino POV Orchestrator
# DOCUMENTO MAESTRO INTERCONECTADO DE SOBERANÍA DIGITAL — Capítulo III
# Daemon de Sincronización Perimetral
# Puerto UDP: 9995 (interfaz local 127.0.0.1)
# Bluetooth RFCOMM: /dev/rfcomm0 @ 9600 baud
# Protocolo hardware: <Estado_Avatar 1 byte><Cadena ASCII max 32 chars>\n
# Requires: Python 3.11+, pip install pyserial psutil

import asyncio
import os
import struct
import time
from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Optional

try:
    import serial
except ImportError:
    serial = None

import psutil

# ---------------------------------------------------------------------------
# Configuration — prefijos soberanos
# ---------------------------------------------------------------------------
NETFLOW_SOCKET_PORT = int(os.getenv("NETFLOW_DB_PORT", "9995"))
NETFLOW_BIND_ADDR = os.getenv("NETFLOW_DB_BIND", "127.0.0.1")
BT_PORT = os.getenv("CIVIL_CORE_BT_PORT", "/dev/rfcomm0")
BT_BAUD = int(os.getenv("CIVIL_CORE_BT_BAUD", "9600"))
DISPLAY_INTERVAL = float(os.getenv("CIVIL_CORE_DISPLAY_INTERVAL", "2.0"))
INFER_INTERVAL = float(os.getenv("CIVIL_CORE_INFER_INTERVAL", "5.0"))

# ---------------------------------------------------------------------------
# Avatar states (semantemas de estado)
# ---------------------------------------------------------------------------
AVATAR_NEUTRAL = "N"  # infraestructura estable
AVATAR_ALERTA = "A"   # SYN flood, ataque crítico
AVATAR_HABLANDO = "H" # tráfico saturado, alta actividad

# ---------------------------------------------------------------------------
# EngineFrame — payload hacia el hardware POV
# ---------------------------------------------------------------------------
@dataclass
class EngineFrame:
    avatar_state: str = AVATAR_NEUTRAL
    display_string: str = "TAMV ONLINE NODE 0"

    def encode(self) -> bytes:
        # Protocolo: <1 byte estado><ASCII max 32 chars>\n
        text = self.display_string[:32]
        return f"{self.avatar_state}{text}\n".encode("ascii", errors="replace")


# ---------------------------------------------------------------------------
# NetFlow v5 collector (UDP socket en puerto 9995)
# ---------------------------------------------------------------------------
class NetFlowCollector:
    HEADER_FMT = "!HHIIIIBBH"
    HEADER_SIZE = struct.calcsize(HEADER_FMT)
    RECORD_FMT_V5 = "!IIIHHIIIIIHH"
    RECORD_SIZE = struct.calcsize(RECORD_FMT_V5)

    def __init__(self):
        self.packets_rx = 0
        self.flows_total = 0
        self.bytes_total = 0
        self.last_flow_ts: Optional[str] = None
        self.syn_ratio = 0.0
        self.flow_rate = 0.0

    def feed_packet(self, data: bytes):
        self.packets_rx += 1
        if len(data) < self.HEADER_SIZE:
            return
        header = struct.unpack(self.HEADER_FMT, data[: self.HEADER_SIZE])
        count = header[2]
        syn_count = 0
        for i in range(count):
            offset = self.HEADER_SIZE + i * self.RECORD_SIZE
            if offset + self.RECORD_SIZE > len(data):
                break
            rec = struct.unpack(self.RECORD_FMT_V5, data[offset : offset + self.RECORD_SIZE])
            self.flows_total += 1
            self.bytes_total += rec[6]
            tcp_flags = rec[8]
            if tcp_flags & 0x02:  # SYN flag
                syn_count += 1
        self.last_flow_ts = datetime.now(timezone.utc).isoformat()
        self.syn_ratio = syn_count / max(count, 1)
        self.flow_rate = count

    def infer_avatar_state(self) -> str:
        if self.syn_ratio > 0.8 and self.flow_rate > 100:
            return AVATAR_ALERTA
        if self.flow_rate > 50 or self.bytes_total > 1_000_000:
            return AVATAR_HABLANDO
        return AVATAR_NEUTRAL

    def build_display_string(self) -> str:
        if self.infer_avatar_state() == AVATAR_ALERTA:
            return f"ALERTA {self.flows_total} FLOWS"
        if self.infer_avatar_state() == AVATAR_HABLANDO:
            return f"TRAFICO {self.flows_total} F"
        return "TAMV ONLINE NODE 0"


# ---------------------------------------------------------------------------
# NetworkCoreDaemon
# ---------------------------------------------------------------------------
class NetworkCoreDaemon:
    def __init__(self):
        self.collector = NetFlowCollector()
        self.bt_serial: Optional[serial.Serial] = None
        self.bt_connected = False
        self.last_display = ""
        self.running = True

    # --- Bluetooth RFCOMM ---
    def init_bluetooth(self):
        if serial is None:
            print("[NODO] pyserial no instalado — modo simulación Bluetooth")
            return
        try:
            self.bt_serial = serial.Serial(BT_PORT, BT_BAUD, timeout=1)
            self.bt_connected = True
            print(f"[NODO] Bluetooth RFCOMM conectado en {BT_PORT} @ {BT_BAUD}")
        except (serial.SerialException, FileNotFoundError) as exc:
            print(f"[NODO] Bluetooth no disponible: {exc}")
            print("[NODO] Continuando en modo simulación — sin hardware POV")

    def despachar_trama_hardware(self, frame: EngineFrame):
        payload = frame.encode()
        if self.bt_serial and self.bt_connected:
            try:
                self.bt_serial.write(payload)
            except serial.SerialException:
                self.bt_connected = False
                print("[NODO] Bluetooth desconectado — pasando a simulación")
        # En simulación, loggear la trama
        if frame.display_string != self.last_display:
            print(f"[NODO] >>> TRAMA: {payload!r}")
            self.last_display = frame.display_string

    # --- Bucle de inferencia ---
    async def ejecutar_inferencia_isabella(self):
        state = self.collector.infer_avatar_state()
        text = self.collector.build_display_string()
        return EngineFrame(avatar_state=state, display_string=text)

    # --- Bucle principal ---
    async def bucle_operacional(self):
        print("[NODO] Daemon de Sincronización Perimetral iniciado")
        print(f"[NODO] NetFlowX UDP escuchando en {NETFLOW_BIND_ADDR}:{NETFLOW_SOCKET_PORT}")
        print(f"[NODO] Bluetooth RFCOMM {BT_PORT} @ {BT_BAUD}")
        print(f"[NODO] Intervalo inferencia: {INFER_INTERVAL}s | Display: {DISPLAY_INTERVAL}s")

        loop = asyncio.get_running_loop()

        # UDP listener
        transport, _ = await loop.create_datagram_endpoint(
            lambda: NetFlowProtocol(self.collector),
            local_addr=(NETFLOW_BIND_ADDR, NETFLOW_SOCKET_PORT),
        )

        last_infer = 0.0
        last_display = 0.0

        while self.running:
            now = time.time()

            # Inferencia periódica de estado
            if now - last_infer >= INFER_INTERVAL:
                frame = await self.ejecutar_inferencia_isabella()
                last_infer = now

            # Despacho periódico al hardware
            if now - last_display >= DISPLAY_INTERVAL:
                frame = await self.ejecutar_inferencia_isabella()
                self.despachar_trama_hardware(frame)
                last_display = now

            await asyncio.sleep(0.1)

    def stop(self):
        self.running = False
        if self.bt_serial:
            self.bt_serial.close()


class NetFlowProtocol(asyncio.DatagramProtocol):
    def __init__(self, collector: NetFlowCollector):
        self.collector = collector

    def datagram_received(self, data: bytes, _addr):
        self.collector.feed_packet(data)


# ---------------------------------------------------------------------------
# Entrypoint
# ---------------------------------------------------------------------------
async def main():
    daemon = NetworkCoreDaemon()
    daemon.init_bluetooth()
    try:
        await daemon.bucle_operacional()
    except KeyboardInterrupt:
        print("\n[NODO] Apagando daemon...")
    finally:
        daemon.stop()
        print("[NODO] Daemon detenido")


if __name__ == "__main__":
    asyncio.run(main())
