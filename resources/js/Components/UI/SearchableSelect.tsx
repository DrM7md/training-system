import { useState, useRef, useEffect } from 'react';
import { ChevronDown, X, Check } from 'lucide-react';
import clsx from 'clsx';

interface Option {
    value: string | number;
    label: string;
    subLabel?: string;
}

interface SearchableSelectProps {
    label?: string;
    value: string | number;
    onChange: (value: string | number) => void;
    options: Option[];
    placeholder?: string;
    error?: string;
    required?: boolean;
    disabled?: boolean;
}

export default function SearchableSelect({
    label,
    value,
    onChange,
    options,
    placeholder = 'اختر...',
    error,
    required,
    disabled,
}: SearchableSelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const selectedOption = options.find((opt) => String(opt.value) === String(value));

    // Close on outside click
    useEffect(() => {
        if (!isOpen) return;
        const handle = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handle);
        return () => document.removeEventListener('mousedown', handle);
    }, [isOpen]);

    return (
        <div className="w-full relative" ref={containerRef}>
            {label && (
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    {label}
                    {required && <span className="text-red-500 mr-1">*</span>}
                </label>
            )}

            <button
                type="button"
                onClick={() => !disabled && setIsOpen(!isOpen)}
                disabled={disabled}
                className={clsx(
                    'w-full px-4 py-2.5 border rounded-xl text-sm text-right transition-all duration-200 flex items-center justify-between gap-2',
                    'focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500',
                    error
                        ? 'border-red-300 focus:ring-red-500/20 focus:border-red-500 bg-red-50/50'
                        : 'border-slate-200 hover:border-slate-300 bg-white',
                    disabled && 'bg-slate-50 cursor-not-allowed opacity-60'
                )}
            >
                <span className={clsx(!selectedOption && 'text-slate-400')}>
                    {selectedOption ? selectedOption.label : placeholder}
                </span>
                <div className="flex items-center gap-1">
                    {selectedOption && !disabled && (
                        <span
                            role="button"
                            tabIndex={-1}
                            onMouseDown={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                onChange('');
                            }}
                            className="p-1 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                            <X className="h-3.5 w-3.5 text-slate-400" />
                        </span>
                    )}
                    <ChevronDown
                        className={clsx(
                            'h-4 w-4 text-slate-400 transition-transform',
                            isOpen && 'rotate-180'
                        )}
                    />
                </div>
            </button>

            {isOpen && (
                <div className="absolute z-50 mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-xl shadow-slate-200/50 overflow-hidden">
                    <div className="max-h-60 overflow-y-auto">
                        {options.length === 0 ? (
                            <div className="px-4 py-6 text-center text-slate-500 text-sm">
                                لا توجد خيارات
                            </div>
                        ) : (
                            options.map((option) => (
                                <button
                                    key={option.value}
                                    type="button"
                                    onClick={() => {
                                        onChange(option.value);
                                        setIsOpen(false);
                                    }}
                                    className={clsx(
                                        'w-full px-4 py-2.5 text-right text-sm transition-colors flex items-center justify-between',
                                        String(option.value) === String(value)
                                            ? 'bg-teal-50 text-teal-700'
                                            : 'hover:bg-slate-50 text-slate-700'
                                    )}
                                >
                                    <span className="font-medium">{option.label}</span>
                                    {String(option.value) === String(value) && (
                                        <Check className="h-4 w-4 text-teal-600" />
                                    )}
                                </button>
                            ))
                        )}
                    </div>
                </div>
            )}

            {error && <p className="mt-1.5 text-sm text-red-600 font-medium">{error}</p>}
        </div>
    );
}
