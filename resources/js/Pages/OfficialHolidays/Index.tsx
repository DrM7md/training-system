import AuthenticatedLayout from '@/Components/Layout/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { Plus, Edit2, Trash2, CalendarOff, Calendar } from 'lucide-react';
import Card from '@/Components/UI/Card';
import Button from '@/Components/UI/Button';
import PageHeader from '@/Components/UI/PageHeader';
import Modal, { ModalFooter } from '@/Components/UI/Modal';
import DeleteModal from '@/Components/UI/DeleteModal';
import Input from '@/Components/UI/Input';
import Textarea from '@/Components/UI/Textarea';

interface Holiday {
    id: number;
    name: string;
    start_date: string;
    end_date: string;
    color: string;
    notes: string | null;
}

interface Props {
    holidays: Holiday[];
}

const colorOptions = [
    { value: '#ef4444', label: 'أحمر' },
    { value: '#f97316', label: 'برتقالي' },
    { value: '#eab308', label: 'أصفر' },
    { value: '#22c55e', label: 'أخضر' },
    { value: '#3b82f6', label: 'أزرق' },
    { value: '#8b5cf6', label: 'بنفسجي' },
    { value: '#ec4899', label: 'وردي' },
    { value: '#6b7280', label: 'رمادي' },
];

function getDaysDiff(start: string, end: string): number {
    const s = new Date(start);
    const e = new Date(end);
    return Math.floor((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24)) + 1;
}

