import React from 'react';
import { Link } from 'react-router-dom';
import { UserRole } from '../../types/user';

interface RoleSelectionProps {
  onSelectRole: (role: UserRole) => void;
}

const roles = [
  {
    role: UserRole.BUYER,
    emoji: '🏢',
    title: 'Comprador',
    subtitle: 'Empresas e industrias',
    description: 'Busco adquirir materiales reciclables para mi proceso industrial o comercial.',
    perks: ['Acceso a ofertas de materiales', 'Alertas por categoría', 'Contacto directo con generadores'],
    color: 'blue',
  },
  {
    role: UserRole.SELLER,
    emoji: '♻️',
    title: 'Vendedor / Generador',
    subtitle: 'Hogares y negocios',
    description: 'Genero residuos reciclables y quiero venderlos o que los recolecten.',
    perks: ['Publica materiales gratis', 'Recibe ofertas', 'Conecta con recolectores'],
    color: 'emerald',
  },
  {
    role: UserRole.COLLECTOR,
    emoji: '🚚',
    title: 'Recolector / Empresa',
    subtitle: 'Centros y empresas recicladoras',
    description: 'Ofrezco servicios de recolección, compra o procesamiento de materiales.',
    perks: ['Perfil verificado', 'Gestiona zonas de operación', 'Recibe solicitudes de recolección'],
    color: 'teal',
  },
];

const colorMap = {
  blue:    { border: 'hover:border-blue-500',    bg: 'group-hover:bg-blue-50',    badge: 'bg-blue-100 text-blue-700',    btn: 'bg-blue-600 hover:bg-blue-700',    icon: 'bg-blue-100' },
  emerald: { border: 'hover:border-emerald-500', bg: 'group-hover:bg-emerald-50', badge: 'bg-emerald-100 text-emerald-700', btn: 'bg-emerald-600 hover:bg-emerald-700', icon: 'bg-emerald-100' },
  teal:    { border: 'hover:border-teal-500',    bg: 'group-hover:bg-teal-50',    badge: 'bg-teal-100 text-teal-700',    btn: 'bg-teal-600 hover:bg-teal-700',    icon: 'bg-teal-100' },
};

const RoleSelection: React.FC<RoleSelectionProps> = ({ onSelectRole }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex flex-col">
      {/* Header */}
      <div className="py-8 text-center">
        <Link to="/" className="inline-flex items-center gap-2 hover:opacity-80 transition-opacity">
          <img src="/assets/images/logo-full.png" alt="e-colector" className="h-10 object-contain" />
        </Link>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-4 pb-12">
        <div className="w-full max-w-4xl">
          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
              ¿Cuál es tu rol en e-colector?
            </h1>
            <p className="text-gray-500 text-base max-w-md mx-auto">
              Elige el perfil que mejor describe cómo usarás la plataforma. Podrás cambiarlo después.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {roles.map(r => {
              const c = colorMap[r.color as keyof typeof colorMap];
              return (
                <button
                  key={r.role}
                  onClick={() => onSelectRole(r.role)}
                  className={`group relative flex flex-col items-start p-6 bg-white border-2 border-gray-200 ${c.border} rounded-2xl shadow-sm hover:shadow-lg transition-all duration-200 text-left`}
                >
                  <div className={`w-14 h-14 ${c.icon} rounded-2xl flex items-center justify-center text-3xl mb-4`}>
                    {r.emoji}
                  </div>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${c.badge} mb-3`}>
                    {r.subtitle}
                  </span>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{r.title}</h3>
                  <p className="text-sm text-gray-500 mb-4 leading-relaxed">{r.description}</p>
                  <ul className="space-y-1.5 mb-5 w-full">
                    {r.perks.map(p => (
                      <li key={p} className="flex items-center gap-2 text-xs text-gray-600">
                        <span className="w-4 h-4 bg-gray-100 rounded-full flex items-center justify-center text-[10px]">✓</span>
                        {p}
                      </li>
                    ))}
                  </ul>
                  <div className={`w-full py-2.5 ${c.btn} text-white text-sm font-semibold rounded-xl text-center transition-colors mt-auto`}>
                    Seleccionar →
                  </div>
                </button>
              );
            })}
          </div>

          <p className="text-center text-sm text-gray-500 mt-8">
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" className="text-emerald-600 hover:underline font-medium">
              Inicia sesión aquí
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RoleSelection;
