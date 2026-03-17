import { supabase } from '../lib/supabase';
import { Product } from '../types/product';
import { mapProductFromDB, ProductFromDB } from './products';

export interface FavoriteFromDB {
  id: string;
  user_id: string;
  product_id: string;
  created_at: string;
}

export interface FavoriteWithProduct extends FavoriteFromDB {
  product: ProductFromDB | null;
}

export const getFavorites = async (userId: string): Promise<Product[]> => {
  try {
    const { data, error } = await supabase
      .from('favorites')
      .select(`
        *,
        product:products(*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return (data || [])
      .filter((fav: any) => fav.product && fav.product.status === 'activo')
      .map((fav: any) => mapProductFromDB(fav.product as ProductFromDB));
  } catch (error) {
    console.error('Error fetching favorites:', error);
    return [];
  }
};

export const addFavorite = async (userId: string, productId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('favorites')
      .insert({ user_id: userId, product_id: productId });

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error adding favorite:', error);
    return false;
  }
};

export const removeFavorite = async (userId: string, productId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('user_id', userId)
      .eq('product_id', productId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error removing favorite:', error);
    return false;
  }
};

export const isFavorite = async (userId: string, productId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('favorites')
      .select('id')
      .eq('user_id', userId)
      .eq('product_id', productId)
      .maybeSingle();

    if (error) throw error;
    return !!data;
  } catch (error) {
    console.error('Error checking favorite:', error);
    return false;
  }
};

export const getFavoriteIds = async (userId: string): Promise<string[]> => {
  try {
    const { data, error } = await supabase
      .from('favorites')
      .select('product_id')
      .eq('user_id', userId);

    if (error) throw error;
    return (data || []).map((f: any) => f.product_id);
  } catch (error) {
    console.error('Error fetching favorite ids:', error);
    return [];
  }
};
