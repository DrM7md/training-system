import AuthenticatedLayout from '@/Components/Layout/AuthenticatedLayout';
import { Head, router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { Plus, Edit2, Trash2, School, Search, Users, ListPlus, GraduationCap, X } from 'lucide-react';
import Card from '@/Components/UI/Card';
import Button from '@/Components/UI/Button';
import Badge from '@/Components/UI/Badge';
import PageHeader from '@/Components/UI/PageHeader';
import FormModal from '@/Components/UI/FormModal';
import DeleteModal from '@/Components/UI/DeleteModal';
import Input from '@/Components/UI/Input';
import Select from '@/Components/UI/Select';
import Textarea from '@/Components/UI/Textarea';

interface SchoolType {
    id: number;
    name: string;
    code: string | null;
    type: string;
    district: string | null;
    phone: string | null;
    email: string | null;
    address: string | null;
    is_active: boolean;
    employees_count: number;
    trainees_count: number;
}

interface Props {
    schools: { data: SchoolType[]; current_page: number; last_page: number };
    filters: { search?: string; type?: string };
}

const typeOptions = [
    { value: 'male', label: 'بنين' },
    { value: 'female', label: 'بنات' },
];

const typeLabels: Record<string, string> = {
    male: 'بنين',
    female: 'بنات',
    mixed: 'مختلط',
};

export default function Index({ schools, filters }: Props) {
    const [showForm, setShowForm] = useState(false);
    const [showBulkForm, setShowBulkForm] = useState(false);
    const [editing, setEditing] = useState<SchoolType | null>(null);
    const [deleting, setDeleting] = useState<SchoolType | null>(null);
    const [search, setSearch] = useState(filters.search || '');
    const [typeFilter, setTypeFilter] = useState(filters.type || '');

    const bulkForm = useForm({
        names: '',
        type: 'male' as string,
    });

    const initialData = editing
        ? {
              name: editing.name,
              code: editing.code || '',
              type: editing.type,
              district: editing.district || '',
              phone: editing.phone || '',
              email: editing.email || '',
              address: editing.address || '',
              is_active: editing.is_active,
          }
        : { name: '', code: '', type: 'male', district: '', phone: '', email: '', address: '', is_active: true };

    const doSearch = (s: string, t: string) => {
        router.get(route('schools.index'), { search: s || undefined, type: t || undefined }, { preserveState: true, preserveScroll: true });
    };

    // بحث تلقائي بعد التوقف عن الكتابة
    const [searchTimer, setSearchTimer] = useState<ReturnType<typeof setTimeout> | null>(null);
    const handleSearchChange = (val: string) => {
        setSearch(val);
        if (searchTimer) clearTimeout(searchTimer);
        setSearchTimer(setTimeout(() => doSearch(val, typeFilter), 400));
    };

    const handleTypeChange = (val: string) => {
        setTypeFilter(val);
        doSearch(search, val);
    };

    const clearType = () => {
        setTypeFilter('');
        doSearch(search, '');
    };


    const handleBulkSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        bulkForm.post(route('schools.bulk-store'), {
            onSuccess: () => {
                setShowBulkForm(false);
                bulkForm.reset();
            },
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title="المدارس" />

            <PageHeader
                title="المدارس"
                description="إدارة قائمة المدارس"
                action={
                    <div className="flex items-center gap-2">
                        <Button variant="secondary" icon={<ListPlus className="h-4 w-4" />} onClick={() => setShowBulkForm(true)}>
                            إضافة جماعية
                        </Button>
                        <Button icon={<Plus className="h-4 w-4" />} onClick={() => setShowForm(true)}>
                            إضافة مدرسة
                        </Button>
                    </div>
                }
            />

            <Card className="mb-6">
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => handleSearchChange(e.target.value)}
                            placeholder="بحث في المدارس..."
                            className="w-full pr-10 pl-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all"
                        />
                    </div>
                    <div className="relative">
                        <select
                            value={typeFilter}
                            onChange={(e) => handleTypeChange(e.target.value)}
                            className="px-4 py-2.5 pl-10 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all appearance-none"
                        >
                            <option value="">كل الأنواع</option>
                            {typeOptions.map((t) => (
                                <option key={t.value} value={t.value}>{t.label}</option>
                            ))}
                        </select>
                        {typeFilter && (
                            <button
                                type="button"
                                onClick={clearType}
                                className="absolute left-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition-colors"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        )}
                    </div>
                </div>
            </Card>

            <Card padding="none">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gradient-to-l from-slate-50 to-slate-100/50 border-b border-slate-200">
                            <tr>
                                <th className="px-4 py-3.5 text-right text-xs font-bold text-slate-600 uppercase tracking-wide">المدرسة</th>
                                <th className="px-4 py-3.5 text-right text-xs font-bold text-slate-600 uppercase tracking-wide">النوع</th>
                                <th className="px-4 py-3.5 text-right text-xs font-bold text-slate-600 uppercase tracking-wide">الموظفين</th>
                                <th className="px-4 py-3.5 text-right text-xs font-bold text-slate-600 uppercase tracking-wide">المتدربين</th>
                                <th className="px-4 py-3.5 text-right text-xs font-bold text-slate-600 uppercase tracking-wide">الحالة</th>
                                <th className="px-4 py-3.5 text-right text-xs font-bold text-slate-600 uppercase tracking-wide">الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {schools.data.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-4 py-12 text-center text-slate-500">
                                        <School className="h-12 w-12 mx-auto text-slate-300 mb-3" />
                                        <p className="font-medium">لا توجد مدارس</p>
                                    </td>
                                </tr>
                            ) : (
                                schools.data.map((school) => (
                                    <tr key={school.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-4 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center shadow-sm">
                                                    <School className="h-5 w-5 text-indigo-600" />
                                                </div>
                                                <span className="font-semibold text-slate-800">{school.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <Badge variant={school.type === 'male' ? 'info' : school.type === 'female' ? 'danger' : 'default'}>
                                                {typeLabels[school.type]}
                                            </Badge>
                                        </td>
                                        <td className="px-4 py-4">
                                            <span className="inline-flex items-center justify-center gap-1 px-2.5 py-1 bg-slate-100 rounded-lg text-sm">
                                                <Users className="h-4 w-4 text-slate-500" />
                                                <span className="font-semibold text-slate-700">{school.employees_count}</span>
                                            </span>
                                        </td>
                                        <td className="px-4 py-4">
                                            <span className="inline-flex items-center justify-center gap-1 px-2.5 py-1 bg-teal-50 rounded-lg text-sm">
                                                <GraduationCap className="h-4 w-4 text-teal-600" />
                                                <span className="font-semibold text-teal-700">{school.trainees_count}</span>
                                            </span>
                                        </td>
                                        <td className="px-4 py-4">
                                            <Badge variant={school.is_active ? 'success' : 'danger'}>
                                                {school.is_active ? 'نشطة' : 'غير نشطة'}
                                            </Badge>
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="flex items-center gap-1">
                                                <button
                                                    onClick={() => {
                                                        setEditing(school);
                                                        setShowForm(true);
                                                    }}
                                                    className="p-2 rounded-lg hover:bg-teal-100 text-teal-600 transition-colors"
                                                >
                                                    <Edit2 className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => setDeleting(school)}
                                                    className="p-2 rounded-lg hover:bg-red-100 text-red-600 transition-colors"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            <FormModal
                open={showForm}
                onClose={() => {
                    setShowForm(false);
                    setEditing(null);
                }}
                title={editing ? 'تعديل المدرسة' : 'إضافة مدرسة جديدة'}
                initialData={initialData}
                action={editing ? route('schools.update', editing.id) : route('schools.store')}
                method={editing ? 'put' : 'post'}
                size="lg"
            >
                {(form) => (
                    <>
                        <div className="grid grid-cols-2 gap-4">
                            <Input
                                label="اسم المدرسة"
                                value={form.data.name}
                                onChange={(e) => form.setData('name', e.target.value)}
                                error={form.errors.name}
                                required
                            />
                            <Input
                                label="رمز المدرسة"
                                value={form.data.code}
                                onChange={(e) => form.setData('code', e.target.value)}
                                error={form.errors.code}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <Select
                                label="النوع"
                                value={form.data.type}
                                onChange={(e) => form.setData('type', e.target.value)}
                                error={form.errors.type}
                                required
                            >
                                {typeOptions.map((t) => (
                                    <option key={t.value} value={t.value}>{t.label}</option>
                                ))}
                            </Select>
                            <Input
                                label="المنطقة"
                                value={form.data.district}
                                onChange={(e) => form.setData('district', e.target.value)}
                                error={form.errors.district}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <Input
                                label="رقم الهاتف"
                                value={form.data.phone}
                                onChange={(e) => form.setData('phone', e.target.value)}
                                error={form.errors.phone}
                            />
                            <Input
                                label="البريد الإلكتروني"
                                type="email"
                                value={form.data.email}
                                onChange={(e) => form.setData('email', e.target.value)}
                                error={form.errors.email}
                            />
                        </div>
                        <Textarea
                            label="العنوان"
                            value={form.data.address}
                            onChange={(e) => form.setData('address', e.target.value)}
                            error={form.errors.address}
                            rows={2}
                        />
                        <label className="flex items-center gap-2 cursor-pointer group">
                            <input
                                type="checkbox"
                                checked={form.data.is_active}
                                onChange={(e) => form.setData('is_active', e.target.checked)}
                                className="w-4 h-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                            />
                            <span className="text-sm text-slate-700 group-hover:text-slate-900">مدرسة نشطة</span>
                        </label>
                    </>
                )}
            </FormModal>

            {/* Bulk Add Modal */}
            {showBulkForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <button type="button" className="fixed inset-0 bg-black/50 cursor-default" onClick={() => setShowBulkForm(false)} aria-label="إغلاق" />
                    <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 p-6">
                        <h3 className="text-lg font-bold text-slate-800 mb-4">إضافة مدارس جماعية</h3>
                        <form onSubmit={handleBulkSubmit}>
                            <div className="space-y-4">
                                <Select
                                    label="النوع"
                                    value={bulkForm.data.type}
                                    onChange={(e) => bulkForm.setData('type', e.target.value)}
                                    error={bulkForm.errors.type}
                                    required
                                >
                                    {typeOptions.map((t) => (
                                        <option key={t.value} value={t.value}>{t.label}</option>
                                    ))}
                                </Select>
                                <Textarea
                                    label="أسماء المدارس (كل مدرسة في سطر)"
                                    value={bulkForm.data.names}
                                    onChange={(e) => bulkForm.setData('names', e.target.value)}
                                    error={bulkForm.errors.names}
                                    rows={10}
                                    placeholder="اكتب اسم كل مدرسة في سطر جديد"
                                    required
                                />
                            </div>
                            <div className="flex items-center justify-end gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setShowBulkForm(false)}
                                    className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
                                >
                                    إلغاء
                                </button>
                                <Button type="submit" disabled={bulkForm.processing}>
                                    {bulkForm.processing ? 'جاري الإضافة...' : 'إضافة الكل'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <DeleteModal
                open={!!deleting}
                onClose={() => setDeleting(null)}
                action={deleting ? route('schools.destroy', deleting.id) : ''}
                message={`هل أنت متأكد من حذف المدرسة "${deleting?.name}"؟`}
            />
        </AuthenticatedLayout>
    );
}
