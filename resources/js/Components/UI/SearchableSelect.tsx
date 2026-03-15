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
    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});
    const containerRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const listRef = useRef<HTMLDivElement>(null);

    const selectedOption = options.find((opt) => String(opt.value) === String(value));

    const filteredOptions = useMemo(() => {
        if (!searchQuery) return options;
        const query = searchQuery.toLowerCase();
        return options.filter(
            (opt) =>
                opt.label.toLowerCase().includes(query) ||
                (opt.subLabel && opt.subLabel.toLowerCase().includes(query))
        );
    }, [options, searchQuery]);

    const updatePosition = useCallback(() => {
        if (!buttonRef.current) return;
        const rect = buttonRef.current.getBoundingClientRect();
        const spaceBelow = window.innerHeight - rect.bottom;
        const dropdownHeight = 280;
        const showAbove = spaceBelow < dropdownHeight && rect.top > dropdownHeight;

        setDropdownStyle({
            position: 'fixed',
            left: rect.left,
            width: rect.width,
            zIndex: 99999,
            ...(showAbove
                ? { bottom: window.innerHeight - rect.top + 4 }
                : { top: rect.bottom + 4 }),
        });
    }, []);

    // Signal to Modal that a SearchableSelect is active
    useEffect(() => {
        if (isOpen) {
            document.body.setAttribute('data-searchable-open', 'true');
            updatePosition();
            setHighlightedIndex(-1);
            requestAnimationFrame(() => inputRef.current?.focus());
        } else {
            document.body.removeAttribute('data-searchable-open');
        }
        return () => document.body.removeAttribute('data-searchable-open');
    }, [isOpen, updatePosition]);

    // Close on outside click
    useEffect(() => {
        if (!isOpen) return;

        const handleMouseDown = (e: MouseEvent) => {
            const target = e.target as Node;
            if (
                containerRef.current && !containerRef.current.contains(target) &&
                dropdownRef.current && !dropdownRef.current.contains(target)
            ) {
                setIsOpen(false);
                setSearchQuery('');
            }
        };

        document.addEventListener('mousedown', handleMouseDown);
        return () => document.removeEventListener('mousedown', handleMouseDown);
    }, [isOpen]);

    // Close on external scroll and resize
    useEffect(() => {
        if (!isOpen) return;

        const close = () => {
            setIsOpen(false);
            setSearchQuery('');
        };

        const handleScroll = (e: Event) => {
            if (dropdownRef.current?.contains(e.target as Node)) return;
            close();
        };

        document.addEventListener('scroll', handleScroll, true);
        window.addEventListener('resize', close);

        return () => {
            document.removeEventListener('scroll', handleScroll, true);
            window.removeEventListener('resize', close);
        };
    }, [isOpen]);

    const handleSelect = (optionValue: string | number) => {
        onChange(optionValue);
        setIsOpen(false);
        setSearchQuery('');
        buttonRef.current?.focus();
    };

    const handleClear = (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        onChange('');
        setSearchQuery('');
    };

    // Scroll highlighted item into view
    const scrollToHighlighted = (index: number) => {
        if (!listRef.current) return;
        const items = listRef.current.querySelectorAll('[data-option]');
        items[index]?.scrollIntoView({ block: 'nearest' });
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (!isOpen) {
            if (e.key === 'ArrowDown' || e.key === ' ') {
                e.preventDefault();
                setIsOpen(true);
            }
            return;
        }

        switch (e.key) {
            case 'ArrowDown': {
                e.preventDefault();
                const next = highlightedIndex < filteredOptions.length - 1 ? highlightedIndex + 1 : 0;
                setHighlightedIndex(next);
                scrollToHighlighted(next);
                break;
            }
            case 'ArrowUp': {
                e.preventDefault();
                const prev = highlightedIndex > 0 ? highlightedIndex - 1 : filteredOptions.length - 1;
                setHighlightedIndex(prev);
                scrollToHighlighted(prev);
                break;
            }
            case 'Home': {
                e.preventDefault();
                setHighlightedIndex(0);
                scrollToHighlighted(0);
                break;
            }
            case 'End': {
                e.preventDefault();
                const last = filteredOptions.length - 1;
                setHighlightedIndex(last);
                scrollToHighlighted(last);
                break;
            }
            case 'Enter': {
                e.preventDefault();
                if (highlightedIndex >= 0 && highlightedIndex < filteredOptions.length) {
                    handleSelect(filteredOptions[highlightedIndex].value);
                }
                break;
            }
            case 'Escape':
            case 'Tab': {
                setIsOpen(false);
                setSearchQuery('');
                buttonRef.current?.focus();
                break;
            }
        }
    };

    // Reset highlighted index when search changes
    useEffect(() => {
        setHighlightedIndex(-1);
    }, [searchQuery]);

    return (
        <div className="w-full" ref={containerRef}>
            {label && (
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    {label}
                    {required && <span className="text-red-500 mr-1">*</span>}
                </label>
            )}
            <button
                ref={buttonRef}
                type="button"
                onClick={() => !disabled && setIsOpen(!isOpen)}
                onKeyDown={handleKeyDown}
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
                        <span
                            role="button"
                            tabIndex={-1}
                            onMouseDown={handleClear}
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

            {isOpen && createPortal(
                <div
                    ref={dropdownRef}
                    dir="rtl"
                    style={dropdownStyle}
                    data-searchable-select-dropdown
                    onPointerDown={(e) => e.stopPropagation()}
                    onMouseDown={(e) => e.stopPropagation()}
                    onClick={(e) => e.stopPropagation()}
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
                                onKeyDown={handleKeyDown}
                                placeholder={searchPlaceholder}
                                className="w-full pr-9 pl-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                            />
                        </div>
                    </div>
                    <div ref={listRef} className="max-h-60 overflow-y-auto" role="listbox">
                        {filteredOptions.length === 0 ? (
                            <div className="px-4 py-8 text-center text-slate-500 text-sm">
                                لا توجد نتائج
                            </div>
                        ) : (
                            filteredOptions.map((option, index) => (
                                <div
                                    key={option.value}
                                    role="option"
                                    data-option
                                    aria-selected={String(option.value) === String(value)}
                                    onMouseDown={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        handleSelect(option.value);
                                    }}
                                    onMouseEnter={() => setHighlightedIndex(index)}
                                    className={clsx(
                                        'w-full px-4 py-2.5 text-right text-sm transition-colors flex items-center justify-between cursor-pointer',
                                        String(option.value) === String(value)
                                            ? 'bg-teal-50 text-teal-700'
                                            : index === highlightedIndex
                                            ? 'bg-slate-100 text-slate-800'
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
                                </div>
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
