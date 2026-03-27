import { supabase } from '../lib/supabase';

export interface Review {
  id: string;
  reviewer_id: string;
  reviewed_user_id: string;
  product_id: string | null;
  rating: number;
  comment: string | null;
  created_at: string;
  reviewer?: {
    full_name: string | null;
    email: string | null;
    profile_picture_url?: string | null;
  } | null;
}

export interface UserRating {
  average: number;
  count: number;
}

export const createReview = async (data: {
  reviewer_id: string;
  reviewed_user_id: string;
  product_id?: string | null;
  rating: number;
  comment?: string | null;
}): Promise<{ success: boolean; error?: string }> => {
  const { error } = await supabase.from('reviews').insert({
    reviewer_id: data.reviewer_id,
    reviewed_user_id: data.reviewed_user_id,
    product_id: data.product_id ?? null,
    rating: data.rating,
    comment: data.comment ?? null,
  });
  if (error) {
    if (error.code === '23505') return { success: false, error: 'Ya calificaste esta transacción.' };
    return { success: false, error: error.message };
  }
  return { success: true };
};

export const getReviewsForUser = async (userId: string): Promise<Review[]> => {
  const { data, error } = await supabase
    .from('reviews')
    .select('*, reviewer:reviewer_id(full_name, email, profile_picture_url)')
    .eq('reviewed_user_id', userId)
    .order('created_at', { ascending: false });
  if (error) return [];
  return (data || []) as Review[];
};

export const getUserRating = async (userId: string): Promise<UserRating> => {
  const { data } = await supabase
    .from('reviews')
    .select('rating')
    .eq('reviewed_user_id', userId);
  if (!data || data.length === 0) return { average: 0, count: 0 };
  const sum = data.reduce((acc: number, r: { rating: number }) => acc + r.rating, 0);
  return { average: Math.round((sum / data.length) * 10) / 10, count: data.length };
};

export const getReviewedProductIds = async (
  reviewerId: string,
  reviewedUserId: string
): Promise<Set<string>> => {
  const { data } = await supabase
    .from('reviews')
    .select('product_id')
    .eq('reviewer_id', reviewerId)
    .eq('reviewed_user_id', reviewedUserId);
  const ids = new Set<string>();
  (data || []).forEach((r: { product_id: string | null }) => {
    if (r.product_id) ids.add(r.product_id);
  });
  return ids;
};
