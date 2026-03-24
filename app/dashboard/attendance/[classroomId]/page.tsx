import { Suspense } from 'react';
import ClassroomAttendanceClient from './ClassroomAttendanceClient';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{
    classroomId: string;
  }>;
}

export default async function ClassroomAttendancePage({ params }: PageProps) {
  const { classroomId } = await params;
  
  return (
    <Suspense fallback={
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    }>
      <ClassroomAttendanceClient classroomId={classroomId} />
    </Suspense>
  );
}
