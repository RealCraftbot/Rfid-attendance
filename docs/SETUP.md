# RFID Attendance SaaS - Production Setup Guide

## 1. Firebase Project Setup
1. Create a new project in [Firebase Console](https://console.firebase.google.com/).
2. Enable **Authentication** (Email/Password).
3. Enable **Cloud Firestore** in production mode.
4. Enable **Cloud Functions** (requires Blaze plan).
5. Enable **Firebase Hosting**.

## 2. Environment Variables
Create a `.env.local` file in the root with your Firebase config (already updated in .env.example):
```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyDuW0TG7b2CSpnJYGG5mA4TN7YnGTuZ3q0
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=rfid-attendance-be234.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=rfid-attendance-be234
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=rfid-attendance-be234.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=676075800318
NEXT_PUBLIC_FIREBASE_APP_ID=1:676075800318:web:6fbcdf54c9dce46671c7af
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-WBJCYETR9R
```

## 3. Deploying Cloud Functions
1. Install Firebase CLI: `npm install -g firebase-tools`
2. Login: `firebase login`
3. Initialize: `firebase init functions`
4. Copy code from `/functions/index.js` to your local `functions/index.js`.
5. Deploy: `firebase deploy --only functions`

## 4. Deploying Security Rules
1. Copy code from `/firestore.rules` to your local `firestore.rules`.
2. Deploy: `firebase deploy --only firestore:rules`

## 5. SaaS Scaling Strategy
- **Database Indexing**: Ensure composite indexes are created for `attendance_records` (student_id + scan_time).
- **Caching**: Use Redis or Cloud Functions global variables to cache active devices/secrets to reduce Firestore reads.
- **Sharding**: For extremely high traffic, consider sharding the `attendance_records` collection by organization.
- **Aggregations**: Use Cloud Functions to update daily stats (present/absent counts) instead of querying all records on dashboard load.

## 6. Production Security Checklist
- [ ] HMAC secrets are never sent to the client.
- [ ] Firestore rules strictly enforce `request.auth.uid == orgId`.
- [ ] Cloud Functions validate organization subscription status.
- [ ] API endpoints are rate-limited.
- [ ] All ESP32 devices communicate over HTTPS (SSL).
- [ ] Regular database backups are enabled.
