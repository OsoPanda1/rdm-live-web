/*
 * pov_engine.ino — POV Display Firmware for Nodo Cero
 * Real del Monte Digital Hub
 *
 * Hardware: Arduino Mega 2560 + 32x16 LED P10 matrix (or custom LED strip)
 * Protocol: JSON over Serial @ 115200 baud
 *
 * Commands:
 *   {"cmd":"display","text":"...","effect":"scroll|static|blink"}
 *   {"cmd":"telemetry","flows":N,"packets":N,"cpu":N.N}
 *   {"cmd":"brightness","value":0-255}
 */

#include <ArduinoJson.h>

// --- Pin configuration (customize for your LED matrix) ---
#define DATA_PIN    2
#define CLOCK_PIN   3
#define LATCH_PIN   4
#define OE_PIN      5
#define NUM_COLS    32
#define ROWS        16

// --- POV timing ---
const unsigned long FRAME_DELAY_US = 800;  // microseconds per column
const unsigned long BLINK_INTERVAL = 500;  // ms for blink effect

// --- Display buffer ---
uint8_t frame_buffer[ROWS][NUM_COLS] = {0};
uint8_t scroll_buffer[ROWS][512] = {0};   // scrolling text buffer
volatile unsigned int scroll_width = 0;
volatile int scroll_offset = 0;
volatile unsigned long last_frame = 0;

// --- Command state ---
enum Effect { EFFECT_STATIC, EFFECT_SCROLL, EFFECT_BLINK };
volatile Effect current_effect = EFFECT_STATIC;
volatile bool new_data = false;
volatile uint8_t brightness = 128;
volatile unsigned long last_blink = 0;
volatile bool blink_on = true;

// --- Font: 5x7 bitmap for ASCII 32-126 ---
#include "font5x7.h"

// =====================================================================
// POV Rendering
// =====================================================================

void ICACHE_RAM_ATTR render_column(int col) {
  digitalWrite(OE_PIN, HIGH);  // blank display
  digitalWrite(LATCH_PIN, LOW);

  for (int row = 0; row < ROWS; row++) {
    uint8_t val;
    if (current_effect == EFFECT_BLINK && !blink_on) {
      val = 0;
    } else {
      int src_col = col;
      if (current_effect == EFFECT_SCROLL) {
        src_col = col + scroll_offset;
        if (src_col < 0 || src_col >= scroll_width) {
          val = 0;
        } else {
          val = scroll_buffer[row][src_col];
        }
      } else {
        val = (col < NUM_COLS) ? frame_buffer[row][col] : 0;
      }
    }
    digitalWrite(DATA_PIN, (val >> 0) & 1);
    digitalWrite(CLOCK_PIN, HIGH);
    delayMicroseconds(1);
    digitalWrite(CLOCK_PIN, LOW);
  }

  digitalWrite(LATCH_PIN, HIGH);
  delayMicroseconds(1);
  digitalWrite(LATCH_PIN, LOW);

  // Column select via shift register
  for (int b = 0; b < 8; b++) {
    digitalWrite(DATA_PIN, (col >> b) & 1);
    digitalWrite(CLOCK_PIN, HIGH);
    delayMicroseconds(1);
    digitalWrite(CLOCK_PIN, LOW);
  }
  digitalWrite(LATCH_PIN, HIGH);
  delayMicroseconds(1);
  digitalWrite(LATCH_PIN, LOW);

  analogWrite(OE_PIN, map(brightness, 0, 255, 255, 0));
}

void render_pov() {
  unsigned long now_us = micros();
  if (now_us - last_frame < FRAME_DELAY_US * NUM_COLS) return;
  last_frame = now_us;

  for (int col = 0; col < NUM_COLS; col++) {
    render_column(col);
    delayMicroseconds(FRAME_DELAY_US);
  }

  // Scroll advancement
  if (current_effect == EFFECT_SCROLL) {
    scroll_offset--;
    if (scroll_offset < -scroll_width) {
      scroll_offset = NUM_COLS;
    }
  }

  // Blink toggle
  if (current_effect == EFFECT_BLINK) {
    unsigned long now = millis();
    if (now - last_blink > BLINK_INTERVAL) {
      blink_on = !blink_on;
      last_blink = now;
    }
  }
}

