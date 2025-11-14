import React from 'react';
import { useParams } from 'react-router-dom';
import { Star, MapPin, Truck, CheckCircle, ShieldCheck, MessageSquare } from 'lucide-react';

// Simulación de datos de recolector
const mockCollector = {
  id: 'colA',
  name: 'Recolectora Veloz',
  rating: 4.8,
  reviewsCount: 35,
  memberSince: '2023-05-15',
  isVerified: true,
  zones: ['Monterrey Centro', 'San Pedro', 'San Jerónimo'],
  materials: ['PET', 'Cartón', 'Aluminio', 'Papel'],
  bio: 'Recolectora independiente con experiencia en recolección eficiente y puntual en zonas céntricas. Ofrecemos servicio rápido y confiable.',
  vehicle: 'Camioneta Pickup',
  reviews: [
    { id: 'r1', userName: 'Empresa ABC', rating: 5, comment: 'Excelente servicio, muy puntuales.', date: '2024-08-20' },
    { id: 'r2', userName: 'Juan Pérez', rating: 4, comment: 'Buena comunicación, aunque tardó un poco en llegar.', date: '2024-07-10' },
  ]
};

const RecolectorProfile = () => {
  const { id } = useParams<{ id: string }>();
  // Buscar recolector por ID
  const collector = mockCollector; 

  if (!collector) {
    return <div className="container mx-auto p-4">Perfil de recolector no encontrado.</div>;
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
       <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm mb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-4">
               {/* Idealmente aquí iría una imagen de perfil */}
               <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 font-bold text-2xl flex-shrink-0">
                 {collector.name.charAt(0)}
               </div>
               <div className="flex-grow">
                 <h2 className="text-2xl font-semibold flex items-center gap-2">
                   {collector.name}
                   {collector.isVerified && <ShieldCheck size={20} className="text-blue-500" />}
                 </h2>
                 <div className="flex items-center gap-2 text-sm text-yellow-500 mt-1">
                   <Star size={16} fill="currentColor"/>
                   <span>{collector.rating.toFixed(1)} ({collector.reviewsCount} reseñas)</span>
                 </div>
                 <p className="text-xs text-gray-500 mt-1">Miembro desde: {collector.memberSince}</p>
               </div>
               <button className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 text-sm flex items-center gap-2 mt-2 sm:mt-0">
                 <MessageSquare size={16}/> Contactar Recolector
               </button>
            </div>
            
             <p className="text-sm text-gray-700 mb-4">{collector.bio}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                   <h4 className="font-semibold mb-1 flex items-center gap-1"><MapPin size={14}/> Zonas de Operación:</h4>
                   <div className="flex flex-wrap gap-1">
                       {collector.zones.map(zone => (
                           <span key={zone} className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full text-xs">{zone}</span>
                       ))}
                   </div>
                </div>
                 <div>
                   <h4 className="font-semibold mb-1 flex items-center gap-1"><CheckCircle size={14}/> Materiales Recolectados:</h4>
                   <div className="flex flex-wrap gap-1">
                       {collector.materials.map(mat => (
                           <span key={mat} className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-xs">{mat}</span>
                       ))}
                   </div>
                </div>
                <div>
                   <h4 className="font-semibold mb-1 flex items-center gap-1"><Truck size={14}/> Vehículo Principal:</h4>
                   <p className="text-gray-600">{collector.vehicle}</p>
                </div>
            </div>
       </div>

       {/* Sección de Reseñas */} 
       <h3 className="text-xl font-semibold mb-4">Reseñas Recientes</h3>
       {collector.reviews.length > 0 ? (
           <div className="space-y-4">
               {collector.reviews.map(review => (
                   <div key={review.id} className="bg-white p-4 rounded-lg border border-gray-100">
                       <div className="flex items-center justify-between mb-1">
                           <span className="font-medium text-sm text-gray-800">{review.userName}</span>
                           <span className="text-yellow-500 flex items-center gap-1 text-sm"><Star size={14} fill="currentColor"/> {review.rating}</span>
                       </div>
                       <p className="text-sm text-gray-600 mb-1">{review.comment}</p>
                       <p className="text-xs text-gray-400">{review.date}</p>
                   </div>
               ))}
           </div>
       ) : (
           <p className="text-gray-500 italic">Este recolector aún no tiene reseñas.</p>
       )}
       {/* TODO: Añadir botón para dejar reseña si aplica */} 

    </div>
  );
};

export default RecolectorProfile; 