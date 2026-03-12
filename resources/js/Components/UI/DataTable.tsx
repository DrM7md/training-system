import clsx from 'clsx';
import { ChevronRight, ChevronLeft } from 'lucide-react';

interface Column<T> {
    key: keyof T | string;
    title: string;
    render?: (item: T) => React.ReactNode;
    className?: string;
}

interface DataTableProps<T> {
    data: T[];
    columns: Column<T>[];
    keyField: keyof T;
    loading?: boolean;
    emptyMessage?: string;
    pagination?: {
        currentPage: number;
        totalPages: number;
        perPage: number;
        total: number;
        onPageChange: (page: number) => void;
    };
    onRowClick?: (item: T) => void;
}

export default function DataTable<T extends Record<string, unknown>>({
    data,
    columns,
    keyField,
    loading,
    emptyMessage = 'لا توجد بيانات',
    pagination,
    onRowClick,
}: DataTableProps<T>) {
    const getValue = (item: T, key: string): unknown => {
        return key.split('.').reduce((obj: unknown, k) => {
            if (obj && typeof obj === 'object') {
                return (obj as Record<string, unknown>)[k];
            }
            return undefined;
        }, item);
    };

    return (
        <div className="w-full overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-gray-200 bg-gray-50">
                            {columns.map((column) => (
                                <th
                                    key={String(column.key)}
                                    className={clsx(
                                        'px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider',
                                        column.className
                                    )}
                                >
                                    {column.title}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {loading ? (
                            <tr>
                                <td colSpan={columns.length} className="px-4 py-8 text-center">
                                    <div className="flex items-center justify-center gap-2 text-gray-500">
                                        <div className="w-5 h-5 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
                                        <span>جاري التحميل...</span>
                                    </div>
                                </td>
                            </tr>
                        ) : data.length === 0 ? (
                            <tr>
                                <td colSpan={columns.length} className="px-4 py-8 text-center text-gray-500">
                                    {emptyMessage}
                                </td>
                            </tr>
                        ) : (
                            data.map((item) => (
                                <tr
                                    key={String(item[keyField])}
                                    className={clsx(
                                        'hover:bg-gray-50 transition-colors',
                                        onRowClick && 'cursor-pointer'
                                    )}
                                    onClick={() => onRowClick?.(item)}
                                >
                                    {columns.map((column) => (
                                        <td
                                            key={String(column.key)}
                                            className={clsx('px-4 py-3 text-sm text-gray-700', column.className)}
                                        >
                                            {column.render
                                                ? column.render(item)
                                                : String(getValue(item, String(column.key)) ?? '-')}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
            {pagination && pagination.totalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 bg-gray-50">
                    <div className="text-sm text-gray-500">
                        عرض {(pagination.currentPage - 1) * pagination.perPage + 1} إلى{' '}
                        {Math.min(pagination.currentPage * pagination.perPage, pagination.total)} من{' '}
                        {pagination.total} نتيجة
                    </div>
                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => pagination.onPageChange(pagination.currentPage - 1)}
                            disabled={pagination.currentPage === 1}
                            className="p-2 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <ChevronRight className="h-4 w-4" />
                        </button>
                        {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                            const page = i + 1;
                            return (
                                <button
                                    key={page}
                                    onClick={() => pagination.onPageChange(page)}
                                    className={clsx(
                                        'w-8 h-8 rounded-lg text-sm font-medium',
                                        pagination.currentPage === page
                                            ? 'bg-blue-600 text-white'
                                            : 'hover:bg-gray-200 text-gray-700'
                                    )}
                                >
                                    {page}
                                </button>
                            );
                        })}
                        <button
                            onClick={() => pagination.onPageChange(pagination.currentPage + 1)}
                            disabled={pagination.currentPage === pagination.totalPages}
                            className="p-2 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
