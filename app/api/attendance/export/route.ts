export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { success, badRequest, serverError } from '@/lib/api-response';
import { attendanceService } from '@/services/attendance-service';

const exportQuerySchema = z.object({
  format: z.enum(['pdf', 'csv']),
  date: z.string().datetime(),
  orgId: z.string().cuid(),
  classroomId: z.string().cuid().optional(),
});

/**
 * Generate CSV content from attendance data
 */
function generateCSV(attendanceData: any[], date: Date): string {
  const headers = [
    'Student Name',
    'Class',
    'Status',
    'Check In Time',
    'Check Out Time',
    'Device',
    'Duration (minutes)',
    'Total Scans',
  ];

  const rows = attendanceData.map((record) => [
    record.studentName,
    record.className,
    record.status,
    record.checkInTime ? new Date(record.checkInTime).toLocaleTimeString() : '',
    record.checkOutTime ? new Date(record.checkOutTime).toLocaleTimeString() : '',
    record.deviceId || '',
    record.durationOnSite || '',
    record.totalScans,
  ]);

  // Escape special characters and wrap in quotes if needed
  const escapeCSV = (value: string) => {
    const str = String(value);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const csvContent = [
    headers.join(','),
    ...rows.map((row) => row.map(escapeCSV).join(',')),
  ].join('\n');

  return csvContent;
}

/**
 * Generate HTML content for PDF
 */
function generatePDFHTML(attendanceData: any[], stats: any, date: Date, orgName: string): string {
  const formatDate = (date: Date) => date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const formatTime = (dateStr: string | null) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present':
      case 'checked-out':
        return '#22c55e';
      case 'on-site':
        return '#10b981';
      case 'late':
        return '#f59e0b';
      case 'absent':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  const formatDuration = (minutes: number | null) => {
    if (!minutes) return '-';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Attendance Report - ${formatDate(date)}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: Arial, sans-serif; 
      padding: 40px; 
      color: #1f2937;
      line-height: 1.6;
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
      padding-bottom: 20px;
      border-bottom: 3px solid #2563eb;
    }
    .org-name {
      font-size: 28px;
      font-weight: bold;
      color: #2563eb;
      margin-bottom: 8px;
    }
    .report-title {
      font-size: 20px;
      font-weight: bold;
      margin-bottom: 8px;
    }
    .report-date {
      font-size: 14px;
      color: #6b7280;
    }
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 15px;
      margin-bottom: 30px;
    }
    .stat-card {
      background: #f9fafb;
      padding: 15px;
      border-radius: 8px;
      text-align: center;
      border: 1px solid #e5e7eb;
    }
    .stat-label {
      font-size: 12px;
      color: #6b7280;
      text-transform: uppercase;
      margin-bottom: 5px;
    }
    .stat-value {
      font-size: 24px;
      font-weight: bold;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 20px;
    }
    th {
      background: #2563eb;
      color: white;
      padding: 12px;
      text-align: left;
      font-size: 12px;
      text-transform: uppercase;
      font-weight: 600;
    }
    td {
      padding: 12px;
      border-bottom: 1px solid #e5e7eb;
      font-size: 13px;
    }
    tr:nth-child(even) {
      background: #f9fafb;
    }
    .status-badge {
      display: inline-block;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 11px;
      font-weight: bold;
      text-transform: uppercase;
      color: white;
    }
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
      text-align: center;
      font-size: 12px;
      color: #6b7280;
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="org-name">${orgName}</div>
    <div class="report-title">Daily Attendance Report</div>
    <div class="report-date">${formatDate(date)}</div>
  </div>

  <div class="stats-grid">
    <div class="stat-card">
      <div class="stat-label">Total Students</div>
      <div class="stat-value" style="color: #2563eb;">${stats.total}</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Present</div>
      <div class="stat-value" style="color: #22c55e;">${stats.present}</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Absent</div>
      <div class="stat-value" style="color: #ef4444;">${stats.absent}</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">On Site</div>
      <div class="stat-value" style="color: #10b981;">${stats.onSite}</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Checked Out</div>
      <div class="stat-value" style="color: #6b7280;">${stats.checkedOut}</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Late</div>
      <div class="stat-value" style="color: #f59e0b;">${stats.late}</div>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>Student Name</th>
        <th>Class</th>
        <th>Status</th>
        <th>Check In</th>
        <th>Check Out</th>
        <th>Device</th>
        <th>Duration</th>
      </tr>
    </thead>
    <tbody>
      ${attendanceData.map(record => `
        <tr>
          <td><strong>${record.studentName}</strong></td>
          <td>${record.className}</td>
          <td>
            <span class="status-badge" style="background: ${getStatusColor(record.status)};">
              ${record.status.toUpperCase()}
            </span>
          </td>
          <td>${formatTime(record.checkInTime)}</td>
          <td>${formatTime(record.checkOutTime)}</td>
          <td>${record.deviceId || '-'}</td>
          <td>${formatDuration(record.durationOnSite)}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>

  <div class="footer">
    <p>Generated by RFID Attendance System</p>
    <p>© ${new Date().getFullYear()} ${orgName}. All rights reserved.</p>
  </div>
</body>
</html>
  `;
}

export async function GET(request: NextRequest) {
  try {
    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const formatParam = searchParams.get('format') || 'csv';
    const dateParam = searchParams.get('date') || new Date().toISOString();
    const orgIdParam = searchParams.get('orgId') || 'org_123';
    const classroomIdParam = searchParams.get('classroomId') || undefined;

    const queryParams = {
      format: formatParam,
      date: dateParam,
      orgId: orgIdParam,
      classroomId: classroomIdParam,
    };

    const validation = exportQuerySchema.safeParse(queryParams);
    if (!validation.success) {
      return badRequest('Invalid query parameters', validation.error.issues);
    }

    const { format, date, orgId, classroomId } = validation.data;
    const selectedDate = new Date(date);

    // Get attendance data from service
    let attendance, stats, classroomName;
    
    if (classroomId) {
      // Get classroom-specific attendance
      const result = await attendanceService.getAttendanceByClassroom(
        orgId,
        classroomId,
        selectedDate
      );
      attendance = result.attendance;
      stats = result.stats;
      classroomName = result.classroom?.name || 'Classroom';
    } else {
      // Get all attendance
      const result = await attendanceService.getGroupedAttendance(
        orgId,
        selectedDate
      );
      attendance = result.attendance;
      stats = result.stats;
      classroomName = 'All Classes';
    }

    if (format === 'csv') {
      // Generate CSV
      const csvContent = generateCSV(attendance, selectedDate);
      
      return new NextResponse(csvContent, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="attendance-${classroomName.replace(/\s+/g, '-')}-${selectedDate.toISOString().split('T')[0]}.csv"`,
        },
      });
    } else {
      // Generate PDF (HTML for now - in production use puppeteer or similar)
      const htmlContent = generatePDFHTML(attendance, stats, selectedDate, 'Greenfield Academy');
      
      return new NextResponse(htmlContent, {
        status: 200,
        headers: {
          'Content-Type': 'text/html',
          'Content-Disposition': `attachment; filename="attendance-${classroomName.replace(/\s+/g, '-')}-${selectedDate.toISOString().split('T')[0]}.html"`,
        },
      });
    }
  } catch (error) {
    console.error('[Attendance Export Error]', error);
    return serverError('Failed to generate export');
  }
}
