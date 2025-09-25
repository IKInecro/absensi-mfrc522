#include <Arduino.h>
#include <ESP8266WiFi.h>
#include <Ticker.h>
#include "rfid_handler.h"
#include "wifi_manager.h"
#include "http_client.h"
#include "offline_queue.h"

// --- Konfigurasi WiFi & Server ---
#define WIFI_SSID     "Nama_WiFi"
#define WIFI_PASSWORD "Password_WiFi"
const char* SERVER_URL = "http://<IP_SERVER>/backend/api/attendance.php";

// --- Konfigurasi Device ---
#define DEVICE_ID "ESP01"

// --- Buzzer ---
#define BUZZER_PIN D5

// --- Timer Heartbeat / LED / Optional ---
Ticker wifiTicker;

// --- Fungsi Buzzer ---
void beep(int times, int delayMs) {
  for (int i = 0; i < times; i++) {
    digitalWrite(BUZZER_PIN, HIGH);
    delay(delayMs);
    digitalWrite(BUZZER_PIN, LOW);
    delay(delayMs);
  }
}

void setup() {
  Serial.begin(115200);

  pinMode(BUZZER_PIN, OUTPUT);
  digitalWrite(BUZZER_PIN, LOW);

  // Setup filesystem untuk queue
  queue_setup();

  // Setup WiFi
  wifi_connect(WIFI_SSID, WIFI_PASSWORD);

  // Setup RFID
  rfid_setup();

  Serial.println("[ESP] Sistem siap");
}

void loop() {
  // Loop WiFi reconnect
  wifi_loop();

  // Baca RFID
  String uid = rfid_read_uid();
  if (uid.length() > 0) {
    Serial.println("[RFID] UID terbaca: " + uid);

    // Buat payload JSON
    String payload = "{";
    payload += "\"device_id\":\"" + String(DEVICE_ID) + "\",";
    payload += "\"uid\":\"" + uid + "\",";
    payload += "\"timestamp\":\"" + String(millis()) + "\"";
    payload += "}";

    // Coba kirim ke server
    if (http_post_json(SERVER_URL, payload)) {
      // Berhasil → beep 2 pendek
      beep(2, 150);
    } else {
      // Gagal → simpan ke offline queue & beep 1 panjang
      queue_save(payload);
      beep(1, 500);
    }
  }

  // Sync offline queue jika WiFi sudah online
  if (WiFi.status() == WL_CONNECTED) {
    String batch = queue_get_all();
    if (batch.length() > 0) {
      Serial.println("[Queue] Sync batch dimulai");
      int successCount = 0;
      int totalLines = 0;

      // iterasi tiap line JSON
      int startIdx = 0;
      while (startIdx < batch.length()) {
        int endIdx = batch.indexOf('\n', startIdx);
        if (endIdx == -1) endIdx = batch.length();
        String line = batch.substring(startIdx, endIdx);
        startIdx = endIdx + 1;

        if (line.length() > 0 && http_post_json(SERVER_URL, line)) {
          successCount++;
        }
        totalLines++;
      }

      // Jika semua sukses, hapus queue
      if (successCount == totalLines) {
        queue_clear();
        // beep 1 pendek + 1 panjang untuk sync berhasil
        beep(1, 150);
        delay(150);
        beep(1, 500);
      }
    }
  }

  delay(200); // debounce loop
}
