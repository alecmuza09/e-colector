import React from 'react';
import { TrendingUp, Activity, Users, Zap, ArrowUpRight, Target, Clock } from 'lucide-react';

interface BentoCardProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

const BentoCard: React.FC<BentoCardProps> = ({ title, children, className = '', hover = true }) => (
  <div
    className={`bg-gradient-to-br from-white via-emerald-50 to-teal-50 dark:from-gray-800 dark:via-emerald-900/30 dark:to-teal-900/30 rounded-2xl p-6 border border-emerald-200 dark:border-emerald-700 shadow-sm ${
      hover ? 'hover:shadow-lg hover:border-emerald-400 transition-all duration-300' : ''
    } ${className}`}
  >
    {title && <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-300 mb-4 uppercase tracking-wider">{title}</h3>}
    {children}
  </div>
);

export function BentoDashboard() {
  return (
    <div className="space-y-6">
      {/* Header Stats - Row 1 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Listings */}
        <BentoCard>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-2xl font-bold text-emerald-600">342</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Publicaciones</p>
            </div>
            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/50 rounded-lg">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
            </div>
          </div>
          <div className="mt-3 flex items-center gap-1 text-xs text-emerald-600 font-medium">
            <ArrowUpRight className="w-3 h-3" />
            +12% este mes
          </div>
        </BentoCard>

        {/* Active Users */}
        <BentoCard>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-2xl font-bold text-teal-600">1,248</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Usuarios Activos</p>
            </div>
            <div className="p-2 bg-teal-100 dark:bg-teal-900/50 rounded-lg">
              <Users className="w-5 h-5 text-teal-600" />
            </div>
          </div>
          <div className="mt-3 flex items-center gap-1 text-xs text-teal-600 font-medium">
            <ArrowUpRight className="w-3 h-3" />
            +8% esta semana
          </div>
        </BentoCard>

        {/* Transactions */}
        <BentoCard>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-2xl font-bold text-green-600">156</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Transacciones</p>
            </div>
            <div className="p-2 bg-green-100 dark:bg-green-900/50 rounded-lg">
              <Activity className="w-5 h-5 text-green-600" />
            </div>
          </div>
          <div className="mt-3 flex items-center gap-1 text-xs text-green-600 font-medium">
            <ArrowUpRight className="w-3 h-3" />
            +24% este mes
          </div>
        </BentoCard>

        {/* Energy Score */}
        <BentoCard>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-2xl font-bold text-blue-600">87%</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Sostenibilidad</p>
            </div>
            <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
              <Zap className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <div className="mt-3 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-blue-400 to-cyan-400 w-[87%]"></div>
          </div>
        </BentoCard>
      </div>

      {/* Main Content - Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Top Categories - Large Card */}
        <BentoCard className="lg:col-span-2" title="Categorías Populares">
          <div className="space-y-3">
            {[
              { name: 'PET', color: 'emerald', value: 45, icon: '🧴' },
              { name: 'Metal', color: 'blue', value: 28, icon: '🥫' },
              { name: 'Cartón', color: 'amber', value: 18, icon: '📦' },
              { name: 'Electrónicos', color: 'purple', value: 9, icon: '💻' },
            ].map((cat) => (
              <div key={cat.name} className="flex items-center gap-3">
                <span className="text-2xl">{cat.icon}</span>
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{cat.name}</p>
                    <span className="text-xs font-bold text-gray-600 dark:text-gray-400">{cat.value}%</span>
                  </div>
                  <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r from-${cat.color}-400 to-${cat.color}-500`}
                      style={{
                        width: `${cat.value}%`,
                        background: cat.color === 'emerald' ? 'linear-gradient(90deg, #34d399, #10b981)' :
                                  cat.color === 'blue' ? 'linear-gradient(90deg, #60a5fa, #3b82f6)' :
                                  cat.color === 'amber' ? 'linear-gradient(90deg, #fbbf24, #f59e0b)' :
                                  'linear-gradient(90deg, #a78bfa, #8b5cf6)'
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </BentoCard>

        {/* Recent Activity */}
        <BentoCard title="Actividad">
          <div className="space-y-2">
            {[
              { time: 'Hace 2h', action: 'Nueva publicación', icon: '📍' },
              { time: 'Hace 4h', action: 'Contacto recibido', icon: '💬' },
              { time: 'Hace 1d', action: 'Transacción', icon: '✅' },
            ].map((activity, idx) => (
              <div key={idx} className="flex items-start gap-3 pb-3 border-b border-gray-200 dark:border-gray-700 last:border-b-0">
                <span className="text-lg">{activity.icon}</span>
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{activity.action}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-500">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </BentoCard>
      </div>

      {/* Row 3 - Map Stats & Leaderboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Geographic Distribution */}
        <BentoCard className="lg:col-span-2" title="Cobertura Geográfica">
          <div className="grid grid-cols-2 gap-3">
            {[
              { name: 'Monterrey', count: 45, emoji: '🏙️' },
              { name: 'San Nicolás', count: 32, emoji: '🏢' },
              { name: 'Apodaca', count: 28, emoji: '🏭' },
              { name: 'Guadalupe', count: 24, emoji: '🌳' },
              { name: 'Escobedo', count: 18, emoji: '🏗️' },
              { name: 'Santa Catarina', count: 15, emoji: '🌄' },
            ].map((city) => (
              <div key={city.name} className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/30 dark:to-teal-900/30 rounded-lg p-3 border border-emerald-200 dark:border-emerald-700">
                <p className="text-2xl mb-1">{city.emoji}</p>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{city.name}</p>
                <p className="text-lg font-bold text-emerald-600 mt-1">{city.count}</p>
              </div>
            ))}
          </div>
        </BentoCard>

        {/* Quick Stats */}
        <BentoCard title="Estadísticas">
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Tasa Conversión</span>
                <span className="text-sm font-bold text-emerald-600">68%</span>
              </div>
              <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 w-[68%]"></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Verificación</span>
                <span className="text-sm font-bold text-teal-600">92%</span>
              </div>
              <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-teal-400 to-teal-600 w-[92%]"></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Satisfacción</span>
                <span className="text-sm font-bold text-cyan-600">94%</span>
              </div>
              <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-cyan-400 to-cyan-600 w-[94%]"></div>
              </div>
            </div>
          </div>
        </BentoCard>
      </div>

      {/* Row 4 - Large Featured Card */}
      <BentoCard className="lg:col-span-3" title="Impacto Ambiental">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { label: 'KG Reciclados', value: '2,450', icon: '♻️', color: 'emerald' },
            { label: 'CO₂ Evitado', value: '1.2T', icon: '🌍', color: 'teal' },
            { label: 'Árboles Salvados', value: '18', icon: '🌳', color: 'green' },
            { label: 'Energía Ahorrada', value: '450kWh', icon: '⚡', color: 'blue' },
          ].map((stat) => (
            <div key={stat.label} className="text-center p-4 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-xl border border-emerald-200 dark:border-emerald-700">
              <p className="text-3xl mb-2">{stat.icon}</p>
              <p className="text-2xl font-bold text-emerald-600 mb-1">{stat.value}</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">{stat.label}</p>
            </div>
          ))}
        </div>
      </BentoCard>
    </div>
  );
}

