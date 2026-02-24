import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, User, Mail, Phone, MapPin, Lock, ChevronLeft, CheckCircle2, Circle } from 'lucide-react';
import RoleSelection from '../components/auth/RoleSelection';
import { UserRole } from '../types/user';
import { useAuth } from '../context/AuthContext';

// ─── Helper components ───────────────────────────────────────────────────────

const roleLabels: Record<UserRole, { label: string; emoji: string; color: string }> = {
  [UserRole.BUYER]:     { label: 'Comprador',            emoji: '🏢', color: 'bg-blue-100 text-blue-700' },
  [UserRole.SELLER]:    { label: 'Vendedor / Generador', emoji: '♻️', color: 'bg-emerald-100 text-emerald-700' },
  [UserRole.COLLECTOR]: { label: 'Recolector / Empresa', emoji: '🚚', color: 'bg-teal-100 text-teal-700' },
};

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon?: React.ReactNode;
  error?: string;
  suffix?: React.ReactNode;
}
const Input: React.FC<InputProps> = ({ label, icon, error, suffix, id, ...props }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor={id}>{label}</label>
    <div className="relative">
      {icon && (
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">{icon}</span>
      )}
      <input
        id={id}
        {...props}
        className={`w-full ${icon ? 'pl-10' : 'pl-4'} ${suffix ? 'pr-10' : 'pr-4'} py-2.5 border rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition ${error ? 'border-red-400 bg-red-50' : 'border-gray-300 bg-white'}`}
      />
      {suffix && (
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">{suffix}</span>
      )}
    </div>
    {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
  </div>
);

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: string[];
  includeOther?: boolean;
}
const Select: React.FC<SelectProps> = ({ label, options, includeOther, id, ...props }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor={id}>{label}</label>
    <select
      id={id}
      {...props}
      className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
    >
      <option value="" disabled>Selecciona una opción</option>
      {options.map(o => <option key={o} value={o}>{o}</option>)}
      {includeOther && <option value="Otro">Otro</option>}
    </select>
  </div>
);

interface ChipGroupProps {
  label: string;
  name: string;
  options: string[];
  selected: string[];
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}
const ChipGroup: React.FC<ChipGroupProps> = ({ label, name, options, selected, onChange }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
    <div className="flex flex-wrap gap-2">
      {options.map(opt => {
        const checked = selected?.includes(opt);
        return (
          <label
            key={opt}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer border transition-all
              ${checked
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                : 'bg-white text-gray-600 border-gray-300 hover:border-emerald-400 hover:text-emerald-600'}`}
          >
            <input
              type="checkbox"
              name={name}
              value={opt}
              checked={checked}
              onChange={onChange}
              className="sr-only"
            />
            {checked && <span className="text-[10px]">✓</span>}
            {opt}
          </label>
        );
      })}
    </div>
  </div>
);

interface RadioChipGroupProps {
  label: string;
  name: string;
  options: string[];
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}
const RadioChipGroup: React.FC<RadioChipGroupProps> = ({ label, name, options, value, onChange }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
    <div className="flex flex-wrap gap-2">
      {options.map(opt => {
        const checked = value === opt;
        return (
          <label
            key={opt}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer border transition-all
              ${checked
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                : 'bg-white text-gray-600 border-gray-300 hover:border-emerald-400 hover:text-emerald-600'}`}
          >
            <input type="radio" name={name} value={opt} checked={checked} onChange={onChange} className="sr-only" />
            {checked && <span className="text-[10px]">✓</span>}
            {opt}
          </label>
        );
      })}
    </div>
  </div>
);

// ─── Role-specific fields ─────────────────────────────────────────────────────

