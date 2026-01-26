import { supabase } from '../lib/supabase';

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
  const { files, authUserId, productTempKey, bucket = 'product-images' } = params;
  const urls: string[] = [];

  for (const file of files) {
    const ext = getFileExt(file.name);
    const id = typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;
    const path = `${safeNamePart(authUserId)}/${safeNamePart(productTempKey)}/${id}.${ext}`;

    const { error: uploadError } = await supabase.storage.from(bucket).upload(path, file, {
      upsert: false,
      contentType: file.type || undefined,
    });
    if (uploadError) throw uploadError;

    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    if (data?.publicUrl) {
      urls.push(data.publicUrl);
    }
  }

  return urls;
}