// =====================================================================
// Text rendering into buffer
// =====================================================================

void render_text_to_buffer(const char* text, uint8_t buffer[ROWS][512], unsigned int& width_out) {
  unsigned int x = 0;
  while (*text && x < 500) {
    char c = *text++;
    if (c < 32 || c > 126) c = ' ';
    int idx = c - 32;
    for (int col = 0; col < 5; col++) {
      for (int row = 0; row < ROWS; row++) {
        uint8_t byte_val = pgm_read_byte(&font5x7[idx][col]);
        buffer[row][x] = (row < 7) ? ((byte_val >> (6 - row)) & 1) : 0;
      }
      x++;
      if (x >= 512) break;
    }
    // space between chars
    if (x < 512) {
      for (int row = 0; row < ROWS; row++) buffer[row][x] = 0;
      x++;
    }
  }
  width_out = x;
  // Clear tail
  for (; x < 512; x++)
    for (int row = 0; row < ROWS; row++) buffer[row][x] = 0;
}

void render_telemetry(uint32_t flows, uint32_t packets, float cpu) {
  char line[64];
  snprintf(line, sizeof(line), "F:%lu P:%lu CPU:%.1f%%", flows, packets, cpu);
  render_text_to_buffer(line, scroll_buffer, scroll_width);
  current_effect = EFFECT_SCROLL;
  scroll_offset = NUM_COLS;
}

// =====================================================================
// Serial command parsing
// =====================================================================

void process_command(const char* input) {
  StaticJsonDocument<256> doc;
  DeserializationError err = deserializeJson(doc, input);
  if (err) return;

  const char* cmd = doc["cmd"];

  if (strcmp(cmd, "display") == 0) {
    const char* text = doc["text"] | "";
    const char* effect = doc["effect"] | "scroll";

    if (strcmp(effect, "static") == 0) {
      render_text_to_buffer(text, frame_buffer, scroll_width);
      current_effect = EFFECT_STATIC;
    } else if (strcmp(effect, "blink") == 0) {
      render_text_to_buffer(text, frame_buffer, scroll_width);
      current_effect = EFFECT_BLINK;
      blink_on = true;
      last_blink = millis();
    } else {
      render_text_to_buffer(text, scroll_buffer, scroll_width);
      current_effect = EFFECT_SCROLL;
      scroll_offset = NUM_COLS;
    }
    Serial.println("{\"status\":\"ok\"}");

  } else if (strcmp(cmd, "telemetry") == 0) {
    uint32_t flows = doc["flows"] | 0;
    uint32_t packets = doc["packets"] | 0;
    float cpu = doc["cpu"] | 0.0f;
    render_telemetry(flows, packets, cpu);
    Serial.println("{\"status\":\"ok\"}");

  } else if (strcmp(cmd, "brightness") == 0) {
    brightness = constrain(doc["value"] | 128, 0, 255);
    Serial.println("{\"status\":\"ok\"}");
  } else {
    Serial.println("{\"status\":\"unknown\"}");
  }
}

// =====================================================================
// Setup & Loop
// =====================================================================

void setup() {
  pinMode(DATA_PIN, OUTPUT);
  pinMode(CLOCK_PIN, OUTPUT);
  pinMode(LATCH_PIN, OUTPUT);
  pinMode(OE_PIN, OUTPUT);
  digitalWrite(OE_PIN, HIGH);  // start blanked

  Serial.begin(115200);
  while (!Serial) { delay(10); }

  render_text_to_buffer("Nodo Cero", scroll_buffer, scroll_width);
  current_effect = EFFECT_SCROLL;
  scroll_offset = NUM_COLS;

  Serial.println("{\"status\":\"ready\",\"device\":\"pov_engine\"}");
}

char serial_buffer[256];
unsigned int buf_pos = 0;

void loop() {
  // Parse serial commands (non-blocking)
  while (Serial.available()) {
    char c = Serial.read();
    if (c == '\n' || buf_pos >= 255) {
      serial_buffer[buf_pos] = '\0';
      if (buf_pos > 0) {
        process_command(serial_buffer);
      }
      buf_pos = 0;
    } else {
      serial_buffer[buf_pos++] = c;
    }
  }

  render_pov();
}
