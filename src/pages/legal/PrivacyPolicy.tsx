import React from 'react';

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Aviso de Privacidad
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
          Última actualización: Enero 2026
        </p>

        <div className="prose prose-emerald max-w-none text-gray-700 dark:text-gray-300 space-y-6">
          <p>
            E-Colector («nosotros», «la plataforma») se compromete a proteger tu privacidad.
            Este Aviso de Privacidad describe qué datos recopilamos, para qué los usamos,
            con quién los compartimos y qué derechos tienes respecto a tu información.
          </p>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-3">
              1. Responsable del tratamiento
            </h2>
            <p>
              El responsable del tratamiento de tus datos personales es E-Colector. Para
              ejercer tus derechos o resolver dudas sobre el tratamiento de tus datos,
              puedes contactarnos en:{' '}
              <a href="mailto:privacidad@ecolector.com" className="text-emerald-600 hover:underline">
                privacidad@ecolector.com
              </a>
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-3">
              2. Datos que recopilamos
            </h2>
            <p>Recopilamos la información que nos proporcionas al registrarte y usar la plataforma:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Datos de identificación y contacto:</strong> nombre, correo electrónico,
                y, si lo indicas, número de teléfono, dirección o datos de perfil (por ejemplo,
                tipo de usuario: vendedor, comprador, recolector).
              </li>
              <li>
                <strong>Datos de la cuenta:</strong> contraseña (almacenada de forma segura
                y encriptada), preferencias de la cuenta y configuración.
              </li>
              <li>
                <strong>Datos de uso:</strong> información que nuestros sistemas recopilan
                al usar la plataforma (dirección IP, tipo de navegador, páginas visitadas,
                horarios de acceso) para el correcto funcionamiento y la seguridad del servicio.
              </li>
              <li>
                <strong>Contenido que publicas:</strong> ofertas, solicitudes, mensajes y
                cualquier otro contenido que subas o publiques en la plataforma.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-3">
              3. Finalidad del tratamiento
            </h2>
            <p>Utilizamos tus datos para:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Crear y gestionar tu cuenta y permitirte acceder a la plataforma.</li>
              <li>Poner en contacto a vendedores, compradores y recolectores según el uso que hagas del servicio.</li>
              <li>Gestionar ofertas, solicitudes, mensajes y transacciones entre usuarios.</li>
              <li>Enviar comunicaciones técnicas o administrativas necesarias para el servicio (por ejemplo, cambios de contraseña o avisos de seguridad).</li>
              <li>Mejorar la plataforma, la seguridad y la experiencia de usuario (incluyendo análisis agregados o anónimos).</li>
              <li>Cumplir obligaciones legales y resolver disputas cuando sea necesario.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-3">
              4. Base legal y consentimiento
            </h2>
            <p>
              El tratamiento se basa en la ejecución del contrato (prestación del servicio),
              en tu consentimiento cuando lo requiera la normativa aplicable, y en el
              interés legítimo para la seguridad, mejora del servicio y cumplimiento legal.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-3">
              5. Compartición de datos
            </h2>
            <p>
              No vendemos tus datos personales. Podemos compartir información con:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Otros usuarios:</strong> según la funcionalidad que uses (por ejemplo, nombre y datos de perfil visibles en ofertas o mensajes).</li>
              <li><strong>Proveedores de servicios:</strong> alojamiento, autenticación, análisis o soporte técnico, que actúan por nuestra cuenta y con obligaciones de confidencialidad.</li>
              <li><strong>Autoridades:</strong> cuando la ley lo exija o para proteger derechos y seguridad.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-3">
              6. Conservación
            </h2>
            <p>
              Conservamos tus datos mientras mantengas una cuenta activa y, tras la baja,
              durante el tiempo necesario para cumplir obligaciones legales, resolver
              reclamaciones o ejercer o defender derechos.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-3">
              7. Seguridad
            </h2>
            <p>
              Aplicamos medidas técnicas y organizativas adecuadas para proteger tus datos
              frente a accesos no autorizados, pérdida o alteración. La transmisión de
              datos sensibles se realiza mediante protocolos seguros. Ningún sistema es
              infalible; te recomendamos usar contraseñas robustas y no compartir tu acceso.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-3">
              8. Tus derechos
            </h2>
            <p>
              Puedes solicitar el acceso, rectificación, supresión, limitación del
              tratamiento, portabilidad y oposición al tratamiento de tus datos, así como
              retirar el consentimiento cuando este sea la base del tratamiento. Para
              ejercer estos derechos, escríbenos a{' '}
              <a href="mailto:privacidad@ecolector.com" className="text-emerald-600 hover:underline">
                privacidad@ecolector.com
              </a>
              . Tienes derecho a presentar una reclamación ante la autoridad de protección
              de datos competente si consideras que el tratamiento vulnera la normativa aplicable.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-3">
              9. Cookies y tecnologías similares
            </h2>
            <p>
              Utilizamos cookies y tecnologías similares según se describe en nuestra{' '}
              <a href="/legal/cookies" className="text-emerald-600 hover:underline">
                Política de Cookies
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-3">
              10. Cambios en este aviso
            </h2>
            <p>
              Nos reservamos el derecho de actualizar este Aviso de Privacidad. Los cambios
              relevantes se comunicarán mediante un aviso en la plataforma o por correo.
              La fecha de última actualización se indica al inicio del documento.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-3">
              11. Contacto
            </h2>
            <p>
              Para cualquier duda sobre el tratamiento de tus datos o el ejercicio de tus
              derechos:{' '}
              <a href="mailto:privacidad@ecolector.com" className="text-emerald-600 hover:underline">
                privacidad@ecolector.com
              </a>
            </p>
          </section>

          <div className="mt-10 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg text-sm">
            <p className="font-semibold text-amber-800 dark:text-amber-200 mb-1">
              Nota legal (México)
            </p>
            <p className="text-amber-800 dark:text-amber-200">
              La adaptación específica a la legislación mexicana en materia de datos
              personales (Ley Federal de Protección de Datos Personales en Posesión de los
              Particulares —LFPDPPP— y su reglamento) está pendiente de revisión por
              asesoría legal. Los principios aquí descritos son de aplicación general; se
              recomienda validar el texto final y el aviso de privacidad integral con un
              profesional del derecho en México.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
