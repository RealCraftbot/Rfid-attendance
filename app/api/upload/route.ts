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
    console.log('Upload API called');
    
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      console.log('Upload failed: No session');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('User:', session.user.email, 'Role:', session.user.role);

    const formData = await req.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as string;
    
    console.log('Upload type:', type);
    console.log('File:', file?.name, 'Size:', file?.size, 'Type:', file?.type);
    
    if (!file) {
      console.log('Upload failed: No file');
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size must be less than 5MB' }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Only JPG, PNG, and WebP images are allowed' }, { status: 400 });
    }

    // Convert file to base64
    console.log('Converting file to base64...');
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = `data:${file.type};base64,${buffer.toString('base64')}`;
    console.log('Base64 conversion complete, length:', base64.length);

    let folder = 'rfid-attendance/general';
    let updateData: any = {};
    let result: any;

    switch (type) {
      case 'profile':
        folder = `rfid-attendance/profiles/${session.user.orgId || 'general'}`;
        console.log('Uploading to Cloudinary folder:', folder);
        result = await uploadToCloudinary(base64, { folder });
        
        if (result.success) {
          console.log('Cloudinary upload success, updating user...');
          // Update user profile
          await prisma.user.update({
            where: { id: session.user.id },
            data: { imageUrl: result.url },
          });
          updateData = { imageUrl: result.url };
          console.log('User profile updated');
        } else {
          console.error('Cloudinary upload failed:', result.error);
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
        console.log('Uploading logo to:', folder);
        result = await uploadToCloudinary(base64, { folder });
        
        if (result.success) {
          console.log('Logo upload success, updating organization...');
          // Update organization
          await prisma.organization.update({
            where: { id: session.user.orgId },
            data: { logoUrl: result.url },
          });
          updateData = { logoUrl: result.url };
          console.log('Organization updated');
        } else {
          console.error('Cloudinary upload failed:', result.error);
        }
        break;

      case 'student':
        folder = `rfid-attendance/students/${session.user.orgId || 'general'}`;
        console.log('Uploading student photo to:', folder);
        result = await uploadToCloudinary(base64, { folder });
        
        if (result.success) {
          const studentId = formData.get('studentId') as string;
          console.log('Student photo upload success, studentId:', studentId);
          if (studentId) {
            await prisma.student.update({
              where: { id: studentId },
              data: { imageUrl: result.url },
            });
            console.log('Student record updated');
          }
          updateData = { imageUrl: result.url };
        } else {
          console.error('Cloudinary upload failed:', result.error);
        }
        break;

      case 'document':
      case 'payment-proof':
        folder = `rfid-attendance/documents/${session.user.orgId || 'general'}`;
        console.log('Uploading document to:', folder);
        result = await uploadToCloudinary(base64, { 
          folder,
          resource_type: file.type.includes('pdf') ? 'raw' : 'image'
        });
        if (result.success) {
          updateData = { url: result.url, publicId: result.publicId };
        } else {
          console.error('Cloudinary upload failed:', result.error);
        }
        break;

      default:
        return NextResponse.json({ error: 'Invalid upload type' }, { status: 400 });
    }

    if (!result || !result.success) {
      console.error('Upload failed:', result?.error || 'Unknown error');
      return NextResponse.json({ 
        error: result?.error || 'Failed to upload file to Cloudinary' 
      }, { status: 500 });
    }

    console.log('Upload complete, returning success');
    return NextResponse.json({
      success: true,
      message: 'File uploaded successfully',
      url: result.url,
      publicId: result.publicId,
      data: updateData,
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ 
      error: 'Failed to upload file',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
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
