import AuthenticatedLayout from '@/Components/Layout/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { Plus, Edit2, Trash2, Eye, BookOpen, Search, Target, Clock, X, Archive, RotateCcw } from 'lucide-react';
import Card from '@/Components/UI/Card';
import Button from '@/Components/UI/Button';
import Badge from '@/Components/UI/Badge';
import PageHeader from '@/Components/UI/PageHeader';
import FormModal from '@/Components/UI/FormModal';
import DeleteModal from '@/Components/UI/DeleteModal';
import Input from '@/Components/UI/Input';
import Select from '@/Components/UI/Select';
import SearchableSelect from '@/Components/UI/SearchableSelect';
import Textarea from '@/Components/UI/Textarea';

interface Program {
    id: number;
    name: string;
    description: string | null;
    type: string;
    status: string;
    hours: number;
    target_audience: string | null;
    target_count: number;
    male_count: number;
    female_count: number;
    is_approved: boolean;
    is_archived: boolean;
    packages_count: number;
    supervisor: { id: number; name: string } | null;
    academic_year: { id: number; name: string };
}

interface DropdownOption {
    id: number;
    value: string;
    label: string;
}

interface Props {
    programs: { data: Program[]; current_page: number; last_page: number };
    academicYears: Array<{ id: number; name: string }>;
    supervisors: Array<{ id: number; name: string }>;
    currentYear: { id: number; name: string } | null;
    programTypes: DropdownOption[];
    filters: { search?: string; year_id?: string; type?: string; archived?: string };
}

const statusOptions = [
    { value: 'new', label: 'جديد' },
    { value: 'existing', label: 'قائم' },
];

const statusLabels: Record<string, { label: string; variant: 'success' | 'info' | 'default' | 'primary' }> = {
    new: { label: 'جديد', variant: 'info' },
    existing: { label: 'قائم', variant: 'default' },
};

