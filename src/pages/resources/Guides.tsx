import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Download, ArrowRight } from 'lucide-react';

// Definir tipo para las guías
interface Guide {
  id: string;
  title: string;
  description: string;
  type: string;
  icon: React.ElementType; // Tipo para componente de ícono
  content?: string; // Contenido detallado (opcional)
  link?: string; // Enlace interno
  downloadUrl?: string; // Enlace de descarga
}

// Exportar los datos de las guías
export const guides: Guide[] = [
  {
    id: 'vendedores-publicacion', // Nuevo ID
    title: 'Guía para Vendedores: Cómo crear tu primera publicación',
    description: 'Aprender a subir tu primer material reciclable en e-colector de forma correcta, clara y atractiva.',
    type: 'Tutorial',
    icon: BookOpen,
    link: '/recursos/guias/vendedores-publicacion', // Enlace actualizado
    content: `### Objetivo:
Aprender a subir tu primer material reciclable en e-colector de forma correcta, clara y atractiva.\n\n### Contenido:\n\n1.  **Crea tu cuenta**\n    *   Regístrate con tu correo, Google o Facebook\n    *   Elige tu rol: Generador de residuos / Vendedor\n2.  **Accede a tu panel de usuario**\n    *   Haz clic en "Publicar Material"\n    *   Ingresa al formulario guiado\n3.  **Completa la información del material**\n    *   Título (Ej: Botellas PET limpias, 20kg)\n    *   Categoría (Plástico, Cartón, etc.)\n    *   Tipo: Reutilizable / Reciclable / Desperdicio aprovechable\n    *   Cantidad (kg, piezas, bultos)\n    *   Descripción (estado, limpieza, forma de entrega)\n    *   Precio (opcional)\n    *   Ubicación y contacto\n4.  **Sube tus imágenes**\n    *   Imagen de portada clara\n    *   Galería (opcional) para mostrar volumen o condición\n5.  **Publica y revisa**\n    *   Una vez publicada, podrás editarla desde tu panel\n    *   Los recolectores o compradores interesados te escribirán directamente\n\n**Tip:** Publicaciones con fotos limpias, títulos claros y descripciones completas tienen mayor visibilidad y respuestas.`
  },
  {
    id: 'clasificacion-plasticos', // Nuevo ID
    title: 'Mejores Prácticas para la Clasificación de Plásticos',
    description: 'Ayudar a los usuarios a identificar, separar y etiquetar correctamente los plásticos, maximizando su valor y facilitando su recolección.',
    type: 'Mejores Prácticas',
    icon: BookOpen,
    link: '/recursos/guias/clasificacion-plasticos', // Enlace actualizado
    content: `### Objetivo:
Ayudar a los usuarios a identificar, separar y etiquetar correctamente los plásticos, maximizando su valor y facilitando su recolección.\n\n### Contenido:\n\n**Conoce los principales tipos de plásticos reciclables:**\n*   **PET (1):** Botellas de agua y refresco.\n*   **HDPE (2):** Detergentes, envases opacos.\n*   **PVC (3):** Tubos, algunas botellas.\n*   **LDPE (4):** Bolsas flexibles, envolturas.\n*   **PP (5):** Tapas, tupperware.\n*   **PS (6):** Vasos de unicel, charolas.\n*   **Otros (7):** Mezclas de plástico (difícil reciclaje).\n\n**Limpieza básica antes de publicar:**\n*   Vacía y enjuaga los envases\n*   Evita residuos orgánicos o químicos\n*   No mezcles plásticos diferentes\n\n**Separación por tipo:**\n*   Agrupa por número o tipo\n*   Usa bolsas o contenedores individuales\n\n**Etiquetado útil para la plataforma:**\n*   "PET limpio, sin etiquetas"\n*   "HDPE opaco, sin residuos"\n*   "PS en bloques grandes"\n\n**Evita mezclar materiales:**\n*   No combines plástico con cartón, metal o residuos no reciclables\n\n**Resultado:** Mejora el valor del material publicado y facilita la recolección para recicladores y empresas.`
  },
  {
    id: 'checklist-preparacion', // Nuevo ID
    title: 'Checklist de Preparación de Materiales (Descargable)',
    description: 'Asegurar que el material que publiques en e-colector esté limpio, separado, y listo para ser recolectado o vendido.',
    type: 'Recurso Descargable',
    icon: Download,
    downloadUrl: '/docs/checklist-preparacion.pdf' // Mantenemos enlace de descarga, sin contenido detallado aquí
    // No añadimos `content` ni `link` para este item descargable
  },
];

const Guides = () => {
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">Guías y Recursos</h1>
      <p className="text-lg text-gray-600 mb-10 text-center max-w-2xl mx-auto">
        Encuentra tutoriales, mejores prácticas y documentos útiles para sacar el máximo provecho de e-colector y optimizar tus procesos de reciclaje.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {guides.map(guide => (
          <div key={guide.id} className="bg-white rounded-lg shadow p-6 flex flex-col">
            <div className="flex items-center mb-3">
                <guide.icon className="h-8 w-8 text-emerald-600 mr-3 flex-shrink-0" />
                <div>
                    <span className="text-xs font-semibold text-emerald-700 uppercase">{guide.type}</span>
                    <h2 className="font-semibold text-lg text-gray-800">{guide.title}</h2>
                </div>
            </div>
            <p className="text-gray-600 text-sm mb-5 flex-grow">{guide.description}</p>
            {
              guide.downloadUrl ? (
                 <a href={guide.downloadUrl} download target="_blank" rel="noopener noreferrer"
                   className="mt-auto inline-flex items-center justify-center gap-2 bg-emerald-600 text-white py-2 px-4 rounded-lg hover:bg-emerald-700 transition font-medium">
                   <Download className="h-4 w-4"/> Descargar Recurso
                 </a>
              ) : guide.link ? (
                 <Link to={guide.link}
                   className="mt-auto inline-flex items-center justify-center gap-2 bg-white text-emerald-600 border border-emerald-600 py-2 px-4 rounded-lg hover:bg-emerald-50 transition font-medium">
                   Leer Guía <ArrowRight className="h-4 w-4"/>
                 </Link>
              ) : null
            }
          </div>
        ))}
      </div>
    </div>
  );
};

export default Guides; 