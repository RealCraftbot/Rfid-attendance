import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export default cloudinary;

// Generate signature for secure uploads
export function generateSignature(params: Record<string, string | number>) {
  const signature = cloudinary.utils.api_sign_request(
    params,
    process.env.CLOUDINARY_API_SECRET as string
  );
  return signature;
}

// Upload file to Cloudinary
export async function uploadToCloudinary(
  file: string, // base64 or url
  options: {
    folder?: string;
    public_id?: string;
    resource_type?: 'image' | 'video' | 'raw';
  } = {}
) {
  try {
    const result = await cloudinary.uploader.upload(file, {
      folder: options.folder || 'rfid-attendance',
      resource_type: options.resource_type || 'image',
      ...(options.public_id && { public_id: options.public_id }),
      // Optimize images automatically
      quality: 'auto:good',
      fetch_format: 'auto',
    });
    
    return {
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
      format: result.format,
      size: result.bytes,
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    return {
      success: false,
      error: 'Failed to upload file',
    };
  }
}

// Delete file from Cloudinary
export async function deleteFromCloudinary(publicId: string) {
  try {
    await cloudinary.uploader.destroy(publicId);
    return { success: true };
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    return { success: false, error: 'Failed to delete file' };
  }
}

// Get optimized image URL
export function getOptimizedImageUrl(
  url: string,
  options: {
    width?: number;
    height?: number;
    crop?: string;
    quality?: number;
  } = {}
) {
  if (!url || !url.includes('cloudinary.com')) return url;
  
  const { width, height, crop = 'fill', quality = 80 } = options;
  
  // Insert transformations into Cloudinary URL
  const transformations = [
    width && `w_${width}`,
    height && `h_${height}`,
    crop && `c_${crop}`,
    `q_${quality}`,
    'f_auto', // Auto format (webp, avif, etc.)
  ].filter(Boolean).join(',');
  
  return url.replace('/upload/', `/upload/${transformations}/`);
}
