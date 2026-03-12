import AuthenticatedLayout from '@/Components/Layout/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { Plus, Edit2, Trash2, Eye, Search, Layers, X, Download } from 'lucide-react';
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

interface Group {
    id: number;
    name: string;
    gender: string;
    capacity: number;
    start_date: string | null;
    end_date: string | null;
    status: string;
    notes: string | null;
    trainees_count: number;
    package: { id: number; name: string; program: { id: number; name: string } };
    trainer: { id: number; name: string } | null;
    training_hall: { id: number; name: string; capacity?: number } | null;
    semester: { id: number; name: string } | null;
}

interface DropdownOption {
    id: number;
    value: string;
    label: string;
    is_active: boolean;
}

interface Props {
    groups: {
        data: Group[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        links: Array<{ url: string | null; label: string; active: boolean }>;
    };
    packages: Array<{ id: number; name: string; program: { id: number; name: string } }>;
    trainers: Array<{ id: number; name: string }>;
    halls: Array<{ id: number; name: string; capacity: number; gender_priority: string | null }>;
    bookedHallIds: number[];
    statuses: DropdownOption[];
    filters: { search?: string; package_id?: string; status?: string };
}

const genderOptions = [
    { value: 'male', label: 'ذكور' },
    { value: 'female', label: 'إناث' },
    { value: 'mixed', label: 'مختلط' },
];

const genderLabels: Record<string, string> = {
    male: 'ذكور',
    female: 'إناث',
    mixed: 'مختلط',
};

const genderPriorityLabels: Record<string, string> = {
    male: 'ذكور',
    female: 'إناث',
    all: 'مشتركة',
};

export default function Index({ groups, packages, trainers, halls, bookedHallIds, statuses, filters }: Props) {
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState<Group | null>(null);
    const [deleting, setDeleting] = useState<Group | null>(null);
    const [search, setSearch] = useState(filters.search || '');
    const [packageFilter, setPackageFilter] = useState(filters.package_id || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || '');
    const [selectedGender, setSelectedGender] = useState('male');

    // Build status labels from dropdown options
    const statusLabels: Record<string, string> = {};
    statuses.forEach(s => { statusLabels[s.value] = s.label; });

    // Map status values to badge variants
    const statusVariants: Record<string, 'success' | 'warning' | 'danger' | 'info' | 'default' | 'primary'> = {
        scheduled: 'info',
        in_progress: 'warning',
        completed: 'success',
        cancelled: 'danger',
        postponed: 'default',
    };

    const initialData = editing
        ? {
              package_id: editing.package.id,
              trainer_id: editing.trainer?.id || '',
              training_hall_id: editing.training_hall?.id || '',
              name: editing.name,
              gender: editing.gender,
              status: editing.status,
              notes: editing.notes || '',
          }
        : {
              package_id: '',
              trainer_id: '',
              training_hall_id: '',
              name: '',
              gender: 'male',
              status: 'scheduled',
              notes: '',
          };

    const packageOptions = packages.map(p => ({
        value: p.id,
        label: p.name,
        subLabel: p.program.name,
    }));

    const trainerOptions = trainers.map(t => ({
        value: t.id,
        label: t.name,
    }));

    // Filter halls: match gender and exclude booked halls (allow current hall when editing)
    const getFilteredHallOptions = (gender: string) => {
        return halls
            .filter(h => {
                // Exclude booked halls (but keep the hall assigned to the editing group)
                const isBooked = bookedHallIds.includes(h.id);
                const isCurrentHall = editing && editing.training_hall?.id === h.id;
                if (isBooked && !isCurrentHall) return false;

                // Filter by gender
                if (!h.gender_priority || h.gender_priority === 'all') return true;
                if (gender === 'mixed') return true;
                return h.gender_priority === gender;
            })
            .map(h => ({
                value: h.id,
                label: h.name,
                subLabel: `السعة: ${h.capacity}${h.gender_priority ? ` - ${genderPriorityLabels[h.gender_priority] || h.gender_priority}` : ''}`,
            }));
    };

    const doSearch = (s: string, p: string, st: string) => {
        router.get(route('groups.index'), {
            search: s || undefined,
            package_id: p || undefined,
            status: st || undefined
        }, { preserveState: true, preserveScroll: true });
    };

    const [searchTimer, setSearchTimer] = useState<ReturnType<typeof setTimeout> | null>(null);
    const handleSearchChange = (val: string) => {
        setSearch(val);
        if (searchTimer) clearTimeout(searchTimer);
        setSearchTimer(setTimeout(() => doSearch(val, packageFilter, statusFilter), 400));
    };

    const handlePackageChange = (val: string) => {
        setPackageFilter(val);
        doSearch(search, val, statusFilter);
    };

    const clearPackage = () => {
        setPackageFilter('');
        doSearch(search, '', statusFilter);
    };

    const handleStatusChange = (val: string) => {
        setStatusFilter(val);
        doSearch(search, packageFilter, val);
    };

    const clearStatus = () => {
        setStatusFilter('');
        doSearch(search, packageFilter, '');
    };

    return (
        <AuthenticatedLayout>
            <Head title="المجموعات" />

            <PageHeader
                title="المجموعات التدريبية"
                description="إدارة المجموعات وتعيين المتدربين"
                action={
                    <div className="flex items-center gap-2">
                        <a href={route('export.groups')} className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-colors">
                            <Download className="h-4 w-4" />
                            تصدير Excel
                        </a>
                        <Button icon={<Plus className="h-4 w-4" />} onClick={() => setShowForm(true)}>
                            إضافة مجموعة
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
                            placeholder="بحث..."
                            className="w-full pr-10 pl-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all"
                        />
                    </div>
                    <div className="sm:w-56 relative">
                        <SearchableSelect
                            value={packageFilter}
                            onChange={(val) => handlePackageChange(String(val))}
                            options={packageOptions}
                            placeholder="كل الحقائب"
                            searchPlaceholder="بحث في الحقائب..."
                        />
                        {packageFilter && (
                            <button
                                type="button"
                                onClick={clearPackage}
                                className="absolute left-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition-colors z-10"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        )}
                    </div>
                    <div className="relative">
                        <select
                            value={statusFilter}
                            onChange={(e) => handleStatusChange(e.target.value)}
                            className="px-4 py-2.5 pl-10 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all appearance-none"
                        >
                            <option value="">كل الحالات</option>
                            {statuses.map((s) => (
                                <option key={s.value} value={s.value}>{s.label}</option>
                            ))}
                        </select>
                        {statusFilter && (
                            <button
                                type="button"
                                onClick={clearStatus}
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
                                <th className="px-4 py-3.5 text-right text-xs font-bold text-slate-600 uppercase tracking-wide">المجموعة</th>
                                <th className="px-4 py-3.5 text-right text-xs font-bold text-slate-600 uppercase tracking-wide">الحقيبة/البرنامج</th>
                                <th className="px-4 py-3.5 text-right text-xs font-bold text-slate-600 uppercase tracking-wide">النوع</th>
                                <th className="px-4 py-3.5 text-right text-xs font-bold text-slate-600 uppercase tracking-wide">المدرب</th>
                                <th className="px-4 py-3.5 text-right text-xs font-bold text-slate-600 uppercase tracking-wide">القاعة</th>
                                <th className="px-4 py-3.5 text-right text-xs font-bold text-slate-600 uppercase tracking-wide">المتدربين</th>
                                <th className="px-4 py-3.5 text-right text-xs font-bold text-slate-600 uppercase tracking-wide">الحالة</th>
                                <th className="px-4 py-3.5 text-right text-xs font-bold text-slate-600 uppercase tracking-wide">الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {groups.data.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="px-4 py-12 text-center text-slate-500">
                                        <Layers className="h-12 w-12 mx-auto text-slate-300 mb-3" />
                                        <p className="font-medium">لا توجد مجموعات</p>
                                        <p className="text-sm text-slate-400 mt-1">ابدأ بإضافة مجموعة جديدة</p>
                                    </td>
                                </tr>
                            ) : (
                                groups.data.map((group) => (
                                    <tr key={group.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-4 py-4">
                                            <Link
                                                href={route('groups.show', group.id)}
                                                className="font-semibold text-slate-800 hover:text-teal-600 transition-colors"
                                            >
                                                {group.name}
                                            </Link>
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="text-sm font-medium text-slate-700">{group.package.program.name}</div>
                                            <div className="text-xs text-slate-400">{group.package.name}</div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <Badge variant={group.gender === 'male' ? 'info' : group.gender === 'female' ? 'danger' : 'default'}>
                                                {genderLabels[group.gender]}
                                            </Badge>
                                        </td>
                                        <td className="px-4 py-4 text-sm text-slate-600">{group.trainer?.name || '-'}</td>
                                        <td className="px-4 py-4 text-sm text-slate-600">{group.training_hall?.name || '-'}</td>
                                        <td className="px-4 py-4">
                                            <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-teal-100 text-teal-700 font-semibold text-sm">
                                                {group.trainees_count}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4">
                                            <Badge variant={statusVariants[group.status] || 'default'}>
                                                {statusLabels[group.status] || group.status}
                                            </Badge>
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="flex items-center gap-1">
                                                <Link
                                                    href={route('groups.show', group.id)}
                                                    className="p-2 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Link>
                                                <button
                                                    onClick={() => {
                                                        setEditing(group);
                                                        setSelectedGender(group.gender);
                                                        setShowForm(true);
                                                    }}
                                                    className="p-2 rounded-lg hover:bg-teal-100 text-teal-600 transition-colors"
                                                >
                                                    <Edit2 className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => setDeleting(group)}
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

                {groups.last_page > 1 && (
                    <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200">
                        <div className="text-sm text-slate-500">
                            عرض {(groups.current_page - 1) * groups.per_page + 1} إلى{' '}
                            {Math.min(groups.current_page * groups.per_page, groups.total)} من {groups.total} مجموعة
                        </div>
                        <div className="flex items-center gap-1">
                            {groups.links.map((link, i) => (
                                <button
                                    key={i}
                                    disabled={!link.url}
                                    onClick={() => link.url && router.get(link.url, {}, { preserveState: true })}
                                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                                        link.active
                                            ? 'bg-blue-600 text-white'
                                            : link.url
                                              ? 'hover:bg-slate-100 text-slate-700'
                                              : 'text-slate-400 cursor-not-allowed'
                                    }`}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </Card>

            <FormModal
                open={showForm}
                onClose={() => {
                    setShowForm(false);
                    setEditing(null);
                    setSelectedGender('male');
                }}
                title={editing ? 'تعديل المجموعة' : 'إضافة مجموعة جديدة'}
                initialData={initialData}
                action={editing ? route('groups.update', editing.id) : route('groups.store')}
                method={editing ? 'put' : 'post'}
                size="lg"
            >
                {(form) => (
                    <>
                        {!editing && (
                            <SearchableSelect
                                label="الحقيبة التدريبية"
                                value={form.data.package_id}
                                onChange={(val) => form.setData('package_id', val)}
                                options={packageOptions}
                                placeholder="اختر الحقيبة"
                                searchPlaceholder="بحث في الحقائب..."
                                error={form.errors.package_id}
                                required
                            />
                        )}
                        <div className="grid grid-cols-2 gap-4">
                            <Input
                                label="اسم المجموعة"
                                value={form.data.name}
                                onChange={(e) => form.setData('name', e.target.value)}
                                error={form.errors.name}
                                placeholder="مثال: المجموعة الأولى"
                                required
                            />
                            <Select
                                label="النوع"
                                value={form.data.gender}
                                onChange={(e) => {
                                    const newGender = e.target.value;
                                    setSelectedGender(newGender);
                                    // Clear hall when gender changes since it might not match
                                    form.setData({
                                        ...form.data,
                                        gender: newGender,
                                        training_hall_id: '',
                                    });
                                }}
                                error={form.errors.gender}
                                required
                            >
                                {genderOptions.map((g) => (
                                    <option key={g.value} value={g.value}>{g.label}</option>
                                ))}
                            </Select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <SearchableSelect
                                label="المدرب"
                                value={form.data.trainer_id}
                                onChange={(val) => form.setData('trainer_id', val)}
                                options={trainerOptions}
                                placeholder="اختر المدرب..."
                                searchPlaceholder="بحث في المدربين..."
                                error={form.errors.trainer_id}
                            />
                            <SearchableSelect
                                label="القاعة"
                                value={form.data.training_hall_id}
                                onChange={(val) => form.setData('training_hall_id', val)}
                                options={getFilteredHallOptions(form.data.gender || selectedGender)}
                                placeholder="اختر القاعة..."
                                searchPlaceholder="بحث في القاعات..."
                                error={form.errors.training_hall_id}
                            />
                        </div>
                        <Select
                            label="الحالة"
                            value={form.data.status}
                            onChange={(e) => form.setData('status', e.target.value)}
                            error={form.errors.status}
                            required
                        >
                            {statuses.map((s) => (
                                <option key={s.value} value={s.value}>{s.label}</option>
                            ))}
                        </Select>
                        <Textarea
                            label="ملاحظات"
                            value={form.data.notes}
                            onChange={(e) => form.setData('notes', e.target.value)}
                            error={form.errors.notes}
                            rows={2}
                        />
                    </>
                )}
            </FormModal>

            <DeleteModal
                open={!!deleting}
                onClose={() => setDeleting(null)}
                action={deleting ? route('groups.destroy', deleting.id) : ''}
                message={`هل أنت متأكد من حذف المجموعة "${deleting?.name}"؟`}
            />
        </AuthenticatedLayout>
    );
}
