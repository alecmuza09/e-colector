import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Linkedin, Instagram, Youtube, Mail, Phone, MapPin, Heart, TrendingUp } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gradient-to-b from-gray-900 to-black text-gray-300">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 mb-12">
          {/* Company Info */}
          <div className="col-span-1 sm:col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <img src="/assets/images/logo-transparent.png" alt="e-colector" className="h-10 object-contain" />
            </div>
            <p className="text-sm text-gray-400 mb-4">
              La plataforma número 1 para conectar recolectores, generadores y empresas recicladoras en México.
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-gray-400 hover:text-emerald-400 transition-colors">
                <Mail className="w-4 h-4" />
                <a href="mailto:hola@e-colector.com">hola@e-colector.com</a>
              </div>
              <div className="flex items-center gap-2 text-gray-400 hover:text-emerald-400 transition-colors">
                <Phone className="w-4 h-4" />
                <a href="tel:+528189962447">+52 81 8996 2447</a>
              </div>
              <div className="flex items-start gap-2 text-gray-400">
                <MapPin className="w-4 h-4 mt-1" />
                <span>Monterrey, N.L., México</span>
              </div>
            </div>
          </div>

          {/* Empresa */}
          <div>
            <h4 className="text-sm font-semibold text-white tracking-wider uppercase mb-4 pb-2 border-b border-gray-700">
              Empresa
            </h4>
            <ul className="space-y-3">
              <li>
                <Link to="/acerca-de" className="text-sm text-gray-400 hover:text-emerald-400 transition-colors flex items-center gap-2">
                  <span className="text-lg">ℹ️</span> Acerca de nosotros
                </Link>
              </li>
              <li>
                <Link to="/precios" className="text-sm text-gray-400 hover:text-emerald-400 transition-colors flex items-center gap-2">
                  <span className="text-lg">💰</span> Precios
                </Link>
              </li>
              <li>
                <Link to="/contacto" className="text-sm text-gray-400 hover:text-emerald-400 transition-colors flex items-center gap-2">
                  <span className="text-lg">✉️</span> Contacto
                </Link>
              </li>
            </ul>
          </div>

          {/* Recursos */}
          <div>
            <h4 className="text-sm font-semibold text-white tracking-wider uppercase mb-4 pb-2 border-b border-gray-700">
              Recursos
            </h4>
            <ul className="space-y-3">
              <li>
                <Link to="/recursos/guias" className="text-sm text-gray-400 hover:text-emerald-400 transition-colors flex items-center gap-2">
                  <span className="text-lg">📚</span> Guías & Tutoriales
                </Link>
              </li>
              <li>
                <Link to="/recursos/centro-ayuda" className="text-sm text-gray-400 hover:text-emerald-400 transition-colors flex items-center gap-2">
                  <span className="text-lg">🆘</span> Centro de Ayuda
                </Link>
              </li>
              <li>
                <a href="https://www.instagram.com/ecolector62" target="_blank" rel="noopener noreferrer" className="text-sm text-gray-400 hover:text-emerald-400 transition-colors flex items-center gap-2">
                  <span className="text-lg">🔗</span> Comunidad
                </a>
              </li>
            </ul>
          </div>

          {/* Plataforma */}
          <div>
            <h4 className="text-sm font-semibold text-white tracking-wider uppercase mb-4 pb-2 border-b border-gray-700">
              Plataforma
            </h4>
            <ul className="space-y-3">
              <li>
                <Link to="/explorar" className="text-sm text-gray-400 hover:text-emerald-400 transition-colors flex items-center gap-2">
                  <span className="text-lg">🗺️</span> Explorar Mapa
                </Link>
              </li>
              <li>
                <Link to="/publicar" className="text-sm text-gray-400 hover:text-emerald-400 transition-colors flex items-center gap-2">
                  <span className="text-lg">📦</span> Publicar Material
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="text-sm text-gray-400 hover:text-emerald-400 transition-colors flex items-center gap-2">
                  <span className="text-lg">📊</span> Mi Panel
                </Link>
              </li>
              <li>
                <a href="#" className="text-sm text-gray-400 hover:text-emerald-400 transition-colors flex items-center gap-2">
                  <span className="text-lg">💬</span> Mensajes
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Donación CTA */}
        <div className="border-t border-gray-700 pt-8 mb-8 text-center">
          <p className="text-sm text-gray-400 mb-4">¿Crees en el reciclaje como motor de cambio social?</p>
          <Link
            to="/apoya"
            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm px-6 py-3 rounded-xl transition-colors"
          >
            <Heart className="w-4 h-4 fill-white" /> Apoya el Movimiento
          </Link>
        </div>

        {/* Legal & Social */}
        <div className="border-t border-gray-700 pt-8">
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            {/* Legal Links */}
            <div>
              <h4 className="text-sm font-semibold text-white mb-4">Legal & Privacidad</h4>
              <div className="flex flex-wrap gap-4">
                <Link to="/legal/privacidad" className="text-xs text-gray-400 hover:text-emerald-400 transition-colors">
                  Aviso de Privacidad
                </Link>
                <Link to="/legal/terminos" className="text-xs text-gray-400 hover:text-emerald-400 transition-colors">
                  Términos de Servicio
                </Link>
                <Link to="/legal/cookies" className="text-xs text-gray-400 hover:text-emerald-400 transition-colors">
                  Política de Cookies
                </Link>
              </div>
            </div>

            {/* Social Links */}
            <div>
              <h4 className="text-sm font-semibold text-white mb-4">Síguenos</h4>
              <div className="flex gap-4">
                <a 
                  href="https://facebook.com" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-gray-400 hover:text-emerald-400 transition-colors hover:scale-110 transform"
                  title="Facebook"
                >
                  <Facebook className="w-5 h-5" />
                </a>
                <a 
                  href="https://www.linkedin.com/company/e-colector/" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-gray-400 hover:text-emerald-400 transition-colors hover:scale-110 transform"
                  title="LinkedIn"
                >
                  <Linkedin className="w-5 h-5" />
                </a>
                <a 
                  href="https://www.instagram.com/ecolector62" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-gray-400 hover:text-emerald-400 transition-colors hover:scale-110 transform"
                  title="Instagram"
                >
                  <Instagram className="w-5 h-5" />
                </a>
                <a 
                  href="https://www.youtube.com/@e-colector" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-gray-400 hover:text-emerald-400 transition-colors hover:scale-110 transform"
                  title="YouTube"
                >
                  <Youtube className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-700 py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-400">
            <div className="flex items-center gap-2">
              <span>&copy; {new Date().getFullYear()} e-colector</span>
              <span>•</span>
              <span>Todos los derechos reservados</span>
            </div>
            <div className="flex items-center gap-1">
              <span>Hecho con</span>
              <Heart className="w-4 h-4 text-red-500 fill-red-500" />
              <span>por el equipo de</span>
              <span className="font-semibold text-emerald-400">e-colector</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span>v1.0.0 • Monterrey, México</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;