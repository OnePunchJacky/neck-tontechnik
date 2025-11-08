'use client';

import { useState, useRef } from 'react';

interface MediaUploaderProps {
  onUploadComplete: (media: any) => void;
  accept?: string;
  maxSize?: number; // in MB
}

export default function MediaUploader({
  onUploadComplete,
  accept = 'image/*,audio/*',
  maxSize = 10,
}: MediaUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size
    if (file.size > maxSize * 1024 * 1024) {
      setError(`Datei ist zu groß. Maximum: ${maxSize}MB`);
      return;
    }

    setError('');
    setUploading(true);
    setProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/wp/media', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Upload fehlgeschlagen');
      }

      const media = await response.json();
      onUploadComplete(media);
      setProgress(100);

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err: any) {
      setError(err.message || 'Upload fehlgeschlagen');
    } finally {
      setUploading(false);
      setTimeout(() => setProgress(0), 2000);
    }
  };

  return (
    <div className="border-2 border-dashed border-[var(--color-border)] rounded-lg p-6 text-center">
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileSelect}
        className="hidden"
        id="media-upload"
        disabled={uploading}
      />
      <label
        htmlFor="media-upload"
        className={`cursor-pointer ${
          uploading ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        <div className="text-4xl mb-2">📤</div>
        <div className="text-[var(--color-text-primary)] font-medium mb-1">
          {uploading ? 'Wird hochgeladen...' : 'Datei auswählen'}
        </div>
        <div className="text-sm text-[var(--color-text-secondary)]">
          {accept.includes('image') && accept.includes('audio')
            ? 'Bilder oder Audio-Dateien'
            : accept.includes('image')
            ? 'Bilder'
            : 'Audio-Dateien'}
          {' '}(max. {maxSize}MB)
        </div>
      </label>

      {uploading && (
        <div className="mt-4">
          <div className="w-full bg-[var(--color-surface-light)] rounded-full h-2">
            <div
              className="bg-[var(--color-primary)] h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {error && (
        <div className="mt-4 text-sm text-red-500">{error}</div>
      )}
    </div>
  );
}

