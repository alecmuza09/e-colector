import React from 'react';
import { Link } from 'react-router-dom'; // Para enlaces a artículos individuales

// Datos para artículos del blog
export const blogPosts = [
  {
    id: 'blog-reciclaje-casa',
    title: '5 Tips para mejorar la separación de residuos en casa',
    excerpt: 'Separar adecuadamente los residuos desde casa es el primer paso para tener un sistema de reciclaje más eficiente...',
    content: `Separar adecuadamente los residuos desde casa es el primer paso para tener un sistema de reciclaje más eficiente y con menor impacto ambiental. Muchas veces mezclamos basura orgánica con plásticos o papeles que podrían reutilizarse, lo cual complica el trabajo de los recolectores y reduce el valor de los materiales.\n\nAquí te compartimos 5 consejos prácticos:\n\n- Coloca botes diferenciados por tipo de residuo.\n- Limpia los envases antes de tirarlos.\n- Aplasta botellas y latas para ahorrar espacio.\n- Separa residuos peligrosos (pilas, electrónicos).\n- Infórmate sobre días y puntos de recolección en tu ciudad.\n\nAplicando estos pasos, no solo ayudas al medio ambiente, sino que también facilitas la labor de quienes viven del reciclaje, conectando con ellos desde plataformas como e-colector.`,
    category: 'Reciclaje',
    date: '15 Agosto, 2024',
    imageUrl: 'https://via.placeholder.com/400x250.png?text=Separación+Casa' // Reemplazar con imagen real
  },
  {
    id: 'blog-economia-circular',
    title: 'La Economía Circular: Más allá del reciclaje',
    excerpt: 'La economía circular es un modelo que busca alargar el ciclo de vida de los productos y materiales, reduciendo al máximo los residuos...',
    content: `La economía circular es un modelo que busca alargar el ciclo de vida de los productos y materiales, reduciendo al máximo los residuos. A diferencia del modelo lineal (producir–usar–desechar), la economía circular propone reutilizar, reparar, transformar y reciclar continuamente.\n\ne-colector nace bajo este enfoque: conectar a quienes generan residuos con quienes pueden aprovecharlos. Esto no solo reduce desechos, sino que también activa cadenas de valor locales, genera oportunidades económicas y fortalece comunidades.\n\nDesde un hogar que publica cartón, hasta una empresa que transforma PET en nuevos productos, todos los usuarios de la plataforma participan en un sistema más justo y sostenible.`,
    category: 'Economía Circular',
    date: '10 Agosto, 2024',
    imageUrl: 'https://via.placeholder.com/400x250.png?text=Economía+Circular' // Reemplazar con imagen real
  },
  {
    id: 'blog-historia-pet-3d',
    title: 'Recicladora transforma PET en filamento 3D',
    excerpt: 'Claudia es una emprendedora de Nuevo León que, a través de e-colector, ha logrado conseguir botellas PET limpias y a bajo costo...',
    content: `Claudia es una emprendedora de Nuevo León que, a través de e-colector, ha logrado conseguir botellas PET limpias y a bajo costo. Gracias a esto, desarrolló un pequeño taller donde transforma el plástico en filamento para impresoras 3D.\n\nCon una trituradora casera y una extrusora adaptada, Claudia produce filamento que vende a estudiantes, makers y artistas. Este proyecto no solo reduce residuos, sino que también genera ingresos locales y fomenta la innovación.\n\nCasos como el de Claudia muestran cómo la tecnología, el reciclaje y la colaboración pueden abrir caminos reales hacia la sostenibilidad y el autoempleo.`,
    category: 'Historias de Éxito',
    date: '5 Agosto, 2024',
    imageUrl: 'https://via.placeholder.com/400x250.png?text=PET+a+Filamento+3D' // Reemplazar con imagen real
  }
];

const Blog = () => {
  // TODO: Implementar filtrado por categoría
  const categories = ['Todos', 'Reciclaje', 'Economía Circular', 'Historias de Éxito']; // Ajustar categorías si es necesario

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">Blog e-colector</h1>

      {/* Filtros de Categoría (Opcional) */}
      <div className="mb-8 flex justify-center flex-wrap gap-2">
        {categories.map(category => (
          <button
            key={category}
            // onClick={() => setActiveCategory(category)} // Lógica de filtrado
            className={`px-4 py-2 rounded-full border text-sm font-medium transition ${
              category === 'Todos' // Simular categoría activa
                ? 'bg-emerald-600 text-white border-emerald-600'
                : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-100'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Grid de Artículos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {blogPosts.map(post => (
          <Link to={`/blog/${post.id}`} key={post.id} className="bg-white rounded-lg shadow overflow-hidden group transition hover:shadow-lg flex flex-col">
            <img src={post.imageUrl} alt={post.title} className="w-full h-48 object-cover" />
            <div className="p-5 flex flex-col flex-grow">
              <span className="text-xs font-semibold text-emerald-600 uppercase mb-1">{post.category}</span>
              <h2 className="font-semibold text-xl text-gray-800 mb-2 group-hover:text-emerald-700 transition-colors flex-grow">{post.title}</h2>
              <p className="text-gray-600 text-sm mb-4">{post.excerpt}</p>
              <div className="mt-auto border-t border-gray-100 pt-3 flex justify-between items-center">
                 <span className="text-xs text-gray-500">{post.date}</span>
                 <span className="text-sm font-medium text-emerald-600 group-hover:underline">Leer más →</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
       {/* TODO: Añadir paginación si hay muchos artículos */} 
    </div>
  );
};

export default Blog; 