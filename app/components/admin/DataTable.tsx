'use client';

import { useState } from 'react';

interface Column<T> {
  key: keyof T | string;
  label: string;
  render?: (item: T) => React.ReactNode;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
  searchable?: boolean;
  searchPlaceholder?: string;
}

export default function DataTable<T extends { id: number }>({
  data,
  columns,
  onEdit,
  onDelete,
  searchable = true,
  searchPlaceholder = 'Suchen...',
}: DataTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredData = searchable
    ? data.filter((item) => {
        return columns.some((col) => {
          const value = col.key === 'id' ? item.id : (item as any)[col.key];
          return String(value || '').toLowerCase().includes(searchTerm.toLowerCase());
        });
      })
    : data;

  return (
    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg overflow-hidden">
      {searchable && (
        <div className="p-4 border-b border-[var(--color-border)]">
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 bg-[var(--color-surface-light)] border border-[var(--color-border)] rounded-lg text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
          />
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-[var(--color-surface-light)] border-b border-[var(--color-border)]">
            <tr>
              {columns.map((col) => (
                <th
                  key={String(col.key)}
                  className="px-4 py-3 text-left text-sm font-semibold text-[var(--color-text-primary)]"
                >
                  {col.label}
                </th>
              ))}
              {(onEdit || onDelete) && (
                <th className="px-4 py-3 text-left text-sm font-semibold text-[var(--color-text-primary)]">
                  Aktionen
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {filteredData.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (onEdit || onDelete ? 1 : 0)}
                  className="px-4 py-8 text-center text-[var(--color-text-secondary)]"
                >
                  Keine Einträge gefunden
                </td>
              </tr>
            ) : (
              filteredData.map((item) => (
                <tr
                  key={item.id}
                  className="border-b border-[var(--color-border)] hover:bg-[var(--color-surface-light)] transition-colors"
                >
                  {columns.map((col) => (
                    <td key={String(col.key)} className="px-4 py-3 text-sm text-[var(--color-text-primary)]">
                      {col.render ? col.render(item) : String((item as any)[col.key] || '')}
                    </td>
                  ))}
                  {(onEdit || onDelete) && (
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        {onEdit && (
                          <button
                            onClick={() => onEdit(item)}
                            className="px-3 py-1 text-sm bg-blue-500/10 text-blue-500 rounded hover:bg-blue-500/20 transition-colors"
                          >
                            Bearbeiten
                          </button>
                        )}
                        {onDelete && (
                          <button
                            onClick={() => onDelete(item)}
                            className="px-3 py-1 text-sm bg-red-500/10 text-red-500 rounded hover:bg-red-500/20 transition-colors"
                          >
                            Löschen
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

