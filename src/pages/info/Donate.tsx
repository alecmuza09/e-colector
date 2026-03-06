import React from 'react';
import { Heart, Leaf, Recycle, Users, ExternalLink } from 'lucide-react';

const DONATION_URL = import.meta.env.VITE_DONATION_URL || 'https://www.e-colector.com/donar';

const impacts = [
  { icon: Recycle, value: '+ 500 kg', label: 'Material rescatado mensualmente' },
  { icon: Leaf, value: '+ 120', label: 'Toneladas de CO₂ evitadas' },
  { icon: Users, value: '+ 300', label: 'Familias recolectoras beneficiadas' },
];

export default function Donate() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white">
      {/* Hero */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-20 px-4 text-center">
        <div className="max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-white/20 px-4 py-1.5 rounded-full text-sm font-semibold mb-5">
            <Heart className="w-4 h-4 fill-white" /> Apoya el Movimiento
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
            Juntos construimos un México más limpio
          </h1>
          <p className="text-emerald-100 text-lg mb-8 max-w-xl mx-auto">
            Tu donación impulsa a recolectores, conecta comunidades y transforma residuos en oportunidades.
            Cada peso cuenta.
          </p>
          <a
            href={DONATION_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-white text-emerald-700 font-bold text-lg px-8 py-4 rounded-2xl hover:bg-emerald-50 transition-colors shadow-lg"
          >
            <Heart className="w-5 h-5 fill-emerald-600 text-emerald-600" />
            Donar ahora
            <ExternalLink className="w-4 h-4" />
          </a>
          <p className="text-emerald-200 text-xs mt-3">Dona el monto que desees — seguro y confiable.</p>
        </div>
      </div>

      {/* Impact stats */}
      <div className="max-w-5xl mx-auto px-4 py-14">
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-10">Nuestro impacto hasta hoy</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {impacts.map(({ icon: Icon, value, label }) => (
            <div key={label} className="bg-white rounded-2xl border border-gray-200 p-8 text-center shadow-sm">
              <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Icon className="w-7 h-7 text-emerald-600" />
              </div>
              <p className="text-3xl font-bold text-emerald-700 mb-1">{value}</p>
              <p className="text-sm text-gray-500">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* How it works */}
      <div className="bg-emerald-50 py-14 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">¿A dónde va tu donación?</h2>
          <p className="text-gray-500 mb-8">Cada donación es invertida directamente en la comunidad recolectora.</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 text-left">
            {[
              { num: '1', title: 'Capacitación', desc: 'Talleres y herramientas para recolectores independientes.' },
              { num: '2', title: 'Tecnología', desc: 'Mantenimiento y mejoras de la plataforma e-colector.' },
              { num: '3', title: 'Comunidad', desc: 'Eventos, redes de apoyo y visibilidad para el movimiento.' },
            ].map(item => (
              <div key={item.num} className="bg-white rounded-2xl p-6 border border-gray-200">
                <div className="w-8 h-8 bg-emerald-600 text-white rounded-xl flex items-center justify-center text-sm font-bold mb-3">
                  {item.num}
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">{item.title}</h3>
                <p className="text-sm text-gray-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA final */}
      <div className="py-16 px-4 text-center">
        <Heart className="w-12 h-12 text-emerald-300 fill-emerald-100 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">¿Listo para hacer la diferencia?</h2>
        <p className="text-gray-500 mb-7">Cada donación, por pequeña que sea, impulsa el cambio.</p>
        <a
          href={DONATION_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-base px-8 py-4 rounded-2xl transition-colors"
        >
          <Heart className="w-5 h-5 fill-white" /> Apoya el Movimiento
        </a>
        <p className="text-gray-400 text-xs mt-3">Para más información escríbenos a <a href="mailto:hola@e-colector.com" className="text-emerald-600 hover:underline">hola@e-colector.com</a></p>
      </div>
    </div>
  );
}
