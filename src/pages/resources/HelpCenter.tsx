import React, { useState } from 'react';
import { Search, LifeBuoy, MessageSquare, BookText } from 'lucide-react';
import { Link } from 'react-router-dom';

// Datos de ejemplo para FAQs
const faqs = [
  {
    id: 'faq-1',
    question: '¿Cómo me registro en e-colector?',
    answer: 'Puedes registrarte haciendo clic en el botón "Registrarse" en la esquina superior derecha. Deberás proporcionar tu nombre, email, contraseña y seleccionar tu tipo de perfil (Comprador, Vendedor o Reciclador).',
    category: 'Cuenta'
  },
  {
    id: 'faq-2',
    question: '¿Cómo publico un material para vender?',
    answer: 'Una vez iniciada sesión como Vendedor, ve a la sección "Publicar Material". Completa los detalles del material (tipo, cantidad, precio, ubicación, fotos) y haz clic en "Publicar". Puedes encontrar una guía detallada en nuestra sección de Recursos.',
    category: 'Vendedores'
  },
    {
    id: 'faq-3',
    question: '¿Qué hago si tengo un problema con una transacción?',
    answer: 'Primero intenta comunicarte con la otra parte a través de nuestra mensajería interna. Si no puedes resolverlo, contacta a nuestro equipo de soporte a través del formulario de contacto o el chat, proporcionando los detalles de la transacción.',
    category: 'Transacciones'
  },
   {
    id: 'faq-4',
    question: '¿Son seguros mis datos en la plataforma?',
    answer: 'Sí, nos tomamos la seguridad muy en serio. Utilizamos encriptación y seguimos las mejores prácticas para proteger tu información personal y de transacciones. Puedes consultar nuestra Política de Privacidad para más detalles.',
    category: 'Seguridad'
  }
  // Añadir más FAQs
];

const HelpCenter = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredFaqs, setFilteredFaqs] = useState(faqs);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    if (term === '') {
      setFilteredFaqs(faqs);
    } else {
      setFilteredFaqs(
        faqs.filter(faq => 
          faq.question.toLowerCase().includes(term) || 
          faq.answer.toLowerCase().includes(term) ||
          faq.category.toLowerCase().includes(term)
        )
      );
    }
  };

  // Agrupar FAQs por categoría
  const faqsByCategory = filteredFaqs.reduce((acc, faq) => {
    (acc[faq.category] = acc[faq.category] || []).push(faq);
    return acc;
  }, {} as Record<string, typeof faqs>);

  return (
    <div className="bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-800 mb-4 text-center">Centro de Ayuda</h1>
        <p className="text-lg text-gray-600 mb-8 text-center max-w-2xl mx-auto">
          Encuentra respuestas a tus preguntas frecuentes, accede a nuestra base de conocimiento o ponte en contacto con nuestro equipo de soporte.
        </p>

        {/* Barra de Búsqueda de FAQs */}
        <div className="max-w-xl mx-auto mb-10 relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input 
            type="text" 
            placeholder="Buscar en FAQs (ej. 'registro', 'publicar', 'pago')"
            value={searchTerm}
            onChange={handleSearch}
            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-full shadow-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          />
        </div>

        {/* Sección Principal de Ayuda */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Link to="/recursos/guias" className="bg-white p-6 rounded-lg shadow hover:shadow-md transition text-center">
            <BookText className="h-10 w-10 text-emerald-600 mx-auto mb-3" />
            <h3 className="font-semibold text-lg text-gray-800 mb-1">Base de Conocimiento</h3>
            <p className="text-sm text-gray-500">Explora nuestras guías y tutoriales.</p>
          </Link>
          <a href="#faqs" className="bg-white p-6 rounded-lg shadow hover:shadow-md transition text-center"> {/* Enlace interno */} 
            <LifeBuoy className="h-10 w-10 text-emerald-600 mx-auto mb-3" />
            <h3 className="font-semibold text-lg text-gray-800 mb-1">Preguntas Frecuentes</h3>
            <p className="text-sm text-gray-500">Respuestas rápidas a dudas comunes.</p>
          </a>
          <Link to="/contacto" className="bg-white p-6 rounded-lg shadow hover:shadow-md transition text-center">
            <MessageSquare className="h-10 w-10 text-emerald-600 mx-auto mb-3" />
            <h3 className="font-semibold text-lg text-gray-800 mb-1">Contactar Soporte</h3>
            <p className="text-sm text-gray-500">Habla con nuestro equipo de ayuda.</p>
          </Link>
        </div>

        {/* Sección de FAQs */}
        <div id="faqs">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 border-b pb-2">Preguntas Frecuentes</h2>
          {Object.keys(faqsByCategory).length > 0 ? (
            Object.entries(faqsByCategory).map(([category, faqsInCategory]) => (
              <div key={category} className="mb-8">
                <h3 className="text-xl font-medium text-emerald-700 mb-4">{category}</h3>
                <div className="space-y-4">
                  {faqsInCategory.map(faq => (
                    <details key={faq.id} className="bg-white p-4 rounded-lg shadow-sm cursor-pointer group">
                      <summary className="font-medium text-gray-700 list-none flex justify-between items-center">
                        {faq.question}
                        <span className="text-emerald-500 group-open:rotate-90 transition-transform duration-200">▶</span>
                      </summary>
                      <p className="text-gray-600 mt-3 text-sm leading-relaxed border-t pt-3">
                        {faq.answer}
                      </p>
                    </details>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center py-6">No se encontraron FAQs que coincidan con tu búsqueda.</p>
          )}
        </div>

        {/* TODO: Implementar sistema de tickets y chat de soporte */} 

      </div>
    </div>
  );
};

export default HelpCenter; 