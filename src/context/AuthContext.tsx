import React, { createContext, useState, useContext, ReactNode } from 'react';
import { UserRole } from '../types/user'; // Asegúrate que la ruta a tus tipos es correcta

interface AuthContextType {
  isAuthenticated: boolean;
  userRole: UserRole | null;
  userName: string | null; // O un objeto de usuario más completo
  login: (role: UserRole, name: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [userName, setUserName] = useState<string | null>(null);

  // Simulación de inicio de sesión
  const login = (role: UserRole, name: string) => {
    setIsAuthenticated(true);
    setUserRole(role);
    setUserName(name);
    // En una app real, aquí manejarías tokens, etc.
    console.log(`Simulated login: ${name} as ${role}`);
  };

  // Simulación de cierre de sesión
  const logout = () => {
    setIsAuthenticated(false);
    setUserRole(null);
    setUserName(null);
    // En una app real, limpiarías tokens, etc.
    console.log('Simulated logout');
  };

  const value = {
    isAuthenticated,
    userRole,
    userName,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 