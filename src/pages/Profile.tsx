import React from 'react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types/user';
import BuyerProfile from './profile/BuyerProfile';
import SellerProfile from './profile/SellerProfile';
import CollectorProfile from './profile/CollectorProfile';
import AdminProfile from './profile/AdminProfile';

function Profile() {
  const { userRole, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-gray-600">Por favor inicia sesión para ver tu perfil.</p>
      </div>
    );
  }

  // Renderizar perfil según el rol
  switch (userRole) {
    case UserRole.BUYER:
      return <BuyerProfile />;
    case UserRole.SELLER:
      return <SellerProfile />;
    case UserRole.COLLECTOR:
      return <CollectorProfile />;
    case UserRole.ADMIN:
      return <AdminProfile />;
    default:
      return (
        <div className="container mx-auto px-4 py-8 text-center">
          <p className="text-gray-600">Rol de usuario no reconocido.</p>
        </div>
      );
  }
}

export default Profile; 