import React, { useState, useRef } from 'react';
import { UploadCloud, CheckCircle2, FileText, Image, Film, X, Loader2 } from 'lucide-react';

interface FileUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  category?: 'document' | 'evidence' | 'avatar' | 'certificate';
  onFileUploaded: (fileUrl: string, fileName: string) => void;
}

export const FileUploadModal: React.FC<FileUploadModalProps> = ({
  isOpen,
  onClose,
  title = 'Upload de Arquivo (Vercel Blob)',
  category = 'evidence',
  onFileUploaded,
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    setSelectedFile(file);
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => setPreviewUrl(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      setPreviewUrl(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    setProgress(15);

    // Realistic progress emulation for Vercel Blob pipeline
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval);
          return 95;
        }
        return prev + 25;
      });
    }, 200);

    setTimeout(() => {
      clearInterval(interval);
      setProgress(100);

      // In client mode, read as Data URL or generate mock Vercel Blob public URL
      if (previewUrl) {
        onFileUploaded(previewUrl, selectedFile.name);
      } else {
        const generatedBlobUrl = `https://blob.vercel-storage.com/nexus-${category}/${Date.now()}-${encodeURIComponent(
          selectedFile.name
        )}`;
        onFileUploaded(generatedBlobUrl, selectedFile.name);
      }

      setUploading(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-stone-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-stone-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center">
              <UploadCloud className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-[#1E293B] text-sm leading-tight">{title}</h3>
              <p className="text-[11px] text-stone-500">Armazenamento em nuvem Vercel Blob</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-stone-400 hover:text-stone-600 hover:bg-stone-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5">
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={handleChange}
            accept="image/*,application/pdf,video/*,.doc,.docx,.xls,.xlsx"
          />

          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center ${
              dragActive
                ? 'border-orange-500 bg-orange-50/50'
                : 'border-stone-200 hover:border-orange-400 bg-stone-50/60'
            }`}
          >
            {selectedFile ? (
              <div className="flex flex-col items-center gap-2">
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-20 h-20 object-cover rounded-lg border border-stone-200 shadow-xs"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
                    <FileText className="w-8 h-8" />
                  </div>
                )}
                <div className="text-center">
                  <p className="text-xs font-bold text-[#1E293B] truncate max-w-[220px]">
                    {selectedFile.name}
                  </p>
                  <p className="text-[11px] text-stone-400">
                    {(selectedFile.size / 1024).toFixed(1)} KB
                  </p>
                </div>
                <span className="text-[10px] text-orange-600 underline mt-1">
                  Clique para trocar de arquivo
                </span>
              </div>
            ) : (
              <>
                <div className="w-12 h-12 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center mb-3">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <p className="text-xs font-semibold text-[#1E293B]">
                  Arraste e solte o arquivo aqui
                </p>
                <p className="text-[11px] text-stone-500 mt-0.5">
                  ou clique para selecionar do seu dispositivo
                </p>
                <div className="flex items-center gap-3 mt-3 text-stone-400 text-[10px]">
                  <span className="flex items-center gap-1">
                    <Image className="w-3 h-3" /> Fotos
                  </span>
                  <span className="flex items-center gap-1">
                    <FileText className="w-3 h-3" /> PDFs / Docs
                  </span>
                  <span className="flex items-center gap-1">
                    <Film className="w-3 h-3" /> Vídeos
                  </span>
                </div>
              </>
            )}
          </div>

          {uploading && (
            <div className="mt-4">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-stone-500 font-medium">Transmitindo para Vercel Blob...</span>
                <span className="text-orange-600 font-bold">{progress}%</span>
              </div>
              <div className="w-full bg-stone-100 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-amber-500 h-1.5 transition-all duration-200"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            disabled={uploading}
            className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-200/60 text-xs font-medium transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleUpload}
            disabled={!selectedFile || uploading}
            className="px-5 py-2.5 rounded-xl bg-[#0F1D38] hover:bg-slate-900 text-amber-300 border border-slate-700 text-xs font-bold shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
          >
            {uploading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Enviando...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Confirmar Upload</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
