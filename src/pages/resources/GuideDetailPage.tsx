import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { guides } from './Guides'; // Importar datos de guías

// Componente simple para renderizar Markdown básico (solo párrafos y listas)
// Para un soporte completo, considera usar react-markdown u otra librería.
const SimpleMarkdownRenderer: React.FC<{ content: string }> = ({ content }) => {
  const lines = content.split('\n');
  const elements: JSX.Element[] = [];
  let currentList: string[] | null = null;

  lines.forEach((line: string, index: number) => {
    const trimmedLine = line.trim();

    if (trimmedLine.startsWith('*') || trimmedLine.startsWith('-') || /^[0-9]+\./.test(trimmedLine)) {
      if (!currentList) {
        currentList = [];
      }
      currentList.push(trimmedLine.replace(/^(\*|-|[0-9]+\.)\s*/, ''));
    } else {
      if (currentList && currentList.length > 0) {
        elements.push(
          <ul key={`ul-${index}`} className="list-disc list-inside ml-6 mb-4 space-y-1">
            {currentList.map((item: string, itemIndex: number) => <li key={itemIndex}>{item}</li>)}
          </ul>
        );
      }
      currentList = null;

      if (trimmedLine.startsWith('### ')) {
        elements.push(<h3 key={index} className="text-xl font-semibold mt-6 mb-3">{trimmedLine.substring(4)}</h3>);
      } else if (trimmedLine.startsWith('**') && trimmedLine.endsWith('**')) {
         elements.push(<p key={index} className="mb-4 font-semibold">{trimmedLine.substring(2, trimmedLine.length - 2)}</p>);
      } else if (trimmedLine) {
        elements.push(<p key={index} className="mb-4">{trimmedLine}</p>);
      }
    }
  });

  if (currentList && currentList.length > 0) {
    elements.push(
      <ul key="ul-last" className="list-disc list-inside ml-6 mb-4 space-y-1">
        {currentList.map((item: string, itemIndex: number) => <li key={itemIndex}>{item}</li>)}
      </ul>
    );
  }

  return <>{elements}</>;
};

export const GuideDetailPage = () => {
  const { guideId } = useParams<{ guideId: string }>();
  // Encontrar la guía. Asumimos que la interfaz Guide está definida y exportada en Guides.tsx
  const guide = guides.find(g => g.id === guideId);

  if (!guide || !guide.content) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-4">¡Error!</h1>
        <p className="text-gray-600">No se encontró la guía solicitada o no tiene contenido.</p>
        <Link to="/recursos/guias" className="mt-6 inline-block text-emerald-600 hover:underline">
          Volver a Guías
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      {/* Migas de pan */}
      <nav className="mb-6 text-sm text-gray-500">
        <Link to="/recursos/guias" className="hover:text-emerald-600">Guías y Recursos</Link>
        <span className="mx-2">/</span>
        <span>{guide.title}</span>
      </nav>

      {/* Título y Tipo */}
      <span className="text-xs font-semibold text-emerald-700 uppercase mb-1 block">{guide.type}</span>
      <h1 className="text-4xl font-bold text-gray-800 mb-8">{guide.title}</h1>

      {/* Contenido de la Guía (Renderizado simple) */}
      <div className="prose prose-lg max-w-none text-gray-700">
        <SimpleMarkdownRenderer content={guide.content} />
      </div>

      {/* Botón para volver */}
       <div className="mt-12 text-center">
        <Link to="/recursos/guias" className="inline-block bg-gray-200 text-gray-700 px-6 py-2 rounded hover:bg-gray-300 transition">
          ← Volver a Guías
        </Link>
      </div>
    </div>
  );
};

export default GuideDetailPage; 