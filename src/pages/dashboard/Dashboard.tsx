import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types/user';
import { BentoDashboard } from '../../components/BentoDashboard';
import BuyerDashboard from './BuyerDashboard';
import SellerDashboard from './SellerDashboard';
import CollectorDashboard from './CollectorDashboard';

const Dashboard = () => {
  const { isAuthenticated, userRole, userName } = useAuth();

  // Si no está autenticado, redirigir a login
  if (!isAuthenticated) {
    // Puedes mostrar un mensaje o simplemente redirigir
    // console.log('User not authenticated, redirecting to login...');
    return <Navigate to="/login" replace />;
  }

  // Renderizar el dashboard correcto según el rol
  const renderDashboardByRole = () => {
    switch (userRole) {
      case UserRole.BUYER:
        return <BuyerDashboard />;
      case UserRole.SELLER:
        return <SellerDashboard />;
      case UserRole.COLLECTOR:
        return <CollectorDashboard />;
      default:
        // Manejar caso inesperado (usuario autenticado sin rol válido)
        return (
          <div>
            <h2 className="text-xl font-semibold text-red-600">Error de Rol</h2>
            <p>No se pudo determinar tu tipo de cuenta. Por favor, contacta a soporte.</p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header con Bienvenida */}
      <div className="sticky top-0 z-10 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-b border-emerald-200 dark:border-emerald-800 px-6 md:px-8 py-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
            ¡Hola, {userName || 'Usuario'}! 👋
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Aquí está tu panel de control con toda la información que necesitas
          </p>
        </div>
      </div>

      {/* Contenido Principal */}
      <div className="px-6 md:px-8 py-8 max-w-7xl mx-auto">
        <BentoDashboard />
      </div>
    </div>
  );
};

export default Dashboard; 