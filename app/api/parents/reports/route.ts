export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { success, forbidden, serverError } from '@/lib/api-response';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return forbidden('Authentication required');
    }

    const userEmail = session.user.email;
    const orgId = session.user.orgId;

    // Find students associated with this parent's email
    const whereClause: any = {
      guardianEmail: userEmail
    };
    
    if (orgId) {
      whereClause.orgId = orgId;
    }

    const students = await prisma.student.findMany({
      where: whereClause,
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
        }
      }
    });

    if (students.length === 0) {
      return success({ children: [], reports: [], fees: [] });
    }

    // Get invoices for these students
    const studentIds = students.map(s => s.id);
    const invoicesWhere: any = {
      studentId: { in: studentIds }
    };
    
    if (orgId) {
      invoicesWhere.orgId = orgId;
    }

    const invoices = await prisma.invoice.findMany({
      where: invoicesWhere,
      orderBy: { createdAt: 'desc' }
    });

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
        attendance: 85,
        createdAt: grade.createdAt.toISOString(),
        teacherName: 'N/A'
      }))
    );

    // Format fees (from invoices)
    const fees = invoices.map(invoice => {
      const student = students.find(s => s.id === invoice.studentId);
      return {
        childId: invoice.studentId,
        term: `Term ${invoice.term}`,
        amount: invoice.amount,
        paid: invoice.paidAmount,
        status: invoice.status,
        dueDate: invoice.dueDate.toISOString()
      };
    });

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
