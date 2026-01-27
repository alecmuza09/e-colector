import { supabase } from '../lib/supabase';
import { Product } from '../data/mockProducts';

export interface ProductFromDB {
  id: string;
  user_id: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  category: string;
  quantity: number | null;
  unit: string | null;
  location: string | null;
  municipality: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  tags: string[] | null;
  image_url: string | null;
  image_urls?: string[] | null;
  verified: boolean;
  type: 'venta' | 'donacion';
  status: string;
  created_at: string;
  updated_at: string;
}

// Convertir producto de DB a formato de la app
export const mapProductFromDB = (dbProduct: ProductFromDB): Product => {
  const imageUrls = (dbProduct.image_urls || []).filter(Boolean) as string[];
  const primaryImage =
    imageUrls[0] ||
    dbProduct.image_url ||
    `https://placehold.co/400x300/cccccc/666666?text=${encodeURIComponent(dbProduct.title)}`;
  return {
    id: dbProduct.id,
    userId: dbProduct.user_id,
    title: dbProduct.title,
    description: dbProduct.description,
    price: Number(dbProduct.price),
    currency: dbProduct.currency || 'MXN',
    location: dbProduct.location || '',
    municipality: (dbProduct.municipality as any) || 'Monterrey',
    address: dbProduct.address || '',
    category: (dbProduct.category as any) || 'Otros',
    tags: dbProduct.tags || [],
    imageUrl: primaryImage,
    imageUrls: imageUrls.length > 0 ? imageUrls : undefined,
    latitude: dbProduct.latitude || 25.6751,
    longitude: dbProduct.longitude || -100.3185,
    verified: dbProduct.verified,
    type: dbProduct.type,
    createdAt: dbProduct.created_at,
    status: dbProduct.status,
  };
};

// Obtener todos los productos activos
export const getProducts = async (): Promise<Product[]> => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('status', 'activo')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return (data || []).map(mapProductFromDB);
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
};

// Obtener producto por ID
export const getProductById = async (id: string): Promise<Product | null> => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    if (!data) return null;

    return mapProductFromDB(data);
  } catch (error) {
    console.error('Error fetching product:', error);
    return null;
  }
};

// Crear nuevo producto
export const createProduct = async (productData: {
  title: string;
  description: string;
  price: number;
  category: string;
  quantity?: number;
  unit?: string;
  location?: string;
  municipality?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  tags?: string[];
  image_url?: string;
  image_urls?: string[];
  type?: 'venta' | 'donacion';
}): Promise<Product | null> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuario no autenticado');

    // Obtener user_id de la tabla users
    const { data: userProfile } = await supabase
      .from('users')
      .select('id')
      .eq('auth_user_id', user.id)
      .single();

    if (!userProfile) throw new Error('Perfil de usuario no encontrado');

    const baseInsert: any = {
      user_id: userProfile.id,
      ...productData,
      status: 'activo',
    };

    // Intento 1: con image_urls (si existe en el esquema)
    let { data, error } = await supabase.from('products').insert(baseInsert).select().single();

    // Fallback: si la columna image_urls no existe todavía, reintenta sin ella
    if (error && String((error as any)?.message || '').toLowerCase().includes('image_urls')) {
      const { image_urls, ...rest } = baseInsert;
      const retry = await supabase.from('products').insert(rest).select().single();
      data = retry.data as any;
      error = retry.error as any;
    }

    if (error) throw error;
    return mapProductFromDB(data as any);
  } catch (error) {
    console.error('Error creating product:', error);
    throw error;
  }
};

// Actualizar producto existente (solo dueño o admin por RLS)
export const updateProduct = async (
  productId: string,
  updates: {
    title?: string;
    description?: string;
    price?: number;
    category?: string;
    quantity?: number;
    unit?: string;
    location?: string;
    municipality?: string;
    address?: string;
    latitude?: number;
    longitude?: number;
    tags?: string[];
    image_url?: string;
    image_urls?: string[];
    type?: 'venta' | 'donacion';
    status?: 'activo' | 'vendido' | 'expirado' | 'cancelado';
  }
): Promise<Product | null> => {
  try {
    const baseUpdate: any = {
      ...updates,
    };

    // Intento 1: con image_urls (si existe en el esquema)
    let { data, error } = await supabase
      .from('products')
      .update(baseUpdate)
      .eq('id', productId)
      .select()
      .single();

    // Fallback: si la columna image_urls no existe todavía, reintenta sin ella
    if (error && String((error as any)?.message || '').toLowerCase().includes('image_urls')) {
      const { image_urls, ...rest } = baseUpdate;
      const retry = await supabase.from('products').update(rest).eq('id', productId).select().single();
      data = retry.data as any;
      error = retry.error as any;
    }

    if (error) throw error;
    return mapProductFromDB(data as any);
  } catch (error) {
    console.error('Error updating product:', error);
    throw error;
  }
};

// Obtener productos por categoría
export const getProductsByCategory = async (category: string): Promise<Product[]> => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('category', category)
      .eq('status', 'activo')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return (data || []).map(mapProductFromDB);
  } catch (error) {
    console.error('Error fetching products by category:', error);
    return [];
  }
};

// Obtener productos por municipio
export const getProductsByMunicipality = async (municipality: string): Promise<Product[]> => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('municipality', municipality)
      .eq('status', 'activo')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return (data || []).map(mapProductFromDB);
  } catch (error) {
    console.error('Error fetching products by municipality:', error);
    return [];
  }
};

// Buscar productos
export const searchProducts = async (query: string): Promise<Product[]> => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('status', 'activo')
      .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return (data || []).map(mapProductFromDB);
  } catch (error) {
    console.error('Error searching products:', error);
    return [];
  }
};
