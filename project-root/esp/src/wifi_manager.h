// wifi_manager.h
// Modul koneksi WiFi ESP8266
// Fungsi: connect/reconnect otomatis, optional AP mode backup

#ifndef WIFI_MANAGER_H
#define WIFI_MANAGER_H

#include <Arduino.h>
#include <ESP8266WiFi.h>

// Fungsi koneksi WiFi
void wifi_connect(const char* ssid, const char* password);

// Fungsi loop WiFi (cek status + reconnect otomatis)
void wifi_loop();

#endif
