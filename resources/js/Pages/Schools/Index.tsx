import AuthenticatedLayout from '@/Components/Layout/AuthenticatedLayout';
import { Head, router, useForm } from '@inertiajs/react';
import { useState, useRef } from 'react';
import { Plus, Edit2, Trash2, School, Search, Users, GraduationCap, X, Download, Upload, FileSpreadsheet } from 'lucide-react';
import Card from '@/Components/UI/Card';
import Button from '@/Components/UI/Button';
import Badge from '@/Components/UI/Badge';
import PageHeader from '@/Components/UI/PageHeader';
import FormModal from '@/Components/UI/FormModal';
import DeleteModal from '@/Components/UI/DeleteModal';
import Modal from '@/Components/UI/Modal';
import Input from '@/Components/UI/Input';
import Select from '@/Components/UI/Select';

interface SchoolType {
    id: number;
    name: string;
    code: string | null;
    type: string;
    education_level: string | null;
    district: string | null;
    principal_name: string | null;
    phone: string | null;
    landline: string | null;
    email: string | null;
    is_active: boolean;
    employees_count: number;
    trainees_count: number;
}

interface Props {
    schools: { data: SchoolType[]; current_page: number; last_page: number; links: Array<{ url: string | null; label: string; active: boolean }> };
    filters: { search?: string; type?: string; education_level?: string };
    currentYear: string | null;
    educationLevels: string[];
}

const typeOptions = [
    { value: 'male', label: 'بنين' },
    { value: 'female', label: 'بنات' },
];

const typeLabels: Record<string, string> = {
    male: 'بنين',
    female: 'بنات',
};

