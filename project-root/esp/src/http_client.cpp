// http_client.cpp
#include "http_client.h"

bool http_post_json(const char* url, const String& payload) {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("[HTTP] WiFi tidak terhubung");
    return false;
  }

  HTTPClient http;
  http.begin(url);
  http.addHeader("Content-Type", "application/json");

  int httpCode = http.POST(payload);

  if (httpCode > 0) {
    Serial.printf("[HTTP] Response code: %d\n", httpCode);
    if (httpCode == HTTP_CODE_OK) {
      String resp = http.getString();
      Serial.println("[HTTP] Response: " + resp);
      http.end();
      return true;
    }
  } else {
    Serial.printf("[HTTP] POST gagal, error: %s\n", http.errorToString(httpCode).c_str());
  }

  http.end();
  return false;
}
