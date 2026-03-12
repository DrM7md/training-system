import clsx from 'clsx';
import { ReactNode } from 'react';

interface CardProps {
    children: ReactNode;
    className?: string;
    padding?: 'none' | 'sm' | 'md' | 'lg';
}

const paddingClasses = {
    none: '',
    sm: 'p-3',
    md: 'p-4 sm:p-5',
    lg: 'p-6',
};

export default function Card({ children, className, padding = 'md' }: CardProps) {
    return (
        <div
            className={clsx(
                'bg-white rounded-2xl border border-slate-200/80 shadow-sm shadow-slate-100',
                paddingClasses[padding],
                className
            )}
        >
            {children}
        </div>
    );
}

interface CardHeaderProps {
    title: ReactNode;
    description?: string;
    action?: ReactNode;
}

export function CardHeader({ title, description, action }: CardHeaderProps) {
    return (
        <div className="flex items-start justify-between mb-4 pb-4 border-b border-slate-100">
            <div>
                <h3 className="text-lg font-bold text-slate-800">{title}</h3>
                {description && <p className="text-sm text-slate-500 mt-1">{description}</p>}
            </div>
            {action}
        </div>
    );
}
