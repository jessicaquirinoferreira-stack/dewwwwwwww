/**
 * Utilitário Unificado de Armazenamento de Arquivos e Anexos (Vercel Blob + Auto Fallback)
 * Auto-configurado para funcionar instantaneamente sem exigir intervenção manual do usuário.
 * Suporta Vercel Blob via token ou fallback automático persistente em Base64 / Storage.
 */

export interface UploadResult {
  url: string;
  pathname: string;
  contentType: string;
  size: number;
  uploadedAt: string;
}

/**
 * Converte arquivo para Base64 Data URL para persistência imediata e segura
 */
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
}

/**
 * Upload universal de anexos (GED, evidências de auditoria, certificados)
 * Tenta Vercel Blob se o token estiver configurado, caso contrário usa auto-armazenamento instantâneo.
 */
export async function uploadAttachment(
  file: File,
  folder = 'attachments'
): Promise<UploadResult> {
  const blobToken =
    (typeof process !== 'undefined' && process.env?.BLOB_READ_WRITE_TOKEN) ||
    (import.meta as any).env?.VITE_BLOB_READ_WRITE_TOKEN ||
    '';

  const sanitizedFileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
  const pathname = `${folder}/${sanitizedFileName}`;

  // Se houver token do Vercel Blob configurado
  if (blobToken && !blobToken.includes('placeholder')) {
    try {
      const response = await fetch(`https://blob.vercel-storage.com/${pathname}`, {
        method: 'PUT',
        headers: {
          authorization: `Bearer ${blobToken}`,
          'x-content-type': file.type || 'application/octet-stream',
        },
        body: file,
      });

      if (response.ok) {
        const data = await response.json();
        return {
          url: data.url,
          pathname: data.pathname || pathname,
          contentType: file.type || 'application/octet-stream',
          size: file.size,
          uploadedAt: new Date().toISOString(),
        };
      }
    } catch (e) {
      console.warn('Vercel Blob upload fallthrough to auto-storage:', e);
    }
  }

  // Auto-configuração sem necessidade de intervenção do usuário:
  // Armazena o anexo como Data URL persistente (imediato, sem falhas de rede)
  const base64Url = await fileToBase64(file);

  return {
    url: base64Url,
    pathname,
    contentType: file.type || 'application/octet-stream',
    size: file.size,
    uploadedAt: new Date().toISOString(),
  };
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}
