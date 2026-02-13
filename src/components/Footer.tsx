import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Linkedin, Instagram, Mail, Phone, MapPin, Heart, TrendingUp, Award } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gradient-to-b from-gray-900 to-black text-gray-300">
      {/* Newsletter Section */}
      <div className="border-b border-gray-700 bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-900 dark:to-teal-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-2xl md:text-3xl font-bold mb-2">Mantente Informado</h3>
              <p className="text-emerald-100">Recibe noticias sobre nuevos materiales y oportunidades directamente en tu bandeja</p>
            </div>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="tu@email.com"
                className="flex-1 px-4 py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-400"
              />
              <button className="px-6 py-3 bg-white text-emerald-600 font-bold rounded-lg hover:bg-emerald-50 transition-colors">
                Suscribirse
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 mb-12">
          {/* Company Info */}
          <div className="col-span-1 sm:col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-3xl">♻️</span>
              <span className="text-xl font-bold text-white">e-colector</span>
            </div>
            <p className="text-sm text-gray-400 mb-4">
              La plataforma número 1 para conectar recolectores, generadores y empresas recicladoras en México.
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-gray-400 hover:text-emerald-400 transition-colors">
                <Mail className="w-4 h-4" />
                <a href="mailto:hola@ecolector.com">hola@ecolector.com</a>
              </div>
              <div className="flex items-center gap-2 text-gray-400 hover:text-emerald-400 transition-colors">
                <Phone className="w-4 h-4" />
                <a href="tel:+5281899624997">+52 81 8996 2499 7</a>
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
                <Link to="/blog" className="text-sm text-gray-400 hover:text-emerald-400 transition-colors flex items-center gap-2">
                  <span className="text-lg">📝</span> Blog & Noticias
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
                <a href="#" className="text-sm text-gray-400 hover:text-emerald-400 transition-colors flex items-center gap-2">
                  <span className="text-lg">🔗</span> Comunidad
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-gray-400 hover:text-emerald-400 transition-colors flex items-center gap-2">
                  <span className="text-lg">🗺️</span> Mapa de Municipios
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

        {/* Legal & Social */}
        <div className="border-t border-gray-700 pt-8">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            {/* Legal Links */}
            <div>
              <h4 className="text-sm font-semibold text-white mb-4">Legal & Privacidad</h4>
              <div className="flex flex-wrap gap-4">
                <Link to="/legal/privacidad" className="text-xs text-gray-400 hover:text-emerald-400 transition-colors">
                  Política de Privacidad
                </Link>
                <Link to="/legal/terminos" className="text-xs text-gray-400 hover:text-emerald-400 transition-colors">
                  Términos de Servicio
                </Link>
                <a href="#" className="text-xs text-gray-400 hover:text-emerald-400 transition-colors">
                  Cookies
                </a>
              </div>
            </div>

            {/* Highlights */}
            <div>
              <div className="flex items-center gap-2 text-sm text-emerald-400 font-semibold mb-2">
                <Award className="w-4 h-4" />
                Certificación: ISO 14001
              </div>
              <p className="text-xs text-gray-400">Comprometidos con la sostenibilidad ambiental</p>
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
                  href="https://twitter.com" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-gray-400 hover:text-emerald-400 transition-colors hover:scale-110 transform"
                  title="Twitter"
                >
                  <Twitter className="w-5 h-5" />
                </a>
                <a 
                  href="https://linkedin.com" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-gray-400 hover:text-emerald-400 transition-colors hover:scale-110 transform"
                  title="LinkedIn"
                >
                  <Linkedin className="w-5 h-5" />
                </a>
                <a 
                  href="https://instagram.com" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-gray-400 hover:text-emerald-400 transition-colors hover:scale-110 transform"
                  title="Instagram"
                >
                  <Instagram className="w-5 h-5" />
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