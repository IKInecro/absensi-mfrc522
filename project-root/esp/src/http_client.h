// http_client.h
// Modul untuk POST JSON ke backend, retry & timeout

#ifndef HTTP_CLIENT_H
#define HTTP_CLIENT_H

#include <Arduino.h>
#include <ESP8266HTTPClient.h>
#include <ESP8266WiFi.h>

// Fungsi POST JSON
// url: endpoint backend
// payload: JSON string
// return true jika sukses, false jika gagal
bool http_post_json(const char* url, const String& payload);

#endif
