import React from 'react';
import { Link } from 'react-router-dom';

export default function TopBar() {
  return (
    <div className="sticky top-0 z-50 bg-white/95 dark:bg-gray-800/95 backdrop-blur-md border-b border-emerald-200 dark:border-emerald-700 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 md:px-8 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center hover:opacity-80 transition-opacity">
          <img src="/assets/images/logo-full.png" alt="e-colector" className="h-10 object-contain" />
        </Link>

        {/* Tagline - Hidden on small screens */}
        <div className="hidden md:flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
          <span className="inline-block px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded-full font-medium">
            ♻️ Conectando Recicladores
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <Link
            to="/login"
            className="px-4 py-2 text-emerald-600 dark:text-emerald-400 font-medium hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-colors"
          >
            Iniciar Sesión
          </Link>
          <Link
            to="/registro"
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors shadow-md hover:shadow-lg"
          >
            Registrarse
          </Link>
        </div>
      </div>
    </div>
  );
}

