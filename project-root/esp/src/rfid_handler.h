// rfid_handler.h
// Modul baca RC522, validasi UID, cek register mode

#ifndef RFID_HANDLER_H
#define RFID_HANDLER_H

#include <Arduino.h>
#include <SPI.h>
#include <MFRC522.h>

// Pin MFRC522
#define SS_PIN D2
#define RST_PIN D1

// Inisialisasi MFRC522
extern MFRC522 mfrc522;

// Setup RC522
void rfid_setup();

// Baca UID kartu sebagai string Hex
String rfid_read_uid();

// Cek apakah mode register aktif (misal backend control)
bool rfid_is_register_mode();

#endif
