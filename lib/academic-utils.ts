import { prisma } from '@/lib/prisma';

export async function getActiveAcademicSession(orgId: string) {
  const session = await prisma.academicSession.findFirst({
    where: {
      orgId,
      isActive: true,
    },
  });
  
  return session;
}

export function isWithinSchoolHours(scanTime: Date, openTime: string, closeTime: string) {
  const hours = scanTime.getHours();
  const minutes = scanTime.getMinutes();
  const scanMinutes = hours * 60 + minutes;
  
  const [openHour, openMin] = openTime.split(':').map(Number);
  const [closeHour, closeMin] = closeTime.split(':').map(Number);
  
  const openMinutes = openHour * 60 + openMin;
  const closeMinutes = closeHour * 60 + closeMin;
  
  return {
    isLate: scanMinutes > openMinutes + 15, // 15 minutes grace period
    isEarlyDeparture: scanMinutes < closeMinutes - 15, // 15 minutes before closing
    minutesLate: Math.max(0, scanMinutes - openMinutes),
    minutesEarly: Math.max(0, closeMinutes - scanMinutes),
  };
}

export function getSchoolDaysInRange(startDate: Date, endDate: Date): number {
  let count = 0;
  const current = new Date(startDate);
  
  while (current <= endDate) {
    const day = current.getDay();
    if (day !== 0 && day !== 6) { // Exclude Sunday (0) and Saturday (6)
      count++;
    }
    current.setDate(current.getDate() + 1);
  }
  
  return count;
}

export function getTermName(term: string): string {
  switch (term) {
    case 'FIRST':
      return '1st Term';
    case 'SECOND':
      return '2nd Term';
    case 'THIRD':
      return '3rd Term';
    default:
      return term;
  }
}
