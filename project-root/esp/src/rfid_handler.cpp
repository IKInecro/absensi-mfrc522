#include "rfid_handler.h"

// Objek MFRC522
MFRC522 mfrc522(SS_PIN, RST_PIN);

// Setup RC522
void rfid_setup() {
  SPI.begin();
  mfrc522.PCD_Init();
  Serial.println("[RFID] RC522 siap");
}

// Baca UID
String rfid_read_uid() {
  String uidStr = "";
  // Cek kartu hadir
  if (!mfrc522.PICC_IsNewCardPresent()) return "";
  if (!mfrc522.PICC_ReadCardSerial()) return "";

  // Convert UID ke Hex string
  for (byte i = 0; i < mfrc522.uid.size; i++) {
    if (mfrc522.uid.uidByte[i] < 0x10) uidStr += "0";
    uidStr += String(mfrc522.uid.uidByte[i], HEX);
  }
  uidStr.toUpperCase();

  // Halt PICC
  mfrc522.PICC_HaltA();
  return uidStr;
}

// Dummy fungsi register mode, bisa diupdate dari backend / EEPROM
bool rfid_is_register_mode() {
  // Contoh: mode register bisa ON/OFF
  return false; // default OFF
}
