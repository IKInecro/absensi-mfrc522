// offline_queue.h
// Modul untuk menyimpan absensi sementara saat ESP offline
// Menggunakan LittleFS (ESP8266)

#ifndef OFFLINE_QUEUE_H
#define OFFLINE_QUEUE_H

#include <Arduino.h>
#include <LittleFS.h>

// Inisialisasi filesystem
void queue_setup();

// Simpan data JSON ke queue
void queue_save(const String& json);

// Ambil semua data queue untuk sync
// Mengembalikan array JSON String
String queue_get_all();

// Hapus queue setelah berhasil sync
void queue_clear();

#endif