interface FieldProps {
  formData: any;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  handleCheckboxChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const MATERIALES = ['Plástico', 'Cartón / Papel', 'Metales', 'Electrónicos', 'Vidrio', 'Textiles'];

const CompradorFields: React.FC<FieldProps> = ({ formData, handleChange, handleCheckboxChange }) => (
  <div className="space-y-5">
    <ChipGroup
      label="Materiales que te interesan comprar"
      name="materialesInteres"
      options={MATERIALES}
      selected={formData.materialesInteres || []}
      onChange={handleCheckboxChange}
    />
    <Select name="volumenCompra" label="Volumen promedio mensual de compra" id="volumenCompra"
      value={formData.volumenCompra || ''} onChange={handleChange}
      options={['Menos de 100 kg', '100–500 kg', '500–1000 kg', 'Más de 1000 kg']} />
    <Select name="frecuenciaCompra" label="Frecuencia de compra" id="frecuenciaCompra"
      value={formData.frecuenciaCompra || ''} onChange={handleChange}
      options={['Una sola vez', 'Semanal', 'Quincenal', 'Mensual', 'Según necesidad']} />
    <Input id="zonasCompra" name="zonasCompra" label="Zonas de compra" icon={<MapPin size={16}/>}
      value={formData.zonasCompra || ''} onChange={handleChange} placeholder="Ej: Monterrey, Apodaca" />
    <label className="flex items-center gap-3 cursor-pointer group">
      <input type="checkbox" name="recibirAlertas"
        checked={formData.recibirAlertas || false}
        onChange={handleChange}
        className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500" />
      <span className="text-sm text-gray-700 group-hover:text-gray-900">
        Recibir alertas cuando se publiquen materiales de mi interés
      </span>
    </label>
  </div>
);

const VendedorFields: React.FC<FieldProps> = ({ formData, handleChange, handleCheckboxChange }) => (
  <div className="space-y-5">
    <Select name="tipoGenerador" label="Tipo de generador" id="tipoGenerador"
      value={formData.tipoGenerador || ''} onChange={handleChange}
      options={['Hogar', 'Negocio (comercio u oficina)', 'Industria / Taller']} includeOther />
    {formData.tipoGenerador === 'Otro' && (
      <Input id="tipoGeneradorOtro" name="tipoGeneradorOtro" label="Especifica" value={formData.tipoGeneradorOtro || ''} onChange={handleChange} />
    )}
    <ChipGroup
      label="Materiales que generas regularmente"
      name="materialesGenerados"
      options={[...MATERIALES, 'Orgánicos aprovechables']}
      selected={formData.materialesGenerados || []}
      onChange={handleCheckboxChange}
    />
    <Select name="frecuenciaGeneracion" label="Frecuencia de generación" id="frecuenciaGeneracion"
      value={formData.frecuenciaGeneracion || ''} onChange={handleChange}
      options={['Diario', 'Semanal', 'Mensual', 'Esporádico']} />
    <Select name="volumenGeneracion" label="Volumen promedio por generación" id="volumenGeneracion"
      value={formData.volumenGeneracion || ''} onChange={handleChange}
      options={['Menos de 50 kg', '50–200 kg', 'Más de 200 kg']} />
    <RadioChipGroup name="dispuestoDonar" label="¿Estás dispuesto a donar materiales?"
      value={formData.dispuestoDonar || ''} onChange={handleChange}
      options={['Sí', 'No', 'Depende del material']} />
    <RadioChipGroup name="necesitaRecoleccion" label="¿Necesitas recolección a domicilio?"
      value={formData.necesitaRecoleccion || ''} onChange={handleChange}
      options={['Sí', 'No', 'Solo en ciertos casos']} />
  </div>
);

const RecolectorFields: React.FC<FieldProps> = ({ formData, handleChange, handleCheckboxChange }) => (
  <div className="space-y-5">
    <Select name="tipoRecolector" label="¿Eres...?" id="tipoRecolector"
      value={formData.tipoRecolector || ''} onChange={handleChange}
      options={['Recolector independiente', 'Centro de acopio', 'Empresa recicladora / Transformadora', 'Cooperativa o agrupación']} />
    <ChipGroup
      label="Servicios que ofreces"
      name="serviciosOfrecidos"
      options={['Recolección a domicilio', 'Compra de materiales', 'Procesamiento', 'Clasificación y limpieza', 'Transporte']}
      selected={formData.serviciosOfrecidos || []}
      onChange={handleCheckboxChange}
    />
    <ChipGroup
      label="Tipos de materiales que manejas"
      name="materialesManejados"
      options={MATERIALES}
      selected={formData.materialesManejados || []}
      onChange={handleCheckboxChange}
    />
    <Input id="zonasOperacion" name="zonasOperacion" label="Zonas de operación" icon={<MapPin size={16}/>}
      value={formData.zonasOperacion || ''} onChange={handleChange} placeholder="Ej: Guadalupe, San Pedro" />
    <Select name="frecuenciaServicio" label="Frecuencia de servicio" id="frecuenciaServicio"
      value={formData.frecuenciaServicio || ''} onChange={handleChange}
      options={['Bajo demanda', 'Semanal', 'Programada con agenda']} />
    <Select name="clientesBuscados" label="¿Qué tipo de clientes buscas?" id="clientesBuscados"
      value={formData.clientesBuscados || ''} onChange={handleChange}
      options={['Hogares', 'Negocios', 'Industrias', 'Todos']} />
    <label className="flex items-center gap-3 cursor-pointer group">
      <input type="checkbox" name="perfilVerificadoVisible"
        checked={formData.perfilVerificadoVisible || false}
        onChange={handleChange}
        className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500" />
      <span className="text-sm text-gray-700 group-hover:text-gray-900">
        Solicitar perfil visible como "Recolector verificado"
      </span>
    </label>
  </div>
);

// ─── Password strength ────────────────────────────────────────────────────────

function getPasswordStrength(pw: string) {
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return score;
}

const strengthLabels = ['', 'Débil', 'Regular', 'Buena', 'Fuerte'];
const strengthColors = ['', 'bg-red-400', 'bg-yellow-400', 'bg-blue-400', 'bg-emerald-500'];

// ─── Main Register component ──────────────────────────────────────────────────

function Register() {
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [additionalData, setAdditionalData] = useState<any>({});
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { signUp } = useAuth();

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    setAdditionalData({});
  };

