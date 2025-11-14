import React from 'react';
import { Link } from 'react-router-dom';
import { Leaf, Menu } from 'lucide-react';

export default function TopBar() {
  return (
    <div className="sticky top-0 z-50 bg-white/95 dark:bg-gray-800/95 backdrop-blur-md border-b border-emerald-200 dark:border-emerald-700 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 md:px-8 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          {/* SVG Logo */}
          <svg className="w-9 h-9" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="16" cy="16" r="15" stroke="currentColor" strokeWidth="1" className="text-emerald-600"/>
            <path d="M16 4C16 4 12 8 12 12C12 15.31 13.79 18.17 16 19.77C18.21 18.17 20 15.31 20 12C20 8 16 4 16 4Z" fill="currentColor" className="text-teal-500"/>
            <circle cx="16" cy="12" r="2" fill="currentColor" className="text-emerald-700"/>
            <path d="M10 22C10 22 8 24 8 26C8 28.21 9.34 30 11 30M22 22C22 22 24 24 24 26C24 28.21 22.66 30 21 30" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="text-emerald-600"/>
          </svg>
          <div>
            <h1 className="font-bold text-lg text-emerald-600 dark:text-emerald-400">e-colector</h1>
            <p className="text-xs text-gray-600 dark:text-gray-400 hidden sm:block">Reciclaje Inteligente</p>
          </div>
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

