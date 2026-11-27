import * as React from 'react';
import { cn } from '@/lib/utils';

export interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  /** Texto de ayuda opcional bajo el campo (se enlaza con aria-describedby). */
  hint?: string;
}

/**
 * Input/TextoEstandar de DESIGN.md: label Poppins 12/500 muted, campo de 12px
 * de radio con borde hairline y padding 11x14. Accesible: asocia label, error
 * y ayuda mediante aria-invalid / aria-describedby.
 */
export const InputField = React.forwardRef<HTMLInputElement, InputFieldProps>(
  ({ label, error, hint, className, id, 'aria-describedby': ariaDescribedBy, ...props }, ref) => {
    const generatedId = React.useId();
    const inputId = id ?? generatedId;
    const errorId = `${inputId}-error`;
    const hintId = `${inputId}-hint`;

    const describedBy =
      [ariaDescribedBy, hint ? hintId : null, error ? errorId : null]
        .filter(Boolean)
        .join(' ') || undefined;

    return (
      <div className="flex flex-col gap-1.5">
        <label htmlFor={inputId} className="text-xs font-medium text-muted">
          {label}
        </label>
        <input
          id={inputId}
          ref={ref}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={cn(
            'flex w-full rounded-input border border-hairline bg-white px-3.5 py-[11px] text-base text-ink placeholder:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50',
            error && 'border-red-600 focus-visible:ring-red-600',
            className,
          )}
          {...props}
        />
        {hint && !error && (
          <p id={hintId} className="text-xs text-muted">
            {hint}
          </p>
        )}
        {error && (
          <p id={errorId} role="alert" className="text-xs font-medium text-red-600">
            {error}
          </p>
        )}
      </div>
    );
  },
);
InputField.displayName = 'InputField';
