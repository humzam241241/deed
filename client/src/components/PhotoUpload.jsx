import React, { useRef, useState } from 'react';
import { ImagePlus, X, Loader2 } from 'lucide-react';
import supabase from '../lib/supabase.js';

const MAX_FILES = 5;
const BUCKET = 'listing-images';

/**
 * PhotoUpload — drag-and-drop / click-to-select image uploader.
 * Props:
 *   urls: string[]         — current list of public image URLs
 *   onChange: (urls) => void — called with new array after upload/delete
 *   disabled?: boolean
 */
export default function PhotoUpload({ urls = [], onChange, disabled = false }) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleFiles = async (files) => {
    setError('');
    const remaining = MAX_FILES - urls.length;
    if (remaining <= 0) {
      return setError(`Maximum ${MAX_FILES} photos allowed.`);
    }
    const toUpload = Array.from(files).slice(0, remaining);

    setUploading(true);
    try {
      const uploaded = await Promise.all(
        toUpload.map(async (file) => {
          const ext = file.name.split('.').pop();
          const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
          const { error: uploadErr } = await supabase.storage
            .from(BUCKET)
            .upload(path, file, { upsert: false });
          if (uploadErr) throw new Error(uploadErr.message);
          const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
          return data.publicUrl;
        })
      );
      onChange([...urls, ...uploaded]);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const removeUrl = (url) => {
    onChange(urls.filter(u => u !== url));
  };

  const onDrop = (e) => {
    e.preventDefault();
    if (disabled) return;
    handleFiles(e.dataTransfer.files);
  };

  return (
    <div className="space-y-2">
      {/* Previews */}
      {urls.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {urls.map((url, i) => (
            <div key={url} className="relative group w-20 h-20">
              <img
                src={url}
                alt={`Photo ${i + 1}`}
                className="w-full h-full object-cover rounded-lg border border-gray-200"
              />
              {!disabled && (
                <button
                  type="button"
                  onClick={() => removeUrl(url)}
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Drop zone */}
      {urls.length < MAX_FILES && !disabled && (
        <div
          onDrop={onDrop}
          onDragOver={e => e.preventDefault()}
          onClick={() => inputRef.current?.click()}
          className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-gray-200 rounded-xl py-6 cursor-pointer hover:border-gray-400 hover:bg-gray-50 transition-colors"
        >
          {uploading ? (
            <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
          ) : (
            <ImagePlus className="w-5 h-5 text-gray-400" />
          )}
          <p className="text-xs text-gray-400">
            {uploading ? 'Uploading…' : `Click or drag photos (${urls.length}/${MAX_FILES})`}
          </p>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={e => handleFiles(e.target.files)}
          />
        </div>
      )}

      {error && (
        <p className="text-xs text-red-500">{error}</p>
      )}
    </div>
  );
}
