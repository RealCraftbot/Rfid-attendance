// THESE TWO LINES ARE THE MAGIC FIX! They tell Next.js NEVER to cache this API route.
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

import { NextResponse } from 'next/server';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // .trim() removes any invisible spaces that might break the search
    const device_id = body.device_id?.trim();
    const rfid_uid = body.rfid_uid?.trim();
    const org_id = body.org_id?.trim(); 

    console.log(`📡 Searching for Tag: [${rfid_uid}] in Org: [${org_id}]`);

    if (!device_id || !rfid_uid || !org_id) {
      return NextResponse.json({ status: 'error', message: 'Missing scan data' }, { status: 400 });
    }

    const studentsRef = collection(db, 'organizations', org_id, 'students');
    const q = query(studentsRef, where('rfid_uid', '==', rfid_uid));
    
    // Because of the magic lines at the top, this will now ALWAYS check the live DB
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      console.log('❌ ERROR: Tag not found in the live database.');
      return NextResponse.json({ status: 'error', message: 'Invalid device or RFID' }, { status: 401 });
    }

    const studentDoc = snapshot.docs[0];
    const student = studentDoc.data();
    
    console.log(`✅ MATCH FOUND: ${student.name}`);

    const attendanceRef = collection(db, 'organizations', org_id, 'attendance_records');
    await addDoc(attendanceRef, {
      student_id: studentDoc.id,
      student_name: student.name, // <-- WE ADDED THIS LINE!
      check_type: 'check-in', 
      device_id: device_id,
      scan_time: new Date(),
    });

    return NextResponse.json({
      status: 'success',
      student_name: student.name,
      check_type: 'check-in'
    });

  } catch (error) {
    console.error('⚠️ API Error Details:', error);
    return NextResponse.json({ status: 'error', message: 'Server error' }, { status: 500 });
  }
}