export default function Index({ schools, filters, currentYear, educationLevels }: Props) {
    const [showForm, setShowForm] = useState(false);
    const [showImport, setShowImport] = useState(false);
    const [editing, setEditing] = useState<SchoolType | null>(null);
    const [deleting, setDeleting] = useState<SchoolType | null>(null);
    const [search, setSearch] = useState(filters.search || '');
    const [typeFilter, setTypeFilter] = useState(filters.type || '');
    const [educationFilter, setEducationFilter] = useState(filters.education_level || '');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const importForm = useForm<{ file: File | null; mode: string }>({ file: null, mode: 'skip' });

    const initialData = editing
        ? {
              name: editing.name,
              education_level: editing.education_level || '',
              type: editing.type,
              district: editing.district || '',
              principal_name: editing.principal_name || '',
              phone: editing.phone || '',
              landline: editing.landline || '',
              email: editing.email || '',
              is_active: editing.is_active,
          }
        : { name: '', education_level: '', type: 'male', district: '', principal_name: '', phone: '', landline: '', email: '', is_active: true };

    const doSearch = (s: string, t: string, el: string) => {
        router.get(route('schools.index'), { search: s || undefined, type: t || undefined, education_level: el || undefined }, { preserveState: true, preserveScroll: true });
    };

    const [searchTimer, setSearchTimer] = useState<ReturnType<typeof setTimeout> | null>(null);
    const handleSearchChange = (val: string) => {
        setSearch(val);
        if (searchTimer) clearTimeout(searchTimer);
        setSearchTimer(setTimeout(() => doSearch(val, typeFilter, educationFilter), 400));
    };

    const handleTypeChange = (val: string) => {
        setTypeFilter(val);
        doSearch(search, val, educationFilter);
    };

    const clearType = () => {
        setTypeFilter('');
        doSearch(search, '', educationFilter);
    };

    const handleEducationChange = (val: string) => {
        setEducationFilter(val);
        doSearch(search, typeFilter, val);
    };

    const clearEducation = () => {
        setEducationFilter('');
        doSearch(search, typeFilter, '');
    };

    const handleImportSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!importForm.data.file) return;

        importForm.post(route('import.schools'), {
            forceFormData: true,
            onSuccess: () => {
                setShowImport(false);
                importForm.reset();
                if (fileInputRef.current) fileInputRef.current.value = '';
            },
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title="المدارس" />

            <PageHeader
                title="المدارس"
                description={currentYear ? `العام الدراسي: ${currentYear}` : 'إدارة قائمة المدارس'}
                action={
                    <div className="flex items-center gap-2">
                        <a href={route('export.schools-template')} className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-purple-700 bg-purple-50 border border-purple-200 rounded-xl hover:bg-purple-100 transition-colors">
                            <FileSpreadsheet className="h-4 w-4" />
                            تحميل القالب
                        </a>
                        <Button variant="secondary" icon={<Upload className="h-4 w-4" />} onClick={() => setShowImport(true)}>
                            استيراد
                        </Button>
                        <a href={route('export.schools')} className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl hover:bg-emerald-100 transition-colors">
                            <Download className="h-4 w-4" />
                            تصدير
                        </a>
                        <Button icon={<Plus className="h-4 w-4" />} onClick={() => setShowForm(true)}>
                            إضافة مدرسة
                        </Button>
                    </div>
                }
            />

            <Card className="mb-6">
                <div className="flex flex-col sm:flex-row gap-4 items-center">
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
                            <option value="">كل الفئات</option>
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
                    {educationLevels.length > 0 && (
                        <div className="relative">
                            <select
                                value={educationFilter}
                                onChange={(e) => handleEducationChange(e.target.value)}
                                className="px-4 py-2.5 pl-10 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all appearance-none"
                            >
                                <option value="">كل المراحل</option>
                                {educationLevels.map((el) => (
                                    <option key={el} value={el}>{el}</option>
                                ))}
                            </select>
                            {educationFilter && (
                                <button
                                    type="button"
                                    onClick={clearEducation}
                                    className="absolute left-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition-colors"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            )}
                        </div>
                    )}
                    <Badge variant="default">{schools.data.length} مدرسة</Badge>
                </div>
            </Card>

            <Card padding="none">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gradient-to-l from-slate-50 to-slate-100/50 border-b border-slate-200">
                            <tr>
                                <th className="px-4 py-3.5 text-right text-xs font-bold text-slate-600 uppercase tracking-wide">المدرسة</th>
                                <th className="px-4 py-3.5 text-right text-xs font-bold text-slate-600 uppercase tracking-wide">المرحلة</th>
                                <th className="px-4 py-3.5 text-right text-xs font-bold text-slate-600 uppercase tracking-wide">الفئة</th>
                                <th className="px-4 py-3.5 text-right text-xs font-bold text-slate-600 uppercase tracking-wide">المدير</th>
                                <th className="px-4 py-3.5 text-right text-xs font-bold text-slate-600 uppercase tracking-wide">الجوال</th>
                                <th className="px-4 py-3.5 text-right text-xs font-bold text-slate-600 uppercase tracking-wide">الهاتف</th>
                                <th className="px-4 py-3.5 text-right text-xs font-bold text-slate-600 uppercase tracking-wide">الموظفين</th>
                                <th className="px-4 py-3.5 text-right text-xs font-bold text-slate-600 uppercase tracking-wide">المتدربين</th>
                                <th className="px-4 py-3.5 text-right text-xs font-bold text-slate-600 uppercase tracking-wide">الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {schools.data.length === 0 ? (
                                <tr>
                                    <td colSpan={9} className="px-4 py-12 text-center text-slate-500">
                                        <School className="h-12 w-12 mx-auto text-slate-300 mb-3" />
                                        <p className="font-medium">لا توجد مدارس</p>
                                    </td>
                                </tr>
                            ) : (
                                schools.data.map((school) => (
                                    <tr key={school.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center flex-shrink-0">
                                                    <School className="h-4 w-4 text-indigo-600" />
                                                </div>
                                                <span className="font-semibold text-slate-800 text-sm">{school.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-slate-600">{school.education_level || '-'}</td>
                                        <td className="px-4 py-3">
                                            <Badge variant={school.type === 'male' ? 'info' : 'danger'}>
                                                {typeLabels[school.type] || school.type}
                                            </Badge>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-slate-600">{school.principal_name || '-'}</td>
                                        <td className="px-4 py-3 text-sm text-slate-600 font-mono" dir="ltr">{school.phone || '-'}</td>
                                        <td className="px-4 py-3 text-sm text-slate-600 font-mono" dir="ltr">{school.landline || '-'}</td>
                                        <td className="px-4 py-3">
                                            <span className="inline-flex items-center justify-center gap-1 px-2 py-0.5 bg-slate-100 rounded-lg text-xs">
                                                <Users className="h-3.5 w-3.5 text-slate-500" />
                                                <span className="font-semibold text-slate-700">{school.employees_count}</span>
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="inline-flex items-center justify-center gap-1 px-2 py-0.5 bg-teal-50 rounded-lg text-xs">
                                                <GraduationCap className="h-3.5 w-3.5 text-teal-600" />
                                                <span className="font-semibold text-teal-700">{school.trainees_count}</span>
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
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

            {schools.links && schools.links.length > 3 && (
                <div className="mt-6 flex justify-center">
                    <nav className="flex items-center gap-1">
                        {schools.links.map((link, i) => (
                            <button
                                key={i}
                                disabled={!link.url}
                                onClick={() => link.url && router.get(link.url, {}, { preserveState: true, preserveScroll: true })}
                                className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                                    link.active
                                        ? 'bg-teal-600 text-white'
                                        : link.url
                                            ? 'text-slate-600 hover:bg-slate-100'
                                            : 'text-slate-300 cursor-not-allowed'
                                }`}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </nav>
                </div>
            )}

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
                                label="المرحلة الدراسية"
                                value={form.data.education_level}
                                onChange={(e) => form.setData('education_level', e.target.value)}
                                error={form.errors.education_level}
                                placeholder="مثال: إعدادي، ثانوي"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <Select
                                label="فئة المدرسة"
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
                                label="المنطقة الجغرافية"
                                value={form.data.district}
                                onChange={(e) => form.setData('district', e.target.value)}
                                error={form.errors.district}
                            />
                        </div>
                        <Input
                            label="اسم مدير المدرسة"
                            value={form.data.principal_name}
                            onChange={(e) => form.setData('principal_name', e.target.value)}
                            error={form.errors.principal_name}
                        />
                        <div className="grid grid-cols-2 gap-4">
                            <Input
                                label="رقم الجوال"
                                value={form.data.phone}
                                onChange={(e) => form.setData('phone', e.target.value)}
                                error={form.errors.phone}
                                placeholder="مثال: 55512345"
                            />
                            <Input
                                label="رقم الهاتف"
                                value={form.data.landline}
                                onChange={(e) => form.setData('landline', e.target.value)}
                                error={form.errors.landline}
                                placeholder="مثال: 40123248 - 40123249"
                            />
                        </div>
                        <Input
                            label="البريد الإلكتروني"
                            type="email"
                            value={form.data.email}
                            onChange={(e) => form.setData('email', e.target.value)}
                            error={form.errors.email}
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

            {/* Import Modal */}
            <Modal
                open={showImport}
                onClose={() => {
                    setShowImport(false);
                    importForm.reset();
                    if (fileInputRef.current) fileInputRef.current.value = '';
                }}
                title="استيراد المدارس من Excel"
            >
                <form onSubmit={handleImportSubmit} className="space-y-6">
                    <div className="p-4 bg-orange-50 rounded-xl border border-orange-100">
                        <h4 className="font-semibold text-orange-800 mb-2 flex items-center gap-2">
                            <FileSpreadsheet className="h-5 w-5" />
                            خطوات الاستيراد
                        </h4>
                        <ol className="text-sm text-orange-700 space-y-1 list-decimal mr-5">
                            <li>قم بتحميل <a href={route('export.schools-template')} className="underline font-medium hover:text-orange-900">قالب Excel</a> أولاً</li>
                            <li>املأ البيانات في القالب (لا تغير صف العناوين)</li>
                            <li>احفظ الملف بصيغة xlsx</li>
                            <li>ارفع الملف هنا</li>
                        </ol>
                        {currentYear && (
                            <p className="mt-2 text-xs text-orange-600 font-medium">سيتم ربط المدارس بالعام الدراسي الحالي: {currentYear}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">عند وجود بيانات مكررة</label>
                        <div className="grid grid-cols-2 gap-3">
                            <label
                                className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                                    importForm.data.mode === 'skip'
                                        ? 'border-teal-500 bg-teal-50'
                                        : 'border-slate-200 hover:border-slate-300'
                                }`}
                            >
                                <input
                                    type="radio"
                                    name="mode"
                                    value="skip"
                                    checked={importForm.data.mode === 'skip'}
                                    onChange={() => importForm.setData('mode', 'skip')}
                                    className="text-teal-600 focus:ring-teal-500"
                                />
                                <div>
                                    <p className="text-sm font-semibold text-slate-800">تخطي الموجودة</p>
                                    <p className="text-xs text-slate-500">إضافة الجديدة فقط وتجاهل المكرر</p>
                                </div>
                            </label>
                            <label
                                className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                                    importForm.data.mode === 'update'
                                        ? 'border-amber-500 bg-amber-50'
                                        : 'border-slate-200 hover:border-slate-300'
                                }`}
                            >
                                <input
                                    type="radio"
                                    name="mode"
                                    value="update"
                                    checked={importForm.data.mode === 'update'}
                                    onChange={() => importForm.setData('mode', 'update')}
                                    className="text-amber-600 focus:ring-amber-500"
                                />
                                <div>
                                    <p className="text-sm font-semibold text-slate-800">تحديث الموجودة</p>
                                    <p className="text-xs text-slate-500">استبدال البيانات القديمة بالجديدة</p>
                                </div>
                            </label>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">اختر ملف Excel</label>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".xlsx,.xls,.csv"
                            onChange={(e) => {
                                const file = e.target.files?.[0] || null;
                                importForm.setData('file', file);
                            }}
                            className="w-full text-sm text-slate-600 file:ml-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 border border-slate-200 rounded-xl cursor-pointer"
                        />
                        {importForm.errors.file && (
                            <p className="mt-1 text-sm text-red-600">{importForm.errors.file}</p>
                        )}
                    </div>

                    <div className="flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={() => {
                                setShowImport(false);
                                importForm.reset();
                            }}
                            className="px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
                        >
                            إلغاء
                        </button>
                        <button
                            type="submit"
                            disabled={!importForm.data.file || importForm.processing}
                            className="px-6 py-2 text-sm font-medium bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                        >
                            {importForm.processing ? (
                                <>
                                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                    </svg>
                                    جاري الاستيراد...
                                </>
                            ) : (
                                <>
                                    <Upload className="h-4 w-4" />
                                    استيراد
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </Modal>

            <DeleteModal
                open={!!deleting}
                onClose={() => setDeleting(null)}
                action={deleting ? route('schools.destroy', deleting.id) : ''}
                message={`هل أنت متأكد من حذف المدرسة "${deleting?.name}"؟`}
            />
        </AuthenticatedLayout>
    );
}
