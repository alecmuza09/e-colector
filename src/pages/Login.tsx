import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types/user';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // --- Simulación de Autenticación --- 
    // En una app real, llamarías a tu API aquí.
    // Aquí simulamos un login exitoso para cualquier email/pass
    // y asignamos un rol basado en el email (solo para demo)
    let simulatedRole = UserRole.BUYER; // Rol por defecto
    if (email.includes('seller')) simulatedRole = UserRole.SELLER;
    if (email.includes('collector')) simulatedRole = UserRole.COLLECTOR;
    
    const simulatedUserName = email.split('@')[0]; // Usar parte local del email como nombre

    console.log('Login attempt:', { email, password });
    
    login(simulatedRole, simulatedUserName); // Llamar a login del contexto
    navigate('/dashboard'); // Redirigir al dashboard
    // --- Fin Simulación ---
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-128px)] bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-lg">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">Iniciar Sesión</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
              placeholder="tu@email.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Contraseña
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
              placeholder="Tu contraseña"
            />
             {/* TODO: Añadir enlace "Olvidé mi contraseña" */}
          </div>

          <div>
            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition duration-150 ease-in-out"
            >
              Entrar
            </button>
          </div>
        </form>
         <p className="mt-6 text-center text-sm text-gray-600">
          ¿No tienes cuenta?{' '}
          <Link to="/registro" className="font-medium text-emerald-600 hover:text-emerald-500">
            Regístrate aquí
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login; 