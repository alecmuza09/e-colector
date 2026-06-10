import { supabase } from '../lib/supabase';

/** Bucket por defecto para fotos de publicaciones (debe existir en Supabase → Storage). */
export const PRODUCT_IMAGES_BUCKET = 'product-images';

/** Mensaje claro cuando Storage no está configurado en el proyecto Supabase. */
export function formatStorageUploadError(err: unknown): string {
  const msg = String((err as any)?.message || err || '').toLowerCase();
  if (msg.includes('bucket not found') || msg.includes('bucket does not exist')) {
    return (
      'No existe el almacén de imágenes en Supabase (bucket «product-images»). ' +
      'Un administrador debe crearlo: en el panel de Supabase → Storage → New bucket, nombre «product-images», público, ' +
      'o ejecutar el archivo supabase-storage-setup.sql en el SQL Editor. Luego vuelve a publicar.'
    );
  }
  if (msg.includes('row-level security') || msg.includes('policy') || msg.includes('permission')) {
    return (
      'No tienes permiso para subir imágenes al bucket «product-images». ' +
      'Un administrador debe ejecutar supabase-fix-storage-rls.sql en el SQL Editor de Supabase ' +
      '(las políticas antiguas con owner = auth.uid() en INSERT suelen causar este error). ' +
      `Detalle: ${(err as any)?.message || 'RLS'}`
    );
  }
  return (err as any)?.message || 'Error al subir las imágenes. Intenta de nuevo.';
}

function getFileExt(name: string): string {
  const parts = name.split('.');
  return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : 'jpg';
}

function safeNamePart(v: string): string {
  return v.replace(/[^a-zA-Z0-9-_]/g, '-').slice(0, 50);
}

export async function uploadProductImages(params: {
  files: File[];
  authUserId: string;
  productTempKey: string;
  bucket?: string;
}): Promise<string[]> {
  const { files, authUserId, productTempKey, bucket = PRODUCT_IMAGES_BUCKET } = params;
  const urls: string[] = [];

  for (const file of files) {
    const ext = getFileExt(file.name);
    const id = typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;
    const path = `${safeNamePart(authUserId)}/${safeNamePart(productTempKey)}/${id}.${ext}`;

    const { error: uploadError } = await supabase.storage.from(bucket).upload(path, file, {
      upsert: false,
      contentType: file.type || undefined,
    });
    if (uploadError) {
      const e = new Error(formatStorageUploadError(uploadError));
      (e as any).cause = uploadError;
      throw e;
    }

    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    if (data?.publicUrl) {
      urls.push(data.publicUrl);
    }
  }

  return urls;
}

