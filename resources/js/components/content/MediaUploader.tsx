"use client";

import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ImagePlus, Loader2 } from 'lucide-react';
import api from '@/lib/api';
import { toast } from 'sonner';

interface MediaUploaderProps {
  onUploadSuccess: (url: string) => void;
}

export default function MediaUploader({ onUploadSuccess }: MediaUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  
  console.log('Selected file:', file);                     // ← add this
  if (!file) {
    console.log('No file selected');
    toast.error('No file selected');
    return;
  }

  console.log('File name:', file.name);
  console.log('File size:', file.size);
  console.log('File type:', file.type);

  if (!file.type.startsWith('image/')) {
    toast.error('Please select an image file');
    return;
  }

  setIsUploading(true);

  const formData = new FormData();
  formData.append('image', file);

  // Debug: see what's actually in FormData
  for (const [key, value] of formData.entries()) {
    console.log(`FormData entry: ${key} =`, value);
  }

  try {
    const { data } = await api.post('/upload-image', formData);
    console.log('Upload success:', data);
    onUploadSuccess(data.url);
    toast.success('Image uploaded!');
  } catch (error: any) {
    console.error('Upload failed:', error);
    const msg = error.response?.data?.message || 'Upload failed';
    toast.error(msg);
  } finally {
    setIsUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }
};

  return (
    <div>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/jpeg,image/png,image/gif,image/webp"
        className="hidden"
      />
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={isUploading}
        onClick={() => fileInputRef.current?.click()}
        className="gap-2"
      >
        {isUploading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Uploading...
          </>
        ) : (
          <>
            <ImagePlus className="h-4 w-4" />
            Add Image
          </>
        )}
      </Button>
    </div>
  );
}