// wifi_manager.cpp
#include "wifi_manager.h"

static const char* currentSSID = nullptr;
static const char* currentPASS = nullptr;
static unsigned long lastReconnectAttempt = 0;
static const unsigned long RECONNECT_INTERVAL = 5000; // 5 detik

void wifi_connect(const char* ssid, const char* password) {
  currentSSID = ssid;
  currentPASS = password;

  WiFi.mode(WIFI_STA); // Station mode
  WiFi.begin(ssid, password);

  Serial.print("[WiFi] Menghubungkan ke SSID: ");
  Serial.println(ssid);

  unsigned long startAttempt = millis();
  while (WiFi.status() != WL_CONNECTED && millis() - startAttempt < 10000) {
    Serial.print(".");
    delay(500);
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\n[WiFi] Terhubung!");
    Serial.print("[WiFi] IP: ");
    Serial.println(WiFi.localIP());
  } else {
    Serial.println("\n[WiFi] Gagal terhubung, akan mencoba reconnect di loop");
  }
}

void wifi_loop() {
  // Jika tidak terhubung, coba reconnect setiap interval
  if (WiFi.status() != WL_CONNECTED) {
    if (millis() - lastReconnectAttempt > RECONNECT_INTERVAL) {
      lastReconnectAttempt = millis();
      Serial.println("[WiFi] Mencoba reconnect...");
      WiFi.disconnect();
      WiFi.begin(currentSSID, currentPASS);
    }
  }
}
