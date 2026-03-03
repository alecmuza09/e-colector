import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Award, Save, Plus, Trash2, Loader, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';

type RewardRule = {
  id: string;
  action_key: string;
  label: string;
  description: string;
  points_per_action: number;
  max_points: number | null;
  active: boolean;
};

type RewardLevel = {
  id: string;
  nombre: string;
  emoji: string;
  min_points: number;
  color: string;
  sort_order: number;
};

type SaveStatus = 'idle' | 'saving' | 'ok' | 'error';

function StatusBadge({ status }: { status: SaveStatus }) {
  if (status === 'idle') return null;
  if (status === 'saving') return <span className="flex items-center gap-1 text-sm text-gray-500"><Loader className="w-4 h-4 animate-spin" /> Guardando…</span>;
  if (status === 'ok')    return <span className="flex items-center gap-1 text-sm text-emerald-600"><CheckCircle className="w-4 h-4" /> Guardado</span>;
  return <span className="flex items-center gap-1 text-sm text-red-600"><AlertCircle className="w-4 h-4" /> Error al guardar</span>;
}

export default function RewardRulesAdmin() {
  const [rules, setRules]   = useState<RewardRule[]>([]);
  const [levels, setLevels] = useState<RewardLevel[]>([]);
  const [loading, setLoading] = useState(true);
  const [ruleStatus,  setRuleStatus]  = useState<SaveStatus>('idle');
  const [levelStatus, setLevelStatus] = useState<SaveStatus>('idle');
  const [tablesExist, setTablesExist] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const [{ data: r, error: re }, { data: l, error: le }] = await Promise.all([
        supabase.from('reward_rules').select('*').order('action_key'),
        supabase.from('reward_levels').select('*').order('sort_order'),
      ]);
      if (re || le) { setTablesExist(false); return; }
      setRules((r || []) as RewardRule[]);
      setLevels((l || []) as RewardLevel[]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  // ── Reglas ──────────────────────────────────────────────────────────
  const updateRule = (id: string, field: keyof RewardRule, value: any) => {
    setRules((prev) => prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)));
  };

  const saveRules = async () => {
    setRuleStatus('saving');
    try {
      for (const rule of rules) {
        const { error } = await supabase.from('reward_rules').update({
          label:              rule.label,
          description:        rule.description,
          points_per_action:  rule.points_per_action,
          max_points:         rule.max_points,
          active:             rule.active,
        }).eq('id', rule.id);
        if (error) throw error;
      }
      setRuleStatus('ok');
    } catch {
      setRuleStatus('error');
    } finally {
      setTimeout(() => setRuleStatus('idle'), 3000);
    }
  };

  // ── Niveles ─────────────────────────────────────────────────────────
  const updateLevel = (id: string, field: keyof RewardLevel, value: any) => {
    setLevels((prev) => prev.map((l) => (l.id === id ? { ...l, [field]: value } : l)));
  };

  const addLevel = async () => {
    const maxOrder = Math.max(0, ...levels.map((l) => l.sort_order));
    const { data, error } = await supabase
      .from('reward_levels')
      .insert({ nombre: 'Nuevo Nivel', emoji: '⭐', min_points: 500, color: 'gray', sort_order: maxOrder + 1 })
      .select()
      .single();
    if (!error && data) setLevels((prev) => [...prev, data as RewardLevel]);
  };

  const deleteLevel = async (id: string) => {
    const { error } = await supabase.from('reward_levels').delete().eq('id', id);
    if (!error) setLevels((prev) => prev.filter((l) => l.id !== id));
  };

  const saveLevels = async () => {
    setLevelStatus('saving');
    try {
      for (const level of levels) {
        const { error } = await supabase.from('reward_levels').update({
          nombre:     level.nombre,
          emoji:      level.emoji,
          min_points: level.min_points,
          color:      level.color,
          sort_order: level.sort_order,
        }).eq('id', level.id);
        if (error) throw error;
      }
      setLevelStatus('ok');
    } catch {
      setLevelStatus('error');
    } finally {
      setTimeout(() => setLevelStatus('idle'), 3000);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader className="w-6 h-6 animate-spin text-red-600" />
      </div>
    );
  }

  if (!tablesExist) {
    return (
      <div className="bg-amber-50 border border-amber-300 rounded-xl p-6">
        <h3 className="font-bold text-amber-800 flex items-center gap-2 mb-2">
          <AlertCircle className="w-5 h-5" /> Tablas no encontradas
        </h3>
        <p className="text-amber-700 text-sm mb-3">
          Las tablas <code className="font-mono bg-amber-100 px-1 rounded">reward_rules</code> y{' '}
          <code className="font-mono bg-amber-100 px-1 rounded">reward_levels</code> aún no existen en Supabase.
        </p>
        <p className="text-amber-700 text-sm">
          Ejecuta el script <strong>supabase-reward-rules.sql</strong> en Supabase → SQL Editor y luego recarga.
        </p>
        <button
          onClick={load}
          className="mt-4 flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-600 text-white hover:bg-amber-700 text-sm"
        >
          <RefreshCw className="w-4 h-4" /> Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* ── Reglas de puntos ── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-500" /> Reglas de puntos
          </h3>
          <div className="flex items-center gap-3">
            <StatusBadge status={ruleStatus} />
            <button
              onClick={saveRules}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 text-sm font-medium"
            >
              <Save className="w-4 h-4" /> Guardar cambios
            </button>
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-gray-200">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-gray-700">Acción</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700">Etiqueta</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700">Descripción</th>
                <th className="text-center px-4 py-3 font-semibold text-gray-700">Puntos</th>
                <th className="text-center px-4 py-3 font-semibold text-gray-700">Máximo</th>
                <th className="text-center px-4 py-3 font-semibold text-gray-700">Activo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rules.map((rule) => (
                <tr key={rule.id} className="bg-white hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <code className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-xs font-mono">
                      {rule.action_key}
                    </code>
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="text"
                      value={rule.label}
                      onChange={(e) => updateRule(rule.id, 'label', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="text"
                      value={rule.description}
                      onChange={(e) => updateRule(rule.id, 'description', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
                    />
                  </td>
                  <td className="px-4 py-3 text-center">
                    <input
                      type="number"
                      min={0}
                      value={rule.points_per_action}
                      onChange={(e) => updateRule(rule.id, 'points_per_action', Number(e.target.value))}
                      className="w-20 border border-gray-300 rounded-lg px-2 py-1.5 text-sm text-center focus:outline-none focus:ring-2 focus:ring-red-400"
                    />
                  </td>
                  <td className="px-4 py-3 text-center">
                    <input
                      type="number"
                      min={0}
                      placeholder="Sin límite"
                      value={rule.max_points ?? ''}
                      onChange={(e) =>
                        updateRule(rule.id, 'max_points', e.target.value === '' ? null : Number(e.target.value))
                      }
                      className="w-24 border border-gray-300 rounded-lg px-2 py-1.5 text-sm text-center focus:outline-none focus:ring-2 focus:ring-red-400"
                    />
                  </td>
                  <td className="px-4 py-3 text-center">
                    <input
                      type="checkbox"
                      checked={rule.active}
                      onChange={(e) => updateRule(rule.id, 'active', e.target.checked)}
                      className="w-4 h-4 accent-red-600"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Niveles ── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900">🏆 Niveles</h3>
          <div className="flex items-center gap-3">
            <StatusBadge status={levelStatus} />
            <button
              onClick={addLevel}
              className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 text-sm"
            >
              <Plus className="w-4 h-4" /> Añadir nivel
            </button>
            <button
              onClick={saveLevels}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 text-sm font-medium"
            >
              <Save className="w-4 h-4" /> Guardar cambios
            </button>
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-gray-200">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-gray-700">Nombre</th>
                <th className="text-center px-4 py-3 font-semibold text-gray-700">Emoji</th>
                <th className="text-center px-4 py-3 font-semibold text-gray-700">Puntos mínimos</th>
                <th className="text-center px-4 py-3 font-semibold text-gray-700">Orden</th>
                <th className="text-center px-4 py-3 font-semibold text-gray-700">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {levels.map((level) => (
                <tr key={level.id} className="bg-white hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <input
                      type="text"
                      value={level.nombre}
                      onChange={(e) => updateLevel(level.id, 'nombre', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
                    />
                  </td>
                  <td className="px-4 py-3 text-center">
                    <input
                      type="text"
                      value={level.emoji}
                      onChange={(e) => updateLevel(level.id, 'emoji', e.target.value)}
                      className="w-16 border border-gray-300 rounded-lg px-2 py-1.5 text-sm text-center focus:outline-none focus:ring-2 focus:ring-red-400"
                    />
                  </td>
                  <td className="px-4 py-3 text-center">
                    <input
                      type="number"
                      min={0}
                      value={level.min_points}
                      onChange={(e) => updateLevel(level.id, 'min_points', Number(e.target.value))}
                      className="w-28 border border-gray-300 rounded-lg px-2 py-1.5 text-sm text-center focus:outline-none focus:ring-2 focus:ring-red-400"
                    />
                  </td>
                  <td className="px-4 py-3 text-center">
                    <input
                      type="number"
                      min={1}
                      value={level.sort_order}
                      onChange={(e) => updateLevel(level.id, 'sort_order', Number(e.target.value))}
                      className="w-16 border border-gray-300 rounded-lg px-2 py-1.5 text-sm text-center focus:outline-none focus:ring-2 focus:ring-red-400"
                    />
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => deleteLevel(level.id)}
                      className="p-1.5 rounded-lg text-red-500 hover:bg-red-50"
                      title="Eliminar nivel"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="text-xs text-gray-500 mt-2">
          Los puntos mínimos definen cuándo un usuario alcanza ese nivel. Asegúrate de que sean ascendentes y no se solapen.
        </p>
      </div>
    </div>
  );
}
