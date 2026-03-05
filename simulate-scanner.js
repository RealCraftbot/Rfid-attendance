const crypto = require('crypto');

// --- YOUR EXACT DEVICE & STUDENT INFO ---
const DEVICE_SECRET = "a6edbebd6aae5c0837d521eae24f8e61"; 
const DEVICE_NAME = "ESP32_GATE"; 
const STUDENT_RFID_UID = "1A2B3C44"; // Peter's RFID tag
const ORG_ID = "rleoecOLicTNrKz8NLkKZvTrQYS2"; // Your Organization ID

const API_URL = "https://rfid-saas.netlify.app/api/scanAttendance"; 

const payload = {
  rfid_uid: STUDENT_RFID_UID,
  device_id: DEVICE_NAME,
  org_id: ORG_ID
};

async function simulateScan() {
  console.log(`📡 Firing scan from [${DEVICE_NAME}] for tag: ${STUDENT_RFID_UID}...`);

  // Using the Device Secret to lock and sign the data securely
  const signature = crypto
    .createHmac('sha256', DEVICE_SECRET)
    .update(JSON.stringify(payload))
    .digest('hex');

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-signature': signature 
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ SUCCESS! Scan accepted by Netlify:', data);
    } else {
      console.error('❌ FAILED! Server rejected the scan:', data);
    }
  } catch (error) {
    console.error('⚠️ NETWORK ERROR:', error.message);
  }
}

simulateScan();