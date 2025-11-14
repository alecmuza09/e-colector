import React, { useState } from 'react';
import { BarChart3, TrendingUp, Users, Package, Award, Calendar } from 'lucide-react';
import { BentoDashboard } from '../components/BentoDashboard';

export default function Estadisticas() {
  const [timeRange, setTimeRange] = useState<'mes' | 'trimestre' | 'año'>('mes');

  const stats = [
    {
      label: 'Publicaciones',
      value: '24',
      change: '+15%',
      icon: Package,
      color: 'emerald',
      trend: 'up'
    },
    {
      label: 'Visualizaciones',
      value: '1,240',
      change: '+24%',
      icon: TrendingUp,
      color: 'teal',
      trend: 'up'
    },
    {
      label: 'Contactos Recibidos',
      value: '87',
      change: '+8%',
      icon: Users,
      color: 'green',
      trend: 'up'
    },
    {
      label: 'Transacciones Completadas',
      value: '18',
      change: '+3%',
      icon: Award,
      color: 'cyan',
      trend: 'up'
    },
  ];

  const performanceByCategory = [
    { name: 'PET', publications: 8, views: 340, contacts: 28 },
    { name: 'Cartón', publications: 6, views: 280, contacts: 22 },
    { name: 'Metal', publications: 5, views: 320, contacts: 18 },
    { name: 'Vidrio', publications: 3, views: 150, contacts: 12 },
    { name: 'Electrónicos', publications: 2, views: 150, contacts: 7 },
  ];

  const topPerformers = [
    { material: 'Botellas PET', sales: 12, revenue: 1200, emoji: '🧴' },
    { material: 'Latas Metal', sales: 8, revenue: 680, emoji: '🥫' },
    { material: 'Cartón', sales: 7, revenue: 252, emoji: '📦' },
    { material: 'Vidrio', sales: 5, revenue: 250, emoji: '🫙' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-b border-emerald-200 dark:border-emerald-800 px-6 md:px-8 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">📊 Estadísticas</h1>
          
          {/* Time Range Selector */}
          <div className="flex gap-2">
            {(['mes', 'trimestre', 'año'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  timeRange === range
                    ? 'bg-emerald-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                {range === 'mes' ? 'Este Mes' : range === 'trimestre' ? 'Este Trimestre' : 'Este Año'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 max-w-7xl mx-auto w-full space-y-6">
        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            const colorBg = {
              emerald: 'bg-emerald-100 dark:bg-emerald-900/30',
              teal: 'bg-teal-100 dark:bg-teal-900/30',
              green: 'bg-green-100 dark:bg-green-900/30',
              cyan: 'bg-cyan-100 dark:bg-cyan-900/30',
            }[stat.color];

            const colorText = {
              emerald: 'text-emerald-600 dark:text-emerald-400',
              teal: 'text-teal-600 dark:text-teal-400',
              green: 'text-green-600 dark:text-green-400',
              cyan: 'text-cyan-600 dark:text-cyan-400',
            }[stat.color];

            return (
              <div
                key={stat.label}
                className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-emerald-200 dark:border-emerald-700 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">{stat.label}</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{stat.value}</p>
                    <p className={`text-sm font-semibold mt-2 ${colorText}`}>
                      {stat.change} vs período anterior
                    </p>
                  </div>
                  <div className={`p-3 rounded-lg ${colorBg}`}>
                    <Icon className={`w-6 h-6 ${colorText}`} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Performance by Category */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-emerald-200 dark:border-emerald-700 p-6 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-emerald-600" />
            Desempeño por Categoría
          </h2>

          <div className="space-y-4">
            {performanceByCategory.map((cat) => (
              <div key={cat.name} className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-900 dark:text-white">{cat.name}</span>
                    <span className="text-xs bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 px-2 py-1 rounded">
                      {cat.publications} publicaciones
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900 dark:text-white">{cat.views} vistas</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{cat.contacts} contactos</p>
                  </div>
                </div>
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-400 to-teal-500"
                    style={{ width: `${(cat.views / 340) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Performers */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-emerald-200 dark:border-emerald-700 p-6 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-emerald-600" />
            Mejores Desempeños
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {topPerformers.map((performer, idx) => (
              <div
                key={performer.material}
                className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-xl p-4 border border-emerald-200 dark:border-emerald-700"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-4xl">{performer.emoji}</span>
                  <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">#{idx + 1}</span>
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">{performer.material}</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Ventas:</span>
                    <span className="font-bold text-gray-900 dark:text-white">{performer.sales}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Ingresos:</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">${performer.revenue}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Timeline Activity */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-emerald-200 dark:border-emerald-700 p-6 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <Calendar className="w-6 h-6 text-emerald-600" />
            Actividad Timeline
          </h2>

          <div className="space-y-3">
            {[
              { date: 'Hoy', activity: '3 nuevas publicaciones', icon: '📝' },
              { date: 'Ayer', activity: '8 contactos recibidos', icon: '💬' },
              { date: 'Hace 2 días', activity: '2 transacciones completadas', icon: '✅' },
              { date: 'Hace 3 días', activity: 'Perfil actualizado', icon: '👤' },
            ].map((item) => (
              <div key={item.date} className="flex items-center gap-4 pb-3 border-b border-gray-200 dark:border-gray-700 last:border-b-0">
                <span className="text-2xl">{item.icon}</span>
                <div className="flex-1">
                  <p className="font-medium text-gray-900 dark:text-white">{item.activity}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{item.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bento Dashboard Preview */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Panel General</h2>
          <BentoDashboard />
        </div>
      </div>
    </div>
  );
}

