import { supabase } from '../lib/supabase';

export interface OfferFromDB {
  id: string;
  product_id: string;
  buyer_id: string;
  price: number;
  quantity: string | null;
  message: string | null;
  status: 'pendiente' | 'aceptada' | 'rechazada' | 'cancelada';
  created_at: string;
  updated_at: string;
  request_id?: string | null;
}

export interface OfferWithDetails extends OfferFromDB {
  product?: {
    id: string;
    title: string;
    category: string;
    user_id: string;
    image_url: string | null;
    image_urls: string[] | null;
  } | null;
  buyer?: {
    id: string;
    full_name: string;
    email: string;
  } | null;
  seller?: {
    id: string;
    full_name: string;
    email: string;
  } | null;
}

export const getOfferById = async (id: string): Promise<OfferWithDetails | null> => {
  try {
    const { data, error } = await supabase
      .from('offers')
      .select(`
        *,
        product:products(id, title, category, user_id, image_url, image_urls),
        buyer:users!offers_buyer_id_fkey(id, full_name, email)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    if (!data) return null;

    // Obtener datos del vendedor (owner del producto)
    let seller = null;
    if (data.product?.user_id) {
      const { data: sellerData } = await supabase
        .from('users')
        .select('id, full_name, email')
        .eq('id', data.product.user_id)
        .single();
      seller = sellerData;
    }

    return { ...data, seller } as OfferWithDetails;
  } catch (error) {
    console.error('Error fetching offer:', error);
    return null;
  }
};

export const getOffersByBuyer = async (userId: string): Promise<OfferWithDetails[]> => {
  try {
    const { data, error } = await supabase
      .from('offers')
      .select(`
        *,
        product:products(id, title, category, user_id, image_url, image_urls)
      `)
      .eq('buyer_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []) as OfferWithDetails[];
  } catch (error) {
    console.error('Error fetching buyer offers:', error);
    return [];
  }
};

export const getOffersByProduct = async (productId: string): Promise<OfferWithDetails[]> => {
  try {
    const { data, error } = await supabase
      .from('offers')
      .select(`
        *,
        buyer:users!offers_buyer_id_fkey(id, full_name, email)
      `)
      .eq('product_id', productId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []) as OfferWithDetails[];
  } catch (error) {
    console.error('Error fetching product offers:', error);
    return [];
  }
};

export const getOffersByRequest = async (requestId: string): Promise<OfferWithDetails[]> => {
  try {
    const { data, error } = await supabase
      .from('offers')
      .select(`
        *,
        buyer:users!offers_buyer_id_fkey(id, full_name, email)
      `)
      .eq('request_id', requestId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []) as OfferWithDetails[];
  } catch (error) {
    console.error('Error fetching request offers:', error);
    return [];
  }
};

export const updateOfferStatus = async (
  id: string,
  status: 'aceptada' | 'rechazada' | 'cancelada'
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('offers')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error updating offer status:', error);
    return false;
  }
};

export const createOffer = async (data: {
  product_id?: string;
  request_id?: string;
  buyer_id: string;
  price: number;
  quantity?: string;
  message?: string;
}): Promise<OfferFromDB | null> => {
  try {
    const { data: offer, error } = await supabase
      .from('offers')
      .insert(data)
      .select()
      .single();

    if (error) throw error;
    return offer as OfferFromDB;
  } catch (error) {
    console.error('Error creating offer:', error);
    return null;
  }
};
