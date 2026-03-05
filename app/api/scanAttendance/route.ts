import { NextResponse } from 'next/server';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    // We added org_id here so the server knows exactly which school to check
    const { device_id, rfid_uid, org_id } = body; 

    console.log('📡 Received real scan:', { device_id, rfid_uid, org_id });

    if (!device_id || !rfid_uid || !org_id) {
      return NextResponse.json({ status: 'error', message: 'Missing scan data' }, { status: 400 });
    }

    // 1. Search the database for the student holding this RFID card
    const studentsRef = collection(db, 'organizations', org_id, 'students');
    const q = query(studentsRef, where('rfid_uid', '==', rfid_uid));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      // If the RFID card isn't registered in the database, reject it
      return NextResponse.json({ status: 'error', message: 'Invalid device or RFID' }, { status: 401 });
    }

    const studentDoc = snapshot.docs[0];
    const student = studentDoc.data();

    // 2. Found them! Now write the attendance record to the database
    const attendanceRef = collection(db, 'organizations', org_id, 'attendance_records');
    await addDoc(attendanceRef, {
      student_id: studentDoc.id,
      check_type: 'check-in', 
      device_id: device_id,
      scan_time: new Date(),
    });

    // 3. Send success message back to the ESP32 (or our simulator)
    return NextResponse.json({
      status: 'success',
      student_name: student.name,
      check_type: 'check-in'
    });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ status: 'error', message: 'Server error' }, { status: 500 });
  }
}