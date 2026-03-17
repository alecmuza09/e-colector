import { supabase } from '../lib/supabase';

export interface RequestFromDB {
  id: string;
  user_id: string;
  material: string;
  quantity: string | null;
  price: string | null;
  location: string | null;
  municipality: string | null;
  description: string | null;
  status: 'activa' | 'completada' | 'cancelada';
  created_at: string;
  updated_at: string;
}

export interface RequestWithUser extends RequestFromDB {
  user?: {
    id: string;
    full_name: string;
    email: string;
    city: string | null;
    is_verified: boolean;
  } | null;
}

export const getRequestById = async (id: string): Promise<RequestWithUser | null> => {
  try {
    const { data, error } = await supabase
      .from('requests')
      .select(`
        *,
        user:users(id, full_name, email, city, is_verified)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as RequestWithUser;
  } catch (error) {
    console.error('Error fetching request:', error);
    return null;
  }
};

export const getActiveRequests = async (): Promise<RequestWithUser[]> => {
  try {
    const { data, error } = await supabase
      .from('requests')
      .select(`
        *,
        user:users(id, full_name, email, city, is_verified)
      `)
      .eq('status', 'activa')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []) as RequestWithUser[];
  } catch (error) {
    console.error('Error fetching active requests:', error);
    return [];
  }
};

export const getMyRequests = async (userId: string): Promise<RequestFromDB[]> => {
  try {
    const { data, error } = await supabase
      .from('requests')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []) as RequestFromDB[];
  } catch (error) {
    console.error('Error fetching my requests:', error);
    return [];
  }
};

export const createRequest = async (requestData: {
  material: string;
  quantity?: string;
  price?: string;
  location?: string;
  municipality?: string;
  description?: string;
}): Promise<RequestFromDB | null> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuario no autenticado');

    const { data: userProfile } = await supabase
      .from('users')
      .select('id')
      .eq('auth_user_id', user.id)
      .single();

    if (!userProfile) throw new Error('Perfil de usuario no encontrado');

    const { data, error } = await supabase
      .from('requests')
      .insert({ ...requestData, user_id: userProfile.id, status: 'activa' })
      .select()
      .single();

    if (error) throw error;
    return data as RequestFromDB;
  } catch (error) {
    console.error('Error creating request:', error);
    throw error;
  }
};

export const updateRequestStatus = async (
  id: string,
  status: 'activa' | 'completada' | 'cancelada'
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('requests')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error updating request status:', error);
    return false;
  }
};

export const updateRequest = async (
  id: string,
  updates: Partial<Pick<RequestFromDB, 'material' | 'quantity' | 'price' | 'location' | 'municipality' | 'description'>>
): Promise<RequestFromDB | null> => {
  try {
    const { data, error } = await supabase
      .from('requests')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as RequestFromDB;
  } catch (error) {
    console.error('Error updating request:', error);
    return null;
  }
};
