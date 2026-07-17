# Hardware del Nodo Cero — POV Display System

## Documentación de Conexión Física Interna
### DOCUMENTO MAESTRO INTERCONECTADO DE SOBERANÍA DIGITAL — Capítulo V

---

## Mapeo de Pines — Arduino Uno/Nano → POV Rotor

### Consideraciones de Montaje

- Evitar caídas de tensión en las líneas LED usando cable calibre 22 AWG o superior.
- El sensor Hall debe colocarse con orientación perpendicular al imán de paso para evitar falsos disparos.
- Balancear mecánicamente el rotor para reducir vibraciones que afecten la lectura del sensor.
- Usar conectores crimpeados en lugar de soldadura directa en puntos sometidos a fuerza centrífuga.
- Asegurar rutas de retorno de corriente independientes para LEDs y lógica digital.

### Tabla de Mapeo Físico

| Componente               | Pin Arduino | Registro AVR | Puerto/DDR | Bit  | Especificación Técnica                                                |
|--------------------------|-------------|--------------|------------|------|-----------------------------------------------------------------------|
| Sensor de efecto Hall    | 13          | PINB         | DDRB       | bit 5 | Sensor magnético de paso de ciclo. Entrada digital con interrupción. Entrada con pull-up interno habilitado. |
| Módulo Bluetooth (TX)    | 0 (RX)      | —            | UART       | —    | Entrada de la trama serial generada por server_core.py. 9600 baud, 8N1. |
| Línea LED 1 (Base)       | 2           | PORTD        | DDRD       | bit 2 | Bit 0 del arreglo paralelo. Render inferior del patrón.               |
| Línea LED 2              | 3           | PORTD        | DDRD       | bit 3 | Bit 1 del arreglo paralelo.                                           |
| Línea LED 3              | 4           | PORTD        | DDRD       | bit 4 | Bit 2 del arreglo paralelo.                                           |
| Línea LED 4              | 5           | PORTD        | DDRD       | bit 5 | Bit 3 del arreglo paralelo.                                           |
| Línea LED 5              | 6           | PORTD        | DDRD       | bit 6 | Bit 4 del arreglo paralelo.                                           |
| Línea LED 6              | 7           | PORTD        | DDRD       | bit 7 | Bit 5 del arreglo paralelo.                                           |
| Línea LED 7              | 8           | PORTB        | DDRB       | bit 0 | Bit 6 del arreglo paralelo.                                           |
| Línea LED 8 (Tope)       | 9           | PORTB        | DDRB       | bit 1 | Bit 7 del arreglo paralelo. Render superior del patrón.               |

### Resumen de Registros AVR

```c
// Configuración de dirección
DDRD |= 0b11111100;  // PD2-PD7 como salidas (LEDs 1-6)
DDRB |= 0b00000011;  // PB0-PB1 como salidas (LEDs 7-8)
DDRB &= ~(1 << 5);   // PB5 como entrada (Hall sensor)

// Pull-up interno para Hall sensor
PORTB |= (1 << 5);

// Escritura paralela a LEDs (evita digitalWrite())
void led_write(uint8_t val) {
  PORTD = (PORTD & 0b00000011) | ((val & 0b00111111) << 2);
  PORTB = (PORTB & 0b11111100) | ((val >> 6) & 0b00000011);
}
```

### Diagrama de Conexión (Texto)

```
                     ┌──────────────┐
                     │   ARDUINO    │
                     │   UNO/NANO   │
                     │              │
  BLUETOOTH ── RX ──┤ Pin 0 (RX)   │
                     │              │
  HALL ──────────────┤ Pin 13 (PB5) │
                     │              │
  LED 1 (Base) ──────┤ Pin 2 (PD2)  │
  LED 2 ──────────────┤ Pin 3 (PD3)  │
  LED 3 ──────────────┤ Pin 4 (PD4)  │
  LED 4 ──────────────┤ Pin 5 (PD5)  │
  LED 5 ──────────────┤ Pin 6 (PD6)  │
  LED 6 ──────────────┤ Pin 7 (PD7)  │
  LED 7 ──────────────┤ Pin 8 (PB0)  │
  LED 8 (Tope) ───────┤ Pin 9 (PB1)  │
                     │              │
                     └──────────────┘
```

---

## Archivos del Firmware

| Archivo          | Descripción                                                         |
|------------------|---------------------------------------------------------------------|
| `pov_engine.ino` | Firmware principal — renderizado POV, protocolo serial, matrices avatar Isabella, sincronización Hall |
| `font5x7.h`      | Fuente tipográfica 5×7 para ASCII 32-126 (95 caracteres en PROGMEM) |

---

## Protocolo Serial (Bluetooth RFCOMM)

El servidor `server_core.py` envía tramas al Arduino vía Bluetooth:

```
<Estado_Avatar 1 byte><Cadena ASCII max 32 chars>\n
```

| Byte | Campo       | Valores         | Descripción                              |
|------|-------------|-----------------|------------------------------------------|
| 0    | Estado      | `N` / `A` / `H` | Neutral, Alerta, Hablando                |
| 1..n | Texto       | ASCII           | Mensaje a proyectar (máx 32 caracteres)  |
| n+1  | Fin de trama | `\n`            | Newline delimita la trama                |

**Estados de Avatar Isabella:**
- `N` — Neutral: infraestructura estable. Avatar con expresión serena.
- `A` — Alerta: SYN flood o ataque crítico. Avatar con ceño severo y signo de alerta.
- `H` — Hablando: tráfico saturado o alta actividad. Avatar con boca abierta.

**Ejemplo de trama:**
```
NTAMV ONLINE NODE 0\n
AALERTA 42 FLOWS\n
HTRAFICO SATURADO\n
```

---

## Especificaciones Técnicas

| Parámetro               | Valor              |
|-------------------------|--------------------|
| Microcontrolador        | ATmega328P         |
| Frecuencia              | 16 MHz             |
| Baud rate Bluetooth     | 9600               |
| LED count               | 8 líneas paralelas |
| Columnas avatar         | 16                 |
| Columnas por carácter   | 5                  |
| Max texto               | 32 caracteres      |
| Sincronización          | Sensor Hall (PCINT)|
| Consumo estimado LEDs   | 160 mA (8 × 20 mA) |

---

## Pruebas de Hardware

Ver `docs/HARDWARE-TESTING.md` para el checklist completo de prueba del sistema ciberfísico.
