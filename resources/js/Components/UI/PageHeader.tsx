import { ReactNode } from 'react';
import { Link } from '@inertiajs/react';
import { ChevronLeft } from 'lucide-react';

interface PageHeaderProps {
    title: ReactNode;
    description?: string;
    action?: ReactNode;
    breadcrumbs?: Array<{ label: string; href?: string }>;
}

export default function PageHeader({ title, description, action, breadcrumbs }: PageHeaderProps) {
    return (
        <div className="mb-6">
            {breadcrumbs && breadcrumbs.length > 0 && (
                <nav className="flex items-center gap-1 text-sm text-slate-500 mb-3">
                    {breadcrumbs.map((item, index) => (
                        <span key={index} className="flex items-center gap-1">
                            {index > 0 && <ChevronLeft className="h-4 w-4" />}
                            {item.href ? (
                                <Link href={item.href} className="hover:text-teal-600 transition-colors">
                                    {item.label}
                                </Link>
                            ) : (
                                <span className="text-slate-800 font-medium">{item.label}</span>
                            )}
                        </span>
                    ))}
                </nav>
            )}
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-l from-slate-700 to-slate-900 bg-clip-text text-transparent">{title}</h1>
                    {description && <p className="text-sm text-slate-500 mt-1.5">{description}</p>}
                </div>
                {action}
            </div>
        </div>
    );
}
