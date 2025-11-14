import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FileText, Search, MessageSquare, BarChart2, Star, PlusCircle, Map, ShoppingCart, PackageCheck, User } from 'lucide-react';

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

// --- Componente Principal BuyerDashboard --- 
const BuyerDashboard = () => {
  const { userName } = useAuth();

  // --- Datos Simulados --- 
  const activeRequests = [
    { id: 'reqA', material: 'PET Cristal', quantity: '500kg', status: 'Activa', offers: 2 },
    { id: 'reqB', material: 'Cartón OCC', quantity: '1 Ton', status: 'Activa', offers: 0 },
    { id: 'reqC', material: 'Aluminio (Latas)', quantity: '100kg', status: 'Pausada', offers: 1 },
  ];

  const nearbyMaterials = [
    { id: 'matA', title: '♻️ Botellas PET (50kg)', seller: 'Vecino Eco', price: '8.50', distance: '1.2km' },
    { id: 'matB', title: '📦 Cartón Corrugado (Grande)', seller: 'Tiendita Verde', price: '2.00', distance: '3.5km' },
  ];

  const sentOffers = [
    { id: 'offA', material: 'HDPE Natural', seller: 'Plásticos Del Norte', quantity: '200kg', price: '12.00', status: 'Pendiente' },
    { id: 'offB', material: 'Vidrio Claro', seller: 'Juan Pérez', quantity: '30kg', price: '1.50', status: 'Aceptada' },
  ];

  const stats = {
    comprasMes: 5,
    materialMasComprado: 'PET',
    ahorroEstimado: 750,
  };

  const suggestedCollectors = [
    { id: 'colA', name: 'Recolectora Veloz', rating: 4.8, zones: ['Monterrey Centro', 'San Pedro'] },
    { id: 'colB', name: 'EcoTransporte Regio', rating: 4.5, zones: ['Apodaca', 'Escobedo'] },
  ];

  return (
    <div>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h2 className="text-2xl font-semibold">Panel de Comprador</h2>
            <p className="text-gray-600">¡Bienvenido, {userName || 'Comprador'}!</p>
          </div>
          <div className="flex gap-2">
            <Link 
              to="/explorar" // Link a buscar materiales
              className="bg-white border border-emerald-600 text-emerald-600 px-4 py-2 rounded-lg hover:bg-emerald-50 transition-colors text-sm font-medium flex items-center gap-2"
            >
              <Search size={16}/> Buscar Materiales
            </Link>
             <Link 
              to="/crear-solicitud" // TODO: Crear esta ruta
              className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors text-sm font-medium flex items-center gap-2"
            >
              <PlusCircle size={16}/> Crear Solicitud
            </Link>
          </div>
        </div>

      {/* --- Secciones del Dashboard --- */} 
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* 1. Mis Solicitudes Activas */}
        <DashboardSection title="Mis Solicitudes Activas" icon={FileText}>
            {activeRequests.map(req => (
                <div key={req.id} className="p-3 bg-gray-50 rounded border border-gray-200">
                    <p className="font-medium">{req.material} ({req.quantity})</p>
                    <div className="flex justify-between items-center text-xs mt-1">
                        <span className={`px-1.5 py-0.5 rounded ${req.status === 'Activa' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{req.status}</span>
                        <span>{req.offers} Ofertas Recibidas</span>
                        <Link to={`/solicitud/${req.id}`} className="text-emerald-600 hover:underline">Ver Detalles</Link>
                    </div>
                </div>
            ))}
             {activeRequests.length === 0 && <p className="italic text-gray-500">No tienes solicitudes activas.</p>}
        </DashboardSection>

        {/* 2. Materiales Disponibles Cerca */}
        <DashboardSection title="Materiales Disponibles Cerca" icon={Map}>
            {nearbyMaterials.map(mat => (
                <div key={mat.id} className="p-3 bg-gray-50 rounded border border-gray-200">
                    <p className="font-medium text-sm"><Link to={`/listado/${mat.id}`} className="hover:text-emerald-700">{mat.title}</Link></p>
                     <div className="flex justify-between items-center text-xs mt-1 text-gray-600">
                        <span>Vendedor: {mat.seller}</span>
                        <span>${mat.price}/kg</span>
                        <span>~{mat.distance}</span>
                     </div>
                </div>
            ))}
            {nearbyMaterials.length === 0 && <p className="italic text-gray-500">No hay materiales disponibles cerca ahora mismo.</p>}
            <Link to="/explorar" className="text-emerald-600 hover:underline text-xs block mt-2">Ver todos los materiales cercanos</Link>
        </DashboardSection>

        {/* 3. Ofertas Enviadas y Estado */}
        <DashboardSection title="Ofertas Enviadas y Estado" icon={MessageSquare}>
           {sentOffers.map(offer => (
               <div key={offer.id} className="p-3 bg-gray-50 rounded border border-gray-200">
                  <p className="font-medium text-sm">Oferta por {offer.material} ({offer.quantity}) a {offer.seller}</p>
                  <div className="flex justify-between items-center text-xs mt-1">
                      <span className={`px-1.5 py-0.5 rounded ${offer.status === 'Pendiente' ? 'bg-yellow-100 text-yellow-700' : offer.status === 'Aceptada' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{offer.status}</span>
                      <span>${offer.price}/kg</span>
                      <Link to={`/oferta/${offer.id}`} className="text-emerald-600 hover:underline">Ver Oferta</Link>
                  </div>
               </div>
           ))}
           {sentOffers.length === 0 && <p className="italic text-gray-500">No has enviado ninguna oferta recientemente.</p>}
        </DashboardSection>

        {/* 4. Estadísticas Personales */}
        <DashboardSection title="Estadísticas Personales" icon={BarChart2}>
           <div className="flex justify-around text-center">
              <div>
                  <p className="text-2xl font-semibold text-emerald-600">{stats.comprasMes}</p>
                  <p className="text-xs text-gray-500">Compras este Mes</p>
              </div>
               <div>
                  <p className="text-lg font-medium text-emerald-600">{stats.materialMasComprado}</p>
                  <p className="text-xs text-gray-500">Material Más Comprado</p>
              </div>
               <div>
                  <p className="text-lg font-medium text-emerald-600">${stats.ahorroEstimado}</p>
                  <p className="text-xs text-gray-500">Ahorro Estimado</p>
              </div>
           </div>
           {/* Aquí podría ir un gráfico pequeño */} 
        </DashboardSection>
        
         {/* 5. Recolectores Sugeridos / Verificados */}
         <DashboardSection title="Recolectores Sugeridos / Verificados" icon={Star}>
           {suggestedCollectors.map(col => (
               <div key={col.id} className="p-3 bg-gray-50 rounded border border-gray-200 flex justify-between items-center">
                  <div>
                     <p className="font-medium text-sm flex items-center gap-1"><User size={14}/> {col.name}</p>
                     <p className="text-xs text-gray-500 mt-1">Zonas: {col.zones.join(', ')}</p>
                  </div>
                   <div className="text-right">
                       <span className="text-yellow-500 flex items-center gap-0.5"><Star size={14} fill="currentColor"/> {col.rating.toFixed(1)}</span>
                       <Link to={`/recolector/${col.id}`} className="text-emerald-600 hover:underline text-xs block mt-1">Ver Perfil</Link>
                   </div>
               </div>
           ))}
           {suggestedCollectors.length === 0 && <p className="italic text-gray-500">No hay recolectores sugeridos por ahora.</p>}
        </DashboardSection>
        
      </div>
    </div>
  );
};

export default BuyerDashboard; 