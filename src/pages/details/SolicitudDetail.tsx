import React from 'react';
import { useParams } from 'react-router-dom';

// Simulación de datos de solicitud
const mockSolicitud = {
  id: 'reqA',
  material: 'PET Cristal',
  quantity: '500kg',
  status: 'Activa',
  description: 'Necesitamos PET Cristal limpio, preferiblemente sin etiquetas, para proceso de reciclaje. Recolección en zona Contry.',
  datePosted: '2024-09-10',
  offersReceived: [
    { id: 'off1', collectorName: 'Recolectora Rápida', price: 8.00, date: '2024-09-11' },
    { id: 'off2', collectorName: 'Eco Transports MX', price: 8.20, date: '2024-09-12' },
  ]
};

const SolicitudDetail = () => {
  const { id } = useParams<{ id: string }>();
  // Aquí normalmente buscarías la solicitud por ID, usamos datos simulados
  const solicitud = mockSolicitud; // En un caso real: fetchSolicitudById(id);

  if (!solicitud) {
    return <div className="container mx-auto p-4">Solicitud no encontrada.</div>;
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <h2 className="text-2xl font-semibold mb-4">Detalles de la Solicitud: {solicitud.material}</h2>
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm mb-6">
        <p className="mb-2"><span className="font-semibold">Material:</span> {solicitud.material}</p>
        <p className="mb-2"><span className="font-semibold">Cantidad Aprox:</span> {solicitud.quantity}</p>
        <p className="mb-2"><span className="font-semibold">Estado:</span>
          <span className={`ml-2 px-2 py-0.5 rounded text-xs ${solicitud.status === 'Activa' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
            {solicitud.status}
          </span>
        </p>
        <p className="mb-2"><span className="font-semibold">Fecha de Publicación:</span> {solicitud.datePosted}</p>
        <p className="text-sm text-gray-700 mt-4"><span className="font-semibold">Descripción:</span> {solicitud.description}</p>
      </div>

      <h3 className="text-xl font-semibold mb-4">Ofertas Recibidas ({solicitud.offersReceived.length})</h3>
      {solicitud.offersReceived.length > 0 ? (
        <div className="space-y-4">
          {solicitud.offersReceived.map(offer => (
            <div key={offer.id} className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm flex justify-between items-center">
              <div>
                <p className="font-medium text-gray-800">{offer.collectorName}</p>
                <p className="text-sm text-gray-600">Precio Ofertado: ${offer.price.toFixed(2)}/kg</p>
                <p className="text-xs text-gray-500">Fecha: {offer.date}</p>
              </div>
              <div className="flex gap-2">
                <button className="bg-emerald-500 text-white px-3 py-1 rounded text-sm hover:bg-emerald-600">Aceptar</button>
                <button className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600">Rechazar</button>
                <button className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600">Contactar</button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 italic">Aún no has recibido ofertas para esta solicitud.</p>
      )}

      {/* Botones de acción para la solicitud */} 
      <div className="mt-6 flex gap-4">
         <button className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600">Pausar Solicitud</button>
         <button className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">Editar Solicitud</button>
      </div>
    </div>
  );
};

export default SolicitudDetail; 