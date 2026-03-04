const functions = require('firebase-functions');
const admin = require('firebase-admin');
const crypto = require('crypto');

admin.initializeApp();
const db = admin.firestore();

/**
 * RFID Attendance Scan Endpoint
 * POST /scanAttendance
 */
exports.scanAttendance = functions.https.onRequest(async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  const { device_id, rfid_uid, signature } = req.body;

  if (!device_id || !rfid_uid || !signature) {
    return res.status(400).json({ status: 'error', message: 'Missing parameters' });
  }

  try {
    // 1. Find the device and its organization
    // We use a collectionGroup query or a mapping table for better performance
    // For simplicity, we'll search across organizations (requires index)
    const deviceQuery = await db.collectionGroup('devices')
      .where('device_id', '==', device_id)
      .where('is_active', '==', true)
      .limit(1)
      .get();

    if (deviceQuery.empty) {
      return res.status(401).json({ status: 'error', message: 'Device not found or inactive' });
    }

    const deviceDoc = deviceQuery.docs[0];
    const deviceData = deviceDoc.data();
    const orgRef = deviceDoc.ref.parent.parent; // organizations/{orgId}
    const orgId = orgRef.id;

    // 2. Verify HMAC Signature
    const secretKey = deviceData.secret_key;
    const expectedSignature = crypto
      .createHmac('sha256', secretKey)
      .update(`${device_id}${rfid_uid}`)
      .digest('hex');

    if (signature !== expectedSignature) {
      return res.status(401).json({ status: 'error', message: 'Invalid signature' });
    }

    // 3. Validate Organization Status
    const orgSnap = await orgRef.get();
    if (!orgSnap.exists() || orgSnap.data().subscription_status !== 'active') {
      return res.status(403).json({ status: 'error', message: 'Organization inactive' });
    }

    // 4. Find Student
    const studentQuery = await orgRef.collection('students')
      .where('rfid_uid', '==', rfid_uid)
      .where('is_active', '==', true)
      .limit(1)
      .get();

    if (studentQuery.empty) {
      return res.status(404).json({ status: 'error', message: 'Student not found' });
    }

    const studentDoc = studentQuery.docs[0];
    const studentId = studentDoc.id;
    const studentData = studentDoc.data();

    // 5. Prevent Duplicate Scans (2-minute window)
    const twoMinutesAgo = admin.firestore.Timestamp.fromMillis(Date.now() - 2 * 60 * 1000);
    const recentScan = await orgRef.collection('attendance_records')
      .where('student_id', '==', studentId)
      .where('scan_time', '>', twoMinutesAgo)
      .limit(1)
      .get();

    if (!recentScan.empty) {
      return res.status(429).json({ status: 'error', message: 'Duplicate scan detected' });
    }

    // 6. Determine Check-in / Check-out Logic
    // Logic: If last scan today was check-in, this is check-out. Else check-in.
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    
    const lastScanToday = await orgRef.collection('attendance_records')
      .where('student_id', '==', studentId)
      .where('scan_time', '>=', admin.firestore.Timestamp.fromDate(startOfToday))
      .orderBy('scan_time', 'desc')
      .limit(1)
      .get();

    let checkType = 'check-in';
    if (!lastScanToday.empty) {
      const lastData = lastScanToday.docs[0].data();
      checkType = lastData.check_type === 'check-in' ? 'check-out' : 'check-in';
    }

    // 7. Record Attendance
    const scanTime = admin.firestore.FieldValue.serverTimestamp();
    await orgRef.collection('attendance_records').add({
      student_id: studentId,
      student_name: studentData.name,
      device_id: device_id,
      check_type: checkType,
      scan_time: scanTime
    });

    return res.status(200).json({
      status: 'success',
      student_name: studentData.name,
      check_type: checkType
    });

  } catch (error) {
    console.error('Attendance Error:', error);
    return res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
});
