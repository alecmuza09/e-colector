import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Truck, PackageSearch, BarChartBig, UserCheck, CalendarClock, MapPinned, CheckCircle, Coins, User, Star } from 'lucide-react';

// --- Subcomponente reutilizable para secciones del Dashboard --- 
interface SectionProps {
  title: string;
  icon?: React.ElementType;
  children: React.ReactNode;
}
const DashboardSection: React.FC<SectionProps> = ({ title, icon: Icon, children }) => (
  <div className="bg-white p-4 sm:p-6 rounded-lg border border-gray-200 shadow-sm">
    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
      {Icon && <Icon size={18} className="text-emerald-600"/>}
      {title}
    </h3>
    <div className="text-sm text-gray-700 space-y-3">
      {children}
    </div>
  </div>
);

// --- Componente Principal CollectorDashboard --- 
const CollectorDashboard = () => {
  const { userName } = useAuth();

   // --- Datos Simulados --- 
   const activeCollections = [
    { id: 'colA', material: 'PET Mixto', address: 'Av. Revolución 123, Monterrey', date: 'Hoy, 3:00 PM', status: 'Confirmada' },
    { id: 'colB', material: 'Cartón y Papel', address: 'Calle Falsa 456, San Nicolás', date: 'Mañana, 10:00 AM', status: 'Pendiente' },
  ];

  const inventory = [
    { id: 'invA', material: 'Aluminio (Latas)', quantity: '85kg', source: 'Compra Directa', date: 'Ayer' },
    { id: 'invB', material: 'HDPE Color', quantity: '150kg', source: 'Recolección Programada', date: 'Hace 3 días' },
    { id: 'invC', material: 'PET Cristal', quantity: '220kg', source: 'Compra Directa', date: 'Ayer' },
  ];

  const performanceStats = {
    recoleccionesMes: 18,
    zonaMasActiva: 'Guadalupe Centro',
    calificacionPromedio: 4.7,
    materialMasRecolectado: 'Cartón OCC',
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-semibold">Panel de Recolector</h2>
          <p className="text-gray-600">¡Bienvenido, {userName || 'Recolector'}!</p>
        </div>
         <div className="flex gap-2">
            {/* TODO: Link a buscar oportunidades o mapa */}
            <Link 
                to="/explorar" 
                className="bg-white border border-emerald-600 text-emerald-600 px-4 py-2 rounded-lg hover:bg-emerald-50 transition-colors text-sm font-medium flex items-center gap-2"
            >
                <PackageSearch size={16}/> Buscar Materiales
            </Link>
            {/* TODO: Link a gestionar rutas o agenda */}
            <Link 
                to="/mis-recolecciones" // Ruta a definir
                className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors text-sm font-medium flex items-center gap-2"
            >
                <Truck size={16}/> Ver Recolecciones
            </Link>
        </div>
      </div>

      {/* --- Secciones del Dashboard --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* 1. Recolecciones Activas y Próximas */}
        <DashboardSection title="Recolecciones Activas y Próximas" icon={CalendarClock}>
          {activeCollections.map(col => (
              <div key={col.id} className="p-3 bg-gray-50 rounded border border-gray-200">
                 <p className="font-medium">{col.material}</p>
                 <p className="text-xs text-gray-500 flex items-center gap-1 mt-1"><MapPinned size={12}/> {col.address}</p>
                 <div className="flex justify-between items-center text-xs mt-1">
                     <span className={`px-1.5 py-0.5 rounded ${col.status === 'Confirmada' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'}`}>{col.status}</span>
                     <span>{col.date}</span>
                     <Link to={`/recoleccion/${col.id}`} className="text-emerald-600 hover:underline">Gestionar</Link>
                 </div>
              </div>
          ))}
          {activeCollections.length === 0 && <p className="italic text-gray-500">No tienes recolecciones programadas.</p>}
           <Link to="/mis-recolecciones" className="text-emerald-600 hover:underline text-xs block mt-2">Ver todas las recolecciones</Link>
        </DashboardSection>

        {/* 2. Compras / Inventario Recibido */} 
        <DashboardSection title="Inventario Reciente" icon={PackageSearch}>
           {inventory.map(item => (
               <div key={item.id} className="p-3 bg-gray-50 rounded border border-gray-200 flex justify-between items-center">
                  <div>
                     <p className="font-medium text-sm">{item.material} ({item.quantity})</p>
                     <p className="text-xs text-gray-500 mt-1">Fuente: {item.source} - {item.date}</p>
                  </div>
                   {/* Botón o info adicional */} 
                  <span className="text-xs text-gray-400">Detalles</span> 
               </div>
           ))}
           {inventory.length === 0 && <p className="italic text-gray-500">No has registrado inventario recientemente.</p>}
           <Link to="/inventario" className="text-emerald-600 hover:underline text-xs block mt-2">Gestionar Inventario</Link>
        </DashboardSection>

        {/* 3. Rendimiento como Recolector */}
        <DashboardSection title="Rendimiento como Recolector" icon={BarChartBig}>
            <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                    <p className="text-xl font-semibold text-emerald-600">{performanceStats.recoleccionesMes}</p>
                    <p className="text-xs text-gray-500">Recolecciones este Mes</p>
                </div>
                 <div>
                    <p className="text-yellow-500 flex items-center justify-center gap-1"><Star size={16} fill="currentColor"/> {performanceStats.calificacionPromedio.toFixed(1)}</p>
                    <p className="text-xs text-gray-500">Calificación Promedio</p>
                </div>
                 <div>
                    <p className="text-base font-medium text-emerald-600">{performanceStats.zonaMasActiva}</p>
                    <p className="text-xs text-gray-500">Zona Más Activa</p>
                </div>
                 <div>
                    <p className="text-base font-medium text-emerald-600">{performanceStats.materialMasRecolectado}</p>
                    <p className="text-xs text-gray-500">Material Más Recolectado</p>
                </div>
            </div>
           {/* Aquí podría ir un gráfico de rendimiento */} 
        </DashboardSection>

        {/* 4. Perfil de Recolector Verificado */}
        <DashboardSection title="Perfil de Recolector" icon={UserCheck}>
            <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded">
               <p className="text-sm text-green-800 flex items-center gap-2">
                  <CheckCircle size={16}/> Tu perfil está activo y verificado.
               </p>
                <Link to="/perfil/editar" className="text-emerald-600 hover:underline text-xs">Editar Perfil</Link>
            </div>
            <div className="mt-3 p-3 bg-gray-50 rounded border border-gray-200">
               <p className="text-sm font-medium mb-1">Próximo pago estimado:</p>
               <p className="text-lg font-semibold text-emerald-700 flex items-center gap-1"><Coins size={18}/> $ 1,250.00 MXN</p>
               <p className="text-xs text-gray-500 mt-1">Basado en recolecciones completadas.</p>
               <Link to="/pagos" className="text-emerald-600 hover:underline text-xs block mt-1">Ver Historial de Pagos</Link>
            </div>
        </DashboardSection>

      </div>
    </div>
  );
};

export default CollectorDashboard; 