import { Suspense } from 'react';
import AttendanceClient from './AttendanceClient';

export const dynamic = 'force-dynamic';

export default function AttendancePage() {
  return (
    <Suspense fallback={
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    }>
      <AttendanceClient />
    </Suspense>
  );
}
