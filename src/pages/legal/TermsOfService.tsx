import React from 'react';

const TermsOfService = () => {
  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Términos y Condiciones de Uso</h1>
      <p className="text-sm text-gray-500 mb-6">Última actualización: [Fecha]</p>

      <div className="prose prose-emerald max-w-none">
        <p>Por favor, lee estos Términos y Condiciones de Uso ("Términos", "Términos y Condiciones") cuidadosamente antes de usar la plataforma e-colector (el "Servicio") operada por [Nombre de la Empresa] ("nosotros", "nos", o "nuestro").</p>
        <p>Tu acceso y uso del Servicio está condicionado a tu aceptación y cumplimiento de estos Términos. Estos Términos se aplican a todos los visitantes, usuarios y otras personas que accedan o utilicen el Servicio.</p>
        <p><strong>Al acceder o utilizar el Servicio, aceptas estar vinculado por estos Términos. Si no estás de acuerdo con alguna parte de los términos, entonces no puedes acceder al Servicio.</strong></p>

        <h2>1. Cuentas</h2>
        <p>Cuando creas una cuenta con nosotros, debes proporcionarnos información precisa, completa y actualizada en todo momento. El incumplimiento de esto constituye una violación de los Términos, lo que puede resultar en la terminación inmediata de tu cuenta en nuestro Servicio.</p>
        <p>Eres responsable de salvaguardar la contraseña que utilizas para acceder al Servicio y de cualquier actividad o acción bajo tu contraseña, ya sea que tu contraseña esté con nuestro Servicio o un servicio de terceros.</p>
        <p>Aceptas no divulgar tu contraseña a ningún tercero. Debes notificarnos inmediatamente después de tomar conocimiento de cualquier violación de seguridad o uso no autorizado de tu cuenta.</p>
        <p>No puedes usar como nombre de usuario el nombre de otra persona o entidad o que no esté legalmente disponible para su uso, un nombre o marca comercial que esté sujeto a derechos de otra persona o entidad que no seas tú sin la autorización apropiada, o un nombre que sea ofensivo, vulgar u obsceno.</p>

        <h2>2. Conducta del Usuario</h2>
        <p>Aceptas no utilizar el Servicio para:</p>
        <ul>
          <li>Publicar contenido ilegal, dañino, amenazante, abusivo, acosador, difamatorio, vulgar, obsceno, invasivo de la privacidad de otros, odioso o racial, étnica o de otra manera objetable.</li>
          <li>Hacerse pasar por cualquier persona o entidad, o declarar falsamente o tergiversar tu afiliación con una persona o entidad.</li>
          <li>Publicar cualquier contenido que no tengas derecho a poner a disposición bajo ninguna ley o bajo relaciones contractuales o fiduciarias.</li>
           <li>Publicar cualquier publicidad no solicitada o no autorizada, materiales promocionales, "correo basura", "spam", "cartas en cadena", "esquemas piramidales" o cualquier otra forma de solicitud.</li>
           <li>Interferir o interrumpir el Servicio o servidores o redes conectadas al Servicio.</li>
           <li>Violar cualquier ley local, estatal, nacional o internacional aplicable.</li>
        </ul>
        <p>Nos reservamos el derecho de suspender o cancelar tu cuenta si participas en actividades prohibidas.</p>
        
        <h2>3. Transacciones entre Usuarios</h2>
        <p>e-colector actúa como una plataforma para conectar a Vendedores, Compradores y Recicladores. No somos parte directa de ninguna transacción entre usuarios. No garantizamos la calidad, seguridad o legalidad de los artículos publicados, la veracidad o exactitud de las publicaciones de los usuarios, la capacidad de los vendedores para vender artículos, la capacidad de los compradores para pagar los artículos, o que un comprador o vendedor completará una transacción.</p>
        <p>Te recomendamos que utilices la precaución y el sentido común al interactuar con otros usuarios. Cualquier disputa relacionada con una transacción debe resolverse directamente entre el comprador y el vendedor.</p>

        <h2>4. Propiedad Intelectual</h2>
        <p>El Servicio y su contenido original (excluyendo el Contenido proporcionado por los usuarios), características y funcionalidad son y seguirán siendo propiedad exclusiva de [Nombre de la Empresa] y sus licenciantes. El Servicio está protegido por derechos de autor, marcas comerciales y otras leyes tanto de [País] como de países extranjeros.</p>

        <h2>5. Terminación</h2>
        <p>Podemos terminar o suspender tu cuenta inmediatamente, sin previo aviso ni responsabilidad, por cualquier motivo, incluyendo, entre otros, si incumples los Términos.</p>
        <p>Tras la terminación, tu derecho a utilizar el Servicio cesará inmediatamente. Si deseas cancelar tu cuenta, simplemente puedes dejar de usar el Servicio.</p>

        <h2>6. Limitación de Responsabilidad</h2>
        <p>En ningún caso [Nombre de la Empresa], ni sus directores, empleados, socios, agentes, proveedores o afiliados, serán responsables por daños indirectos, incidentales, especiales, consecuentes o punitivos, incluyendo, sin limitación, pérdida de beneficios, datos, uso, buena voluntad u otras pérdidas intangibles, resultantes de (i) tu acceso o uso o incapacidad para acceder o usar el Servicio; (ii) cualquier conducta o contenido de cualquier tercero en el Servicio; (iii) cualquier contenido obtenido del Servicio; y (iv) acceso no autorizado, uso o alteración de tus transmisiones o contenido, ya sea basado en garantía, contrato, agravio (incluida negligencia) o cualquier otra teoría legal, ya sea que hayamos sido informados o no de la posibilidad de dicho daño, e incluso si se determina que un remedio establecido en este documento ha fallado en su propósito esencial.</p>

        <h2>7. Ley Aplicable</h2>
        <p>Estos Términos se regirán e interpretarán de acuerdo con las leyes de [País/Estado], sin tener en cuenta sus disposiciones sobre conflicto de leyes.</p>

        <h2>8. Cambios</h2>
        <p>Nos reservamos el derecho, a nuestra sola discreción, de modificar o reemplazar estos Términos en cualquier momento. Si una revisión es material, intentaremos proporcionar un aviso de al menos 30 días antes de que entren en vigor los nuevos términos. Lo que constituye un cambio material se determinará a nuestra sola discreción.</p>

        <h2>9. Contacto</h2>
        <p>Si tienes alguna pregunta sobre estos Términos, por favor contáctanos en:</p>
        <p>[Email de contacto para asuntos legales, ej. legal@e-colector.com]</p>

      </div>
    </div>
  );
};

export default TermsOfService; 