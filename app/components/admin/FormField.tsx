'use client';

import type { InputHTMLAttributes, TextareaHTMLAttributes } from 'react';

interface BaseFieldProps {
  label: string;
  helpText?: string;
  error?: string;
  required?: boolean;
}

interface InputFieldProps extends BaseFieldProps, Omit<InputHTMLAttributes<HTMLInputElement>, 'className'> {
  as?: 'input';
}

interface TextareaFieldProps extends BaseFieldProps, Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'className'> {
  as: 'textarea';
  rows?: number;
}

type FormFieldProps = InputFieldProps | TextareaFieldProps;

export function FormField(props: FormFieldProps) {
  const { label, helpText, error, required, as = 'input', ...rest } = props;

  const baseClass = `
    w-full bg-bg-base border rounded-lg px-3 py-2.5 font-mono text-sm
    text-text-secondary placeholder:text-text-faint outline-none
    transition-colors focus:border-border-medium
    ${error ? 'border-red-500/40' : 'border-border-subtle'}
  `;

  return (
    <div className="space-y-1.5">
      <label className="block font-mono text-xs text-text-muted uppercase tracking-wider">
        {label}{required && <span className="text-accent-primary ml-1">*</span>}
      </label>
      {as === 'textarea' ? (
        <textarea
          {...(rest as TextareaHTMLAttributes<HTMLTextAreaElement>)}
          rows={(rest as TextareaFieldProps).rows ?? 4}
          className={`${baseClass} resize-vertical`}
        />
      ) : (
        <input
          {...(rest as InputHTMLAttributes<HTMLInputElement>)}
          className={baseClass}
        />
      )}
      {helpText && !error && (
        <p className="font-mono text-[10px] text-text-faint">{helpText}</p>
      )}
      {error && (
        <p className="font-mono text-[10px] text-red-400">{error}</p>
      )}
    </div>
  );
}
