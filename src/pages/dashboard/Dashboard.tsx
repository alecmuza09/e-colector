import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types/user';
import BuyerDashboard from './BuyerDashboard';
import SellerDashboard from './SellerDashboard';
import CollectorDashboard from './CollectorDashboard';

const Dashboard = () => {
  const { isAuthenticated, userRole, userName, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const renderDashboard = () => {
    switch (userRole) {
      case UserRole.BUYER:     return <BuyerDashboard />;
      case UserRole.SELLER:    return <SellerDashboard />;
      case UserRole.COLLECTOR: return <CollectorDashboard />;
      default:
        return (
          <div className="p-8 text-center text-gray-500">
            <p className="text-lg font-medium mb-2">Rol no reconocido</p>
            <p className="text-sm">No se pudo determinar tu tipo de cuenta. Contacta a soporte.</p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {renderDashboard()}
    </div>
  );
};

export default Dashboard;
