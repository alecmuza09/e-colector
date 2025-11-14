import React from 'react';

const About = () => {
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Acerca de e-colector</h1>
      
      <section className="mb-8 bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-2xl font-semibold text-emerald-700 mb-3">Nuestra Historia</h2>
        <p className="text-gray-600 leading-relaxed">
          e-colector nació de la visión de [Nombre del Fundador/Grupo] en [Año] con el objetivo de...
          [Contar brevemente cómo surgió la idea, los primeros pasos, etc.]...
          Desde entonces, hemos crecido hasta convertirnos en una plataforma líder que conecta a generadores de residuos reciclables con compradores y recicladores comprometidos.
        </p>
      </section>

      <section className="mb-8 bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-2xl font-semibold text-emerald-700 mb-3">Misión y Visión</h2>
        <h3 className="text-xl font-medium text-gray-700 mb-2">Misión</h3>
        <p className="text-gray-600 leading-relaxed mb-4">
          Nuestra misión es facilitar la transición hacia una economía circular, creando un mercado digital eficiente y transparente para materiales reciclables, empoderando a individuos y empresas a participar activamente en el reciclaje y la sostenibilidad.
        </p>
        <h3 className="text-xl font-medium text-gray-700 mb-2">Visión</h3>
        <p className="text-gray-600 leading-relaxed">
          Aspiramos a ser la plataforma de referencia global para la gestión de residuos reciclables, impulsando la innovación tecnológica y fomentando una cultura de responsabilidad ambiental en toda la cadena de valor.
        </p>
      </section>

      <section className="mb-8 bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-2xl font-semibold text-emerald-700 mb-3">Nuestro Equipo</h2>
        <p className="text-gray-600 leading-relaxed mb-4">
          Contamos con un equipo apasionado y multidisciplinar de expertos en tecnología, medio ambiente, logística y negocio, unidos por el compromiso de crear un impacto positivo.
        </p>
        {/* Opcional: Añadir fotos/nombres del equipo */}
        {/* <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>Miembro 1</div> 
          <div>Miembro 2</div> 
        </div> */}
      </section>

      <section className="bg-emerald-50 p-6 rounded-lg border border-emerald-200">
        <h2 className="text-2xl font-semibold text-emerald-700 mb-3">Nuestro Impacto</h2>
        <p className="text-gray-600 leading-relaxed mb-4">
          Estamos orgullosos del impacto que hemos logrado hasta ahora:
        </p>
        <ul className="list-disc list-inside text-gray-600 space-y-2">
          <li><span className="font-semibold text-emerald-600">[Número]+ toneladas</span> de materiales reciclados gestionados a través de la plataforma.</li>
          <li>Reducción estimada de <span className="font-semibold text-emerald-600">[Número] toneladas</span> de emisiones de CO2.</li>
          <li>Conexión de <span className="font-semibold text-emerald-600">[Número]+</span> vendedores y compradores.</li>
           <li>Fomento de <span className="font-semibold text-emerald-600">[Número]+</span> empleos verdes indirectos.</li>
        </ul>
        <p className="text-gray-600 leading-relaxed mt-4">
          Y esto es solo el comienzo. Seguimos trabajando para ampliar nuestro alcance y maximizar nuestra contribución a un futuro más sostenible.
        </p>
      </section>
    </div>
  );
};

export default About; 