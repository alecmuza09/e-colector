import React from 'react';

const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Términos de Servicio
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
          Última actualización: Enero 2026
        </p>

        <div className="prose prose-emerald max-w-none text-gray-700 dark:text-gray-300 space-y-6">
          <p>
            Bienvenido a E-Colector. Estos Términos de Servicio («Términos») regulan el
            acceso y uso de la plataforma E-Colector («Plataforma», «Servicio») operada por
            E-Colector («nosotros», «nuestro»). Al registrarte o usar el Servicio, aceptas
            quedar vinculado por estos Términos. Si no estás de acuerdo, no utilices la Plataforma.
          </p>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-3">
              1. Descripción del servicio
            </h2>
            <p>
              E-Colector es una plataforma que conecta a vendedores, compradores y
              recolectores de materiales para facilitar la compraventa y el reciclaje. La
              Plataforma actúa como intermediario; no somos parte de las transacciones entre
              usuarios ni garantizamos la calidad, legalidad o disponibilidad de los
              artículos publicados. El uso del Servicio es bajo tu propia responsabilidad.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-3">
              2. Registro y cuenta
            </h2>
            <p>
              Para usar determinadas funcionalidades debes registrarte proporcionando
              información veraz, completa y actualizada (por ejemplo, correo electrónico y
              contraseña). Eres responsable de mantener la confidencialidad de tu contraseña
              y de toda actividad que ocurra en tu cuenta. Debes notificarnos de cualquier
              uso no autorizado o violación de seguridad. Nos reservamos el derecho de
              rechazar el registro o suspender/cancelar cuentas que incumplan estos Términos
              o que falseen información.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-3">
              3. Conducta del usuario
            </h2>
            <p>Al usar la Plataforma te comprometes a:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>No publicar contenido ilegal, engañoso, ofensivo, difamatorio o que viole derechos de terceros.</li>
              <li>No suplantar a personas o entidades ni falsear tu identidad o afiliación.</li>
              <li>No utilizar el Servicio para spam, publicidad no autorizada, esquemas piramidales o actividades fraudulentas.</li>
              <li>No interferir con el funcionamiento del Servicio, redes o sistemas (incluyendo intentos de acceso no autorizado).</li>
              <li>Cumplir la legislación aplicable y respetar los derechos de otros usuarios.</li>
            </ul>
            <p>
              El incumplimiento de estas normas puede dar lugar a la suspensión o
              cancelación de tu cuenta sin previo aviso.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-3">
              4. Transacciones entre usuarios
            </h2>
            <p>
              Las ofertas, solicitudes, acuerdos y pagos entre usuarios son responsabilidad
              exclusiva de dichos usuarios. E-Colector no interviene en la ejecución de
              las transacciones ni garantiza el cumplimiento de los acuerdos. Cualquier
              disputa entre usuarios debe resolverse directamente entre las partes; en la
              medida permitida por la ley, E-Colector no será responsable por daños
              derivados de transacciones entre usuarios.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-3">
              5. Contenido e propiedad intelectual
            </h2>
            <p>
              Tú conservas los derechos sobre el contenido que publicas (textos, imágenes,
              etc.). Al publicar, nos otorgas una licencia no exclusiva, mundial y libre de
              regalías para usar, mostrar y distribuir dicho contenido en el marco del
              Servicio. La Plataforma, su diseño, marcas y código son propiedad de
              E-Colector o de sus licenciantes y están protegidos por leyes de propiedad
              intelectual. No está permitido copiar, modificar o explotar el Servicio o sus
              elementos sin autorización expresa.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-3">
              6. Privacidad y datos personales
            </h2>
            <p>
              El tratamiento de tus datos personales se rige por nuestro{' '}
              <a href="/legal/privacidad" className="text-emerald-600 hover:underline">
                Aviso de Privacidad
              </a>
              . Al usar el Servicio aceptas dicho tratamiento según lo allí descrito.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-3">
              7. Terminación
            </h2>
            <p>
              Podemos suspender o dar por terminado tu acceso al Servicio en cualquier
              momento, con o sin causa, incluyendo en caso de incumplimiento de estos
              Términos. Tú puedes cerrar tu cuenta en cualquier momento dejando de usar el
              Servicio o solicitando la baja según los medios que pongamos a tu
              disposición. Tras la terminación, tu derecho a usar el Servicio cesa de
              inmediato; las disposiciones que por su naturaleza deban sobrevivir (por
              ejemplo, limitación de responsabilidad, ley aplicable) seguirán vigentes.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-3">
              8. Limitación de responsabilidad
            </h2>
            <p>
              En la máxima medida permitida por la ley aplicable, E-Colector y sus
              directores, empleados, proveedores y afiliados no serán responsables por
              daños indirectos, incidentales, especiales, consecuentes o punitivos
              (incluyendo pérdida de beneficios, datos o goodwill) derivados del uso o la
              imposibilidad de uso del Servicio, de la conducta de terceros, del contenido
              publicado por usuarios o de accesos no autorizados. El Servicio se ofrece
              «tal cual»; no garantizamos que esté libre de errores o interrupciones. En
              ningún caso nuestra responsabilidad total superará el monto que hayas pagado
              a E-Colector en los doce meses anteriores al hecho que la origine (o, si no
              aplica, cero).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-3">
              9. Ley aplicable y jurisdicción
            </h2>
            <p>
              Estos Términos se regirán e interpretarán de acuerdo con las leyes
              aplicables en el lugar desde el que operamos el Servicio. Cualquier
              controversia se someterá a los tribunales competentes en dicho lugar, salvo
              que la ley imperativa del usuario exija otra cosa.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-3">
              10. Modificaciones
            </h2>
            <p>
              Nos reservamos el derecho de modificar estos Términos en cualquier momento.
              Los cambios se publicarán en la Plataforma con la fecha de última
              actualización. Si los cambios son sustanciales, intentaremos notificarte por
              medios razonables (por ejemplo, aviso en la Plataforma o por correo). El uso
              continuado del Servicio tras la entrada en vigor de los cambios constituye
              la aceptación de los nuevos Términos.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-3">
              11. Contacto
            </h2>
            <p>
              Para preguntas sobre estos Términos:{' '}
              <a href="mailto:legal@ecolector.com" className="text-emerald-600 hover:underline">
                legal@ecolector.com
              </a>
            </p>
          </section>

          <div className="mt-10 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg text-sm">
            <p className="font-semibold text-amber-800 dark:text-amber-200 mb-1">
              Nota legal (México)
            </p>
            <p className="text-amber-800 dark:text-amber-200">
              La adaptación específica a la legislación mexicana (incluyendo disposiciones
              en materia de comercio electrónico, protección al consumidor y competencia)
              está pendiente de revisión por asesoría legal. Los principios aquí descritos
              son de aplicación general; se recomienda validar el texto final con un
              profesional del derecho en México.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;
