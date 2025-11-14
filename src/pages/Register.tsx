import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import RoleSelection from '../components/auth/RoleSelection';
import { UserRole } from '../types/user';
import { useAuth } from '../context/AuthContext';

// --- Componentes para campos específicos de cada rol ---

interface FieldProps { 
  formData: any;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  handleCheckboxChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const CompradorFields: React.FC<FieldProps> = ({ formData, handleChange, handleCheckboxChange }) => {
  const municipios = ['Monterrey', 'San Nicolás', 'San Pedro', 'Guadalupe', 'Apodaca', 'Escobedo', 'Santa Catarina', 'Otro']; // Ejemplo
  return (
    <div className="space-y-4">
      <p className="text-sm font-semibold text-gray-700">Información de Comprador</p>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Tipos de materiales que te interesan</label>
        <div className="space-y-1">
          {['Plástico', 'Cartón / Papel', 'Metales', 'Electrónicos', 'Vidrio', 'Textiles'].map(mat => (
            <label key={mat} className="flex items-center text-sm">
              <input type="checkbox" name="materialesInteres" value={mat} checked={formData.materialesInteres?.includes(mat)} onChange={handleCheckboxChange} className="form-checkbox h-4 w-4 text-emerald-600"/>
              <span className="ml-2 text-gray-700">{mat}</span>
            </label>
          ))}
           <div className="flex items-center text-sm">
             <label className="flex items-center flex-grow">
               <input type="checkbox" name="materialesInteres" value="Otros" checked={formData.materialesInteres?.includes('Otros')} onChange={handleCheckboxChange} className="form-checkbox h-4 w-4 text-emerald-600"/>
               <span className="ml-2 text-gray-700">Otros:</span>
             </label>
             <input type="text" name="materialesInteresOtros" value={formData.materialesInteresOtros || ''} onChange={handleChange} placeholder="Especifica" className="ml-2 p-1 border rounded text-xs flex-grow" disabled={!formData.materialesInteres?.includes('Otros')} />
           </div>
        </div>
      </div>

      <SelectField name="volumenCompra" label="Volumen promedio mensual de compra" value={formData.volumenCompra} onChange={handleChange} options={['Menos de 100 kg', '100–500 kg', '500–1000 kg', 'Más de 1000 kg']} />
      <SelectField name="frecuenciaCompra" label="Frecuencia de compra" value={formData.frecuenciaCompra} onChange={handleChange} options={['Una sola vez', 'Semanal', 'Quincenal', 'Mensual', 'Según necesidad']} />
      
      {/* TODO: Implementar multiselección real para zonas */}
      <TextField name="zonasCompra" label="Zonas en las que compras (separadas por coma)" value={formData.zonasCompra} onChange={handleChange} placeholder="Ej: Monterrey, Apodaca" />

      <CheckboxField name="recibirAlertas" label="¿Deseas recibir alertas cuando se publiquen materiales que te interesen?" checked={formData.recibirAlertas} onChange={handleCheckboxChange} />
    </div>
  );
};

const VendedorFields: React.FC<FieldProps> = ({ formData, handleChange, handleCheckboxChange }) => {
  return (
    <div className="space-y-4">
      <p className="text-sm font-semibold text-gray-700">Información de Vendedor / Generador</p>
      <SelectField name="tipoGenerador" label="Tipo de generador" value={formData.tipoGenerador} onChange={handleChange} options={['Hogar', 'Negocio (comercio u oficina)', 'Industria / Taller']} includeOther />
      {formData.tipoGenerador === 'Otro' && <TextField name="tipoGeneradorOtro" label="Especifica otro tipo" value={formData.tipoGeneradorOtro} onChange={handleChange} />} 
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Materiales que generas regularmente</label>
        <div className="space-y-1">
           {['Plástico', 'Cartón', 'Metales', 'Vidrio', 'Electrónicos', 'Textiles', 'Orgánicos aprovechables'].map(mat => (
            <label key={mat} className="flex items-center text-sm">
              <input type="checkbox" name="materialesGenerados" value={mat} checked={formData.materialesGenerados?.includes(mat)} onChange={handleCheckboxChange} className="form-checkbox h-4 w-4 text-emerald-600"/>
              <span className="ml-2 text-gray-700">{mat}</span>
            </label>
          ))}
        </div>
      </div>
      
      <SelectField name="frecuenciaGeneracion" label="Frecuencia de generación" value={formData.frecuenciaGeneracion} onChange={handleChange} options={['Diario', 'Semanal', 'Mensual', 'Esporádico']} />
      <SelectField name="volumenGeneracion" label="Volumen promedio por generación" value={formData.volumenGeneracion} onChange={handleChange} options={['Menos de 50 kg', '50–200 kg', 'Más de 200 kg']} />
      <RadioGroupField name="dispuestoDonar" label="¿Estás dispuesto a donar materiales?" value={formData.dispuestoDonar} onChange={handleChange} options={['Sí', 'No', 'Depende del tipo de material']} />
      <RadioGroupField name="necesitaRecoleccion" label="¿Necesitas recolección a domicilio?" value={formData.necesitaRecoleccion} onChange={handleChange} options={['Sí', 'No', 'Solo en ciertos casos']} />
    </div>
  );
};

const RecolectorFields: React.FC<FieldProps> = ({ formData, handleChange, handleCheckboxChange }) => {
  return (
    <div className="space-y-4">
       <p className="text-sm font-semibold text-gray-700">Información de Recolector / Empresa</p>
      <SelectField name="tipoRecolector" label="¿Eres...?" value={formData.tipoRecolector} onChange={handleChange} options={['Recolector independiente', 'Centro de acopio', 'Empresa recicladora / Transformadora', 'Cooperativa o agrupación']} />

       <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Servicios que ofreces</label>
        <div className="space-y-1">
           {['Recolección a domicilio', 'Compra de materiales', 'Procesamiento (triturado, compactado, etc.)', 'Clasificación y limpieza', 'Transporte a centros recicladores'].map(srv => (
            <label key={srv} className="flex items-center text-sm">
              <input type="checkbox" name="serviciosOfrecidos" value={srv} checked={formData.serviciosOfrecidos?.includes(srv)} onChange={handleCheckboxChange} className="form-checkbox h-4 w-4 text-emerald-600"/>
              <span className="ml-2 text-gray-700">{srv}</span>
            </label>
          ))}
        </div>
      </div>

      {/* TODO: Implementar multiselección real para zonas */}
      <TextField name="zonasOperacion" label="Zonas en las que operas (separadas por coma)" value={formData.zonasOperacion} onChange={handleChange} placeholder="Ej: Guadalupe, San Pedro" />

       <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Tipos de materiales que manejas</label>
        {/* Reutilizar la lógica de checkboxes de Comprador o Vendedor sería ideal */} 
         <div className="space-y-1">
           {['Plástico', 'Cartón / Papel', 'Metales', 'Electrónicos', 'Vidrio', 'Textiles'].map(mat => (
             <label key={mat} className="flex items-center text-sm">
               <input type="checkbox" name="materialesManejados" value={mat} checked={formData.materialesManejados?.includes(mat)} onChange={handleCheckboxChange} className="form-checkbox h-4 w-4 text-emerald-600"/>
               <span className="ml-2 text-gray-700">{mat}</span>
             </label>
           ))}
         </div>
       </div>
       
      <SelectField name="frecuenciaServicio" label="Frecuencia de servicio o compra" value={formData.frecuenciaServicio} onChange={handleChange} options={['Bajo demanda', 'Semanal', 'Programada con agenda']} />
      <SelectField name="clientesBuscados" label="¿Qué tipo de clientes buscas?" value={formData.clientesBuscados} onChange={handleChange} options={['Hogares', 'Negocios', 'Industrias', 'Todos']} />
      <CheckboxField name="perfilVerificadoVisible" label="¿Deseas que tu perfil sea visible como 'Recolector verificado'?" checked={formData.perfilVerificadoVisible} onChange={handleCheckboxChange} />
    </div>
  );
};

// --- Componentes genéricos de formulario (pueden ir a /components/ui o similar) ---
const TextField: React.FC<{ name: string; label: string; value: string; onChange: any; placeholder?: string; disabled?: boolean; type?: string }> = 
({ name, label, value, onChange, placeholder = '', disabled = false, type = 'text' }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor={name}>{label}</label>
    <input
      className={`shadow-sm appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
      id={name}
      name={name}
      type={type}
      placeholder={placeholder}
      value={value || ''}
      onChange={onChange}
      disabled={disabled}
    />
  </div>
);

const SelectField: React.FC<{ name: string; label: string; value: string; onChange: any; options: string[]; includeOther?: boolean }> = 
({ name, label, value, onChange, options, includeOther = false }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor={name}>{label}</label>
    <select
      className="shadow-sm border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
      id={name}
      name={name}
      value={value || ''}
      onChange={onChange}
    >
      <option value="" disabled>Selecciona una opción</option>
      {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
      {includeOther && <option value="Otro">Otro</option>}
    </select>
  </div>
);

const CheckboxField: React.FC<{ name: string; label: string; checked: boolean; onChange: any }> = 
({ name, label, checked, onChange }) => (
   <label className="flex items-center text-sm">
    <input 
        type="checkbox" 
        name={name} 
        checked={checked || false} 
        onChange={onChange} 
        className="form-checkbox h-4 w-4 text-emerald-600 rounded focus:ring-emerald-500"
    />
    <span className="ml-2 text-gray-700">{label}</span>
  </label>
);

const RadioGroupField: React.FC<{ name: string; label: string; value: string; onChange: any; options: string[] }> = 
({ name, label, value, onChange, options }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    <div className="flex flex-wrap gap-x-4 gap-y-1">
      {options.map(opt => (
        <label key={opt} className="flex items-center text-sm">
          <input 
            type="radio" 
            name={name} 
            value={opt} 
            checked={value === opt} 
            onChange={onChange} 
            className="form-radio h-4 w-4 text-emerald-600 focus:ring-emerald-500"
          />
          <span className="ml-1.5 text-gray-700">{opt}</span>
        </label>
      ))}
    </div>
  </div>
);

// --- Componente Register Principal --- 

function Register() {
  // Estados básicos
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  
  // Estados para campos adicionales (objeto único)
  const [additionalData, setAdditionalData] = useState<any>({}); 

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    setAdditionalData({}); // Resetear datos adicionales al cambiar de rol
  };
  
  // Manejador genérico para inputs de texto, select, radio
  const handleAdditionalChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setAdditionalData((prev: any) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  // Manejador específico para checkboxes múltiples
  const handleMultiCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, checked } = e.target;
    setAdditionalData((prev: any) => {
      const currentValues = prev[name] || [];
      if (checked) {
        return { ...prev, [name]: [...currentValues, value] };
      } else {
        return { ...prev, [name]: currentValues.filter((v: string) => v !== value) };
      }
    });
  };
  
  // Manejador para checkboxes simples (reusa handleAdditionalChange pero asegura valor boolean)
  const handleSingleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
     const { name, checked } = e.target;
     setAdditionalData((prev: any) => ({ ...prev, [name]: checked }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("Las contraseñas no coinciden.");
      return;
    }
    if (!termsAccepted) {
      alert("Debes aceptar los términos y condiciones.");
      return;
    }
    if (!selectedRole) {
      alert("Error: Rol no seleccionado.");
      return;
    }
    
    const registrationData = {
      name,
      email,
      password,
      role: selectedRole,
      phone,
      city,
      termsAccepted,
      ...additionalData
    };
    
    console.log('Register attempt:', registrationData);
    alert(`Registro simulado exitoso para ${name} como ${selectedRole}.`);
    
    login(selectedRole, name);
    navigate('/dashboard');
  };

  return (
    <div className="container mx-auto px-4 py-12">
      {!selectedRole ? (
        <RoleSelection onSelectRole={handleRoleSelect} />
      ) : (
        <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-xl">
          <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
            Crear Cuenta como: <span className="capitalize text-emerald-600">{selectedRole}</span>
          </h1>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Campos básicos (Nombre, Email, Teléfono, Ciudad, Contraseña) */}
             <TextField name="name" label="Nombre Completo / Empresa" value={name} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)} placeholder="Tu Nombre o Razón Social" />
             <TextField name="email" label="Email de Contacto" value={email} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)} placeholder="tu@email.com" type="email" />
             <TextField name="phone" label="Teléfono" value={phone} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPhone(e.target.value)} placeholder="Ej: 81 1234 5678" type="tel" />
             <TextField name="city" label="Ciudad/Región Principal" value={city} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCity(e.target.value)} placeholder="Ej: Monterrey, Nuevo León" />
             <TextField name="password" label="Contraseña" value={password} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)} placeholder="Mínimo 8 caracteres" type="password" />
            
             <div>
               <label className="block text-gray-700 text-sm font-bold mb-1" htmlFor="confirmPassword">Confirmar Contraseña</label>
               <input
                 className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${password !== confirmPassword && confirmPassword ? 'border-red-500' : ''}`}
                 id="confirmPassword"
                 type="password"
                 placeholder="Repite tu contraseña"
                 value={confirmPassword}
                 onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value)}
                 required
               />
               {password !== confirmPassword && confirmPassword && (
                 <p className="text-red-500 text-xs italic mt-1">Las contraseñas no coinciden.</p>
               )}
             </div>

            {/* Sección de Campos Adicionales por Rol */}
            <div className="p-6 border border-gray-200 rounded-lg bg-gray-50">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Información Adicional para <span className="capitalize text-emerald-600">{selectedRole}</span></h2>
               {selectedRole === UserRole.BUYER && <CompradorFields formData={additionalData} handleChange={handleAdditionalChange} handleCheckboxChange={handleMultiCheckboxChange} />} 
               {selectedRole === UserRole.SELLER && <VendedorFields formData={additionalData} handleChange={handleAdditionalChange} handleCheckboxChange={handleMultiCheckboxChange} />} 
               {selectedRole === UserRole.COLLECTOR && <RecolectorFields formData={additionalData} handleChange={handleAdditionalChange} handleCheckboxChange={handleMultiCheckboxChange} />}
            </div>
            
            {/* Aceptar Términos */}
            <CheckboxField name="termsAccepted" label="He leído y acepto los Términos y Condiciones y la Política de Privacidad." checked={termsAccepted} onChange={(e:React.ChangeEvent<HTMLInputElement>) => setTermsAccepted(e.target.checked)} />
           
             {/* Botón Submit y Enlace Login */}
            <div className="flex flex-col sm:flex-row items-center justify-between mt-8">
              <button
                className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-6 rounded focus:outline-none focus:shadow-outline disabled:opacity-50 transition duration-150 ease-in-out mb-4 sm:mb-0"
                type="submit"
                disabled={password !== confirmPassword || !termsAccepted || !name || !email || !phone || !city || password.length < 8}
              >
                Crear Cuenta
              </button>
              <a href="/login" className="inline-block align-baseline font-bold text-sm text-blue-600 hover:text-blue-800">
                ¿Ya tienes cuenta? Inicia Sesión
              </a>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default Register; 