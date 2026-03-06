import React, { useState } from 'react';
import { Mail, Phone, MapPin, Loader, CheckCircle, Instagram } from 'lucide-react';
import { supabase } from '../../lib/supabase';

const Contact = () => {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // Obtener el id del admin para enviarle el mensaje
      const { data: admins } = await supabase
        .from('users')
        .select('id')
        .eq('role', 'admin')
        .limit(1);

      if (admins && admins.length > 0) {
        // Insertar en tabla messages como mensaje de contacto
        await supabase.from('messages').insert({
          sender_id: admins[0].id, // usamos admin como sender temporal para usuarios anónimos
          receiver_id: admins[0].id,
          subject: `[Contacto] ${formData.subject}`,
          content: `Nombre: ${formData.name}\nEmail: ${formData.email}\n\n${formData.message}`,
          read: false,
        });
      }

      // También enviar por mailto como fallback
      setIsSubmitted(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch {
      setError('Hubo un problema al enviar tu mensaje. Por favor contáctanos directamente a hola@e-colector.com');
    }
    setIsLoading(false);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Contáctanos</h1>
        <p className="text-gray-500">Estamos aquí para ayudarte. Escríbenos y te respondemos a la brevedad.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Formulario */}
        <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Envíanos un mensaje</h2>
          {isSubmitted ? (
            <div className="text-center py-10">
              <CheckCircle className="h-14 w-14 text-emerald-500 mx-auto mb-4" />
              <p className="font-semibold text-lg text-gray-800 mb-1">¡Mensaje enviado!</p>
              <p className="text-gray-500 text-sm">Nos pondremos en contacto contigo pronto a través de <strong>hola@e-colector.com</strong>.</p>
              <button
                onClick={() => setIsSubmitted(false)}
                className="mt-5 text-sm text-emerald-600 hover:underline"
              >
                Enviar otro mensaje
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1.5">Nombre completo</label>
                <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} required
                  placeholder="Tu nombre"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">Correo electrónico</label>
                <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} required
                  placeholder="tu@email.com"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>
              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1.5">Asunto</label>
                <input type="text" id="subject" name="subject" value={formData.subject} onChange={handleChange} required
                  placeholder="¿En qué podemos ayudarte?"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1.5">Mensaje</label>
                <textarea id="message" name="message" rows={5} value={formData.message} onChange={handleChange} required
                  placeholder="Cuéntanos más..."
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none" />
              </div>
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
                  {error}
                </div>
              )}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold py-3 px-4 rounded-xl transition-colors text-sm"
              >
                {isLoading ? <Loader className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
                {isLoading ? 'Enviando...' : 'Enviar mensaje'}
              </button>
            </form>
          )}
        </div>

        {/* Información de contacto */}
        <div className="space-y-5">
          <h2 className="text-xl font-semibold text-gray-900">Información de contacto</h2>

          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-start gap-4">
            <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <Mail className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 text-sm">Email</h3>
              <a href="mailto:hola@e-colector.com" className="text-emerald-600 hover:underline text-sm">hola@e-colector.com</a>
              <p className="text-xs text-gray-500 mt-1">Respondemos en menos de 24 horas hábiles.</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-start gap-4">
            <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <Phone className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 text-sm">Teléfono</h3>
              <a href="tel:+528189962447" className="text-emerald-600 hover:underline text-sm">+52 81 8996 2447</a>
              <p className="text-xs text-gray-500 mt-1">Lunes a Viernes, 9:00 – 18:00 (CST).</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-start gap-4">
            <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <MapPin className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 text-sm">Ubicación</h3>
              <p className="text-gray-600 text-sm">Monterrey, Nuevo León, México</p>
              <p className="text-xs text-gray-500 mt-1">Atención presencial con cita previa.</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-start gap-4">
            <div className="w-10 h-10 bg-pink-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <Instagram className="h-5 w-5 text-pink-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 text-sm">Redes sociales</h3>
              <a href="https://www.instagram.com/ecolector62" target="_blank" rel="noopener noreferrer"
                className="text-pink-600 hover:underline text-sm">@ecolector62</a>
              <p className="text-xs text-gray-500 mt-1">Únete a nuestra comunidad.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
