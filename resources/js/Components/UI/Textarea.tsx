import clsx from 'clsx';
import { forwardRef, TextareaHTMLAttributes } from 'react';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string;
    error?: string;
    hint?: string;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
    ({ className, label, error, hint, id, ...props }, ref) => {
        const inputId = id || props.name;

        return (
            <div className="w-full">
                {label && (
                    <label htmlFor={inputId} className="block text-sm font-semibold text-slate-700 mb-1.5">
                        {label}
                        {props.required && <span className="text-red-500 mr-1">*</span>}
                    </label>
                )}
                <textarea
                    ref={ref}
                    id={inputId}
                    rows={4}
                    className={clsx(
                        'w-full px-4 py-2.5 border rounded-xl text-sm transition-all duration-200 resize-none',
                        'focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500',
                        'placeholder:text-slate-400',
                        error
                            ? 'border-red-300 focus:ring-red-500/20 focus:border-red-500 bg-red-50/50'
                            : 'border-slate-200 hover:border-slate-300 bg-white',
                        props.disabled && 'bg-slate-50 cursor-not-allowed opacity-60',
                        className
                    )}
                    {...props}
                />
                {error && <p className="mt-1.5 text-sm text-red-600 font-medium">{error}</p>}
                {hint && !error && <p className="mt-1.5 text-sm text-slate-500">{hint}</p>}
            </div>
        );
    }
);

Textarea.displayName = 'Textarea';

export default Textarea;
