import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface PasswordInputProps {
  id: string;
  name: string;
  placeholder?: string;
  required?: boolean;
  showRequirements?: boolean;
  className?: string;
}

export function PasswordInput({ 
  id, 
  name, 
  placeholder = "••••••••",
  required = true,
  showRequirements = false,
  className = ""
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");

  // Validar requisitos
  const requirements = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    digit: /[0-9]/.test(password),
    special: /[!@#$%^&*]/.test(password),
  };

  const allRequirementsMet = Object.values(requirements).every(req => req);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };

  return (
    <div>
      <div className="relative">
        <input
          type={showPassword ? "text" : "password"}
          id={id}
          name={name}
          value={password}
          onChange={handleChange}
          required={required}
          placeholder={placeholder}
          className={`w-full px-4 py-3 bg-(--bg-secondary) border-2 border-(--border-primary) rounded-lg text-(--text-primary) placeholder-[var(--text-tertiary)] focus:outline-none focus:border-(--accent-primary) transition-colors pr-10 ${className}`}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-(--text-tertiary) hover:text-(--text-secondary) transition-colors"
          tabIndex={-1}
        >
          {showPassword ? (
            <EyeOff size={20} />
          ) : (
            <Eye size={20} />
          )}
        </button>
      </div>

      {showRequirements && password && (
        <div className="mt-3 p-3 bg-(--bg-secondary) border border-(--border-primary) rounded-lg">
          <p className="text-xs font-bold text-(--text-secondary) mb-2 uppercase">Password Requirements:</p>
          <ul className="space-y-1 text-xs">
            <li className={`flex items-center gap-2 ${requirements.length ? 'text-green-500' : 'text-(--text-tertiary)'}`}>
              <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${requirements.length ? 'bg-green-500/20' : 'bg-(--border-primary)'}`}>
                {requirements.length ? '✓' : '○'}
              </span>
              At least 8 characters ({password.length}/8)
            </li>
            <li className={`flex items-center gap-2 ${requirements.uppercase ? 'text-green-500' : 'text-(--text-tertiary)'}`}>
              <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${requirements.uppercase ? 'bg-green-500/20' : 'bg-(--border-primary)'}`}>
                {requirements.uppercase ? '✓' : '○'}
              </span>
              One uppercase letter (A-Z)
            </li>
            <li className={`flex items-center gap-2 ${requirements.lowercase ? 'text-green-500' : 'text-(--text-tertiary)'}`}>
              <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${requirements.lowercase ? 'bg-green-500/20' : 'bg-(--border-primary)'}`}>
                {requirements.lowercase ? '✓' : '○'}
              </span>
              One lowercase letter (a-z)
            </li>
            <li className={`flex items-center gap-2 ${requirements.digit ? 'text-green-500' : 'text-(--text-tertiary)'}`}>
              <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${requirements.digit ? 'bg-green-500/20' : 'bg-(--border-primary)'}`}>
                {requirements.digit ? '✓' : '○'}
              </span>
              One digit (0-9)
            </li>
            <li className={`flex items-center gap-2 ${requirements.special ? 'text-green-500' : 'text-(--text-tertiary)'}`}>
              <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${requirements.special ? 'bg-green-500/20' : 'bg-(--border-primary)'}`}>
                {requirements.special ? '✓' : '○'}
              </span>
              One special character (!@#$%^&*)
            </li>
          </ul>
          {allRequirementsMet && (
            <p className="text-xs text-green-500 font-bold mt-2">✓ Password is strong!</p>
          )}
        </div>
      )}
    </div>
  );
}
