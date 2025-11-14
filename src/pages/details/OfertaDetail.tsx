import React from 'react';
import { useParams, Link } from 'react-router-dom';

// Simulación de datos de oferta
const mockOffer = {
  id: 'offA',
  material: 'HDPE Natural',
  seller: 'Plásticos Del Norte',
  sellerId: 'seller123', // Para enlace al perfil del vendedor
  quantity: '200kg',
  price: 12.00,
  status: 'Pendiente', // Pendiente, Aceptada, Rechazada, Retirada
  dateSent: '2024-09-11',
  message: 'Hola, estamos interesados en su HDPE Natural. Ofrecemos $12.00/kg y podemos recoger mañana.'
};

const OfertaDetail = () => {
  const { id } = useParams<{ id: string }>();
  // Aquí buscarías la oferta por ID
  const offer = mockOffer; 

  if (!offer) {
    return <div className="container mx-auto p-4">Oferta no encontrada.</div>;
  }

  const statusStyles = {
    Pendiente: 'bg-yellow-100 text-yellow-700',
    Aceptada: 'bg-green-100 text-green-700',
    Rechazada: 'bg-red-100 text-red-700',
    Retirada: 'bg-gray-100 text-gray-500',
  };

  return (
    <div className="container mx-auto p-4 md:p-8">
      <h2 className="text-2xl font-semibold mb-4">Detalles de la Oferta Enviada</h2>
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm mb-6">
        <p className="mb-2"><span className="font-semibold">Material:</span> {offer.material}</p>
        <p className="mb-2"><span className="font-semibold">Vendedor:</span> 
          <Link to={`/perfil/${offer.sellerId}`} className="text-emerald-600 hover:underline ml-1">
             {offer.seller}
          </Link>
        </p>
        <p className="mb-2"><span className="font-semibold">Cantidad Ofertada:</span> {offer.quantity}</p>
        <p className="mb-2"><span className="font-semibold">Precio Ofertado:</span> ${offer.price.toFixed(2)}/kg</p>
        <p className="mb-2"><span className="font-semibold">Estado:</span> 
           <span className={`ml-2 px-2 py-0.5 rounded text-xs ${statusStyles[offer.status as keyof typeof statusStyles]}`}>
            {offer.status}
          </span>
        </p>
        <p className="mb-2"><span className="font-semibold">Fecha de Envío:</span> {offer.dateSent}</p>
        <div className="mt-4 pt-4 border-t border-gray-100">
          <p className="font-semibold mb-1">Mensaje Enviado:</p>
          <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded">{offer.message}</p>
        </div>
      </div>

      {/* Acciones disponibles según el estado */} 
      {offer.status === 'Pendiente' && (
        <div className="flex gap-4">
          <button className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">Retirar Oferta</button>
           <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">Contactar Vendedor</button>
        </div>
      )}
       {offer.status === 'Aceptada' && (
         <div className="bg-green-50 p-4 rounded border border-green-200 text-green-800">
           <p className="font-semibold">¡Oferta Aceptada!</p>
           <p className="text-sm">Coordina los detalles de la entrega/recolección con el vendedor.</p>
            <button className="mt-2 bg-emerald-600 text-white px-3 py-1 rounded text-sm hover:bg-emerald-700">Contactar Vendedor</button>
         </div>
      )}
       {offer.status === 'Rechazada' && (
         <div className="bg-red-50 p-4 rounded border border-red-200 text-red-800">
           <p className="font-semibold">Oferta Rechazada</p>
           <p className="text-sm">Puedes intentar buscar otros materiales o ajustar tu oferta si es posible.</p>
           <Link to="/explorar" className="mt-2 inline-block bg-emerald-600 text-white px-3 py-1 rounded text-sm hover:bg-emerald-700">
             Buscar Materiales
           </Link>
         </div>
      )}
    </div>
  );
};

export default OfertaDetail; 