import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { uploadToCloudinary, deleteFromCloudinary } from '@/lib/cloudinary';
import { prisma } from '@/lib/prisma';

// GET - Generate upload signature for secure client-side uploads
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const folder = searchParams.get('folder') || 'rfid-attendance/general';
    
    // Generate timestamp and signature for secure upload
    const timestamp = Math.round(new Date().getTime() / 1000);
    const params = {
      timestamp: timestamp.toString(),
      folder,
    };
    
    const signature = require('cloudinary').v2.utils.api_sign_request(
      params,
      process.env.CLOUDINARY_API_SECRET
    );

    return NextResponse.json({
      success: true,
      signature,
      timestamp,
      apiKey: process.env.CLOUDINARY_API_KEY,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      folder,
    });

  } catch (error) {
    console.error('Upload signature error:', error);
    return NextResponse.json({ error: 'Failed to generate upload signature' }, { status: 500 });
  }
}

// POST - Upload and save profile picture
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as string; // 'profile' | 'logo' | 'document'
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Convert file to base64
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = `data:${file.type};base64,${buffer.toString('base64')}`;

    let folder = 'rfid-attendance/general';
    let updateData: any = {};
    let result: any;

    switch (type) {
      case 'profile':
        folder = `rfid-attendance/profiles/${session.user.orgId || 'general'}`;
        result = await uploadToCloudinary(base64, { folder });
        
        if (result.success) {
          // Update user profile
          await prisma.user.update({
            where: { id: session.user.id },
            data: { imageUrl: result.url },
          });
          updateData = { imageUrl: result.url };
        }
        break;

      case 'logo':
        // Only admins can upload logos
        if (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN') {
          return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
        }
        
        if (!session.user.orgId) {
          return NextResponse.json({ error: 'Organization not found' }, { status: 400 });
        }
        
        folder = `rfid-attendance/logos/${session.user.orgId}`;
        result = await uploadToCloudinary(base64, { folder });
        
        if (result.success) {
          // Update organization
          await prisma.organization.update({
            where: { id: session.user.orgId },
            data: { logoUrl: result.url },
          });
          updateData = { logoUrl: result.url };
        }
        break;

      case 'student':
        folder = `rfid-attendance/students/${session.user.orgId || 'general'}`;
        result = await uploadToCloudinary(base64, { folder });
        
        if (result.success) {
          const studentId = formData.get('studentId') as string;
          if (studentId) {
            await prisma.student.update({
              where: { id: studentId },
              data: { imageUrl: result.url },
            });
          }
          updateData = { imageUrl: result.url };
        }
        break;

      case 'document':
      case 'payment-proof':
        folder = `rfid-attendance/documents/${session.user.orgId || 'general'}`;
        result = await uploadToCloudinary(base64, { 
          folder,
          resource_type: file.type.includes('pdf') ? 'raw' : 'image'
        });
        updateData = { url: result.url, publicId: result.publicId };
        break;

      default:
        return NextResponse.json({ error: 'Invalid upload type' }, { status: 400 });
    }

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'File uploaded successfully',
      url: result.url,
      publicId: result.publicId,
      data: updateData,
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
  }
}

// DELETE - Delete uploaded file
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const publicId = searchParams.get('publicId');
    const type = searchParams.get('type');

    if (!publicId) {
      return NextResponse.json({ error: 'Public ID required' }, { status: 400 });
    }

    const result = await deleteFromCloudinary(publicId);

    if (result.success) {
      // Clear from database based on type
      if (type === 'profile') {
        await prisma.user.update({
          where: { id: session.user.id },
          data: { imageUrl: null },
        });
      } else if (type === 'logo' && session.user.orgId) {
        await prisma.organization.update({
          where: { id: session.user.orgId },
          data: { logoUrl: null },
        });
      }

      return NextResponse.json({
        success: true,
        message: 'File deleted successfully',
      });
    } else {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json({ error: 'Failed to delete file' }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';
