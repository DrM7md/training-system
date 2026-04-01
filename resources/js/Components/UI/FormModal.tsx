import { useForm, InertiaFormProps } from '@inertiajs/react';
import { FormEvent, ReactNode, useEffect, useRef } from 'react';
import Modal, { ModalFooter } from './Modal';
import Button from './Button';

// ─── Generic Type — عشان الـ form يكون typed ───
interface FormModalProps<T extends Record<string, unknown>> {
    open: boolean;
    onClose: () => void;
    title: string;
    description?: string;
    initialData: T;
    action: string;
    method?: 'post' | 'put' | 'patch';
    children: (form: InertiaFormProps<T>) => ReactNode;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    submitLabel?: string;
    onSuccess?: () => void;
}

export default function FormModal<T extends Record<string, unknown>>({
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
    onSuccess,
}: FormModalProps<T>) {
    const form = useForm(initialData as any);

    // ─── نحفظ آخر initialData عشان نقارن بثبات ───
    const prevDataRef = useRef<string>('');

    useEffect(() => {
        if (!open) return;

        const dataStr = JSON.stringify(initialData);

        // نحدّث بس لو البيانات فعلاً تغيرت
        if (dataStr !== prevDataRef.current) {
            form.setData(initialData);
            prevDataRef.current = dataStr;
        }

        // دايماً ننظف الـ errors لما يفتح
        form.clearErrors();
    }, [open, initialData]);

    // ─── Submit ───
    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();

        const options = {
            preserveScroll: true,
            onSuccess: () => {
                form.reset();
                form.clearErrors();
                onClose();
                onSuccess?.();
            },
        };

        form[method](action, options);
    };

    // ─── إغلاق ───
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