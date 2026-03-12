import AuthenticatedLayout from '@/Components/Layout/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import { Plus, Edit2, Trash2, Users, Search, User, Briefcase, Eye, BookOpen, Calendar, GraduationCap, Building2, X } from 'lucide-react';
import Card from '@/Components/UI/Card';
import Button from '@/Components/UI/Button';
import Badge from '@/Components/UI/Badge';
import PageHeader from '@/Components/UI/PageHeader';
import FormModal from '@/Components/UI/FormModal';
import DeleteModal from '@/Components/UI/DeleteModal';
import Modal from '@/Components/UI/Modal';
import Input from '@/Components/UI/Input';
import Select from '@/Components/UI/Select';
import SearchableSelect from '@/Components/UI/SearchableSelect';
import { formatDate } from '@/Utils/helpers';

interface TrainingRecord {
    id: number;
    program_name: string;
    package_name: string;
    group_name: string;
    trainer_name: string;
    hall_name: string;
    start_date: string | null;
    end_date: string | null;
    sessions_count: number;
    status: string;
    grade: number | null;
    group_status: string;
}

interface Employee {
    id: number;
    name: string;
    employee_number: string | null;
    national_id: string | null;
    email: string | null;
    phone: string | null;
    gender: string;
    job_title: string | null;
    specialization: string | null;
    is_active: boolean;
    school: { id: number; name: string } | null;
    training_history?: TrainingRecord[];
    total_courses?: number;
}

interface Props {
    employees: { data: Employee[]; current_page: number; last_page: number };
    schools: Array<{ id: number; name: string }>;
    filters: { search?: string; school_id?: string; gender?: string };
    employee?: Employee;
}

const genderOptions = [
    { value: 'male', label: 'ذكر' },
    { value: 'female', label: 'أنثى' },
];

const statusLabels: Record<string, { label: string; variant: 'success' | 'warning' | 'danger' | 'info' | 'default' | 'primary' }> = {
    scheduled: { label: 'مجدول', variant: 'info' },
    in_progress: { label: 'قيد التنفيذ', variant: 'warning' },
    completed: { label: 'مكتمل', variant: 'success' },
    cancelled: { label: 'ملغي', variant: 'danger' },
    postponed: { label: 'مؤجل', variant: 'default' },
    enrolled: { label: 'مسجل', variant: 'info' },
    passed: { label: 'ناجح', variant: 'success' },
    failed: { label: 'راسب', variant: 'danger' },
    withdrawn: { label: 'منسحب', variant: 'default' },
    absent: { label: 'غائب', variant: 'danger' },
};