export default function Index({ programs, academicYears, supervisors, currentYear, programTypes, filters }: Props) {
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState<Program | null>(null);
    const [deleting, setDeleting] = useState<Program | null>(null);
    const [search, setSearch] = useState(filters.search || '');
    const [yearFilter, setYearFilter] = useState(filters.year_id || '');
    const [typeFilter, setTypeFilter] = useState(filters.type || '');
    const isArchived = filters.archived === '1';

    const typeLabels: Record<string, string> = {};
    programTypes.forEach(t => { typeLabels[t.value] = t.label; });

    const initialData = editing
        ? {
              name: editing.name,
              description: editing.description || '',
              type: editing.type,
              status: editing.status,
              hours: editing.hours || 0,
              target_audience: editing.target_audience || '',
              male_count: editing.male_count,
              female_count: editing.female_count,
              supervisor_id: editing.supervisor?.id || '',
              content_preparer_id: '',
          }
        : {
              name: '',
              description: '',
              type: programTypes[0]?.value || '',
              status: 'new',
              hours: 0,
              target_audience: '',
              male_count: 0,
              female_count: 0,
              supervisor_id: '',
              content_preparer_id: '',
          };

    const supervisorOptions = supervisors.map(s => ({
        value: s.id,
        label: s.name,
    }));

    const doSearch = (s: string, y: string, t: string, archived?: boolean) => {
        router.get(route('programs.index'), {
            search: s || undefined,
            year_id: y || undefined,
            type: t || undefined,
            archived: (archived ?? isArchived) ? '1' : undefined,
        }, { preserveState: true, preserveScroll: true });
    };

    const switchTab = (archived: boolean) => {
        setSearch('');
        setYearFilter('');
        setTypeFilter('');
        router.get(route('programs.index'), {
            archived: archived ? '1' : undefined,
        }, { preserveState: true, preserveScroll: true });
    };

    const [searchTimer, setSearchTimer] = useState<ReturnType<typeof setTimeout> | null>(null);
    const handleSearchChange = (val: string) => {
        setSearch(val);
        if (searchTimer) clearTimeout(searchTimer);
        setSearchTimer(setTimeout(() => doSearch(val, yearFilter, typeFilter), 400));
    };

    const handleYearChange = (val: string) => {
        setYearFilter(val);
        doSearch(search, val, typeFilter);
    };

    const clearYear = () => {
        setYearFilter('');
        doSearch(search, '', typeFilter);
    };

    const handleTypeChange = (val: string) => {
        setTypeFilter(val);
        doSearch(search, yearFilter, val);
    };

    const clearType = () => {
        setTypeFilter('');
        doSearch(search, yearFilter, '');
    };

    return (
        <AuthenticatedLayout>
            <Head title="البرامج التدريبية" />

            <PageHeader
                title="البرامج التدريبية"
                description={currentYear ? `العام الدراسي: ${currentYear.name}` : undefined}
                action={
                    <Button icon={<Plus className="h-4 w-4" />} onClick={() => setShowForm(true)}>
                        إضافة برنامج
                    </Button>
                }
            />

            <div className="flex gap-1 mb-4 bg-white rounded-xl p-1 border border-slate-200 w-fit">
                <button
                    onClick={() => switchTab(false)}
                    className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${!isArchived ? 'bg-teal-500 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'}`}
                >
                    البرامج النشطة
                </button>
                <button
                    onClick={() => switchTab(true)}
                    className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${isArchived ? 'bg-teal-500 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'}`}
                >
                    <Archive className="h-4 w-4" />
                    الأرشيف
                </button>
            </div>

            <Card className="mb-6">
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => handleSearchChange(e.target.value)}
                            placeholder="بحث في البرامج..."
                            className="w-full pr-10 pl-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all"
                        />
                    </div>
                    <div className="relative">
                        <select
                            value={yearFilter}
                            onChange={(e) => handleYearChange(e.target.value)}
                            className="px-4 py-2.5 pl-10 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all appearance-none"
                        >
                            <option value="">كل الأعوام</option>
                            {academicYears.map((y) => (
                                <option key={y.id} value={y.id}>{y.name}</option>
                            ))}
                        </select>
                        {yearFilter && (
                            <button
                                type="button"
                                onClick={clearYear}
                                className="absolute left-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition-colors"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        )}
                    </div>
                    <div className="relative">
                        <select
                            value={typeFilter}
                            onChange={(e) => handleTypeChange(e.target.value)}
                            className="px-4 py-2.5 pl-10 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all appearance-none"
                        >
                            <option value="">كل الأنواع</option>
                            {programTypes.map((t) => (
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
                                <th className="px-4 py-3.5 text-right text-xs font-bold text-slate-600 uppercase tracking-wide">البرنامج</th>
                                <th className="px-4 py-3.5 text-right text-xs font-bold text-slate-600 uppercase tracking-wide">نوع البرنامج</th>
                                <th className="px-4 py-3.5 text-right text-xs font-bold text-slate-600 uppercase tracking-wide">الساعات</th>
                                <th className="px-4 py-3.5 text-right text-xs font-bold text-slate-600 uppercase tracking-wide">الحالة</th>
                                <th className="px-4 py-3.5 text-right text-xs font-bold text-slate-600 uppercase tracking-wide">المستهدفين</th>
                                <th className="px-4 py-3.5 text-right text-xs font-bold text-slate-600 uppercase tracking-wide">الحقائب</th>
                                <th className="px-4 py-3.5 text-right text-xs font-bold text-slate-600 uppercase tracking-wide">المشرف</th>
                                <th className="px-4 py-3.5 text-right text-xs font-bold text-slate-600 uppercase tracking-wide">الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {programs.data.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="px-4 py-12 text-center text-slate-500">
                                        <BookOpen className="h-12 w-12 mx-auto text-slate-300 mb-3" />
                                        <p className="font-medium">لا توجد برامج تدريبية</p>
                                        <p className="text-sm text-slate-400 mt-1">ابدأ بإضافة برنامج جديد</p>
                                    </td>
                                </tr>
                            ) : (
                                programs.data.map((program) => (
                                    <tr key={program.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-4 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-sm">
                                                    <BookOpen className="h-5 w-5 text-white" />
                                                </div>
                                                <div>
                                                    <Link
                                                        href={route('programs.show', program.id)}
                                                        className="font-semibold text-slate-800 hover:text-teal-600 transition-colors"
                                                    >
                                                        {program.name}
                                                    </Link>
                                                    {program.target_audience && (
                                                        <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                                                            <Target className="h-3 w-3" />
                                                            {program.target_audience}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <Badge variant="primary">{typeLabels[program.type] || program.type}</Badge>
                                        </td>
                                        <td className="px-4 py-4">
                                            <span className="flex items-center gap-1 text-sm text-slate-600">
                                                <Clock className="h-4 w-4 text-slate-400" />
                                                <span className="font-semibold">{program.hours || 0}</span> ساعة
                                            </span>
                                        </td>
                                        <td className="px-4 py-4">
                                            <Badge variant={statusLabels[program.status]?.variant || 'default'}>
                                                {statusLabels[program.status]?.label || program.status}
                                            </Badge>
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="flex items-center gap-2">
                                                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 text-slate-700 font-semibold text-sm">
                                                    {program.target_count}
                                                </span>
                                                <div className="text-xs text-slate-500">
                                                    <span className="text-sky-600">{program.male_count} ذ</span>
                                                    <span className="mx-1">|</span>
                                                    <span className="text-pink-600">{program.female_count} أ</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-teal-100 text-teal-700 font-semibold text-sm">
                                                {program.packages_count}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4">
                                            {program.supervisor ? (
                                                <Badge variant="info">{program.supervisor.name}</Badge>
                                            ) : (
                                                <span className="text-slate-400">-</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="flex items-center gap-1">
                                                <Link
                                                    href={route('programs.show', program.id)}
                                                    className="p-2 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Link>
                                                <button
                                                    onClick={() => {
                                                        setEditing(program);
                                                        setShowForm(true);
                                                    }}
                                                    className="p-2 rounded-lg hover:bg-teal-100 text-teal-600 transition-colors"
                                                >
                                                    <Edit2 className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => router.post(route('programs.toggle-archive', program.id), {}, { preserveState: true })}
                                                    className={`p-2 rounded-lg transition-colors ${program.is_archived ? 'hover:bg-emerald-100 text-emerald-600' : 'hover:bg-amber-100 text-amber-600'}`}
                                                    title={program.is_archived ? 'استعادة' : 'أرشفة'}
                                                >
                                                    {program.is_archived ? <RotateCcw className="h-4 w-4" /> : <Archive className="h-4 w-4" />}
                                                </button>
                                                <button
                                                    onClick={() => setDeleting(program)}
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
                title={editing ? 'تعديل البرنامج' : 'إضافة برنامج جديد'}
                initialData={initialData}
                action={editing ? route('programs.update', editing.id) : route('programs.store')}
                method={editing ? 'put' : 'post'}
                size="lg"
            >
                {(form) => (
                    <>
                        <Input
                            label="اسم البرنامج"
                            value={form.data.name}
                            onChange={(e) => form.setData('name', e.target.value)}
                            error={form.errors.name}
                            required
                        />
                        <Textarea
                            label="الوصف"
                            value={form.data.description}
                            onChange={(e) => form.setData('description', e.target.value)}
                            error={form.errors.description}
                            rows={3}
                        />
                        <div className="grid grid-cols-3 gap-4">
                            <Select
                                label="نوع البرنامج"
                                value={form.data.type}
                                onChange={(e) => form.setData('type', e.target.value)}
                                error={form.errors.type}
                                required
                            >
                                {programTypes.map((t) => (
                                    <option key={t.value} value={t.value}>{t.label}</option>
                                ))}
                            </Select>
                            <Select
                                label="الحالة"
                                value={form.data.status}
                                onChange={(e) => form.setData('status', e.target.value)}
                                error={form.errors.status}
                                required
                            >
                                {statusOptions.map((s) => (
                                    <option key={s.value} value={s.value}>{s.label}</option>
                                ))}
                            </Select>
                            <Input
                                label="عدد الساعات التدريبية"
                                type="number"
                                min={0}
                                value={form.data.hours}
                                onChange={(e) => form.setData('hours', parseInt(e.target.value) || 0)}
                                error={form.errors.hours}
                            />
                        </div>
                        <Input
                            label="الفئة المستهدفة"
                            value={form.data.target_audience}
                            onChange={(e) => form.setData('target_audience', e.target.value)}
                            error={form.errors.target_audience}
                            placeholder="مثال: المعلمين، المدراء"
                        />
                        <div className="grid grid-cols-3 gap-4">
                            <Input
                                label="عدد الذكور"
                                type="number"
                                min={0}
                                value={form.data.male_count}
                                onChange={(e) => form.setData('male_count', parseInt(e.target.value) || 0)}
                                error={form.errors.male_count}
                            />
                            <Input
                                label="عدد الإناث"
                                type="number"
                                min={0}
                                value={form.data.female_count}
                                onChange={(e) => form.setData('female_count', parseInt(e.target.value) || 0)}
                                error={form.errors.female_count}
                            />
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1.5">العدد المستهدف</label>
                                <div className="px-4 py-2.5 border border-slate-200 rounded-xl bg-slate-50 text-sm font-bold text-teal-700">
                                    {(form.data.male_count || 0) + (form.data.female_count || 0)}
                                </div>
                            </div>
                        </div>
                        <SearchableSelect
                            label="المشرف"
                            value={form.data.supervisor_id}
                            onChange={(val) => form.setData('supervisor_id', val)}
                            options={supervisorOptions}
                            placeholder="اختر المشرف (اختياري)"
                            searchPlaceholder="بحث في المشرفين..."
                            error={form.errors.supervisor_id}
                        />
                    </>
                )}
            </FormModal>

            <DeleteModal
                open={!!deleting}
                onClose={() => setDeleting(null)}
                action={deleting ? route('programs.destroy', deleting.id) : ''}
                message={`هل أنت متأكد من حذف البرنامج "${deleting?.name}"؟`}
            />
        </AuthenticatedLayout>
    );
}