  const handleAdditionalChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setAdditionalData((prev: any) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleMultiCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, checked } = e.target;
    setAdditionalData((prev: any) => {
      const cur = prev[name] || [];
      return { ...prev, [name]: checked ? [...cur, value] : cur.filter((v: string) => v !== value) };
    });
  };

  const passwordStrength = getPasswordStrength(password);
  const passwordMismatch = confirmPassword.length > 0 && password !== confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password !== confirmPassword) return setError('Las contraseñas no coinciden.');
    if (!termsAccepted) return setError('Debes aceptar los términos y condiciones.');
    if (!selectedRole) return setError('Error: Rol no seleccionado.');
    if (password.length < 8) return setError('La contraseña debe tener al menos 8 caracteres.');

    setLoading(true);
    const { error: signUpError } = await signUp(email, password, {
      name, email, password, role: selectedRole, phone, city, termsAccepted, additionalData,
    });

    if (signUpError) {
      setError(signUpError.message || 'Error al registrar. Intenta de nuevo.');
      setLoading(false);
    } else {
      navigate('/dashboard');
    }
  };

  if (!selectedRole) {
    return <RoleSelection onSelectRole={handleRoleSelect} />;
  }

  const roleInfo = roleLabels[selectedRole];
  const isFormValid = !loading && password === confirmPassword && termsAccepted && name && email && phone && city && password.length >= 8;

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex flex-col">
      {/* Top bar */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b border-gray-100 px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <img src="/assets/images/logo-full.png" alt="e-colector" className="h-8 object-contain" />
        </Link>
        <button
          onClick={() => setSelectedRole(null)}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors"
        >
          <ChevronLeft size={16} />
          Cambiar rol
        </button>
      </div>

      <div className="flex-1 flex items-start justify-center px-4 py-10">
        <div className="w-full max-w-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold ${roleInfo.color} mb-4`}>
              <span>{roleInfo.emoji}</span>
              {roleInfo.label}
            </span>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Crea tu cuenta</h1>
            <p className="text-gray-500 text-sm mt-1">Completa la información para empezar a usar e-colector</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Section 1: Basic info */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100 bg-gray-50">
                <div className="w-7 h-7 bg-emerald-600 text-white rounded-full flex items-center justify-center text-xs font-bold">1</div>
                <span className="font-semibold text-gray-800 text-sm">Información básica</span>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <Input
                      id="name" name="name" label="Nombre completo / Empresa" required
                      icon={<User size={16} />}
                      value={name} onChange={e => setName(e.target.value)}
                      placeholder="Tu nombre o razón social"
                    />
                  </div>
                  <Input
                    id="email" name="email" label="Correo electrónico" type="email" required
                    icon={<Mail size={16} />}
                    value={email} onChange={e => setEmail(e.target.value)}
                    placeholder="tu@email.com"
                  />
                  <Input
                    id="phone" name="phone" label="Teléfono" type="tel" required
                    icon={<Phone size={16} />}
                    value={phone} onChange={e => setPhone(e.target.value)}
                    placeholder="Ej: 81 1234 5678"
                  />
                  <div className="sm:col-span-2">
                    <Input
                      id="city" name="city" label="Ciudad / Región principal" required
                      icon={<MapPin size={16} />}
                      value={city} onChange={e => setCity(e.target.value)}
                      placeholder="Ej: Monterrey, Nuevo León"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Section 2: Password */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100 bg-gray-50">
                <div className="w-7 h-7 bg-emerald-600 text-white rounded-full flex items-center justify-center text-xs font-bold">2</div>
                <span className="font-semibold text-gray-800 text-sm">Seguridad</span>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <Input
                    id="password" name="password" label="Contraseña" required
                    type={showPassword ? 'text' : 'password'}
                    icon={<Lock size={16} />}
                    value={password} onChange={e => setPassword(e.target.value)}
                    placeholder="Mínimo 8 caracteres"
                    suffix={
                      <button type="button" onClick={() => setShowPassword(v => !v)} className="hover:text-gray-600 transition-colors">
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    }
                  />
                  {password.length > 0 && (
                    <div className="mt-2">
                      <div className="flex gap-1 mb-1">
                        {[1,2,3,4].map(i => (
                          <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${i <= passwordStrength ? strengthColors[passwordStrength] : 'bg-gray-200'}`} />
                        ))}
                      </div>
                      <p className="text-xs text-gray-500">
                        Seguridad: <span className="font-medium">{strengthLabels[passwordStrength]}</span>
                      </p>
                    </div>
                  )}
                </div>
                <Input
                  id="confirmPassword" name="confirmPassword"
                  label="Confirmar contraseña" required
                  type={showConfirm ? 'text' : 'password'}
                  icon={<Lock size={16} />}
                  value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Repite tu contraseña"
                  error={passwordMismatch ? 'Las contraseñas no coinciden' : undefined}
                  suffix={
                    <button type="button" onClick={() => setShowConfirm(v => !v)} className="hover:text-gray-600 transition-colors">
                      {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  }
                />
              </div>
            </div>

            {/* Section 3: Role-specific */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100 bg-gray-50">
                <div className="w-7 h-7 bg-emerald-600 text-white rounded-full flex items-center justify-center text-xs font-bold">3</div>
                <div>
                  <span className="font-semibold text-gray-800 text-sm">Perfil de </span>
                  <span className={`text-sm font-semibold ${roleInfo.color.split(' ')[1]}`}>{roleInfo.label}</span>
                </div>
              </div>
              <div className="p-6">
                {selectedRole === UserRole.BUYER && (
                  <CompradorFields formData={additionalData} handleChange={handleAdditionalChange} handleCheckboxChange={handleMultiCheckboxChange} />
                )}
                {selectedRole === UserRole.SELLER && (
                  <VendedorFields formData={additionalData} handleChange={handleAdditionalChange} handleCheckboxChange={handleMultiCheckboxChange} />
                )}
                {selectedRole === UserRole.COLLECTOR && (
                  <RecolectorFields formData={additionalData} handleChange={handleAdditionalChange} handleCheckboxChange={handleMultiCheckboxChange} />
                )}
              </div>
            </div>

            {/* Terms & submit */}
            <div className="space-y-4">
              {/* Terms checkbox */}
              <label className="flex items-start gap-3 cursor-pointer group">
                <div className={`mt-0.5 w-5 h-5 flex-shrink-0 rounded border-2 flex items-center justify-center transition-colors ${termsAccepted ? 'bg-emerald-600 border-emerald-600' : 'border-gray-300 group-hover:border-emerald-400'}`}>
                  {termsAccepted && <CheckCircle2 size={14} className="text-white" />}
                </div>
                <input type="checkbox" checked={termsAccepted} onChange={e => setTermsAccepted(e.target.checked)} className="sr-only" />
                <span className="text-sm text-gray-600 leading-snug">
                  He leído y acepto los{' '}
                  <Link to="/legal/terms" className="text-emerald-600 hover:underline font-medium" target="_blank">Términos de Servicio</Link>
                  {' '}y el{' '}
                  <Link to="/legal/privacy" className="text-emerald-600 hover:underline font-medium" target="_blank">Aviso de Privacidad</Link>.
                </span>
              </label>

              {error && (
                <div className="flex items-center gap-2.5 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                  <Circle size={16} className="flex-shrink-0" />
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={!isFormValid}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors text-sm shadow-sm"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Creando cuenta...
                  </span>
                ) : 'Crear cuenta'}
              </button>

              <p className="text-center text-sm text-gray-500">
                ¿Ya tienes cuenta?{' '}
                <Link to="/login" className="text-emerald-600 hover:underline font-medium">
                  Inicia sesión
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Register;
