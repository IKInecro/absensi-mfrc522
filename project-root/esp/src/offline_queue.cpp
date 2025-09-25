// offline_queue.cpp
#include "offline_queue.h"

#define QUEUE_FILE "/absensi_queue.txt"

// Inisialisasi LittleFS
void queue_setup() {
  if (!LittleFS.begin()) {
    Serial.println("[Queue] Gagal mount LittleFS");
    return;
  }
  Serial.println("[Queue] LittleFS siap digunakan");
}

// Simpan data JSON ke queue
void queue_save(const String& json) {
  File file = LittleFS.open(QUEUE_FILE, "a"); // append
  if (!file) {
    Serial.println("[Queue] Gagal membuka file untuk menyimpan");
    return;
  }
  file.println(json);
  file.close();
  Serial.println("[Queue] Data tersimpan di queue");
}

// Ambil semua data queue
String queue_get_all() {
  String allData = "";
  if (!LittleFS.exists(QUEUE_FILE)) return allData;

  File file = LittleFS.open(QUEUE_FILE, "r");
  if (!file) return allData;

  while (file.available()) {
    String line = file.readStringUntil('\n');
    if (line.length() > 0) {
      allData += line + "\n";
    }
  }
  file.close();
  return allData;
}

// Hapus queue setelah sync
void queue_clear() {
  if (LittleFS.exists(QUEUE_FILE)) {
    LittleFS.remove(QUEUE_FILE);
    Serial.println("[Queue] Queue dihapus setelah sync");
  }
}
