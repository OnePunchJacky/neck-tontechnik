'use client';

import { useState } from 'react';

interface AccordionItem {
  title: string;
  content: string;
}

interface ServiceAccordionProps {
  items: AccordionItem[];
}

export default function ServiceAccordion({ items }: ServiceAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0); // First item open by default

  const toggleAccordion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="space-y-3">
      {items.map((item, index) => (
        <div
          key={index}
          className="border border-[var(--color-neutral-700)] rounded-lg overflow-hidden transition-all duration-200"
        >
          <button
            onClick={() => toggleAccordion(index)}
            className="w-full text-left px-6 py-4 flex items-center justify-between bg-[var(--color-surface)] hover:bg-[var(--color-surface-light)] transition-colors duration-200"
          >
            <h3 className="font-bold text-[var(--color-text-primary)]">{item.title}</h3>
            <svg
              className={`w-5 h-5 text-[var(--color-text-secondary)] transform transition-transform duration-200 ${
                openIndex === index ? 'rotate-180' : ''
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <div
            className={`overflow-hidden transition-all duration-300 ${
              openIndex === index ? 'max-h-96' : 'max-h-0'
            }`}
          >
            <p className="px-6 py-4 text-[var(--color-text-secondary)] bg-[var(--color-bg)] border-t border-[var(--color-neutral-700)]">
              {item.content}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}