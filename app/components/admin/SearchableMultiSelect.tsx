'use client';

import { useState, useRef, useEffect } from 'react';
import { X, ChevronDown, Search } from 'lucide-react';

interface Option {
  id: number | string;
  name: string;
}

interface SearchableMultiSelectProps {
  options: Option[];
  selectedIds: (number | string)[];
  onChange: (selectedIds: (number | string)[]) => void;
  label: string;
  placeholder?: string;
  searchPlaceholder?: string;
}

export default function SearchableMultiSelect({
  options,
  selectedIds,
  onChange,
  label,
  placeholder = 'Auswählen...',
  searchPlaceholder = 'Suchen...',
}: SearchableMultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Filter options based on search term
  const filteredOptions = options.filter((option) =>
    option.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get selected options for display
  const selectedOptions = options.filter((option) => selectedIds.includes(option.id));

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleToggle = (optionId: number | string) => {
    if (selectedIds.includes(optionId)) {
      onChange(selectedIds.filter((id) => id !== optionId));
    } else {
      onChange([...selectedIds, optionId]);
    }
  };

  const handleRemove = (optionId: number | string, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(selectedIds.filter((id) => id !== optionId));
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
        {label}
      </label>
      
      {/* Selected items display */}
      <div
        onClick={() => {
          setIsOpen(!isOpen);
          setTimeout(() => inputRef.current?.focus(), 0);
        }}
        className={`
          min-h-[42px] w-full px-3 py-2 bg-[var(--color-surface-light)] border border-[var(--color-border)] rounded-lg
          cursor-pointer flex items-center gap-2 flex-wrap
          ${isOpen ? 'ring-2 ring-[var(--color-primary)] border-[var(--color-primary)]' : ''}
        `}
      >
        {selectedOptions.length > 0 ? (
          <>
            {selectedOptions.map((option) => (
              <span
                key={option.id}
                className="inline-flex items-center gap-1 px-2 py-1 bg-[var(--color-primary)] text-white text-sm rounded"
              >
                {option.name}
                <button
                  type="button"
                  onClick={(e) => handleRemove(option.id, e)}
                  className="hover:bg-white/20 rounded p-0.5"
                  aria-label={`${option.name} entfernen`}
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </>
        ) : (
          <span className="text-[var(--color-text-secondary)]">{placeholder}</span>
        )}
        <ChevronDown
          className={`w-4 h-4 ml-auto text-[var(--color-text-secondary)] transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg shadow-lg max-h-64 overflow-hidden">
          {/* Search input */}
          <div className="p-2 border-b border-[var(--color-border)]">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[var(--color-text-secondary)]" />
              <input
                ref={inputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full pl-8 pr-3 py-2 bg-[var(--color-surface-light)] border border-[var(--color-border)] rounded text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>

          {/* Options list */}
          <div className="max-h-48 overflow-y-auto">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => {
                const isSelected = selectedIds.includes(option.id);
                return (
                  <div
                    key={option.id}
                    onClick={() => handleToggle(option.id)}
                    className={`
                      px-3 py-2 cursor-pointer flex items-center gap-2 hover:bg-[var(--color-surface-light)]
                      ${isSelected ? 'bg-[var(--color-primary)]/10' : ''}
                    `}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleToggle(option.id)}
                      className="w-4 h-4 text-[var(--color-primary)] bg-[var(--color-surface-light)] border-[var(--color-border)] rounded focus:ring-2 focus:ring-[var(--color-primary)]"
                      onClick={(e) => e.stopPropagation()}
                    />
                    <span className="text-[var(--color-text-primary)] flex-1">{option.name}</span>
                  </div>
                );
              })
            ) : (
              <div className="px-3 py-4 text-center text-[var(--color-text-secondary)]">
                {searchTerm ? 'Keine Ergebnisse gefunden' : 'Keine Optionen verfügbar'}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Helper text */}
      {selectedOptions.length > 0 && (
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
          {selectedOptions.length} {selectedOptions.length === 1 ? 'Artist ausgewählt' : 'Artists ausgewählt'}
        </p>
      )}
    </div>
  );
}

