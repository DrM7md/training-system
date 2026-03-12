import clsx from 'clsx';
import { forwardRef, SelectHTMLAttributes, ReactNode } from 'react';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
    error?: string;
    hint?: string;
    children: ReactNode;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
    ({ className, label, error, hint, id, children, ...props }, ref) => {
        const selectId = id || props.name;

        return (
            <div className="w-full">
                {label && (
                    <label htmlFor={selectId} className="block text-sm font-semibold text-slate-700 mb-1.5">
                        {label}
                        {props.required && <span className="text-red-500 mr-1">*</span>}
                    </label>
                )}
                <select
                    ref={ref}
                    id={selectId}
                    className={clsx(
                        'w-full px-4 py-2.5 border rounded-xl text-sm transition-all duration-200 appearance-none',
                        'focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500',
                        'bg-white bg-no-repeat',
                        'bg-[url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke-width=\'2\' stroke=\'%2364748b\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' d=\'M19 9l-7 7-7-7\'/%3E%3C/svg%3E")] bg-[length:1.25rem] bg-[left_0.75rem_center]',
                        error
                            ? 'border-red-300 focus:ring-red-500/20 focus:border-red-500 bg-red-50/50'
                            : 'border-slate-200 hover:border-slate-300',
                        props.disabled && 'bg-slate-50 cursor-not-allowed opacity-60',
                        className
                    )}
                    {...props}
                >
                    {children}
                </select>
                {error && <p className="mt-1.5 text-sm text-red-600 font-medium">{error}</p>}
                {hint && !error && <p className="mt-1.5 text-sm text-slate-500">{hint}</p>}
            </div>
        );
    }
);

Select.displayName = 'Select';

export default Select;
