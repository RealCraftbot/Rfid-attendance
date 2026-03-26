'use client';

import React, { useState, useRef } from 'react';
import { Upload, X, Loader2, User, Camera } from 'lucide-react';

interface ImageUploadProps {
  currentImage?: string | null;
  onUpload: (url: string) => void;
  onRemove?: () => void;
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
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      alert('Only JPG, PNG, and WebP images are allowed');
      return;
    }

    // Show preview immediately
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        onUpload(data.url);
      } else {
        alert(data.error || 'Failed to upload image');
        setPreview(currentImage || null);
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload image');
      setPreview(currentImage || null);
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = async () => {
    if (!onRemove) return;
    
    if (confirm('Are you sure you want to remove this image?')) {
      setPreview(null);
      onRemove();
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
                onClick={() => fileInputRef.current?.click()}
                className="p-2 bg-white rounded-full hover:bg-zinc-100"
                title="Change"
              >
                <Camera size={16} className="text-zinc-700" />
              </button>
              {onRemove && (
                <button
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

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {!preview && (
        <button
          onClick={() => fileInputRef.current?.click()}
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
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1 px-3 py-1.5 bg-zinc-100 text-zinc-700 rounded-lg text-xs font-medium hover:bg-zinc-200"
          >
            <Camera size={14} />
            Change
          </button>
          {onRemove && (
            <button
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
