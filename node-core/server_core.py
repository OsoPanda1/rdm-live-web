# server_core.py — Nodo Cero: NetFlowX + Isabella + POV Orchestrator
# Real del Monte Digital Hub - Cyber-Physical System
# Requires: Python 3.11+, pip install fastapi[standard] websockets pyserial scapy psutil

import asyncio
import json
import os
import struct
import time
from datetime import datetime, timezone
from typing import Optional

try:
    import serial
except ImportError:
    serial = None

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import psutil

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------
HOST = os.getenv("NODE_CORE_HOST", "0.0.0.0")
PORT = int(os.getenv("NODE_CORE_PORT", "8090"))
ARDUINO_PORT = os.getenv("ARDUINO_PORT", "/dev/ttyACM0")
ARDUINO_BAUD = int(os.getenv("ARDUINO_BAUD", "115200"))
NETFLOW_PORT = int(os.getenv("NETFLOW_PORT", "2055"))
ISABELLA_URL = os.getenv("ISABELLA_URL", "http://localhost:8080/api/isabella")

app = FastAPI(title="Nodo Cero — NetFlowX · Isabella · POV")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# In-memory telemetry state
# ---------------------------------------------------------------------------
class TelemetryStore:
    def __init__(self):
        self.packets_rx = 0
        self.flows_total = 0
        self.bytes_total = 0
        self.active_connections = 0
        self.cpu_percent = 0.0
        self.memory_percent = 0.0
        self.last_flow_ts: Optional[str] = None
        self.last_update = time.time()

    def to_dict(self):
        return {
            "packets_rx": self.packets_rx,
            "flows_total": self.flows_total,
            "bytes_total": self.bytes_total,
            "active_connections": self.active_connections,
            "cpu_percent": self.cpu_percent,
            "memory_percent": self.memory_percent,
            "last_flow_ts": self.last_flow_ts,
            "last_update": self.last_update,
            "status": "operational",
            "uptime_seconds": int(time.time() - self.last_update),
        }

store = TelemetryStore()

# ---------------------------------------------------------------------------
# NetFlow v5 collector (UDP)
# ---------------------------------------------------------------------------
class NetFlowCollector:
    HEADER_FMT = "!HHIIIIBBH"
    HEADER_SIZE = struct.calcsize(HEADER_FMT)
    RECORD_FMT_V5 = "!IIIHHIIIIIHH"
    RECORD_SIZE = struct.calcsize(RECORD_FMT_V5)

    def __init__(self, port: int):
        self.port = port

    async def serve(self):
        loop = asyncio.get_running_loop()
        transport, _ = await loop.create_datagram_endpoint(
            lambda: NetFlowProtocol(self),
            local_addr=("0.0.0.0", self.port),
        )
        print(f"[NetFlowX] Listening on UDP :{self.port}")

    def on_packet(self, data: bytes):
        store.packets_rx += 1
        if len(data) < self.HEADER_SIZE:
            return
        header = struct.unpack(self.HEADER_FMT, data[: self.HEADER_SIZE])
        count = header[2]  # flow count
        for i in range(count):
            offset = self.HEADER_SIZE + i * self.RECORD_SIZE
            if offset + self.RECORD_SIZE > len(data):
                break
            rec = struct.unpack(self.RECORD_FMT_V5, data[offset : offset + self.RECORD_SIZE])
            store.flows_total += 1
            store.bytes_total += rec[6]  # dOctets
            store.last_flow_ts = datetime.now(timezone.utc).isoformat()


class NetFlowProtocol(asyncio.DatagramProtocol):
    def __init__(self, collector: NetFlowCollector):
        self.collector = collector

    def datagram_received(self, data: bytes, _addr):
        self.collector.on_packet(data)


