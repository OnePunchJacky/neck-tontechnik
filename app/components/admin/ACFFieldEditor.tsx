'use client';

import { useState } from 'react';
import FormField from './FormField';

interface ACFField {
  key: string;
  label: string;
  type: 'text' | 'textarea' | 'number' | 'url' | 'date' | 'select' | 'media';
  value: any;
  required?: boolean;
  placeholder?: string;
  options?: { value: string | number; label: string }[];
}

interface ACFFieldEditorProps {
  fields: ACFField[];
  onChange: (fields: Record<string, any>) => void;
  onMediaSelect?: (fieldKey: string) => void;
}

export default function ACFFieldEditor({
  fields,
  onChange,
  onMediaSelect,
}: ACFFieldEditorProps) {
  const [fieldValues, setFieldValues] = useState<Record<string, any>>(
    fields.reduce((acc, field) => {
      acc[field.key] = field.value;
      return acc;
    }, {} as Record<string, any>)
  );

  const handleFieldChange = (key: string, value: any) => {
    const newValues = { ...fieldValues, [key]: value };
    setFieldValues(newValues);
    onChange(newValues);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">
        Zusätzliche Felder (ACF)
      </h3>
      {fields.map((field) => (
        <div key={field.key}>
          {field.type === 'media' ? (
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={fieldValues[field.key] || ''}
                  onChange={(e) => handleFieldChange(field.key, e.target.value)}
                  placeholder={field.placeholder || 'Media ID oder URL'}
                  className="flex-1 px-4 py-2 bg-[var(--color-surface-light)] border border-[var(--color-border)] rounded-lg text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                />
                {onMediaSelect && (
                  <button
                    type="button"
                    onClick={() => onMediaSelect(field.key)}
                    className="px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg hover:opacity-90 transition-opacity"
                  >
                    Auswählen
                  </button>
                )}
              </div>
              {fieldValues[field.key] && (
                <div className="mt-2">
                  {String(fieldValues[field.key]).startsWith('http') ? (
                    <img
                      src={String(fieldValues[field.key])}
                      alt="Preview"
                      className="max-w-xs h-auto rounded"
                    />
                  ) : (
                    <p className="text-sm text-[var(--color-text-secondary)]">
                      Media ID: {fieldValues[field.key]}
                    </p>
                  )}
                </div>
              )}
            </div>
          ) : (
            <FormField
              label={field.label}
              name={field.key}
              type={field.type}
              value={fieldValues[field.key]}
              onChange={(value) => handleFieldChange(field.key, value)}
              required={field.required}
              placeholder={field.placeholder}
              options={field.options}
            />
          )}
        </div>
      ))}
    </div>
  );
}

