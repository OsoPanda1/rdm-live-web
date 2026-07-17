/*
 * pov_engine.ino — Firmware Cinético POV
 * DOCUMENTO MAESTRO INTERCONECTADO DE SOBERANÍA DIGITAL — Capítulo III
 * Hardware: Arduino Uno/Nano (AVR ATmega328P)
 * Sensor: Efecto Hall en pin 13 (PB5) — interrupción PCINT0
 * Bluetooth: RFCOMM en UART (pin 0 RX) @ 9600 baud
 * LEDs: 8 líneas paralelas en pines 2-9 (PORTD bits 2-7, PORTB bits 0-1)
 * Protocolo: <Estado_Avatar 1 byte><Cadena ASCII max 32 chars>\n
 *
 * Renderizado POV con temporización por revolución:
 * - Hall sensor mide tiempo de rotación
 * - time_per_deg distribuye columnas en 360°
 * - draw_avatar() centrado en ventana angular específica
 * - displayChar() con line_delay ajustable
 */

#include <avr/io.h>
#include <avr/interrupt.h>
#include <avr/pgmspace.h>
#include <string.h>
#include "font5x7.h"

// =====================================================================
// Pin Mapping — DOCUMENTO MAESTRO Capítulo V
// =====================================================================
#define HALL_SENSOR_PIN  13   // PB5 — PCINT5 (PCINT0 vector)

// LED lines: PD2-PD7 (pins 2-7) = lower 6 bits, PB0-PB1 (pins 8-9) = upper 2 bits
#define LED_MASK_PORTD  0b11111100  // PD2..PD7
#define LED_MASK_PORTB  0b00000011  // PB0..PB1

// =====================================================================
// Avatar Isabella Matrices (16 columnas x 8 bits) — PROGMEM
// =====================================================================
// Cada byte: bit 7 = LED superior (pin 9), bit 0 = LED inferior (pin 2)
const uint8_t PROGMEM avatar_neutral[16] = {
  0b00111100,
  0b01111110,
  0b11011011,
  0b11111111,
  0b11111111,
  0b11111111,
  0b11000011,
  0b11000011,
  0b11000011,
  0b11111111,
  0b01111110,
  0b00111100,
  0b00011000,
  0b00100100,
  0b01000010,
  0b10000001,
};

const uint8_t PROGMEM avatar_hablando[16] = {
  0b00111100,
  0b01111110,
  0b11011011,
  0b11111111,
  0b11111111,
  0b11111111,
  0b11000011,
  0b11100111,
  0b11100111,
  0b11000011,
  0b11111111,
  0b01111110,
  0b00111100,
  0b01100110,
  0b10111101,
  0b00000000,
};

const uint8_t PROGMEM avatar_alerta[16] = {
  0b00111100,
  0b01111110,
  0b11011011,
  0b11111111,
  0b11100111,
  0b11100111,
  0b11000011,
  0b11000011,
  0b11000011,
  0b11111111,
  0b01111110,
  0b00111100,
  0b00011000,
  0b00011000,
  0b01111110,
  0b00011000,
};

// =====================================================================
// Global state
// =====================================================================
volatile unsigned long one_rot_time = 0;     // microsegundos de una revolución
volatile unsigned long time_per_deg = 0;     // microsegundos por grado
volatile unsigned long previousMillis = 0;
volatile bool text_ok = false;

// Avatar state from server_core.py: 'N' = Neutral, 'H' = Hablando, 'A' = Alerta
volatile char avatarMode = 'N';

// Display text buffer (max 32 chars + null)
volatile char receivedWord[33] = "TAMV ONLINE NODE 0";
volatile bool newTextAvailable = false;

// =====================================================================
// LED Write — direct AVR port registers (no digitalWrite latency)
// =====================================================================
static inline void led_write(uint8_t val) {
  // val bits 0-5 -> PD2-PD7
  PORTD = (PORTD & ~LED_MASK_PORTD) | ((val & 0b00111111) << 2);
  // val bits 6-7 -> PB0-PB1
  PORTB = (PORTB & ~LED_MASK_PORTB) | ((val >> 6) & 0b00000011);
}

static inline void led_off(void) {
  PORTD &= ~LED_MASK_PORTD;
  PORTB &= ~LED_MASK_PORTB;
}

// =====================================================================
// ISR — Hall effect sensor (PCINT0: pin 13 / PB5)
// =====================================================================
ISR(PCINT0_vect) {
  // Detect rising edge on PB5 (pin 13)
  if (PINB & (1 << 5)) {
    unsigned long now = micros();
    unsigned long diff = now - previousMillis;
    if (diff > 1000) {  // debounce: ignore <1ms pulses
      one_rot_time = diff;
      if (one_rot_time > 0) {
        time_per_deg = one_rot_time / 360;
      }
      previousMillis = now;
      text_ok = true;
    }
  }
}