# ---------------------------------------------------------------------------
# Arduino POV display bridge
# ---------------------------------------------------------------------------
class POVController:
    def __init__(self, port: str, baud: int):
        self.port = port
        self.baud = baud
        self.ser: Optional[serial.Serial] = None
        self.connected = False

    def connect(self):
        if serial is None:
            print("[POV] pyserial not installed; running in simulation mode")
            return
        try:
            self.ser = serial.Serial(self.port, self.baud, timeout=2)
            self.connected = True
            print(f"[POV] Connected to Arduino on {self.port}")
        except (serial.SerialException, FileNotFoundError) as exc:
            print(f"[POV] Could not connect: {exc}")

    async def display_text(self, text: str, effect: str = "scroll"):
        msg = json.dumps({"cmd": "display", "text": text, "effect": effect}) + "\n"
        await self._send(msg)

    async def display_telemetry(self):
        t = store.to_dict()
        msg = json.dumps({
            "cmd": "telemetry",
            "flows": t["flows_total"],
            "packets": t["packets_rx"],
            "cpu": t["cpu_percent"],
        }) + "\n"
        await self._send(msg)

    async def _send(self, msg: str):
        if self.ser and self.connected:
            try:
                self.ser.write(msg.encode())
            except serial.SerialException:
                self.connected = False
        else:
            pass  # simulation: silently accept

    def close(self):
        if self.ser:
            self.ser.close()


pov = POVController(ARDUINO_PORT, ARDUINO_BAUD)


# ---------------------------------------------------------------------------
# System health monitor
# ---------------------------------------------------------------------------
async def system_health_loop():
    while True:
        store.cpu_percent = psutil.cpu_percent(interval=1)
        store.memory_percent = psutil.virtual_memory().percent
        store.active_connections = len(psutil.net_connections())
        await asyncio.sleep(5)


async def telemetry_push_loop():
    while True:
        await pov.display_telemetry()
        await asyncio.sleep(10)


# ---------------------------------------------------------------------------
# WebSocket for real-time telemetry streaming
# ---------------------------------------------------------------------------
connected_ws: set[WebSocket] = set()


@app.websocket("/ws/telemetry")
async def ws_telemetry(ws: WebSocket):
    await ws.accept()
    connected_ws.add(ws)
    try:
        while True:
            await ws.receive_text()  # keep-alive pong
    except WebSocketDisconnect:
        pass
    finally:
        connected_ws.discard(ws)


async def broadcast_telemetry():
    while True:
        payload = json.dumps(store.to_dict())
        dead: list[WebSocket] = []
        for ws in connected_ws:
            try:
                await ws.send_text(payload)
            except Exception:
                dead.append(ws)
        for ws in dead:
            connected_ws.discard(ws)
        await asyncio.sleep(2)


# ---------------------------------------------------------------------------
# REST endpoints
# ---------------------------------------------------------------------------
@app.get("/health")
async def health():
    return {"status": "ok", "timestamp": datetime.now(timezone.utc).isoformat()}


@app.get("/api/v1/telemetry")
async def get_telemetry():
    return store.to_dict()


@app.post("/api/v1/display")
async def set_display(text: str, effect: str = "scroll"):
    await pov.display_text(text, effect)
    return {"sent": True, "text": text}


@app.get("/api/v1/isabella/proxy")
async def isabella_proxy(q: str = ""):
    import httpx
    async with httpx.AsyncClient() as client:
        resp = await client.post(ISABELLA_URL, json={"query": q}, timeout=10)
    return resp.json()


# ---------------------------------------------------------------------------
# Lifespan
# ---------------------------------------------------------------------------
async def lifespan(app: FastAPI):
    collector = NetFlowCollector(NETFLOW_PORT)
    pov.connect()
    tasks = [
        asyncio.create_task(collector.serve()),
        asyncio.create_task(system_health_loop()),
        asyncio.create_task(telemetry_push_loop()),
        asyncio.create_task(broadcast_telemetry()),
    ]
    yield
    for t in tasks:
        t.cancel()
    pov.close()


app.router.lifespan_context = lifespan


# ---------------------------------------------------------------------------
# Entrypoint
# ---------------------------------------------------------------------------
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host=HOST, port=PORT)
