/**
 * ESP32 RFID Attendance Client with HMAC SHA256 Signing
 * Required Libraries: 
 * - MFRC522 (RFID)
 * - ArduinoJson
 * - HTTPClient
 * - mbedtls (Built-in for ESP32 HMAC)
 */

#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <SPI.h>
#include <MFRC522.h>
#include "mbedtls/md.h"

// Configuration
const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";
const char* serverUrl = "https://your-cloud-functions-url/scanAttendance";

// Device Credentials (from Dashboard)
const char* DEVICE_ID = "ESP32_FRONT_01";
const char* SECRET_KEY = "your_generated_secret_key";

// RFID Pins
#define SS_PIN 5
#define RST_PIN 22
MFRC522 rfid(SS_PIN, RST_PIN);

void setup() {
  Serial.begin(115200);
  SPI.begin();
  rfid.PCD_Init();
  
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nWiFi Connected");
}

String calculateHMAC(String payload, String key) {
  byte hmacResult[32];
  mbedtls_md_context_t ctx;
  mbedtls_md_type_t md_type = MBEDTLS_MD_SHA256;

  mbedtls_md_init(&ctx);
  mbedtls_md_setup(&ctx, mbedtls_md_info_from_type(md_type), 1);
  mbedtls_md_hmac_starts(&ctx, (const unsigned char *) key.c_str(), key.length());
  mbedtls_md_hmac_update(&ctx, (const unsigned char *) payload.c_str(), payload.length());
  mbedtls_md_hmac_finish(&ctx, hmacResult);
  mbedtls_md_free(&ctx);

  String hash = "";
  for (int i = 0; i < 32; i++) {
    char str[3];
    sprintf(str, "%02x", (int)hmacResult[i]);
    hash += str;
  }
  return hash;
}

void loop() {
  if (!rfid.PICC_IsNewCardPresent() || !rfid.PICC_ReadCardSerial()) return;

  // 1. Get RFID UID
  String rfidUid = "";
  for (byte i = 0; i < rfid.uid.size; i++) {
    rfidUid += String(rfid.uid.uidByte[i] < 0x10 ? "0" : "");
    rfidUid += String(rfid.uid.uidByte[i], HEX);
  }
  rfidUid.toUpperCase();
  Serial.println("Scanned: " + rfidUid);

  // 2. Generate Signature (HMAC SHA256 of device_id + rfid_uid)
  String payload = String(DEVICE_ID) + rfidUid;
  String signature = calculateHMAC(payload, String(SECRET_KEY));

  // 3. Send to Cloud
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(serverUrl);
    http.addHeader("Content-Type", "application/json");

    StaticJsonDocument<200> doc;
    doc["device_id"] = DEVICE_ID;
    doc["rfid_uid"] = rfidUid;
    doc["signature"] = signature;

    String requestBody;
    serializeJson(doc, requestBody);

    int httpResponseCode = http.POST(requestBody);

    if (httpResponseCode > 0) {
      String response = http.getString();
      Serial.println(httpResponseCode);
      Serial.println(response);
      // Handle success (beep, LED, etc.)
    } else {
      Serial.print("Error on sending POST: ");
      Serial.println(httpResponseCode);
    }
    http.end();
  }

  rfid.PICC_HaltA();
  rfid.PCD_StopCrypto1();
  delay(2000); // Cooldown
}
