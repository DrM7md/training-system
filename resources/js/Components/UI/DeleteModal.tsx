import { router } from '@inertiajs/react';
import Modal, { ModalFooter } from './Modal';
import Button from './Button';
import { useState } from 'react';
import { AlertTriangle } from 'lucide-react';

interface DeleteModalProps {
    open: boolean;
    onClose: () => void;
    title?: string;
    message?: string;
    action: string;
}

export default function DeleteModal({
    open,
    onClose,
    title = 'تأكيد الحذف',
    message = 'هل أنت متأكد من حذف هذا العنصر؟ لا يمكن التراجع عن هذا الإجراء.',
    action,
}: DeleteModalProps) {
    const [loading, setLoading] = useState(false);

    const handleDelete = () => {
        setLoading(true);
        router.delete(action, {
            preserveScroll: true,
            onSuccess: () => {
                setLoading(false);
                onClose();
            },
            onError: () => {
                setLoading(false);
            },
        });
    };

    return (
        <Modal open={open} onClose={onClose} title={title} size="sm">
            <div className="flex items-start gap-4">
                <div className="p-3 bg-red-100 rounded-xl">
                    <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
                <p className="text-slate-600 pt-2 leading-relaxed">{message}</p>
            </div>
            <ModalFooter>
                <Button type="button" variant="secondary" onClick={onClose}>
                    إلغاء
                </Button>
                <Button type="button" variant="danger" loading={loading} onClick={handleDelete}>
                    حذف
                </Button>
            </ModalFooter>
        </Modal>
    );
}
