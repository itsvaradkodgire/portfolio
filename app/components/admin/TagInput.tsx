'use client';

import { useState, KeyboardEvent } from 'react';
import { X } from 'lucide-react';

interface TagInputProps {
  label: string;
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
}

export function TagInput({ label, value, onChange, placeholder = 'Add tag, press Enter' }: TagInputProps) {
  const [input, setInput] = useState('');

  const add = () => {
    const tag = input.trim();
    if (tag && !value.includes(tag)) {
      onChange([...value, tag]);
    }
    setInput('');
  };

  const remove = (tag: string) => onChange(value.filter((t) => t !== tag));

  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      add();
    }
    if (e.key === 'Backspace' && !input && value.length > 0) {
      remove(value[value.length - 1]);
    }
  };

  return (
    <div className="space-y-1.5">
      <label className="block font-mono text-xs text-text-muted uppercase tracking-wider">{label}</label>
      <div className="flex flex-wrap gap-1.5 p-2 bg-bg-base border border-border-subtle rounded-lg min-h-[44px]
                      focus-within:border-border-medium transition-colors">
        {value.map((tag) => (
          <span
            key={tag}
            className="flex items-center gap-1 font-mono text-xs bg-bg-elevated border border-border-subtle
                       rounded px-2 py-0.5 text-text-secondary"
          >
            {tag}
            <button onClick={() => remove(tag)} className="text-text-faint hover:text-red-400 transition-colors">
              <X size={10} />
            </button>
          </span>
        ))}
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKey}
          onBlur={add}
          placeholder={value.length === 0 ? placeholder : ''}
          className="flex-1 min-w-[100px] bg-transparent font-mono text-xs text-text-secondary
                     placeholder:text-text-faint outline-none"
        />
      </div>
      <p className="font-mono text-[10px] text-text-faint">Press Enter or comma to add</p>
    </div>
  );
}
