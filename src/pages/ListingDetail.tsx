import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPin, Calendar, Clock, DollarSign, Package, Info, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';
import { mockProducts, Product } from '../data/mockProducts';

interface Offer {
  id: number;
  collectorId: number;
  price: number;
  suggestedDate: string;
  suggestedTime: string;
  status: 'pending' | 'accepted' | 'rejected';
}

const formatPrice = (price: number, currency: string, type: Product['type']) => {
  if (type === 'donacion' || price === 0) {
    return <span className="text-green-600 font-semibold">Gratis / Donación</span>;
  }
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: currency }).format(price);
};

const ListingDetail = () => {
  const { id } = useParams<{ id: string }>();
  const product = mockProducts.find(p => p.id === id);

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showOfferForm, setShowOfferForm] = useState(false);
  const [offer, setOffer] = useState<Partial<Offer>>({
    price: product?.type === 'venta' ? product.price : 0,
    suggestedDate: '',
    suggestedTime: '',
  });

  const isVerifiedCollector = true;

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-4">¡Error!</h1>
        <p className="text-gray-600">No se encontró el listado solicitado.</p>
        <Link to="/" className="mt-6 inline-flex items-center gap-2 text-emerald-600 hover:underline">
          <ArrowLeft size={16}/> Volver al inicio
        </Link>
      </div>
    );
  }

  const images = [product.imageUrl];

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? images.length - 1 : prev - 1
    );
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => 
      prev === images.length - 1 ? 0 : prev + 1
    );
  };

  const handleSubmitOffer = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Oferta enviada:', offer);
    setShowOfferForm(false);
    alert('Oferta enviada (simulación)');
  };

  const getStatusBadge = () => {
    return (
      <span className={`bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-sm font-medium`}>
        Disponible
      </span>
    );
  };
  
  const priceDisplay = formatPrice(product.price, product.currency, product.type);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="relative h-96">
          <img
            src={images[currentImageIndex]}
            alt={product.title}
            className="w-full h-full object-cover"
          />
          {images.length > 1 && (
            <>
              <div className="absolute inset-0 flex items-center justify-between px-4">
                <button
                  onClick={handlePrevImage}
                  className="bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75"
                >
                  ←
                </button>
                <button
                  onClick={handleNextImage}
                  className="bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75"
                >
                  →
                </button>
              </div>
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                {images.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`w-2 h-2 rounded-full ${
                      index === currentImageIndex ? 'bg-white' : 'bg-white bg-opacity-50'
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {product.title}
              </h1>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {product.location.replace('📍 ', '')}
                </span>
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${product.category === 'PET' ? 'bg-blue-100 text-blue-700' : product.category === 'Cartón' ? 'bg-yellow-100 text-yellow-700' : product.category === 'Vidrio' ? 'bg-green-100 text-green-700' : product.category === 'Metal' ? 'bg-red-100 text-red-700' : product.category === 'Electrónicos' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'}`}>
                  {product.category}
                </span>
              </div>
            </div>
            {getStatusBadge()}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-6">
               <div>
                  <h2 className="text-lg font-semibold mb-2">Descripción detallada</h2>
                  <p className="text-gray-600 whitespace-pre-wrap">{product.description}</p>
                </div>
                
                <div>
                  <h2 className="text-lg font-semibold mb-2">Información Adicional</h2>
                   <dl className="space-y-1 text-sm">
                     <div className="flex">
                       <dt className="w-28 flex-shrink-0 text-gray-500">Municipio:</dt>
                       <dd>{product.municipality}</dd>
                     </div>
                     <div className="flex">
                       <dt className="w-28 flex-shrink-0 text-gray-500">Dirección aprox.:</dt>
                       <dd>{product.address}</dd> 
                     </div>
                     <div className="flex">
                       <dt className="w-28 flex-shrink-0 text-gray-500">Tipo:</dt>
                       <dd className={`font-medium ${product.type === 'donacion' ? 'text-green-600' : 'text-blue-600'}`}>{product.type === 'donacion' ? 'Donación' : 'Venta'}</dd>
                     </div>
                   </dl>
                </div>

                <div>
                  <h2 className="text-lg font-semibold mb-2">Publicado por</h2>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-lg font-semibold text-gray-500">
                      {product.municipality.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium">Usuario de {product.municipality}</p>
                      <div className="flex items-center gap-2">
                        {product.verified && (
                          <span className="flex items-center text-sm text-emerald-600">
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Verificado
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
            </div>

            <div className="md:col-span-1">
              <div className="bg-gray-50 rounded-lg p-5 sticky top-24">
                <h2 className="text-xl font-bold mb-1 text-center">{product.type === 'donacion' ? 'Solicitar Donación' : 'Hacer una Oferta'}</h2>
                <p className="text-2xl font-bold text-emerald-700 mb-4 text-center">
                  {priceDisplay}
                   {product.type === 'venta' && <span className="text-sm font-normal text-gray-500"> / kg</span>} 
                </p>
                
                {!isVerifiedCollector ? (
                   <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                     <div className="flex items-start gap-3">
                       <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                       <div>
                         <h3 className="font-medium text-yellow-800">Verificación requerida</h3>
                         <p className="text-sm text-yellow-700 mt-1">
                           Para ofertar o solicitar necesitas ser un usuario verificado.
                           <Link to="/perfil" className="text-yellow-800 underline ml-1">
                             Verificar mi cuenta
                           </Link>
                         </p>
                       </div>
                     </div>
                   </div>
                ) : (
                  <form onSubmit={handleSubmitOffer} className="space-y-4">
                    {product.type === 'venta' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Precio ofertado (MXN/kg)
                        </label>
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                          <input
                            type="number"
                            step="0.50"
                            value={offer.price}
                            onChange={(e) => setOffer({ ...offer, price: parseFloat(e.target.value) })}
                            className="pl-10 w-full p-2 border border-gray-200 rounded-lg focus:ring-emerald-500 focus:border-emerald-500"
                            placeholder={product.price.toFixed(2)}
                            required
                          />
                        </div>
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {product.type === 'donacion' ? 'Fecha sugerida de recolección' : 'Fecha sugerida'}
                      </label>
                      <input
                        type="date"
                        value={offer.suggestedDate}
                        onChange={(e) => setOffer({ ...offer, suggestedDate: e.target.value })}
                        className="w-full p-2 border border-gray-200 rounded-lg focus:ring-emerald-500 focus:border-emerald-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {product.type === 'donacion' ? 'Hora sugerida de recolección' : 'Hora sugerida'}
                      </label>
                      <input
                        type="time"
                        value={offer.suggestedTime}
                        onChange={(e) => setOffer({ ...offer, suggestedTime: e.target.value })}
                        className="w-full p-2 border border-gray-200 rounded-lg focus:ring-emerald-500 focus:border-emerald-500"
                        required
                      />
                    </div>
                    <button 
                      type="submit"
                      className="w-full bg-emerald-600 text-white py-2.5 px-4 rounded-lg hover:bg-emerald-700 transition font-medium">
                       {product.type === 'donacion' ? 'Solicitar Recolección' : 'Enviar Oferta'}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListingDetail;