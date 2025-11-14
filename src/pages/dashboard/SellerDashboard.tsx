import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { mockProducts, Product } from '../../data/mockProducts'; // Importar productos para "Mis publicaciones"
import { Edit, Pause, Trash2, Check, RefreshCw, MessageSquare, AlertTriangle, MapPin, PlusCircle, Package, DollarSign, BarChart, Clock } from 'lucide-react';

// Definir un tipo que incluya el estado que añadimos en PublishListing
type UserProduct = Product & { status: 'activo' | 'pausado' | 'vendido' | 'expirado' };

// --- Subcomponente para Tarjeta de Publicación (Dashboard Vendedor) ---
const PublicationCard: React.FC<{ product: UserProduct; status: UserProduct['status'] }> = ({ product, status }) => {
  const statusStyles = {
    activo: 'bg-emerald-100 text-emerald-700',
    pausado: 'bg-yellow-100 text-yellow-700',
    vendido: 'bg-blue-100 text-blue-700',
    expirado: 'bg-gray-100 text-gray-500',
  };
  // Actualizar regex para extraer cantidad y unidad (kg o Ton)
  const quantityMatch = product.title.match(/\((\d*\.?\d+)\s*(kg|Ton)\)/i);
  const quantity = quantityMatch ? `${quantityMatch[1]} ${quantityMatch[2]}` : 'N/A';
  const titleWithoutQuantity = product.title.replace(/\s*\(.*\)/, '').trim(); // Título sin la parte de cantidad/unidad

  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm flex flex-col sm:flex-row gap-4">
      <img src={product.imageUrl} alt={titleWithoutQuantity} className="w-full sm:w-24 h-24 object-cover rounded flex-shrink-0" />
      <div className="flex-grow">
        <div className="flex justify-between items-start mb-1">
           <Link to={`/listado/${product.id}`} className="font-semibold text-gray-800 hover:text-emerald-600 text-sm sm:text-base">
             {titleWithoutQuantity} {/* Mostrar título limpio */}
           </Link>
           <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusStyles[status]}`}>{status.charAt(0).toUpperCase() + status.slice(1)}</span>
        </div>
        {/* Simular fecha de publicación */} 
        <p className="text-xs text-gray-500 mb-2">Publicado: {new Date(Date.now() - Math.random() * 10 * 24 * 60 * 60 * 1000).toLocaleDateString()}</p>
        <p className="text-sm text-gray-700 mb-3">Precio: ${product.price.toFixed(2)}/{product.title.match(/\(.*? (kg|Ton)\)/i)?.[1] || 'unidad'} | Cantidad aprox: {quantity}</p> 
        <div className="flex flex-wrap gap-2 text-xs mt-auto">
            {/* Botones varían según estado */} 
            {status === 'activo' && <button className="flex items-center gap-1 bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200"><Edit size={12}/> Editar</button>}
            {status === 'activo' && <button className="flex items-center gap-1 bg-yellow-100 text-yellow-700 px-2 py-1 rounded hover:bg-yellow-200"><Pause size={12}/> Pausar</button>}
            {status === 'pausado' && <button className="flex items-center gap-1 bg-green-100 text-green-700 px-2 py-1 rounded hover:bg-green-200"><Check size={12}/> Reactivar</button>}
            {(status === 'activo' || status === 'pausado') && <button className="flex items-center gap-1 bg-red-100 text-red-700 px-2 py-1 rounded hover:bg-red-200"><Trash2 size={12}/> Eliminar</button>}
            {status === 'activo' && <button className="flex items-center gap-1 bg-green-100 text-green-700 px-2 py-1 rounded hover:bg-green-200"><Check size={12}/> Vendido</button>}
            {status === 'expirado' && <button className="flex items-center gap-1 bg-gray-100 text-gray-600 px-2 py-1 rounded hover:bg-gray-200"><RefreshCw size={12}/> Renovar</button>}
        </div>
         <p className="text-xs text-gray-400 mt-2">Visitas: {Math.floor(Math.random()*100)} | Ofertas: {Math.floor(Math.random()*5)}</p>
      </div>
    </div>
  );
};

// --- Subcomponente para Fila de Oferta Recibida --- 
const OfferRow: React.FC<{ offer: any }> = ({ offer }) => {
    const statusStyles = {
    pendiente: 'bg-yellow-100 text-yellow-700',
    aceptada: 'bg-green-100 text-green-700',
    rechazada: 'bg-red-100 text-red-700',
    contraoferta: 'bg-blue-100 text-blue-700',
  };
  return (
      <div className="bg-white p-3 rounded border border-gray-100 mb-2 flex flex-col sm:flex-row justify-between items-start gap-2">
          <div>
              <p className="text-sm font-medium text-gray-800">Oferta para: <span className="font-semibold text-emerald-700">{offer.material}</span></p>
              <p className="text-xs text-gray-500">De: {offer.user} ({offer.userType}) | Precio: ${offer.price}/kg | Cantidad: {offer.quantity}</p>
              <p className="text-xs text-gray-500">Recolección: {offer.date} a las {offer.time}</p>
          </div>
          <div className="flex flex-col sm:items-end gap-2 w-full sm:w-auto flex-shrink-0">
             <span className={`text-xs font-medium px-2 py-0.5 rounded-full self-start sm:self-end ${statusStyles[offer.status as keyof typeof statusStyles]}`}>{offer.status.charAt(0).toUpperCase() + offer.status.slice(1)}</span>
             <div className="flex gap-2 mt-1">
                  <button className="text-xs bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600">Aceptar</button>
                  <button className="text-xs bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600">Rechazar</button>
                  <button className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600">Contraoferta</button>
                   <button className="text-xs bg-gray-500 text-white px-2 py-1 rounded hover:bg-gray-600"><MessageSquare size={12}/></button>
             </div>
          </div>
      </div>
  )
}

const SellerDashboard = () => {
  const { userName } = useAuth();
  // Estado para almacenar las publicaciones del usuario
  const [userProducts, setUserProducts] = useState<UserProduct[]>([]);

  // useEffect para cargar productos desde localStorage al montar
  useEffect(() => {
    const storedListingsRaw = localStorage.getItem('userListings');
    let listingsToDisplay: UserProduct[] = [];

    if (storedListingsRaw) {
      try {
        const parsedListings: Product[] = JSON.parse(storedListingsRaw);
        // Asegurarse de que cada producto tenga un estado (por defecto 'activo')
        listingsToDisplay = parsedListings.map(p => ({ 
            ...p, 
            // Asignar estado predeterminado o mantener si ya existe (aunque nuestro guardado actual siempre pone activo)
            status: (p as any).status || 'activo' 
        }));
      } catch (error) {
        console.error("Error al parsear listings de localStorage:", error);
        // Fallback a datos mock si hay error
         listingsToDisplay = [
            { ...mockProducts[0], status: 'activo' as const },
            { ...mockProducts[1], status: 'pausado' as const },
            { ...mockProducts[6], status: 'vendido' as const },
          ];
      }
    } else {
      // Si no hay nada en localStorage, usar los datos mock iniciales
        listingsToDisplay = [
            { ...mockProducts[0], status: 'activo' as const },
            { ...mockProducts[1], status: 'pausado' as const },
            { ...mockProducts[6], status: 'vendido' as const },
        ];
    }
    setUserProducts(listingsToDisplay);
  }, []); // El array vacío asegura que se ejecute solo una vez al montar

  const receivedOffers = [
      { id: 1, material: 'Botellas PET Cristal', user: 'Recicladora Monterrey', userType: 'Comprador', price: 9.00, quantity: '45kg', date: '2024-09-15', time: '10:00', status: 'pendiente' },
      { id: 2, material: 'Cartón Corrugado OCC', user: 'Recolector Independiente #3', userType: 'Recolector', price: 2.50, quantity: '100kg', date: '2024-09-14', time: '14:30', status: 'aceptada' },
      { id: 3, material: 'Botellas PET Cristal', user: 'Manualidades Creativas', userType: 'Comprador', price: 8.50, quantity: '10kg', date: '2024-09-13', time: 'Tarde', status: 'rechazada' },
  ];
  
  const userZones = [
      { id: 'z1', name: 'Casa Principal', address: 'Av. Siempre Viva 123, Monterrey', type: 'Hogar', materials: ['PET', 'Cartón'] },
      { id: 'z2', name: 'Oficina Centro', address: 'Calle Morelos 500, Monterrey', type: 'Negocio', materials: ['Papel', 'Electrónicos'] },
  ];

  const nearbyRequests = [
      { id: 'req1', material: 'Aluminio (Latas)', quantity: '~20kg', price: 'Pago justo', location: 'San Nicolás', user: 'Comercio Local' },
      { id: 'req2', material: 'HDPE (Envases)', quantity: '>50kg', price: 'A tratar', location: 'Monterrey Sur', user: 'Taller Mecánico' },
  ];

   const materialHistory = [
    { id: 'h1', material: 'Archivo Muerto', date: '10/08/2024', status: 'Vendido', quantity: '55kg', buyer: 'Papelera Regional' },
    { id: 'h2', material: 'Chatarra Electrónica', date: '05/08/2024', status: 'Donado', quantity: 'N/A', buyer: 'Centro Comunitario' },
    { id: 'h3', material: 'Vidrio (Frascos)', date: '01/08/2024', status: 'Expirado', quantity: 'N/A', buyer: '-' },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
           <h2 className="text-2xl font-semibold">Panel de Vendedor / Generador</h2>
           <p className="text-gray-600">¡Bienvenido, {userName || 'Vendedor'}!</p>
        </div>
         <Link 
          to="/publicar" 
          className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors text-sm font-medium flex items-center gap-2"
        >
          <PlusCircle size={16}/> Publicar Material
        </Link>
      </div>

      <div className="space-y-8">
          {/* 1. Mis publicaciones activas */} 
          <section>
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2"><Package size={20}/> Mis Publicaciones</h3>
            <div className="space-y-4">
              {userProducts.length > 0 ? (
                 userProducts.map(p => <PublicationCard key={p.id} product={p} status={p.status} />)
              ) : (
                 <p className="text-gray-500 italic p-4 bg-gray-50 rounded text-center">No tienes publicaciones activas.</p>
              )}
            </div>
          </section>
          
          {/* 2. Ofertas recibidas */} 
          <section>
             <h3 className="text-xl font-semibold mb-4 flex items-center gap-2"><DollarSign size={20}/> Ofertas Recibidas</h3>
             <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
               {receivedOffers.length > 0 ? (
                  receivedOffers.map(offer => <OfferRow key={offer.id} offer={offer} />)
               ) : (
                  <p className="text-gray-500 italic text-center py-4">No has recibido ofertas.</p>
               )}
             </div>
          </section>
          
          {/* 3. Zonas donde genero residuos */} 
          <section>
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2"><MapPin size={20}/> Mis Zonas de Generación</h3>
               <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm space-y-3">
                 {userZones.map(zone => (
                   <div key={zone.id} className="p-3 border-b border-gray-100 last:border-b-0">
                     <p className="font-medium text-gray-800">{zone.name} <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded ml-2">{zone.type}</span></p>
                     <p className="text-sm text-gray-600">{zone.address}</p>
                     <p className="text-xs text-gray-500 mt-1">Materiales: {zone.materials.join(', ')}</p>
                     {/* Botones Editar/Eliminar Placeholder */}
                     <div className="flex gap-2 mt-2">
                        <button className="text-xs text-blue-600 hover:underline">Editar</button>
                        <button className="text-xs text-red-600 hover:underline">Eliminar</button>
                     </div>
                   </div>
                 ))}
                 {userZones.length === 0 && <p className="text-gray-500 italic mb-4">No tienes zonas registradas.</p>}
                 <button className="bg-blue-500 text-white px-3 py-1.5 rounded text-sm hover:bg-blue-600 flex items-center gap-1 mt-3">
                   <PlusCircle size={14}/> Añadir Zona
                 </button>
               </div>
          </section>
          
           {/* 4. Solicitudes abiertas cercanas */} 
          <section>
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2"><AlertTriangle size={20}/> Solicitudes Abiertas Cercanas</h3>
               <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg space-y-3">
                   {nearbyRequests.map(req => (
                     <div key={req.id} className="bg-white p-3 rounded border border-gray-200 flex justify-between items-start">
                       <div>
                         <p className="text-sm font-medium">Se busca: <span className="text-emerald-700">{req.material} ({req.quantity})</span></p>
                         <p className="text-xs text-gray-500">Comprador: {req.user} | Ubicación: {req.location} | Precio: {req.price}</p>
                       </div>
                       <button className="text-xs bg-emerald-500 text-white px-2 py-1 rounded mt-1 hover:bg-emerald-600 flex-shrink-0">Ofrecer</button>
                     </div>
                   ))}
                   {nearbyRequests.length === 0 && <p className="text-yellow-800 text-sm italic">No hay solicitudes cercanas que coincidan con tus materiales ahora.</p>}
               </div>
          </section>
          
          {/* 5. Historial de materiales */} 
          <section>
               <h3 className="text-xl font-semibold mb-4 flex items-center gap-2"><Clock size={20}/> Historial de Materiales</h3>
               <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                   {/* Placeholder de tabla */} 
                   <div className="overflow-x-auto">
                       <table className="min-w-full text-sm">
                           <thead className="bg-gray-50">
                               <tr>
                                   <th className="px-3 py-2 text-left font-medium text-gray-600">Material</th>
                                   <th className="px-3 py-2 text-left font-medium text-gray-600">Fecha</th>
                                   <th className="px-3 py-2 text-left font-medium text-gray-600">Estado</th>
                                   <th className="px-3 py-2 text-left font-medium text-gray-600">Cantidad</th>
                                   <th className="px-3 py-2 text-left font-medium text-gray-600">Comprador/Recolector</th>
                               </tr>
                           </thead>
                           <tbody className="divide-y divide-gray-100">
                               {materialHistory.map(item => (
                                   <tr key={item.id}>
                                       <td className="px-3 py-2 text-gray-700">{item.material}</td>
                                       <td className="px-3 py-2 text-gray-500">{item.date}</td>
                                       <td className="px-3 py-2"><span className={`text-xs font-medium px-2 py-0.5 rounded-full ${item.status === 'Vendido' ? 'bg-blue-100 text-blue-700' : item.status === 'Donado' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{item.status}</span></td>
                                       <td className="px-3 py-2 text-gray-500">{item.quantity}</td>
                                       <td className="px-3 py-2 text-gray-500">{item.buyer}</td>
                                   </tr>
                               ))}
                           </tbody>
                       </table>
                   </div>
                   <div className="mt-4 h-32 bg-gray-100 flex items-center justify-center text-gray-400 rounded text-xs">[ Gráfico de Volumen Mensual (Próximamente) ]</div>
               </div>
          </section>
      </div>
    </div>
  );
};

export default SellerDashboard; 