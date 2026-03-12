import clsx from 'clsx';

interface BadgeProps {
    children: React.ReactNode;
    variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'primary';
    size?: 'sm' | 'md';
}

const variants = {
    default: 'bg-slate-100 text-slate-600 ring-1 ring-slate-200',
    success: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
    warning: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
    danger: 'bg-red-50 text-red-700 ring-1 ring-red-200',
    info: 'bg-sky-50 text-sky-700 ring-1 ring-sky-200',
    primary: 'bg-teal-50 text-teal-700 ring-1 ring-teal-200',
};

const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
};

export default function Badge({ children, variant = 'default', size = 'sm' }: BadgeProps) {
    return (
        <span
            className={clsx(
                'inline-flex items-center font-medium rounded-full',
                variants[variant],
                sizes[size]
            )}
        >
            {children}
        </span>
    );
}
