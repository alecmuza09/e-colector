import React, { useState } from 'react';
import { Mail, Phone, MapPin } from 'lucide-react';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implementar lógica de envío del formulario (ej. llamada a API)
    console.log('Formulario enviado:', formData);
    setIsSubmitted(true);
    // Opcional: resetear formulario
    // setFormData({ name: '', email: '', subject: '', message: '' });
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">Contacto</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Formulario de Contacto */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold text-emerald-700 mb-5">Envíanos un mensaje</h2>
          {isSubmitted ? (
              <div className="text-center p-6 bg-emerald-50 border border-emerald-200 rounded-lg">
                  <Mail className="h-12 w-12 text-emerald-500 mx-auto mb-3"/>
                  <p className="font-semibold text-lg text-emerald-700">¡Gracias por tu mensaje!</p>
                  <p className="text-gray-600">Nos pondremos en contacto contigo pronto.</p>
              </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} required 
                       className="w-full p-2 border border-gray-300 rounded-lg shadow-sm focus:ring-emerald-500 focus:border-emerald-500"/>
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} required
                       className="w-full p-2 border border-gray-300 rounded-lg shadow-sm focus:ring-emerald-500 focus:border-emerald-500"/>
              </div>
              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">Asunto</label>
                <input type="text" id="subject" name="subject" value={formData.subject} onChange={handleChange} required
                       className="w-full p-2 border border-gray-300 rounded-lg shadow-sm focus:ring-emerald-500 focus:border-emerald-500"/>
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">Mensaje</label>
                <textarea id="message" name="message" rows={4} value={formData.message} onChange={handleChange} required
                          className="w-full p-2 border border-gray-300 rounded-lg shadow-sm focus:ring-emerald-500 focus:border-emerald-500"></textarea>
              </div>
              <button type="submit" className="w-full bg-emerald-600 text-white py-2 px-4 rounded-lg hover:bg-emerald-700 transition font-medium">
                Enviar Mensaje
              </button>
            </form>
           )}
        </div>

        {/* Información de Contacto */}
        <div className="space-y-6">
             <h2 className="text-2xl font-semibold text-emerald-700 mb-5">Información de Soporte</h2>
             <div className="bg-white p-5 rounded-lg shadow-sm flex items-start gap-4">
                <Mail className="h-6 w-6 text-emerald-600 mt-1 flex-shrink-0" />
                <div>
                    <h3 className="font-medium text-gray-800">Email de Soporte</h3>
                    <a href="mailto:soporte@e-colector.com" className="text-emerald-600 hover:underline">soporte@e-colector.com</a>
                    <p className="text-sm text-gray-500 mt-1">Para consultas generales y asistencia técnica.</p>
                </div>
             </div>
              <div className="bg-white p-5 rounded-lg shadow-sm flex items-start gap-4">
                <Phone className="h-6 w-6 text-emerald-600 mt-1 flex-shrink-0" />
                <div>
                    <h3 className="font-medium text-gray-800">Teléfono</h3>
                    <a href="tel:+34900123456" className="text-emerald-600 hover:underline">+34 900 123 456</a>
                    <p className="text-sm text-gray-500 mt-1">Horario de atención: Lunes a Viernes, 9:00 - 18:00 CET.</p>
                </div>
             </div>
              <div className="bg-white p-5 rounded-lg shadow-sm flex items-start gap-4">
                <MapPin className="h-6 w-6 text-emerald-600 mt-1 flex-shrink-0" />
                <div>
                    <h3 className="font-medium text-gray-800">Oficina Central</h3>
                    <p className="text-gray-600">[Dirección completa], [Ciudad], [Código Postal], España</p>
                    <p className="text-sm text-gray-500 mt-1">Visitas solo con cita previa.</p>
                    {/* Opcional: Embed de mapa */}
                    {/* <div className="mt-3 h-48 bg-gray-200 rounded">Mapa aquí</div> */} 
                </div>
             </div>
        </div>
      </div>
    </div>
  );
};

export default Contact; 