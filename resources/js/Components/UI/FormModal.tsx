import { useForm } from '@inertiajs/react';
import { FormEvent, ReactNode, useEffect } from 'react';
import Modal, { ModalFooter } from './Modal';
import Button from './Button';

interface FormModalProps {
    open: boolean;
    onClose: () => void;
    title: string;
    description?: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    initialData: any;
    action: string;
    method?: 'post' | 'put' | 'patch';
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    children: (form: any) => ReactNode;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    submitLabel?: string;
}

export default function FormModal({
    open,
    onClose,
    title,
    description,
    initialData,
    action,
    method = 'post',
    children,
    size = 'md',
    submitLabel = 'حفظ',
}: FormModalProps) {
    const form = useForm(initialData);

    useEffect(() => {
        if (open) {
            form.setData(initialData);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, JSON.stringify(initialData)]);

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        
        const options = {
            preserveScroll: true,
            onSuccess: () => {
                form.reset();
                onClose();
            },
        };

        if (method === 'post') {
            form.post(action, options);
        } else if (method === 'put') {
            form.put(action, options);
        } else {
            form.patch(action, options);
        }
    };

    const handleClose = () => {
        form.reset();
        form.clearErrors();
        onClose();
    };

    return (
        <Modal open={open} onClose={handleClose} title={title} description={description} size={size}>
            <form onSubmit={handleSubmit}>
                <div className="space-y-4">{children(form)}</div>
                <ModalFooter>
                    <Button type="button" variant="secondary" onClick={handleClose}>
                        إلغاء
                    </Button>
                    <Button type="submit" loading={form.processing}>
                        {submitLabel}
                    </Button>
                </ModalFooter>
            </form>
        </Modal>
    );
}
