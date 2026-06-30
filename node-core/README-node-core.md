# Nodo Cero — Node Core

## Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│                   Nodo Cero                          │
│  ┌──────────┐  ┌────────────┐  ┌──────────────────┐ │
│  │NetFlowX  │  │  Isabella   │  │  POV Display     │ │
│  │Collector │──│ AI Bridge   │──│  Controller      │ │
│  │(UDP:2055)│  │(HTTP/REST)  │  │(Serial/WebSocket)│ │
│  └──────────┘  └────────────┘  └──────────────────┘ │
│       │               │               │              │
│  ┌────▼───────────────▼───────────────▼────┐         │
│  │         Telemetry Store (RAM)           │         │
│  │  flows_total | packets_rx | cpu_percent │         │
│  └────────────────┬────────────────────────┘         │
│                    │                                  │
│  ┌────────────────▼────────────────────────┐         │
│  │  WebSocket Broadcast (/ws/telemetry)    │         │
│  │  REST API (/api/v1/telemetry)           │         │
│  │  Health (/health)                       │         │
│  └─────────────────────────────────────────┘         │
└─────────────────────────────────────────────────────┘
```

## Components

### NetFlowX Telemetry Collector
- UDP listener on port **2055** (configurable via `NETFLOW_PORT`)
- Parses **NetFlow v5** packets (header + flow records)
- Tracks: packets received, total flows, total bytes, last flow timestamp
- Decodes 5-tuple (src/dst IP, src/dst port, protocol) and byte counts

### Isabella AI Bridge
- Proxies queries to the Isabella AI inference endpoint (`ISABELLA_URL`)
- Endpoint: `GET /api/v1/isabella/proxy?q=<query>`
- Enables the physical node to send local telemetry context to Isabella for real-time decision support

### POV Display Controller
- JSON-over-Serial protocol to Arduino POV display
- Supports commands: `display` (text + effect), `telemetry` (live stats), `brightness`
- Effects: `scroll`, `static`, `blink`
- Auto-pushes telemetry every 10 seconds to the physical display

### System Health Monitor
- Reports CPU %, memory %, and active TCP connections via `psutil`
- Updates telemetry store every 5 seconds

## API Reference

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Health check |
| GET | `/api/v1/telemetry` | Current telemetry snapshot |
| POST | `/api/v1/display?text=...&effect=scroll` | Send text to POV display |
| GET | `/api/v1/isabella/proxy?q=...` | Query Isabella AI |
| WS | `/ws/telemetry` | Real-time telemetry stream |

## Deployment

### Prerequisites
- Python 3.11+
- `pip install fastapi[standard] uvicorn[standard] websockets pyserial psutil httpx`

### Run
```bash
cd node-core
python server_core.py
```

### Environment Variables
| Variable | Default | Description |
|----------|---------|-------------|
| `NODE_CORE_HOST` | `0.0.0.0` | Bind address |
| `NODE_CORE_PORT` | `8090` | HTTP/WS server port |
| `ARDUINO_PORT` | `/dev/ttyACM0` | Arduino serial port |
| `ARDUINO_BAUD` | `115200` | Serial baud rate |
| `NETFLOW_PORT` | `2055` | NetFlow UDP listener |
| `ISABELLA_URL` | `http://localhost:8080/api/isabella` | Isabella AI endpoint |

### Systemd Service
See `systemd/nodo-cero.service` for production deployment.

## Monitoring
- Prometheus metrics endpoint: TBD (planned)
- Logs: structured JSON via `python-json-logger` (recommended)
- Alerts: integrate with `health` endpoint via uptime monitor
