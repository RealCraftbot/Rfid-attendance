'use client';

import React, { useState, useRef } from 'react';
import { Upload, X, Loader2, User, Camera } from 'lucide-react';

interface ImageUploadProps {
  currentImage?: string | null;
  onUpload: (url: string) => void | Promise<void>;
  onRemove?: () => void | Promise<void>;
  type: 'profile' | 'logo' | 'document';
  size?: 'sm' | 'md' | 'lg';
  shape?: 'circle' | 'square';
}

const sizeClasses = {
  sm: 'w-16 h-16',
  md: 'w-24 h-24',
  lg: 'w-32 h-32',
};

export default function ImageUpload({
  currentImage,
  onUpload,
  onRemove,
  type,
  size = 'md',
  shape = 'circle',
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentImage || null);
  const [error, setError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleButtonClick = () => {
    console.log('Upload button clicked, triggering file input');
    if (fileInputRef.current) {
      fileInputRef.current.click();
    } else {
      console.error('File input ref is null');
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('File input onChange triggered');
    console.log('Files:', e.target.files);
    
    const file = e.target.files?.[0];
    if (!file) {
      console.log('No file selected');
      return;
    }

    console.log('File selected:', file.name, 'Size:', file.size, 'Type:', file.type);
    setError('');

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      const msg = 'File size must be less than 5MB';
      console.error(msg);
      setError(msg);
      alert(msg);
      return;
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      const msg = 'Only JPG, PNG, and WebP images are allowed';
      console.error(msg, 'Got type:', file.type);
      setError(msg);
      alert(msg);
      return;
    }

    // Show preview immediately
    console.log('Reading file for preview...');
    const reader = new FileReader();
    reader.onloadend = () => {
      console.log('File read complete');
      setPreview(reader.result as string);
    };
    reader.onerror = (err) => {
      console.error('FileReader error:', err);
      setError('Failed to read file');
    };
    reader.readAsDataURL(file);

    // Upload
    console.log('Starting upload to server...');
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);

      console.log('Sending POST request to /api/upload');
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Upload failed with status:', response.status, errorText);
        throw new Error(`Upload failed: ${response.status}`);
      }

      const data = await response.json();
      console.log('Response data:', data);

      if (data.success) {
        console.log('Upload successful, calling onUpload with URL:', data.url);
        await onUpload(data.url);
        console.log('onUpload completed successfully');
      } else {
        console.error('Upload failed:', data.error);
        setError(data.error || 'Failed to upload image');
        alert(data.error || 'Failed to upload image');
        setPreview(currentImage || null);
      }
    } catch (error) {
      console.error('Upload error:', error);
      const errorMsg = error instanceof Error ? error.message : 'Failed to upload image';
      setError(errorMsg);
      alert(errorMsg);
      setPreview(currentImage || null);
    } finally {
      setUploading(false);
      // Reset input so same file can be selected again
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemove = async () => {
    if (!onRemove) return;
    
    if (confirm('Are you sure you want to remove this image?')) {
      setPreview(null);
      try {
        await onRemove();
      } catch (error) {
        console.error('Remove error:', error);
        setPreview(currentImage || null);
      }
    }
  };

  const shapeClasses = shape === 'circle' ? 'rounded-full' : 'rounded-xl';

  return (
    <div className="flex flex-col items-center gap-3">
      <div 
        className={`${sizeClasses[size]} ${shapeClasses} relative overflow-hidden bg-zinc-100 border-2 border-dashed border-zinc-300 flex items-center justify-center group`}
      >
        {uploading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-zinc-100/80">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
          </div>
        ) : preview ? (
          <>
            <img 
              src={preview} 
              alt="Preview" 
              className="w-full h-full object-cover"
            />
            {/* Hover overlay */}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={handleButtonClick}
                className="p-2 bg-white rounded-full hover:bg-zinc-100"
                title="Change"
              >
                <Camera size={16} className="text-zinc-700" />
              </button>
              {onRemove && (
                <button
                  type="button"
                  onClick={handleRemove}
                  className="p-2 bg-red-500 rounded-full hover:bg-red-600"
                  title="Remove"
                >
                  <X size={16} className="text-white" />
                </button>
              )}
            </div>
          </>
        ) : (
          <div className="text-center p-2">
            <User size={size === 'lg' ? 40 : size === 'md' ? 32 : 24} className="mx-auto text-zinc-400 mb-1" />
            <p className="text-[10px] text-zinc-500">No image</p>
          </div>
        )}
      </div>

      {error && (
        <p className="text-xs text-red-500 text-center max-w-[200px]">{error}</p>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        capture="user"
        onChange={handleFileSelect}
        className="hidden"
        style={{ display: 'none' }}
      />

      {!preview && (
        <button
          type="button"
          onClick={handleButtonClick}
          disabled={uploading}
          className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700 disabled:opacity-50"
        >
          {uploading ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <Upload size={14} />
          )}
          {uploading ? 'Uploading...' : 'Upload Image'}
        </button>
      )}

      {preview && !uploading && (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleButtonClick}
            className="flex items-center gap-1 px-3 py-1.5 bg-zinc-100 text-zinc-700 rounded-lg text-xs font-medium hover:bg-zinc-200"
          >
            <Camera size={14} />
            Change
          </button>
          {onRemove && (
            <button
              type="button"
              onClick={handleRemove}
              className="flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs font-medium hover:bg-red-100"
            >
              <X size={14} />
              Remove
            </button>
          )}
        </div>
      )}

      <p className="text-[10px] text-zinc-400 text-center max-w-[200px]">
        JPG, PNG or WebP. Max 5MB.
      </p>
    </div>
  );
}
