import { useState } from 'react';
import { Phone, AlertCircle, CheckCircle } from 'lucide-react';

interface PhoneInputProps {
  id: string;
  name?: string;
  placeholder?: string;
  required?: boolean;
  showValidation?: boolean;
  className?: string;
}

export function PhoneInput({ 
  id, 
  name = "phone_number",
  placeholder = "+1 (555) 123-4567",
  required = true,
  showValidation = false,
  className = ""
}: PhoneInputProps) {
  const [phone, setPhone] = useState("");
  const [touched, setTouched] = useState(false);

  // Extraer solo números del teléfono
  const digitsOnly = phone.replace(/\D/g, '');
  
  // Validación de teléfono (mínimo 10 dígitos)
  const isValid = digitsOnly.length >= 10;
  const isInvalid = touched && phone.length > 0 && !isValid;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPhone(value);
    
    // Validar mientras escribe
    if (!touched && value.length > 0) {
      setTouched(true);
    }
  };

  const handleBlur = () => {
    setTouched(true);
  };

  const getValidationStatus = () => {
    if (!touched || phone.length === 0) return null;
    if (isValid) return 'valid';
    return 'invalid';
  };

  const validationStatus = getValidationStatus();

  return (
    <div>
      <div className="relative">
        <input
          type="tel"
          id={id}
          name={name}
          value={phone}
          onChange={handleChange}
          onBlur={handleBlur}
          required={required}
          placeholder={placeholder}
          className={`w-full px-4 py-3 bg-(--bg-secondary) border-2 rounded-lg text-(--text-primary) placeholder-[var(--text-tertiary)] focus:outline-none transition-colors pr-10 ${
            isInvalid 
              ? 'border-red-500 focus:border-red-500' 
              : validationStatus === 'valid'
              ? 'border-green-500 focus:border-green-500'
              : 'border-(--border-primary) focus:border-(--accent-primary)'
          } ${className}`}
        />
        
        {/* Icono de validación */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          {validationStatus === 'valid' && (
            <CheckCircle className="w-5 h-5 text-green-500" />
          )}
          {validationStatus === 'invalid' && (
            <AlertCircle className="w-5 h-5 text-red-500" />
          )}
          {!validationStatus && (
            <Phone className="w-5 h-5 text-(--text-tertiary)" />
          )}
        </div>
      </div>

      {/* Mostrar requisitos si está activado */}
      {showValidation && (
        <div className="mt-2 space-y-1">
          <div className="flex items-center gap-2 text-xs">
            <div className={`w-1.5 h-1.5 rounded-full ${digitsOnly.length >= 10 ? 'bg-green-500' : 'bg-(--text-tertiary)'}`}></div>
            <span className={digitsOnly.length >= 10 ? 'text-green-600 font-medium' : 'text-(--text-secondary)'}>
              Mínimo 10 dígitos ({digitsOnly.length}/10)
            </span>
          </div>
          
          <div className="flex items-center gap-2 text-xs">
            <div className={`w-1.5 h-1.5 rounded-full ${/^[\d\-\s\(\)\+]*$/.test(phone) ? 'bg-green-500' : 'bg-(--text-tertiary)'}`}></div>
            <span className={/^[\d\-\s\(\)\+]*$/.test(phone) ? 'text-green-600 font-medium' : 'text-(--text-secondary)'}>
              Formato: dígitos, espacios, guiones, paréntesis permitidos
            </span>
          </div>

          {isValid && (
            <div className="mt-2 flex items-center gap-2 text-xs text-green-600 font-medium">
              <CheckCircle className="w-4 h-4" />
              <span>Teléfono válido</span>
            </div>
          )}
        </div>
      )}

      {isInvalid && (
        <p className="mt-2 text-xs text-red-600 font-medium flex items-center gap-1">
          <AlertCircle className="w-4 h-4" />
          Se necesitan al menos 10 dígitos
        </p>
      )}
    </div>
  );
}