export default function Index({ employees, schools, filters, employee }: Props) {
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState<Employee | null>(null);
    const [deleting, setDeleting] = useState<Employee | null>(null);
    const [viewing, setViewing] = useState<Employee | null>(employee || null);
    const [search, setSearch] = useState(filters.search || '');
    const [schoolFilter, setSchoolFilter] = useState(filters.school_id || '');
    const [genderFilter, setGenderFilter] = useState(filters.gender || '');

    const initialData = editing
        ? {
              school_id: editing.school?.id || '',
              name: editing.name,
              employee_number: editing.employee_number || '',
              national_id: editing.national_id || '',
              email: editing.email || '',
              phone: editing.phone || '',
              gender: editing.gender,
              job_title: editing.job_title || '',
              specialization: editing.specialization || '',
              is_active: editing.is_active,
          }
        : {
              school_id: '',
              name: '',
              employee_number: '',
              national_id: '',
              email: '',
              phone: '',
              gender: 'male',
              job_title: '',
              specialization: '',
              is_active: true,
          };

    const doSearch = (s: string, school: string, gender: string) => {
        router.get(route('employees.index'), {
            search: s || undefined,
            school_id: school || undefined,
            gender: gender || undefined
        }, { preserveState: true, preserveScroll: true });
    };

    const [searchTimer, setSearchTimer] = useState<ReturnType<typeof setTimeout> | null>(null);
    const handleSearchChange = (val: string) => {
        setSearch(val);
        if (searchTimer) clearTimeout(searchTimer);
        setSearchTimer(setTimeout(() => doSearch(val, schoolFilter, genderFilter), 400));
    };

    const handleSchoolChange = (val: string) => { setSchoolFilter(val); doSearch(search, val, genderFilter); };
    const handleGenderChange = (val: string) => { setGenderFilter(val); doSearch(search, schoolFilter, val); };
    const clearSchool = () => { setSchoolFilter(''); doSearch(search, '', genderFilter); };
    const clearGender = () => { setGenderFilter(''); doSearch(search, schoolFilter, ''); };

    const handleView = (emp: Employee) => {
        setViewing(emp);
        router.get(route('employees.show', emp.id), {}, {
            preserveState: true,
            only: ['employee'],
            onSuccess: (page) => {
                const data = (page.props as { employee?: Employee }).employee;
                if (data) setViewing(data);
            }
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title="المتدربين" />

            <PageHeader
                title="المتدربين"
                description="إدارة قائمة المتدربين (المعلمين)"
                action={
                    <Button icon={<Plus className="h-4 w-4" />} onClick={() => setShowForm(true)}>
                        إضافة متدرب
                    </Button>
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
                            placeholder="بحث بالاسم أو الرقم الوظيفي..."
                            className="w-full pr-10 pl-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all"
                        />
                    </div>
                    <div className="relative">
                        <select
                            value={schoolFilter}
                            onChange={(e) => handleSchoolChange(e.target.value)}
                            className="px-4 py-2.5 pl-10 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all appearance-none"
                        >
                            <option value="">كل المدارس</option>
                            {schools.map((s) => (
                                <option key={s.id} value={s.id}>{s.name}</option>
                            ))}
                        </select>
                        {schoolFilter && (
                            <button type="button" onClick={clearSchool} className="absolute left-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition-colors">
                                <X className="h-4 w-4" />
                            </button>
                        )}
                    </div>
                    <div className="relative">
                        <select
                            value={genderFilter}
                            onChange={(e) => handleGenderChange(e.target.value)}
                            className="px-4 py-2.5 pl-10 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all appearance-none"
                        >
                            <option value="">كل الجنس</option>
                            {genderOptions.map((g) => (
                                <option key={g.value} value={g.value}>{g.label}</option>
                            ))}
                        </select>
                        {genderFilter && (
                            <button type="button" onClick={clearGender} className="absolute left-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition-colors">
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
                                <th className="px-4 py-3.5 text-right text-xs font-bold text-slate-600 uppercase tracking-wide">الاسم</th>
                                <th className="px-4 py-3.5 text-right text-xs font-bold text-slate-600 uppercase tracking-wide">الرقم الوظيفي</th>
                                <th className="px-4 py-3.5 text-right text-xs font-bold text-slate-600 uppercase tracking-wide">المدرسة</th>
                                <th className="px-4 py-3.5 text-right text-xs font-bold text-slate-600 uppercase tracking-wide">الوظيفة</th>
                                <th className="px-4 py-3.5 text-right text-xs font-bold text-slate-600 uppercase tracking-wide">الجنس</th>
                                <th className="px-4 py-3.5 text-right text-xs font-bold text-slate-600 uppercase tracking-wide">الحالة</th>
                                <th className="px-4 py-3.5 text-right text-xs font-bold text-slate-600 uppercase tracking-wide">الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {employees.data.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-4 py-12 text-center text-slate-500">
                                        <Users className="h-12 w-12 mx-auto text-slate-300 mb-3" />
                                        <p className="font-medium">لا يوجد متدربين</p>
                                    </td>
                                </tr>
                            ) : (
                                employees.data.map((emp) => (
                                    <tr key={emp.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-4 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-sky-50 flex items-center justify-center shadow-sm">
                                                    <User className="h-5 w-5 text-sky-600" />
                                                </div>
                                                <div>
                                                    <span className="font-semibold text-slate-800 block">{emp.name}</span>
                                                    {emp.email && <span className="text-xs text-slate-500">{emp.email}</span>}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 text-sm text-slate-600 font-mono">{emp.employee_number || '-'}</td>
                                        <td className="px-4 py-4 text-sm text-slate-600">{emp.school?.name || '-'}</td>
                                        <td className="px-4 py-4">
                                            {emp.job_title ? (
                                                <span className="flex items-center gap-1 text-sm text-slate-600">
                                                    <Briefcase className="h-3.5 w-3.5" />
                                                    {emp.job_title}
                                                </span>
                                            ) : '-'}
                                        </td>
                                        <td className="px-4 py-4">
                                            <Badge variant={emp.gender === 'male' ? 'info' : 'danger'}>
                                                {emp.gender === 'male' ? 'ذكر' : 'أنثى'}
                                            </Badge>
                                        </td>
                                        <td className="px-4 py-4">
                                            <Badge variant={emp.is_active ? 'success' : 'danger'}>
                                                {emp.is_active ? 'نشط' : 'غير نشط'}
                                            </Badge>
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="flex items-center gap-1">
                                                <button
                                                    onClick={() => handleView(emp)}
                                                    className="p-2 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setEditing(emp);
                                                        setShowForm(true);
                                                    }}
                                                    className="p-2 rounded-lg hover:bg-teal-100 text-teal-600 transition-colors"
                                                >
                                                    <Edit2 className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => setDeleting(emp)}
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
                title={editing ? 'تعديل المتدرب' : 'إضافة متدرب جديد'}
                initialData={initialData}
                action={editing ? route('employees.update', editing.id) : route('employees.store')}
                method={editing ? 'put' : 'post'}
                size="lg"
            >
                {(form) => (
                    <>
                        <div className="grid grid-cols-2 gap-4">
                            <Input
                                label="الاسم"
                                value={form.data.name}
                                onChange={(e) => form.setData('name', e.target.value)}
                                error={form.errors.name}
                                required
                            />
                            <Select
                                label="الجنس"
                                value={form.data.gender}
                                onChange={(e) => form.setData('gender', e.target.value)}
                                error={form.errors.gender}
                                required
                            >
                                {genderOptions.map((g) => (
                                    <option key={g.value} value={g.value}>{g.label}</option>
                                ))}
                            </Select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <Input
                                label="الرقم الوظيفي"
                                value={form.data.employee_number}
                                onChange={(e) => form.setData('employee_number', e.target.value)}
                                error={form.errors.employee_number}
                            />
                            <Input
                                label="رقم الهوية"
                                value={form.data.national_id}
                                onChange={(e) => form.setData('national_id', e.target.value)}
                                error={form.errors.national_id}
                            />
                        </div>
                        <SearchableSelect
                            label="المدرسة"
                            value={form.data.school_id}
                            onChange={(val) => form.setData('school_id', val || '')}
                            options={schools.map((s) => ({ value: s.id, label: s.name }))}
                            placeholder="اختر المدرسة..."
                            searchPlaceholder="بحث في المدارس..."
                            error={form.errors.school_id}
                        />
                        <div className="grid grid-cols-2 gap-4">
                            <Input
                                label="الوظيفة"
                                value={form.data.job_title}
                                onChange={(e) => form.setData('job_title', e.target.value)}
                                error={form.errors.job_title}
                            />
                            <Input
                                label="التخصص"
                                value={form.data.specialization}
                                onChange={(e) => form.setData('specialization', e.target.value)}
                                error={form.errors.specialization}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <Input
                                label="البريد الإلكتروني"
                                type="email"
                                value={form.data.email}
                                onChange={(e) => form.setData('email', e.target.value)}
                                error={form.errors.email}
                            />
                            <Input
                                label="رقم الجوال"
                                value={form.data.phone}
                                onChange={(e) => form.setData('phone', e.target.value)}
                                error={form.errors.phone}
                            />
                        </div>
                        <label className="flex items-center gap-2 cursor-pointer group">
                            <input
                                type="checkbox"
                                checked={form.data.is_active}
                                onChange={(e) => form.setData('is_active', e.target.checked)}
                                className="w-4 h-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                            />
                            <span className="text-sm text-slate-700 group-hover:text-slate-900">نشط</span>
                        </label>
                    </>
                )}
            </FormModal>

            <DeleteModal
                open={!!deleting}
                onClose={() => setDeleting(null)}
                action={deleting ? route('employees.destroy', deleting.id) : ''}
                message={`هل أنت متأكد من حذف المتدرب "${deleting?.name}"؟`}
            />

            {/* View Employee Training History Modal */}
            <Modal
                open={!!viewing}
                onClose={() => setViewing(null)}
                title={`السجل التدريبي: ${viewing?.name || ''}`}
                size="xl"
            >
                {viewing && (
                    <div className="space-y-5">
                        {/* Employee Info */}
                        <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-xl">
                            <div className="p-3.5 bg-sky-50 rounded-xl shadow-lg">
                                <User className="h-7 w-7 text-sky-600" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-xl font-bold text-slate-800">{viewing.name}</h3>
                                <div className="flex flex-wrap gap-3 mt-2 text-sm text-slate-500">
                                    {viewing.school && (
                                        <span className="flex items-center gap-1">
                                            <Building2 className="h-4 w-4" />
                                            {viewing.school.name}
                                        </span>
                                    )}
                                    {viewing.job_title && (
                                        <span className="flex items-center gap-1">
                                            <Briefcase className="h-4 w-4" />
                                            {viewing.job_title}
                                        </span>
                                    )}
                                    {viewing.employee_number && (
                                        <span className="font-mono text-xs bg-slate-200 px-2 py-0.5 rounded">
                                            {viewing.employee_number}
                                        </span>
                                    )}
                                </div>
                                <div className="flex flex-wrap gap-2 mt-3">
                                    <Badge variant={viewing.gender === 'male' ? 'info' : 'danger'}>
                                        {viewing.gender === 'male' ? 'ذكر' : 'أنثى'}
                                    </Badge>
                                    <Badge variant={viewing.is_active ? 'success' : 'danger'}>
                                        {viewing.is_active ? 'نشط' : 'غير نشط'}
                                    </Badge>
                                </div>
                            </div>
                            <div className="text-center px-4 py-2 bg-white rounded-xl border border-slate-200">
                                <BookOpen className="h-5 w-5 text-teal-600 mx-auto mb-1" />
                                <p className="text-2xl font-bold text-teal-700">{viewing.total_courses || 0}</p>
                                <p className="text-xs text-slate-500">دورة</p>
                            </div>
                        </div>

                        {/* Training History */}
                        <div>
                            <h4 className="font-semibold text-slate-700 mb-3 flex items-center gap-2">
                                <GraduationCap className="h-5 w-5" />
                                الدورات التدريبية
                            </h4>
                            {viewing.training_history && viewing.training_history.length > 0 ? (
                                <div className="space-y-3 max-h-80 overflow-y-auto">
                                    {viewing.training_history.map((record) => (
                                        <div key={record.id} className="p-4 border border-slate-200 rounded-xl hover:border-teal-300 transition-colors">
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <h5 className="font-semibold text-slate-800">{record.program_name}</h5>
                                                    <p className="text-sm text-slate-500 mt-0.5">
                                                        {record.package_name} - {record.group_name}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <Badge variant={statusLabels[record.group_status]?.variant || 'default'}>
                                                        {statusLabels[record.group_status]?.label || record.group_status}
                                                    </Badge>
                                                    {record.status && record.status !== record.group_status && (
                                                        <Badge variant={statusLabels[record.status]?.variant || 'default'}>
                                                            {statusLabels[record.status]?.label || record.status}
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3 mt-3 text-xs text-slate-500 flex-wrap">
                                                <span className="flex items-center gap-1">
                                                    <GraduationCap className="h-3.5 w-3.5" />
                                                    المدرب: {record.trainer_name}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Building2 className="h-3.5 w-3.5" />
                                                    {record.hall_name}
                                                </span>
                                                {record.sessions_count > 0 && (
                                                    <span className="px-1.5 py-0.5 bg-slate-100 rounded text-slate-600">
                                                        {record.sessions_count} جلسة
                                                    </span>
                                                )}
                                                {record.grade !== null && (
                                                    <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded font-semibold">
                                                        الدرجة: {record.grade}
                                                    </span>
                                                )}
                                            </div>
                                            {record.start_date && (
                                                <div className="mt-2">
                                                    <span className="flex items-center gap-1 text-xs px-2 py-0.5 bg-amber-50 text-amber-700 rounded w-fit">
                                                        <Calendar className="h-3.5 w-3.5" />
                                                        {formatDate(record.start_date)}
                                                        {record.end_date && ` - ${formatDate(record.end_date)}`}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-slate-500 bg-slate-50 rounded-xl">
                                    <BookOpen className="h-10 w-10 mx-auto text-slate-300 mb-2" />
                                    <p>لا توجد دورات تدريبية مسجلة لهذا المتدرب</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </Modal>
        </AuthenticatedLayout>
    );
}
