export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { success, forbidden, serverError } from '@/lib/api-response';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.orgId) {
      return forbidden('Organization ID required');
    }

    const orgId = session.user.orgId;

    // Find students associated with this parent's email
    const students = await prisma.student.findMany({
      where: { 
        orgId,
        guardianEmail: session.user.email
      },
      include: {
        classroom: {
          select: {
            name: true,
            grade: true
          }
        },
        grades: {
          orderBy: { createdAt: 'desc' },
          take: 10
        },
        invoices: {
          where: {
            academicYear: new Date().getFullYear().toString()
          }
        }
      }
    });

    if (students.length === 0) {
      return success({ children: [], reports: [], fees: [] });
    }

    // Format children
    const children = students.map(student => ({
      id: student.id,
      name: student.name,
      class: student.classroom?.name || 'N/A',
      admissionNo: student.admissionNumber,
      imageUrl: student.imageUrl
    }));

    // Format reports (from grades)
    const reports = students.flatMap(student => 
      student.grades.map(grade => ({
        id: grade.id,
        studentId: student.id,
        studentName: student.name,
        studentClass: student.classroom?.name || 'N/A',
        studentImage: student.imageUrl,
        term: grade.term,
        session: grade.academicYear,
        average: grade.totalScore || 0,
        grade: grade.grade || 'N/A',
        attendance: 85, // Placeholder
        createdAt: grade.createdAt.toISOString(),
        teacherName: 'N/A'
      }))
    );

    // Format fees (from invoices)
    const fees = students.flatMap(student =>
      student.invoices.map(invoice => ({
        childId: student.id,
        term: `Term ${invoice.term}`,
        amount: invoice.amount,
        paid: invoice.paidAmount,
        status: invoice.status,
        dueDate: invoice.dueDate.toISOString()
      }))
    );

    return success({
      children,
      reports,
      fees
    });
  } catch (error) {
    console.error('[Parents Reports API Error]', error);
    return serverError('Failed to fetch reports');
  }
}
