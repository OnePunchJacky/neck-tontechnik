'use client';

interface FormFieldProps {
  label: string;
  name: string;
  type?: 'text' | 'textarea' | 'number' | 'email' | 'date' | 'url' | 'select';
  value: any;
  onChange: (value: any) => void;
  required?: boolean;
  placeholder?: string;
  options?: { value: string | number; label: string }[];
  rows?: number;
  error?: string;
}

export default function FormField({
  label,
  name,
  type = 'text',
  value,
  onChange,
  required = false,
  placeholder,
  options,
  rows = 4,
  error,
}: FormFieldProps) {
  return (
    <div className="mb-4">
      <label
        htmlFor={name}
        className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2"
      >
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      {type === 'textarea' ? (
        <textarea
          id={name}
          name={name}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          required={required}
          placeholder={placeholder}
          rows={rows}
          className={`w-full px-4 py-2 bg-[var(--color-surface-light)] border ${
            error ? 'border-red-500' : 'border-[var(--color-border)]'
          } rounded-lg text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]`}
        />
      ) : type === 'select' ? (
        <select
          id={name}
          name={name}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          required={required}
          className={`w-full px-4 py-2 bg-[var(--color-surface-light)] border ${
            error ? 'border-red-500' : 'border-[var(--color-border)]'
          } rounded-lg text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]`}
        >
          <option value="">Bitte wählen...</option>
          {options?.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          id={name}
          name={name}
          type={type}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          required={required}
          placeholder={placeholder}
          className={`w-full px-4 py-2 bg-[var(--color-surface-light)] border ${
            error ? 'border-red-500' : 'border-[var(--color-border)]'
          } rounded-lg text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]`}
        />
      )}

      {error && (
        <p className="mt-1 text-sm text-red-500">{error}</p>
      )}
    </div>
  );
}

