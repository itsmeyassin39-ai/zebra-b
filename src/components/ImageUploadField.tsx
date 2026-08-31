import React, { useRef, useState } from 'react';
import { ImageUp, Loader2, X } from 'lucide-react';
import { api } from '../api/client';

interface ImageUploadFieldProps {
  label?: string;
  value: string;
  onChange: (url: string) => void;
  hint?: string;
  compact?: boolean;
}

const MAX_DIM = 1400;
const QUALITY = 0.82;

function fileToResizedDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Lecture du fichier impossible'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('Image invalide'));
      img.onload = () => {
        let { width, height } = img;
        const scale = Math.min(1, MAX_DIM / Math.max(width, height));
        width = Math.round(width * scale);
        height = Math.round(height * scale);
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas indisponible'));
          return;
        }
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', QUALITY));
      };
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });
}

export default function ImageUploadField({
  label,
  value,
  onChange,
  hint,
  compact,
}: ImageUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setBusy(true);
    setError('');
    try {
      const dataUrl = await fileToResizedDataUrl(file);
      const b64 = dataUrl.split(',')[1] ?? '';
      const { url } = await api<{ url: string }>('/api/upload', {
        method: 'POST',
        body: { data: b64 },
      });
      onChange(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Échec du chargement de la photo.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      {label && <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">{label}</label>}
      <div className="flex items-start gap-4">
        {value ? (
          <img
            src={value}
            alt="Aperçu"
            className={`rounded-xl object-cover bg-zinc-100 border border-zinc-200 shrink-0 ${compact ? 'w-16 h-16' : 'w-24 h-24'}`}
          />
        ) : (
          <div className={`rounded-xl bg-zinc-100 border border-zinc-200 flex items-center justify-center text-zinc-300 shrink-0 ${compact ? 'w-16 h-16' : 'w-24 h-24'}`}>
            <ImageUp className={compact ? 'w-5 h-5' : 'w-7 h-7'} />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFile}
          />
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={busy}
              className="inline-flex items-center gap-2 rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 transition-colors cursor-pointer disabled:opacity-60"
            >
              {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImageUp className="w-4 h-4" />}
              {busy ? 'Chargement…' : 'Choisir une photo'}
            </button>
            {value && (
              <button
                type="button"
                onClick={() => onChange('')}
                className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 bg-white px-3 py-2 text-sm font-semibold text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
                Retirer
              </button>
            )}
          </div>
          {error && <p className="text-xs text-red-500 mt-1.5">{error}</p>}
          {hint && <p className="text-[11px] text-zinc-400 mt-1.5">{hint}</p>}
        </div>
      </div>
    </div>
  );
}
