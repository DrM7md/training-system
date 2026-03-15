import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import clsx from 'clsx';
import { ReactNode } from 'react';

interface ModalProps {
    open: boolean;
    onClose: () => void;
    title: string;
    description?: string;
    children: ReactNode;
    size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
    showClose?: boolean;
}

const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-[90vw]',
};

export default function Modal({
    open,
    onClose,
    title,
    description,
    children,
    size = 'md',
    showClose = true,
}: ModalProps) {
    return (
        <Dialog.Root open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 animate-in fade-in" />
                <Dialog.Content
                    className={clsx(
                        'fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50',
                        'bg-white rounded-2xl shadow-2xl shadow-slate-900/10 w-full p-6',
                        'animate-in fade-in zoom-in-95 duration-200',
                        'max-h-[85vh] overflow-y-auto',
                        sizeClasses[size]
                    )}
                    dir="rtl"
                    onPointerDownOutside={(e) => {
                        const originalEvent = (e as any).detail?.originalEvent;
                        const target = (originalEvent?.target || e.target) as HTMLElement;
                        if (target?.closest?.('[data-searchable-select-dropdown]')) {
                            e.preventDefault();
                        }
                    }}
                    onInteractOutside={(e) => {
                        const originalEvent = (e as any).detail?.originalEvent;
                        const target = (originalEvent?.target || e.target) as HTMLElement;
                        if (target?.closest?.('[data-searchable-select-dropdown]')) {
                            e.preventDefault();
                        }
                    }}
                >
                    <div className="flex items-start justify-between mb-5 pb-4 border-b border-slate-100">
                        <div>
                            <Dialog.Title className="text-xl font-bold text-slate-800">
                                {title}
                            </Dialog.Title>
                            {description && (
                                <Dialog.Description className="text-sm text-slate-500 mt-1">
                                    {description}
                                </Dialog.Description>
                            )}
                        </div>
                        {showClose && (
                            <Dialog.Close asChild>
                                <button className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
                                    <X className="h-5 w-5" />
                                </button>
                            </Dialog.Close>
                        )}
                    </div>
                    {children}
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
}

interface ModalFooterProps {
    children: ReactNode;
    className?: string;
}

export function ModalFooter({ children, className }: ModalFooterProps) {
    return (
        <div className={clsx('flex items-center justify-end gap-3 mt-6 pt-5 border-t border-slate-100', className)}>
            {children}
        </div>
    );
}