function formatDateAr(d: string): string {
    return new Date(d).toLocaleDateString('ar-SA', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
}

function getDayName(d: string): string {
    return new Date(d).toLocaleDateString('ar-SA', { weekday: 'long' });
}

export default function OfficialHolidaysIndex({ holidays }: Props) {
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState<Holiday | null>(null);
    const [deleting, setDeleting] = useState<Holiday | null>(null);

    const initialData = {
        name: '',
        start_date: '',
        end_date: '',
        color: '#ef4444',
        notes: '',
    };

    const form = useForm(initialData);

    const openCreate = () => {
        form.setData(initialData);
        form.clearErrors();
        setEditing(null);
        setShowForm(true);
    };

    const openEdit = (holiday: Holiday) => {
        form.setData({
            name: holiday.name,
            start_date: holiday.start_date,
            end_date: holiday.end_date,
            color: holiday.color || '#ef4444',
            notes: holiday.notes || '',
        });
        form.clearErrors();
        setEditing(holiday);
        setShowForm(true);
    };

    const handleSubmit = () => {
        const options = {
            preserveScroll: true,
            onSuccess: () => setShowForm(false),
        };
        if (editing) {
            form.put(`/official-holidays/${editing.id}`, options);
        } else {
            form.post('/official-holidays', options);
        }
    };

    const sortedHolidays = [...holidays].sort((a, b) =>
        new Date(a.start_date).getTime() - new Date(b.start_date).getTime()
    );

    const totalDays = holidays.reduce((sum, h) => sum + getDaysDiff(h.start_date, h.end_date), 0);

    return (
        <AuthenticatedLayout>
            <Head title="الإجازات الرسمية" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
                <PageHeader
                    title="الإجازات الرسمية"
                    description="إدارة الإجازات الرسمية والعطلات للعام الدراسي"
                    action={
                        <Button onClick={openCreate}>
                            <Plus className="h-4 w-4 ml-2" />
                            إضافة إجازة
                        </Button>
                    }
                />

                {/* Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                    <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
                        <div className="text-2xl font-bold text-slate-800">{holidays.length}</div>
                        <div className="text-sm text-slate-500">إجازة مسجلة</div>
                    </div>
                    <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
                        <div className="text-2xl font-bold text-red-600">{totalDays}</div>
                        <div className="text-sm text-slate-500">إجمالي أيام الإجازات</div>
                    </div>
                    <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
                        <div className="text-2xl font-bold text-teal-600">
                            {holidays.filter(h => new Date(h.end_date) >= new Date()).length}
                        </div>
                        <div className="text-sm text-slate-500">إجازات قادمة</div>
                    </div>
                </div>

                {/* Holidays List */}
                {sortedHolidays.length === 0 ? (
                    <Card className="p-12 text-center">
                        <CalendarOff className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-slate-600 mb-2">لا توجد إجازات مسجلة</h3>
                        <p className="text-slate-400 mb-4">قم بإضافة الإجازات الرسمية للعام الدراسي</p>
                        <Button onClick={openCreate} variant="outline">
                            <Plus className="h-4 w-4 ml-2" />
                            إضافة إجازة
                        </Button>
                    </Card>
                ) : (
                    <div className="space-y-3">
                        {sortedHolidays.map((holiday) => {
                            const days = getDaysDiff(holiday.start_date, holiday.end_date);
                            const isPast = new Date(holiday.end_date) < new Date();

                            return (
                                <div
                                    key={holiday.id}
                                    className={`bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-4 transition-all hover:shadow-md ${isPast ? 'opacity-60' : ''}`}
                                >
                                    <div
                                        className="w-2 h-16 rounded-full shrink-0"
                                        style={{ backgroundColor: holiday.color || '#ef4444' }}
                                    />

                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-bold text-slate-800 text-lg">{holiday.name}</h3>
                                        <div className="flex items-center gap-4 mt-1 text-sm text-slate-500 flex-wrap">
                                            <span className="flex items-center gap-1">
                                                <Calendar className="h-3.5 w-3.5" />
                                                {formatDateAr(holiday.start_date)}
                                                {holiday.start_date !== holiday.end_date && (
                                                    <> ← {formatDateAr(holiday.end_date)}</>
                                                )}
                                            </span>
                                            <span>
                                                {getDayName(holiday.start_date)}
                                                {holiday.start_date !== holiday.end_date && (
                                                    <> - {getDayName(holiday.end_date)}</>
                                                )}
                                            </span>
                                        </div>
                                        {holiday.notes && (
                                            <p className="text-xs text-slate-400 mt-1">{holiday.notes}</p>
                                        )}
                                    </div>

                                    <div className="text-center px-3">
                                        <div
                                            className="inline-flex items-center justify-center w-10 h-10 rounded-full text-white font-bold text-sm"
                                            style={{ backgroundColor: holiday.color || '#ef4444' }}
                                        >
                                            {days}
                                        </div>
                                        <div className="text-xs text-slate-400 mt-1">
                                            {days === 1 ? 'يوم' : days === 2 ? 'يومان' : days <= 10 ? 'أيام' : 'يوم'}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-1 shrink-0">
                                        <button
                                            onClick={() => openEdit(holiday)}
                                            className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-400 hover:text-teal-600"
                                        >
                                            <Edit2 className="h-4 w-4" />
                                        </button>
                                        <button
                                            onClick={() => setDeleting(holiday)}
                                            className="p-2 hover:bg-red-50 rounded-lg transition-colors text-slate-400 hover:text-red-600"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Form Modal */}
            <Modal
                open={showForm}
                onClose={() => setShowForm(false)}
                title={editing ? 'تعديل الإجازة' : 'إضافة إجازة جديدة'}
            >
                <div className="space-y-4">
                    <Input
                        label="اسم الإجازة"
                        value={form.data.name}
                        onChange={(e) => form.setData('name', e.target.value)}
                        error={form.errors.name}
                        placeholder="مثال: إجازة عيد الفطر"
                        required
                    />
                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="تاريخ البداية"
                            type="date"
                            value={form.data.start_date}
                            onChange={(e) => form.setData('start_date', e.target.value)}
                            error={form.errors.start_date}
                            required
                        />
                        <Input
                            label="تاريخ النهاية"
                            type="date"
                            value={form.data.end_date}
                            onChange={(e) => form.setData('end_date', e.target.value)}
                            error={form.errors.end_date}
                            required
                        />
                    </div>
                    {form.data.start_date && form.data.end_date && (
                        <div className="text-sm text-slate-500 bg-slate-50 rounded-lg p-3 text-center">
                            مدة الإجازة: <span className="font-bold text-slate-700">{getDaysDiff(form.data.start_date, form.data.end_date)}</span> يوم
                        </div>
                    )}
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">اللون</label>
                        <div className="flex items-center gap-2 flex-wrap">
                            {colorOptions.map((c) => (
                                <button
                                    key={c.value}
                                    type="button"
                                    onClick={() => form.setData('color', c.value)}
                                    className={`w-8 h-8 rounded-full transition-all ${
                                        form.data.color === c.value
                                            ? 'ring-2 ring-offset-2 ring-slate-400 scale-110'
                                            : 'hover:scale-110'
                                    }`}
                                    style={{ backgroundColor: c.value }}
                                    title={c.label}
                                />
                            ))}
                        </div>
                    </div>
                    <Textarea
                        label="ملاحظات"
                        value={form.data.notes}
                        onChange={(e) => form.setData('notes', e.target.value)}
                        error={form.errors.notes}
                        placeholder="ملاحظات إضافية (اختياري)"
                        rows={2}
                    />
                </div>
                <ModalFooter>
                    <Button variant="secondary" onClick={() => setShowForm(false)}>
                        إلغاء
                    </Button>
                    <Button onClick={handleSubmit} loading={form.processing}>
                        {editing ? 'تحديث' : 'إضافة'}
                    </Button>
                </ModalFooter>
            </Modal>

            {/* Delete Modal */}
            <DeleteModal
                open={!!deleting}
                onClose={() => setDeleting(null)}
                title="حذف الإجازة"
                message={`هل أنت متأكد من حذف إجازة "${deleting?.name}"؟`}
                action={deleting ? `/official-holidays/${deleting.id}` : ''}
            />
        </AuthenticatedLayout>
    );
}
