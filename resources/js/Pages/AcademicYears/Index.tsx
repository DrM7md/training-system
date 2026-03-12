import AuthenticatedLayout from '@/Components/Layout/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import { Plus, Edit2, Trash2, Star, Calendar, BookOpen, Layers } from 'lucide-react';
import Card from '@/Components/UI/Card';
import Button from '@/Components/UI/Button';
import Badge from '@/Components/UI/Badge';
import PageHeader from '@/Components/UI/PageHeader';
import FormModal from '@/Components/UI/FormModal';
import DeleteModal from '@/Components/UI/DeleteModal';
import Input from '@/Components/UI/Input';
import { formatDate } from '@/Utils/helpers';

interface AcademicYear {
    id: number;
    name: string;
    start_date: string;
    end_date: string;
    is_current: boolean;
    semesters_count: number;
    programs_count: number;
}

interface Props {
    academicYears: {
        data: AcademicYear[];
        current_page: number;
        last_page: number;
    };
}

export default function Index({ academicYears }: Props) {
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState<AcademicYear | null>(null);
    const [deleting, setDeleting] = useState<AcademicYear | null>(null);

    const getDateValue = (dateStr: string) => {
        if (!dateStr) return '';
        return dateStr.split('T')[0];
    };

    const initialData = editing
        ? {
              name: editing.name,
              start_date: getDateValue(editing.start_date),
              end_date: getDateValue(editing.end_date),
              is_current: editing.is_current,
          }
        : { name: '', start_date: '', end_date: '', is_current: false };

    const handleEdit = (year: AcademicYear) => {
        setEditing(year);
        setShowForm(true);
    };

    const handleClose = () => {
        setShowForm(false);
        setEditing(null);
    };

    const handleSetCurrent = (year: AcademicYear) => {
        router.post(route('academic-years.set-current', year.id), {}, { preserveScroll: true });
    };

    return (
        <AuthenticatedLayout>
            <Head title="الأعوام الدراسية" />

            <PageHeader
                title="الأعوام الدراسية"
                description="إدارة الأعوام الدراسية والفصول"
                action={
                    <Button icon={<Plus className="h-4 w-4" />} onClick={() => setShowForm(true)}>
                        إضافة عام دراسي
                    </Button>
                }
            />

            {academicYears.data.length === 0 ? (
                <Card>
                    <div className="text-center py-12 text-slate-500">
                        <Calendar className="h-12 w-12 mx-auto text-slate-300 mb-3" />
                        <p className="font-medium">لا توجد أعوام دراسية</p>
                        <p className="text-sm text-slate-400 mt-1">ابدأ بإضافة عام دراسي جديد</p>
                    </div>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {academicYears.data.map((year) => (
                        <Card
                            key={year.id}
                            className={`relative group hover:shadow-sm transition-shadow ${
                                year.is_current ? 'border-r-4 border-r-teal-500' : ''
                            }`}
                        >
                            {/* Action buttons on hover */}
                            <div className="absolute top-3 left-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                {!year.is_current && (
                                    <button
                                        onClick={() => handleSetCurrent(year)}
                                        className="p-1.5 rounded-lg hover:bg-teal-50 text-teal-600 transition-colors"
                                        title="تعيين كحالي"
                                    >
                                        <Star className="h-4 w-4" />
                                    </button>
                                )}
                                <button
                                    onClick={() => handleEdit(year)}
                                    className="p-1.5 rounded-lg hover:bg-teal-100 text-teal-600 transition-colors"
                                >
                                    <Edit2 className="h-4 w-4" />
                                </button>
                                <button
                                    onClick={() => setDeleting(year)}
                                    className="p-1.5 rounded-lg hover:bg-red-100 text-red-600 transition-colors"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>

                            {/* Header with icon and name */}
                            <div className="flex items-start gap-3">
                                <div className="bg-teal-50 text-teal-600 rounded-xl p-2.5">
                                    <Calendar className="h-5 w-5" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-bold text-slate-800">{year.name}</h3>
                                        {year.is_current && (
                                            <Badge variant="success">الحالي</Badge>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Dates row */}
                            <div className="mt-3 flex items-center gap-2 text-sm text-slate-500">
                                <span>{formatDate(year.start_date)}</span>
                                <span className="text-slate-300">—</span>
                                <span>{formatDate(year.end_date)}</span>
                            </div>

                            {/* Stats */}
                            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-3">
                                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 rounded-lg text-sm">
                                    <Layers className="h-3.5 w-3.5 text-slate-400" />
                                    <span className="font-semibold text-slate-700">{year.semesters_count}</span>
                                    <span className="text-slate-500 text-xs">فصل</span>
                                </div>
                                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-teal-50 rounded-lg text-sm">
                                    <BookOpen className="h-3.5 w-3.5 text-teal-500" />
                                    <span className="font-semibold text-teal-700">{year.programs_count}</span>
                                    <span className="text-teal-600 text-xs">برنامج</span>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            <FormModal
                open={showForm}
                onClose={handleClose}
                title={editing ? 'تعديل العام الدراسي' : 'إضافة عام دراسي'}
                initialData={initialData}
                action={editing ? route('academic-years.update', editing.id) : route('academic-years.store')}
                method={editing ? 'put' : 'post'}
            >
                {(form) => (
                    <>
                        <Input
                            label="اسم العام الدراسي"
                            value={form.data.name}
                            onChange={(e) => form.setData('name', e.target.value)}
                            error={form.errors.name}
                            placeholder="مثال: 1446-1447هـ"
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
                        <label className="flex items-center gap-2 cursor-pointer group">
                            <input
                                type="checkbox"
                                checked={form.data.is_current}
                                onChange={(e) => form.setData('is_current', e.target.checked)}
                                className="w-4 h-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                            />
                            <span className="text-sm text-slate-700 group-hover:text-slate-900">تعيين كعام دراسي حالي</span>
                        </label>
                    </>
                )}
            </FormModal>

            <DeleteModal
                open={!!deleting}
                onClose={() => setDeleting(null)}
                action={deleting ? route('academic-years.destroy', deleting.id) : ''}
                message={`هل أنت متأكد من حذف العام الدراسي "${deleting?.name}"؟`}
            />
        </AuthenticatedLayout>
    );
}
