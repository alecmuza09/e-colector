import React from 'react';
import { Check } from 'lucide-react'; // Icono para listas de características
import { Button } from "@/components/ui/button";

const Pricing = () => {
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold text-center mb-4 text-emerald-700">💰 Planes y Precios</h1>
      <p className="text-lg text-center text-gray-600 mb-12 max-w-3xl mx-auto">
        Elige el plan que mejor se adapte a tus necesidades para conectar, vender y comprar materiales reciclables de forma eficiente.
        Nuestra plataforma está diseñada para impulsar la formalización de recolectores, facilitar la gestión de residuos de negocios y permitir que empresas accedan a materiales útiles a bajo costo.
      </p>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Plan Básico */}
        <div className="border border-gray-200 rounded-lg p-6 shadow-sm flex flex-col">
          <h2 className="text-2xl font-semibold mb-2">🧩 Básico</h2>
          <p className="text-gray-500 mb-4">Ideal para empezar, explorar oportunidades y publicar materiales ocasionales.</p>
          <p className="text-3xl font-bold mb-6">Gratis</p>
          <ul className="space-y-2 mb-8 flex-grow text-gray-700">
            <li>✔ Publica hasta 3 anuncios por mes</li>
            <li>✔ Acceso a búsquedas básicas</li>
            <li>✔ Mensajería directa con otros usuarios</li>
            <li>✔ Visibilidad en resultados estándar</li>
          </ul>
          <p className="text-sm text-gray-500 mb-4">🎯 Perfecto para hogares o negocios con residuos esporádicos</p>
          <Button variant="outline" disabled className="w-full">Plan Actual</Button>
        </div>

        {/* Plan Profesional */}
        <div className="border-2 border-emerald-500 rounded-lg p-6 shadow-lg flex flex-col relative">
          <span className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-emerald-500 text-white text-xs font-semibold px-3 py-1 rounded-full">Más Popular</span>
          <h2 className="text-2xl font-semibold mb-2">🚀 Profesional</h2>
          <p className="text-gray-500 mb-4">Para recolectores, generadores frecuentes o compradores activos</p>
          <p className="text-3xl font-bold mb-6">199 MXN <span className="text-lg font-normal text-gray-500">/ mes</span></p>
          <ul className="space-y-2 mb-8 flex-grow text-gray-700">
            <li>✔ Publicaciones ilimitadas</li>
            <li>✔ Acceso a búsquedas avanzadas y filtros</li>
            <li>✔ Estadísticas de rendimiento</li>
            <li>✔ Verificación de perfil</li>
            <li>✔ Soporte prioritario</li>
          </ul>
          <p className="text-sm text-gray-500 mb-4">🎯 Ideal para quienes usan la plataforma como herramienta comercial diaria</p>
          <Button className="w-full bg-emerald-600 hover:bg-emerald-700">Elegir Plan Profesional</Button>
        </div>

        {/* Plan Empresa */}
        <div className="border border-gray-200 rounded-lg p-6 shadow-sm flex flex-col">
          <h2 className="text-2xl font-semibold mb-2">🏢 Empresa</h2>
          <p className="text-gray-500 mb-4">Soluciones a medida para organizaciones con grandes volúmenes o necesidades complejas</p>
          <p className="text-3xl font-bold mb-6">💬 Contactar</p>
           <ul className="space-y-2 mb-8 flex-grow text-gray-700">
            <li>✔ Todas las funciones del plan Profesional</li>
            <li>✔ Integración vía API</li>
            <li>✔ Gestor de cuenta dedicado</li>
            <li>✔ Informes personalizados</li>
          </ul>
          <p className="text-sm text-gray-500 mb-4">🎯 Pensado para empresas recicladoras, centros de acopio o industrias</p>
          <Button variant="outline" className="w-full">Contactar Ventas</Button>
        </div>
      </div>

      {/* Sección FAQs sobre Precios */}
      <div className="mt-16 max-w-3xl mx-auto">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">Preguntas Frecuentes sobre Precios</h2>
          <div className="space-y-4">
              {/* FAQ 1 */}
              <details className="bg-white p-4 rounded-lg shadow-sm cursor-pointer">
                  <summary className="font-medium text-gray-700">¿Hay algún costo oculto?</summary>
                  <p className="text-gray-600 mt-2 text-sm leading-relaxed">No, nuestros precios son transparentes. El plan Básico es gratuito y los planes de pago tienen tarifas mensuales fijas sin cargos adicionales inesperados por las funcionalidades incluidas.</p>
              </details>
               {/* FAQ 2 */}
               <details className="bg-white p-4 rounded-lg shadow-sm cursor-pointer">
                  <summary className="font-medium text-gray-700">¿Puedo cambiar de plan más adelante?</summary>
                  <p className="text-gray-600 mt-2 text-sm leading-relaxed">Sí, puedes cambiar tu plan en cualquier momento desde la configuración de tu cuenta. El cambio se aplicará al inicio del siguiente ciclo de facturación.</p>
              </details>
              {/* FAQ 3 */}
               <details className="bg-white p-4 rounded-lg shadow-sm cursor-pointer">
                  <summary className="font-medium text-gray-700">¿Qué métodos de pago aceptan?</summary>
                  <p className="text-gray-600 mt-2 text-sm leading-relaxed">Aceptamos las principales tarjetas de crédito (Visa, Mastercard, American Express) y [mencionar otros si aplica, ej. PayPal, transferencia bancaria].</p>
              </details>
               {/* Añadir más FAQs */} 
          </div>
      </div>
    </div>
  );
};

export default Pricing; 