import React from 'react';
import { Check, Sparkles, Truck, Factory } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const Pricing = () => {
  const plans = [
    {
      icon: Sparkles,
      name: 'Generador',
      badge: 'Gratis',
      badgeClass: 'bg-emerald-500 text-white',
      description: 'Ideal para empresas o personas que generan materiales reciclables y buscan darles salida de forma eficiente.',
      price: null,
      priceAfter: null,
      features: [
        'Publicación de materiales reciclables.',
        'Acceso a red de recolectores y recicladores.',
        'Gestión básica de solicitudes.',
        'Historial de movimientos.',
        'Soporte estándar.',
      ],
      footer: 'Sin costo. Sin comisiones ocultas.',
      cta: 'Registrarse gratis',
      href: '/registro',
      borderClass: 'border-emerald-200 dark:border-emerald-800',
      popular: false,
    },
    {
      icon: Truck,
      name: 'Recolector',
      badge: '6 meses gratis',
      badgeClass: 'bg-teal-500 text-white',
      description: 'Pensado para recolectores que buscan más oportunidades y mejor organización operativa.',
      price: 199,
      priceAfter: '6 meses sin costo, luego',
      features: [
        'Acceso a solicitudes activas de generadores.',
        'Perfil verificado dentro de la plataforma.',
        'Gestión de rutas y solicitudes.',
        'Historial de operaciones.',
        'Métricas básicas de desempeño.',
        'Soporte prioritario.',
      ],
      footer: '6 meses sin costo para impulsar tu crecimiento. Luego una tarifa accesible para mantener acceso continuo a oportunidades.',
      cta: 'Comenzar 6 meses gratis',
      href: '/registro',
      borderClass: 'border-2 border-teal-500 dark:border-teal-400',
      popular: true,
    },
    {
      icon: Factory,
      name: 'Reciclador',
      badge: '6 meses gratis',
      badgeClass: 'bg-amber-500 text-white',
      description: 'Tu plataforma de gestión de ingresos de materia prima para tu empresa. Diseñado para recicladores que necesitan suministro constante, trazabilidad y control financiero.',
      price: 2000,
      priceAfter: '6 meses sin costo, luego',
      features: [
        'Acceso directo a red de generadores y recolectores.',
        'Panel de control de compras de materia prima.',
        'Gestión y seguimiento de ingresos por material.',
        'Reportes y métricas de abastecimiento.',
        'Visibilidad destacada dentro de la plataforma.',
        'Soporte prioritario empresarial.',
      ],
      footer: 'Convierte el abastecimiento en una ventaja estratégica.',
      cta: 'Comenzar 6 meses gratis',
      href: '/registro',
      borderClass: 'border-amber-200 dark:border-amber-800',
      popular: false,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-12 md:py-16">
        <header className="text-center mb-12 md:mb-16">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Planes y Precios – E-Colector
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Elige el plan que mejor se adapte a tu perfil: generador, recolector o reciclador.
          </p>
        </header>

        <div className="grid md:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto">
          {plans.map((plan) => {
            const Icon = plan.icon;
            return (
              <div
                key={plan.name}
                className={`relative rounded-2xl p-6 md:p-8 bg-white dark:bg-gray-800 shadow-lg flex flex-col ${plan.borderClass} ${
                  plan.popular ? 'ring-2 ring-teal-500/50' : ''
                }`}
              >
                {plan.popular && (
                  <span className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-teal-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
                    Más popular
                  </span>
                )}
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2.5 rounded-xl bg-emerald-100 dark:bg-emerald-900/40">
                    <Icon className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">{plan.name}</h2>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${plan.badgeClass}`}>
                      {plan.badge}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                  {plan.description}
                </p>
                <div className="mb-6">
                  {plan.priceAfter && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{plan.priceAfter}</p>
                  )}
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">
                    {plan.price === null ? (
                      'Gratis'
                    ) : (
                      <>
                        ${plan.price.toLocaleString('es-MX')} <span className="text-base font-normal text-gray-500">MXN / mes</span>
                      </>
                    )}
                  </p>
                </div>
                <ul className="space-y-3 flex-grow mb-6">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                      <Check className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-6 italic">
                  {plan.footer}
                </p>
                <Link to={plan.href} className="block mt-auto">
                  <Button
                    className="w-full"
                    variant={plan.popular ? 'default' : 'outline'}
                  >
                    {plan.cta}
                  </Button>
                </Link>
              </div>
            );
          })}
        </div>

        {/* FAQ */}
        <div className="mt-16 max-w-3xl mx-auto">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 text-center">
            Preguntas frecuentes sobre precios
          </h2>
          <div className="space-y-4">
            <details className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm cursor-pointer border border-gray-100 dark:border-gray-700">
              <summary className="font-medium text-gray-700 dark:text-gray-300">¿Hay algún costo oculto?</summary>
              <p className="text-gray-600 dark:text-gray-400 mt-2 text-sm leading-relaxed">
                No. El plan Generador es gratuito y sin comisiones. Los planes de pago tienen tarifas mensuales fijas y transparentes.
              </p>
            </details>
            <details className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm cursor-pointer border border-gray-100 dark:border-gray-700">
              <summary className="font-medium text-gray-700 dark:text-gray-300">¿Puedo cambiar de plan más adelante?</summary>
              <p className="text-gray-600 dark:text-gray-400 mt-2 text-sm leading-relaxed">
                Sí, puedes cambiar tu plan en cualquier momento desde la configuración de tu cuenta.
              </p>
            </details>
            <details className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm cursor-pointer border border-gray-100 dark:border-gray-700">
              <summary className="font-medium text-gray-700 dark:text-gray-300">¿Qué métodos de pago aceptan?</summary>
              <p className="text-gray-600 dark:text-gray-400 mt-2 text-sm leading-relaxed">
                Aceptamos tarjetas de crédito/débito (Visa, Mastercard) y transferencia bancaria.
              </p>
            </details>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pricing;
