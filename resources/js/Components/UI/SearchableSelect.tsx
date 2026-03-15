import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Search, ChevronDown, X, Check } from 'lucide-react';
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
    searchPlaceholder?: string;
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
    searchPlaceholder = 'بحث...',
}: SearchableSelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});
    const containerRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const selectedOption = options.find((opt) => String(opt.value) === String(value));

    const updateDropdownPosition = useCallback(() => {
        if (buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect();
            setDropdownStyle({
                position: 'fixed',
                top: rect.bottom + 4,
                left: rect.left,
                width: rect.width,
                zIndex: 9999,
            });
        }
    }, []);

    const filteredOptions = useMemo(() => {
        if (!searchQuery) return options;
        const query = searchQuery.toLowerCase();
        return options.filter(
            (opt) =>
                opt.label.toLowerCase().includes(query) ||
                (opt.subLabel && opt.subLabel.toLowerCase().includes(query))
        );
    }, [options, searchQuery]);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            const target = event.target as Node;
            if (
                containerRef.current && !containerRef.current.contains(target) &&
                dropdownRef.current && !dropdownRef.current.contains(target)
            ) {
                setIsOpen(false);
                setSearchQuery('');
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (isOpen) {
            updateDropdownPosition();
            inputRef.current?.focus();
        }
    }, [isOpen, updateDropdownPosition]);

    const handleSelect = (optionValue: string | number) => {
        onChange(optionValue);
        setIsOpen(false);
        setSearchQuery('');
    };

    const handleClear = (e: React.MouseEvent) => {
        e.stopPropagation();
        onChange('');
        setSearchQuery('');
    };

    return (
        <div className="w-full" ref={containerRef}>
            {label && (
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    {label}
                    {required && <span className="text-red-500 mr-1">*</span>}
                </label>
            )}
            <div className="relative">
                <button
                    ref={buttonRef}
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
                        {selectedOption ? (
                            <span className="flex flex-col items-start">
                                <span>{selectedOption.label}</span>
                                {selectedOption.subLabel && (
                                    <span className="text-xs text-slate-400">{selectedOption.subLabel}</span>
                                )}
                            </span>
                        ) : (
                            placeholder
                        )}
                    </span>
                    <div className="flex items-center gap-1">
                        {selectedOption && !disabled && (
                            <button
                                type="button"
                                onClick={handleClear}
                                className="p-1 hover:bg-slate-100 rounded-lg transition-colors"
                            >
                                <X className="h-3.5 w-3.5 text-slate-400" />
                            </button>
                        )}
                        <ChevronDown
                            className={clsx(
                                'h-4 w-4 text-slate-400 transition-transform',
                                isOpen && 'rotate-180'
                            )}
                        />
                    </div>
                </button>

            </div>
            {isOpen && createPortal(
                <div
                    ref={dropdownRef}
                    dir="rtl"
                    style={dropdownStyle}
                    className="bg-white border border-slate-200 rounded-xl shadow-xl shadow-slate-200/50 overflow-hidden"
                >
                    <div className="p-2 border-b border-slate-100">
                        <div className="relative">
                            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <input
                                ref={inputRef}
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder={searchPlaceholder}
                                className="w-full pr-9 pl-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                            />
                        </div>
                    </div>
                    <div className="max-h-60 overflow-y-auto">
                        {filteredOptions.length === 0 ? (
                            <div className="px-4 py-8 text-center text-slate-500 text-sm">
                                لا توجد نتائج
                            </div>
                        ) : (
                            filteredOptions.map((option) => (
                                <button
                                    key={option.value}
                                    type="button"
                                    onClick={() => handleSelect(option.value)}
                                    className={clsx(
                                        'w-full px-4 py-2.5 text-right text-sm transition-colors flex items-center justify-between',
                                        String(option.value) === String(value)
                                            ? 'bg-teal-50 text-teal-700'
                                            : 'hover:bg-slate-50 text-slate-700'
                                    )}
                                >
                                    <div className="flex flex-col items-start">
                                        <span className="font-medium">{option.label}</span>
                                        {option.subLabel && (
                                            <span className="text-xs text-slate-400">{option.subLabel}</span>
                                        )}
                                    </div>
                                    {String(option.value) === String(value) && (
                                        <Check className="h-4 w-4 text-teal-600" />
                                    )}
                                </button>
                            ))
                        )}
                    </div>
                </div>,
                document.body
            )}
            {error && <p className="mt-1.5 text-sm text-red-600 font-medium">{error}</p>}
        </div>
    );
}