// =====================================================================
// Avatar rendering
// =====================================================================
void draw_avatar(const uint8_t* avatar_matrix, uint8_t start_deg, uint8_t span_deg) {
  if (time_per_deg == 0) return;

  unsigned int delay_us = time_per_deg * span_deg / 16;  // 16 columnas en span_deg grados
  if (delay_us == 0) delay_us = 1;

  for (uint8_t col = 0; col < 16; col++) {
    uint8_t val = pgm_read_byte(&avatar_matrix[col]);
    led_write(val);
    delayMicroseconds(delay_us);
    led_off();
  }
}

// =====================================================================
// Character display — 5x7 font rendering
// =====================================================================
void displayChar(char c) {
  uint8_t idx;
  if (c >= 'A' && c <= 'Z') {
    idx = c - 'A' + 33;  // offset in font5x7
  } else if (c >= 'a' && c <= 'z') {
    idx = c - 'a' + 65;  // lowercase after uppercase in font5x7
  } else if (c == ' ') {
    idx = 0;   // space
  } else if (c == ':') {
    idx = 26;  // colon at position 26 (0-indexed)
  } else {
    idx = 0;
  }

  for (uint8_t col = 0; col < 5; col++) {
    uint8_t byte_val = pgm_read_byte(&font5x7[idx][col]);
    led_write(byte_val);
    delayMicroseconds(time_per_deg * 2);  // ~2° per column
    led_off();
  }
  // Inter-columnar gap
  led_write(0);
  delayMicroseconds(time_per_deg);
  led_off();
}

void displayText(const char* text) {
  while (*text) {
    displayChar(*text++);
  }
}

// =====================================================================
// Full frame render — avatar + text
// =====================================================================
void render_frame() {
  if (!text_ok || time_per_deg == 0) return;
  text_ok = false;

  cli();
  char localWord[33];
  strncpy(localWord, (const char*)receivedWord, 32);
  localWord[32] = '\0';
  char localAvatar = avatarMode;
  sei();

  // Select avatar matrix based on state
  const uint8_t* avatar_ptr;
  switch (localAvatar) {
    case 'H': avatar_ptr = avatar_hablando; break;
    case 'A': avatar_ptr = avatar_alerta;   break;
    default:  avatar_ptr = avatar_neutral;  break;
  }

  // Render: avatar in first 90°, text in remaining 270°
  // Avatar spans ~45° (16 cols)
  draw_avatar(avatar_ptr, 0, 45);

  // Render text across remaining arc
  displayText(localWord);
}

// =====================================================================
// Serial command parsing — Bluetooth UART @ 9600
// =====================================================================
void parseCommand(const char* buf) {
  // Protocol: <Estado 1 byte><ASCII string max 32>\n
  if (strlen(buf) < 1) return;

  char state = buf[0];
  if (state == 'N' || state == 'A' || state == 'H') {
    avatarMode = state;
  }

  // Extract text (from index 1 onwards)
  if (strlen(buf) > 1) {
    const char* textStart = buf + 1;
    size_t len = strlen(textStart);
    if (len > 32) len = 32;
    cli();
    strncpy((char*)receivedWord, textStart, len);
    receivedWord[len] = '\0';
    newTextAvailable = true;
    text_ok = true;
    sei();
  }
}

// =====================================================================
// Setup
// =====================================================================
void setup() {
  // Configure LED pins as outputs using AVR registers
  DDRD |= LED_MASK_PORTD;   // PD2-PD7 as outputs
  DDRB |= LED_MASK_PORTB;   // PB0-PB1 as outputs
  led_off();

  // Configure Hall sensor pin (PB5) as input with pull-up
  DDRB &= ~(1 << 5);        // PB5 as input
  PORTB |= (1 << 5);        // PB5 pull-up enabled

  // Enable pin change interrupt on PB5 (PCINT5)
  PCICR |= (1 << PCIE0);    // Enable PCINT0 group
  PCMSK0 |= (1 << PCINT5);  // Enable interrupt on PB5

  // Initialize UART for Bluetooth @ 9600 baud
  Serial.begin(9600);
  while (!Serial) { delay(10); }

  // Enable global interrupts
  sei();

  // Initial state
  avatarMode = 'N';
  strcpy((char*)receivedWord, "TAMV ONLINE NODE 0");
  text_ok = true;

  Serial.println("POV_ENGINE_READY");
}

// =====================================================================
// Main loop
// =====================================================================
char serial_buf[64];
uint8_t buf_pos = 0;

void loop() {
  // Read Bluetooth serial (non-blocking)
  while (Serial.available()) {
    char c = Serial.read();
    if (c == '\n' || buf_pos >= 63) {
      serial_buf[buf_pos] = '\0';
      if (buf_pos > 0) {
        parseCommand(serial_buf);
      }
      buf_pos = 0;
    } else {
      serial_buf[buf_pos++] = c;
    }
  }

  // Render POV frame synchronized by Hall sensor ISR
  if (text_ok && time_per_deg > 0) {
    render_frame();
  }
}
