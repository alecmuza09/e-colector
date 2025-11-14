import React from 'react';

// TODO: Obtener datos del usuario (probablemente desde el contexto o estado global)
// TODO: Mostrar contenido diferente según el tipo de usuario (Vendedor, Comprador, Reciclador)

function Profile() {
  // Placeholder: Simular un usuario logueado
  const mockUser = {
    name: "Usuario Ejemplo",
    email: "usuario@ejemplo.com",
    type: "comprador" // Cambiar a 'vendedor' o 'reciclador' para probar
  };

  const renderUserProfile = () => {
    switch (mockUser.type) {
      case 'vendedor':
        return <div>Dashboard del Vendedor (Próximamente)</div>;
      case 'comprador':
        return <div>Perfil del Comprador (Próximamente)</div>;
      case 'reciclador':
        return <div>Panel del Reciclador (Próximamente)</div>;
      default:
        return <div>Tipo de usuario desconocido</div>;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Mi Perfil</h1>
      <div className="bg-white shadow rounded-lg p-6 mb-6">
          <p><strong>Nombre:</strong> {mockUser.name}</p>
          <p><strong>Email:</strong> {mockUser.email}</p>
          <p><strong>Tipo de Cuenta:</strong> {mockUser.type}</p>
          {/* TODO: Añadir botón para editar perfil */}      
      </div>

      <h2 className="text-xl font-semibold mb-4">Mi Panel</h2>
      <div className="bg-white shadow rounded-lg p-6">
          {renderUserProfile()}    
      </div>
      
      {/* TODO: Añadir secciones comunes: Notificaciones, Mensajes, Historial, etc. */}
    </div>
  );
}

export default Profile; 