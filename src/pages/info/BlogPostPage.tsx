import React from 'react';
import { useParams, Link } from 'react-router-dom';
// Importamos los datos directamente desde Blog.tsx por simplicidad
// En una app real, esto podría venir de un contexto, estado global o API.
import { blogPosts } from './Blog'; // Asumiendo que exportas `blogPosts` desde Blog.tsx

// Definir tipo para los posts (podría estar en un archivo de tipos separado)
interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  date: string;
  imageUrl: string;
}

export const BlogPostPage = () => {
  const { postId } = useParams<{ postId: string }>();
  const post = blogPosts.find((p: BlogPost) => p.id === postId);

  if (!post) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-4">¡Error!</h1>
        <p className="text-gray-600">No se encontró la entrada de blog solicitada.</p>
        <Link to="/blog" className="mt-6 inline-block text-emerald-600 hover:underline">
          Volver al Blog
        </Link>
      </div>
    );
  }

  // Dividir el contenido en párrafos para mejor formato
  const paragraphs = post.content.split('\n\n');

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      {/* Migas de pan (opcional) */}
      <nav className="mb-6 text-sm text-gray-500">
        <Link to="/blog" className="hover:text-emerald-600">Blog</Link>
        <span className="mx-2">/</span>
        <span>{post.title}</span>
      </nav>

      {/* Título y Metadatos */}
      <h1 className="text-4xl font-bold text-gray-800 mb-4">{post.title}</h1>
      <div className="flex items-center text-gray-500 text-sm mb-6 space-x-4">
        <span>📅 {post.date}</span>
        <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded text-xs font-medium">{post.category}</span>
      </div>

      {/* Imagen Principal (opcional) */}
      <img src={post.imageUrl} alt={post.title} className="w-full h-64 md:h-96 object-cover rounded-lg mb-8 shadow-md" />

      {/* Contenido del Post */}
      <div className="prose prose-lg max-w-none text-gray-700">
        {paragraphs.map((paragraph: string, index: number) => (
          <p key={index} className="mb-4">
            {/* Renderizar listas (simplificado) */}
            {paragraph.startsWith('- ') ? (
              <ul className="list-disc list-inside ml-4">
                {paragraph.split('\n').map((item: string, itemIndex: number) => (
                  <li key={itemIndex}>{item.replace(/^- /, '')}</li>
                ))}
              </ul>
            ) : (
              paragraph
            )}
          </p>
        ))}
      </div>

       {/* Botón para volver */}
       <div className="mt-12 text-center">
        <Link to="/blog" className="inline-block bg-gray-200 text-gray-700 px-6 py-2 rounded hover:bg-gray-300 transition">
          ← Volver al Blog
        </Link>
      </div>
    </div>
  );
};

export default BlogPostPage; 