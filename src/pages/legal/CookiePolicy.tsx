import React from 'react';

const CookiePolicy = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Política de Cookies
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
          Última actualización: Enero 2026
        </p>

        <div className="prose prose-emerald max-w-none text-gray-700 dark:text-gray-300 space-y-6">
          <p>
            Esta Política de Cookies describe qué son las cookies, cómo las utiliza E-Colector
            y qué opciones tienes como usuario. Te recomendamos leerla junto con nuestro
            Aviso de Privacidad y Términos de Servicio.
          </p>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-3">
              1. ¿Qué son las cookies?
            </h2>
            <p>
              Las cookies son pequeños archivos de texto que los sitios web almacenan en tu
              dispositivo (ordenador, tablet o móvil) cuando los visitas. Permiten que la
              plataforma recuerde tus acciones y preferencias durante un tiempo, para que no
              tengas que volver a configurarlas cada vez que regreses.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-3">
              2. Tipos de cookies que utilizamos
            </h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Cookies técnicas o estrictamente necesarias:</strong> Son esenciales
                para el funcionamiento del sitio (por ejemplo, mantener tu sesión iniciada,
                recordar tu idioma o preferencias de seguridad). Sin ellas, algunos servicios
                no podrían ofrecerse correctamente.
              </li>
              <li>
                <strong>Cookies de rendimiento o analíticas:</strong> Nos permiten conocer
                cómo se usa la plataforma (páginas visitadas, tiempo de permanencia) para
                mejorar la experiencia de usuario. La información suele ser anónima o
                agregada.
              </li>
              <li>
                <strong>Cookies de funcionalidad:</strong> Recuerdan elecciones que haces
                (como región, idioma o tipo de usuario) para ofrecerte una experiencia más
                personalizada.
              </li>
              <li>
                <strong>Cookies de terceros:</strong> Pueden ser establecidas por servicios
                que utilizamos (por ejemplo, mapas, análisis o redes sociales). Su uso está
                sujeto a las políticas de privacidad de esos terceros.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-3">
              3. Finalidad del uso de cookies
            </h2>
            <p>
              Utilizamos cookies para: (a) garantizar el correcto funcionamiento de la
              plataforma y la autenticación; (b) recordar tus preferencias y configuración;
              (c) analizar el uso del sitio y mejorar nuestros servicios; (d) cumplir
              obligaciones legales o de seguridad cuando sea necesario.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-3">
              4. Duración
            </h2>
            <p>
              Las cookies pueden ser de sesión (se eliminan al cerrar el navegador) o
              persistentes (permanecen un tiempo determinado en tu dispositivo). En cada
              caso, el tiempo de conservación respeta los plazos necesarios para la finalidad
              indicada y la normativa aplicable.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-3">
              5. Cómo gestionar o eliminar cookies
            </h2>
            <p>
              Puedes configurar tu navegador para bloquear o eliminar cookies. La forma de
              hacerlo depende del navegador que uses (Chrome, Firefox, Safari, Edge, etc.).
              Ten en cuenta que bloquear ciertas cookies puede afectar la funcionalidad del
              sitio (por ejemplo, no poder mantener la sesión iniciada).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-3">
              6. Consentimiento
            </h2>
            <p>
              En la primera visita a la plataforma, o cuando sea necesario según la
              normativa aplicable, podrás aceptar o rechazar el uso de cookies no
              estrictamente necesarias. Las cookies técnicas necesarias para el
              funcionamiento del servicio no requieren consentimiento previo.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-3">
              7. Cambios en esta política
            </h2>
            <p>
              Nos reservamos el derecho de actualizar esta Política de Cookies para
              reflejar cambios en nuestras prácticas o en la normativa. Te recomendamos
              revisarla periódicamente. La fecha de última actualización se indica al
              inicio del documento.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-3">
              8. Contacto
            </h2>
            <p>
              Para cualquier duda sobre el uso de cookies o el ejercicio de tus derechos,
              puedes contactarnos en:{' '}
              <a href="mailto:hola@ecolector.com" className="text-emerald-600 hover:underline">
                hola@ecolector.com
              </a>
            </p>
          </section>

          <div className="mt-10 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg text-sm">
            <p className="font-semibold text-amber-800 dark:text-amber-200 mb-1">
              Nota legal (México)
            </p>
            <p className="text-amber-800 dark:text-amber-200">
              La adaptación específica a la legislación mexicana en materia de cookies y
              datos personales (LFPDPPP y normativa aplicable) está pendiente de revisión
              por asesoría legal. Los principios aquí descritos son de aplicación general;
              se recomienda validar el texto final con un profesional del derecho en México.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CookiePolicy;
