import { NextResponse } from 'next/server';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import * as fs from 'fs';
import * as path from 'path';

let db: any;
let auth: any;

function getAdmin() {
  if (db && auth) return { db, auth };
  
  const serviceAccountPath = path.join(process.cwd(), 'service-account-key.json');
  
  if (!fs.existsSync(serviceAccountPath)) {
    throw new Error('service-account-key.json not found. Download from Firebase Console: Project Settings > Service Accounts > Generate New Private Key');
  }
  
  const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
  
  initializeApp({ credential: cert(serviceAccount) });
  db = getFirestore();
  auth = getAuth();
  
  return { db, auth };
}

export async function POST() {
  try {
    const { db, auth } = getAdmin();

    const orgId = "ejigbo-high-school";
    const results: any = { org: null, users: [], students: [], errors: [] };

    // 1. Create Organization
    await db.doc(`organizations/${orgId}`).set({
      name: "Ejigbo High School",
      address: "Ejigbo, Lagos State, Nigeria",
      phone: "+2348012345678",
      email: "info@ejighigh.edu.ng",
      created_at: new Date(),
      is_active: true
    });
    results.org = orgId;

    // 2. Create Admin User
    const adminEmail = "admin@ejighigh.edu.ng";
    try {
      const adminUser = await auth.createUser({
        email: adminEmail,
        password: "password123",
        displayName: "Principal Adebayo"
      });
      
      await db.doc(`users/${adminUser.uid}`).set({
        name: "Principal Adebayo",
        email: adminEmail,
        phone: "+2348012345679",
        org_id: orgId,
        role: "admin",
        is_active: true,
        created_at: new Date()
      });
      results.users.push({ email: adminEmail, role: 'admin', password: 'password123' });
    } catch (e: any) {
      results.errors.push(`Admin: ${e.message}`);
    }

    // 3. Create Teachers
    const teachers = [
      { name: "Mrs. Folake Johnson", email: "folake@ejighigh.edu.ng", subject: "Mathematics" },
      { name: "Mr. Chidi Okonkwo", email: "chidi@ejighigh.edu.ng", subject: "English" },
      { name: "Mrs. Sarah Musa", email: "sarah@ejighigh.edu.ng", subject: "Science" }
    ];

    for (const t of teachers) {
      try {
        const user = await auth.createUser({
          email: t.email,
          password: "password123",
          displayName: t.name
        });
        
        await db.doc(`users/${user.uid}`).set({
          name: t.name,
          email: t.email,
          phone: "+2348012345000",
          org_id: orgId,
          role: "teacher",
          subject: t.subject,
          is_active: true,
          created_at: new Date()
        });
        results.users.push({ email: t.email, role: 'teacher', password: 'password123' });
      } catch (e: any) {
        results.errors.push(`Teacher ${t.name}: ${e.message}`);
      }
    }

    // 4. Create Parents (Dad, Mom, Guardian)
    const parents = [
      { name: "Mr. Oladipo Johnson", email: "oladipo.johnson@email.com", parentType: "dad" },
      { name: "Mrs. Adaeze Johnson", email: "adaeze.johnson@email.com", parentType: "mom" },
      { name: "Mr. Emeka Obi (Uncle)", email: "emeka.obi@email.com", parentType: "guardian" }
    ];

    const createdParents: any[] = [];
    for (const p of parents) {
      try {
        const user = await auth.createUser({
          email: p.email,
          password: "password123",
          displayName: p.name
        });
        
        await db.doc(`users/${user.uid}`).set({
          name: p.name,
          email: p.email,
          phone: "+2348012345001",
          parentType: p.parentType,
          org_id: orgId,
          role: "parent",
          is_active: true,
          created_at: new Date()
        });
        createdParents.push({ id: user.uid, ...p });
        results.users.push({ email: p.email, role: 'parent', type: p.parentType, password: 'password123' });
      } catch (e: any) {
        results.errors.push(`Parent ${p.name}: ${e.message}`);
      }
    }

    // 5. Create Students (Children)
    const students = [
      { name: "David Johnson", class: "SS1-A", dob: "2010-05-15", bloodGroup: "O+", parentIndex: 0 },
      { name: "Grace Johnson", class: "JS3-B", dob: "2009-08-22", bloodGroup: "A+", parentIndex: 1 },
      { name: "Michael Obi", class: "SS2-A", dob: "2008-02-10", bloodGroup: "B+", parentIndex: 2 },
      { name: "Chioma Okonkwo", class: "JS2-A", dob: "2011-11-30", bloodGroup: "O-", parentIndex: null }
    ];

    const createdStudents: any[] = [];
    for (const s of students) {
      try {
        const studentRef = db.collection(`organizations/${orgId}/students`).doc();
        
        const studentData: any = {
          name: s.name,
          class: s.class,
          dateOfBirth: s.dob,
          bloodGroup: s.bloodGroup,
          rfid_uid: `RFID-${Math.random().toString(36).substr(2, 8).toUpperCase()}`,
          is_active: true,
          created_at: new Date()
        };
        
        // Link parent if specified
        if (s.parentIndex !== null && createdParents[s.parentIndex]) {
          studentData.parent_id = createdParents[s.parentIndex].id;
        }
        
        await studentRef.set(studentData);
        createdStudents.push({ id: studentRef.id, ...s });
        results.students.push({ id: studentRef.id, name: s.name, class: s.class });
      } catch (e: any) {
        results.errors.push(`Student ${s.name}: ${e.message}`);
      }
    }

    // 6. Create sample attendance for last 7 days for each student
    for (const student of createdStudents) {
      for (let i = 0; i < 7; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        
        // Check-in
        const checkInDate = new Date(date);
        checkInDate.setHours(7, 30 + Math.floor(Math.random() * 30), 0);
        await db.collection(`organizations/${orgId}/attendance_records`).add({
          student_id: student.id,
          student_name: student.name,
          check_type: 'check-in',
          scan_time: checkInDate,
          device_id: 'Main Gate',
          created_at: new Date()
        });
        
        // Check-out
        const checkOutDate = new Date(date);
        checkOutDate.setHours(14, 0 + Math.floor(Math.random() * 30), 0);
        await db.collection(`organizations/${orgId}/attendance_records`).add({
          student_id: student.id,
          student_name: student.name,
          check_type: 'check-out',
          scan_time: checkOutDate,
          device_id: 'Main Gate',
          created_at: new Date()
        });
      }
    }

    // 7. Create notifications for parents
    if (createdParents[0]) {
      await db.collection(`organizations/${orgId}/notifications`).add({
        title: "Welcome to Ejigbo High School",
        message: "Your child's attendance will now be tracked in real-time.",
        type: "info",
        parent_id: createdParents[0].id,
        created_at: new Date()
      });
    }

    // 8. Create classrooms
    const classrooms = ["SS1-A", "SS2-A", "SS3-A", "JS1-A", "JS2-A", "JS3-A"];
    for (const c of classrooms) {
      await db.collection(`organizations/${orgId}/classrooms`).doc(c).set({
        name: c,
        created_at: new Date()
      });
    }

    return NextResponse.json({ 
      success: true, 
      message: "Dummy data created successfully!",
      data: results
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
