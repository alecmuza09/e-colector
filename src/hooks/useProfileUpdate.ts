import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

export type SaveMsg = { type: 'ok' | 'err'; text: string } | null;

export function useProfileUpdate() {
  const { userProfile, refreshProfile } = useAuth();
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<SaveMsg>(null);

  const save = async (
    basicUpdates?: Partial<{ full_name: string; phone_number: string; city: string }>,
    profileDataUpdates?: Record<string, any>
  ) => {
    if (!userProfile?.id) return;
    setSaving(true);
    setSaveMsg(null);
    try {
      const payload: Record<string, any> = { ...basicUpdates };
      if (profileDataUpdates) {
        payload.profile_data = { ...(userProfile.profile_data || {}), ...profileDataUpdates };
      }
      const { error } = await supabase.from('users').update(payload).eq('id', userProfile.id);
      if (error) throw error;
      if (basicUpdates?.full_name) {
        await supabase.auth.updateUser({ data: { full_name: basicUpdates.full_name } });
      }
      await refreshProfile();
      setSaveMsg({ type: 'ok', text: 'Información actualizada correctamente.' });
      setTimeout(() => setSaveMsg(null), 3000);
    } catch (e: any) {
      setSaveMsg({ type: 'err', text: e?.message || 'Error al guardar.' });
    } finally {
      setSaving(false);
    }
  };

  return { save, saving, saveMsg, setSaveMsg };
}

/** Alterna un elemento dentro de un array de strings */
export const toggleChip = (arr: string[], item: string): string[] =>
  arr.includes(item) ? arr.filter((x) => x !== item) : [...arr, item];

/** Chips seleccionables para campos de array */
export const MATERIAL_CHIPS = ['PET', 'Cartón', 'Vidrio', 'Metal', 'Electrónicos', 'Papel', 'HDPE', 'Orgánicos', 'Otros'];
export const COVERAGE_CHIPS = [
  'Monterrey', 'San Nicolás', 'Guadalupe', 'San Pedro', 'Apodaca',
  'Escobedo', 'Santa Catarina', 'Juárez', 'García', 'Área Metropolitana',
];
export const CERT_CHIPS = ['ISO 14001', 'NMX-AA', 'SEMARNAT', 'REPSE', 'Otro'];
