import AuthenticatedLayout from '@/Components/Layout/AuthenticatedLayout';
import { Head, router, useForm } from '@inertiajs/react';
import { useState, useRef } from 'react';
import { Plus, Edit2, Trash2, GraduationCap, Search, Mail, Phone, Layers, Calendar, Eye, BookOpen, Users, Clock, X, Download, Upload, FileSpreadsheet } from 'lucide-react';
import Card from '@/Components/UI/Card';
import Button from '@/Components/UI/Button';
import Badge from '@/Components/UI/Badge';
import PageHeader from '@/Components/UI/PageHeader';
import FormModal from '@/Components/UI/FormModal';
import DeleteModal from '@/Components/UI/DeleteModal';
import Modal from '@/Components/UI/Modal';
import Input from '@/Components/UI/Input';
import Select from '@/Components/UI/Select';
import Textarea from '@/Components/UI/Textarea';
import { formatDate } from '@/Utils/helpers';

interface TrainingHistory {
    id: number;
    program_name: string;
    package_name: string;
    group_name: string;
    start_date: string;
    end_date: string;
    trainees_count: number;
    status: string;
}

interface Trainer {
    id: number;
    name: string;
    national_id: string | null;
    employee_id: string | null;
    email: string | null;
    phone: string | null;
    gender: string;
    nationality: string | null;
    nationality_category: string | null;
    employer_type: string | null;
    employer: string | null;
    job_title: string | null;
    education_level: string | null;
    academic_specialization: string | null;
    specialization: string | null;
    bio: string | null;
    training_experience_years: number;
    current_experience_years: number;
    is_certified_trainer: boolean;
    can_prepare_packages: boolean;
    training_fields: string | null;
    training_gender: string | null;
    trainer_evaluation: string | null;
    cooperation_status: string | null;
    is_internal: boolean;
    is_active: boolean;
    notes: string | null;
    program_groups_count: number;
    training_sessions_count: number;
    training_history?: TrainingHistory[];
    total_hours?: number;
    total_trainees?: number;
}

interface Props {
    trainers: { data: Trainer[]; current_page: number; last_page: number; links: Array<{ url: string | null; label: string; active: boolean }> };
    filters: { search?: string; gender?: string; is_internal?: string };
    trainer?: Trainer;
}

const genderOptions = [
    { value: 'male', label: 'ذكر' },
    { value: 'female', label: 'أنثى' },
];

const trainingGenderOptions = [
    { value: 'male', label: 'رجال' },
    { value: 'female', label: 'نساء' },
    { value: 'both', label: 'رجال ونساء' },
];

const trainingGenderLabels: Record<string, string> = {
    male: 'رجال',
    female: 'نساء',
    both: 'رجال ونساء',
};

const statusLabels: Record<string, { label: string; variant: 'success' | 'warning' | 'danger' | 'info' | 'default' | 'primary' }> = {
    scheduled: { label: 'مجدول', variant: 'info' },
    in_progress: { label: 'قيد التنفيذ', variant: 'warning' },
    completed: { label: 'مكتمل', variant: 'success' },
    cancelled: { label: 'ملغي', variant: 'danger' },
};

export default function Index({ trainers, filters, trainer }: Props) {
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState<Trainer | null>(null);
    const [deleting, setDeleting] = useState<Trainer | null>(null);
    const [viewing, setViewing] = useState<Trainer | null>(trainer || null);
    const [showImport, setShowImport] = useState(false);
    const [search, setSearch] = useState(filters.search || '');
    const [genderFilter, setGenderFilter] = useState(filters.gender || '');
    const [internalFilter, setInternalFilter] = useState(filters.is_internal || '');

    const fileInputRef = useRef<HTMLInputElement>(null);
    const importForm = useForm<{ file: File | null }>({ file: null });

    const initialData = editing
        ? {
              name: editing.name,
              national_id: editing.national_id || '',
              employee_id: editing.employee_id || '',
              email: editing.email || '',
              phone: editing.phone || '',
              gender: editing.gender,
              nationality: editing.nationality || '',
              employer_type: editing.employer_type || '',
              employer: editing.employer || '',
              job_title: editing.job_title || '',
              education_level: editing.education_level || '',
              academic_specialization: editing.academic_specialization || '',
              specialization: editing.specialization || '',
              bio: editing.bio || '',
              training_experience_years: editing.training_experience_years || 0,
              is_certified_trainer: editing.is_certified_trainer,
              can_prepare_packages: editing.can_prepare_packages,
              training_fields: editing.training_fields || '',
              training_gender: editing.training_gender || '',
              trainer_evaluation: editing.trainer_evaluation || '',
              cooperation_status: editing.cooperation_status || '',
              is_internal: editing.is_internal,
              is_active: editing.is_active,
              notes: editing.notes || '',
          }
        : {
              name: '',
              national_id: '',
              employee_id: '',
              email: '',
              phone: '',
              gender: 'male',
              nationality: '',
              employer_type: 'داخلي',
              employer: '',
              job_title: '',
              education_level: '',
              academic_specialization: '',
              specialization: '',
              bio: '',
              training_experience_years: 0,
              is_certified_trainer: false,
              can_prepare_packages: false,
              training_fields: '',
              training_gender: '',
              trainer_evaluation: '',
              cooperation_status: '',
              is_internal: true,
              is_active: true,
              notes: '',
          };

    const doSearch = (s: string, g: string, i: string) => {
        router.get(route('trainers.index'), {
            search: s || undefined,
            gender: g || undefined,
            is_internal: i || undefined
        }, { preserveState: true, preserveScroll: true });
    };

    const [searchTimer, setSearchTimer] = useState<ReturnType<typeof setTimeout> | null>(null);
    const handleSearchChange = (val: string) => {
        setSearch(val);
        if (searchTimer) clearTimeout(searchTimer);
        setSearchTimer(setTimeout(() => doSearch(val, genderFilter, internalFilter), 400));
    };

    const handleGenderChange = (val: string) => {
        setGenderFilter(val);
        doSearch(search, val, internalFilter);
    };

    const clearGender = () => {
        setGenderFilter('');
        doSearch(search, '', internalFilter);
    };

    const handleInternalChange = (val: string) => {
        setInternalFilter(val);
        doSearch(search, genderFilter, val);
    };

    const clearInternal = () => {
        setInternalFilter('');
        doSearch(search, genderFilter, '');
    };

    const handleViewTrainer = (t: Trainer) => {
        setViewing(t);
        router.get(route('trainers.show', t.id), {}, {
            preserveState: true,
            only: ['trainer'],
            onSuccess: (page) => {
                const trainerData = (page.props as { trainer?: Trainer }).trainer;
                if (trainerData) {
                    setViewing(trainerData);
                }
            }
        });
    };

    const handleImportSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!importForm.data.file) return;

        importForm.post(route('import.trainers'), {
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
            <Head title="المدربين" />

            <PageHeader
                title="المدربين"
                description="إدارة قائمة المدربين"
                action={
                    <div className="flex items-center gap-2">
                        <a href={route('export.trainers-template')} className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-xl border border-purple-200 bg-purple-50 text-purple-700 hover:bg-purple-100 transition-colors">
                            <FileSpreadsheet className="h-4 w-4" />
                            تحميل القالب
                        </a>
                        <button onClick={() => setShowImport(true)} className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors">
                            <Upload className="h-4 w-4" />
                            استيراد Excel
                        </button>
                        <a href={route('export.trainers')} className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-colors">
                            <Download className="h-4 w-4" />
                            تصدير Excel
                        </a>
                        <Button icon={<Plus className="h-4 w-4" />} onClick={() => setShowForm(true)}>
                            إضافة مدرب
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
                            placeholder="بحث في المدربين..."
                            className="w-full pr-10 pl-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all"
                        />
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
                            <button
                                type="button"
                                onClick={clearGender}
                                className="absolute left-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition-colors"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        )}
                    </div>
                    <div className="relative">
                        <select
                            value={internalFilter}
                            onChange={(e) => handleInternalChange(e.target.value)}
                            className="px-4 py-2.5 pl-10 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all appearance-none"
                        >
                            <option value="">الكل</option>
                            <option value="1">داخلي</option>
                            <option value="0">خارجي</option>
                        </select>
                        {internalFilter && (
                            <button
                                type="button"
                                onClick={clearInternal}
                                className="absolute left-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition-colors"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        )}
                    </div>
                </div>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {trainers.data.length === 0 ? (
                    <Card className="col-span-full">
                        <div className="text-center py-12 text-slate-500">
                            <GraduationCap className="h-14 w-14 mx-auto text-slate-300 mb-3" />
                            <p className="font-medium">لا يوجد مدربين</p>
                            <p className="text-sm text-slate-400 mt-1">ابدأ بإضافة مدرب جديد أو استيراد من Excel</p>
                        </div>
                    </Card>
                ) : (
                    trainers.data.map((t) => (
                        <Card key={t.id} className="relative group hover:shadow-md transition-shadow">
                            <div className="absolute top-4 left-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => handleViewTrainer(t)} className="p-2 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors">
                                    <Eye className="h-4 w-4" />
                                </button>
                                <button onClick={() => { setEditing(t); setShowForm(true); }} className="p-2 rounded-lg hover:bg-teal-100 text-teal-600 transition-colors">
                                    <Edit2 className="h-4 w-4" />
                                </button>
                                <button onClick={() => setDeleting(t)} className="p-2 rounded-lg hover:bg-red-100 text-red-600 transition-colors">
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="p-2.5 bg-violet-50 rounded-xl">
                                    <GraduationCap className="h-5 w-5 text-violet-600" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-bold text-slate-800 text-lg">{t.name}</h3>
                                    {(t.academic_specialization || t.specialization) && (
                                        <p className="text-sm text-slate-500 mt-0.5">{t.academic_specialization || t.specialization}</p>
                                    )}
                                    {t.job_title && (
                                        <p className="text-xs text-slate-400 mt-0.5">{t.job_title}</p>
                                    )}
                                </div>
                            </div>

                            <div className="mt-5 pt-4 border-t border-slate-100 flex flex-wrap gap-2">
                                <Badge variant={t.employer_type === 'داخلي' || t.is_internal ? 'primary' : 'warning'}>
                                    {t.employer_type || (t.is_internal ? 'داخلي' : 'خارجي')}
                                </Badge>
                                <Badge variant={t.is_active ? 'success' : 'danger'}>
                                    {t.is_active ? 'نشط' : 'غير نشط'}
                                </Badge>
                                <Badge variant={t.gender === 'male' ? 'info' : 'danger'}>
                                    {t.gender === 'male' ? 'ذكر' : 'أنثى'}
                                </Badge>
                                {t.nationality_category && (
                                    <Badge variant={t.nationality_category === 'قطري' ? 'success' : 'default'}>
                                        {t.nationality_category}
                                    </Badge>
                                )}
                            </div>

                            <div className="mt-4 flex items-center gap-4 text-xs">
                                <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded-lg font-medium flex items-center gap-1">
                                    <Layers className="h-3.5 w-3.5" />
                                    {t.program_groups_count} مجموعة
                                </span>
                                <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded-lg font-medium flex items-center gap-1">
                                    <Calendar className="h-3.5 w-3.5" />
                                    {t.training_sessions_count} جلسة
                                </span>
                                {t.current_experience_years > 0 && (
                                    <span className="px-2 py-1 bg-amber-50 text-amber-700 rounded-lg font-medium">
                                        {t.current_experience_years} سنة خبرة
                                    </span>
                                )}
                            </div>

                            {(t.email || t.phone) && (
                                <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5">
                                    {t.email && (
                                        <p className="text-xs text-slate-500 flex items-center gap-1.5">
                                            <Mail className="h-3.5 w-3.5" />
                                            {t.email}
                                        </p>
                                    )}
                                    {t.phone && (
                                        <p className="text-xs text-slate-500 flex items-center gap-1.5">
                                            <Phone className="h-3.5 w-3.5" />
                                            {t.phone}
                                        </p>
                                    )}
                                </div>
                            )}

                            <button
                                onClick={() => handleViewTrainer(t)}
                                className="mt-4 w-full py-2 text-sm text-teal-600 hover:text-teal-700 hover:bg-teal-50 rounded-lg transition-colors font-medium"
                            >
                                عرض التفاصيل والبرامج
                            </button>
                        </Card>
                    ))
                )}
            </div>

            {/* Pagination */}
            {trainers.links && trainers.links.length > 3 && (
                <div className="mt-6 flex justify-center">
                    <nav className="flex items-center gap-1">
                        {trainers.links.map((link, i) => (
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

            {/* Form Modal */}
            <FormModal
                open={showForm}
                onClose={() => {
                    setShowForm(false);
                    setEditing(null);
                }}
                title={editing ? 'تعديل المدرب' : 'إضافة مدرب جديد'}
                initialData={initialData}
                action={editing ? route('trainers.update', editing.id) : route('trainers.store')}
                method={editing ? 'put' : 'post'}
                size="xl"
            >
                {(form) => (
                    <div className="space-y-5">
                        {/* القسم 1: المعلومات الأساسية */}
                        <div>
                            <h4 className="text-sm font-bold text-slate-700 mb-3 pb-2 border-b border-slate-100">المعلومات الأساسية</h4>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
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
                                <Input
                                    label="الرقم الشخصي (الوطني)"
                                    value={form.data.national_id}
                                    onChange={(e) => form.setData('national_id', e.target.value)}
                                    error={form.errors.national_id}
                                />
                                <Input
                                    label="الرقم الوظيفي"
                                    value={form.data.employee_id}
                                    onChange={(e) => form.setData('employee_id', e.target.value)}
                                    error={form.errors.employee_id}
                                />
                                <Input
                                    label="الجنسية"
                                    value={form.data.nationality}
                                    onChange={(e) => form.setData('nationality', e.target.value)}
                                    error={form.errors.nationality}
                                />
                                <Select
                                    label="نوع جهة العمل"
                                    value={form.data.employer_type}
                                    onChange={(e) => {
                                        form.setData('employer_type', e.target.value);
                                        form.setData('is_internal', e.target.value === 'داخلي');
                                    }}
                                >
                                    <option value="داخلي">داخلي</option>
                                    <option value="خارجي">خارجي</option>
                                </Select>
                            </div>
                        </div>

                        {/* القسم 2: معلومات العمل */}
                        <div>
                            <h4 className="text-sm font-bold text-slate-700 mb-3 pb-2 border-b border-slate-100">معلومات العمل والتعليم</h4>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                <Input
                                    label="جهة العمل"
                                    value={form.data.employer}
                                    onChange={(e) => form.setData('employer', e.target.value)}
                                    error={form.errors.employer}
                                />
                                <Input
                                    label="المسمى الوظيفي"
                                    value={form.data.job_title}
                                    onChange={(e) => form.setData('job_title', e.target.value)}
                                    error={form.errors.job_title}
                                />
                                <Input
                                    label="المستوى العلمي"
                                    value={form.data.education_level}
                                    onChange={(e) => form.setData('education_level', e.target.value)}
                                    error={form.errors.education_level}
                                />
                                <Input
                                    label="التخصص العلمي"
                                    value={form.data.academic_specialization}
                                    onChange={(e) => {
                                        form.setData('academic_specialization', e.target.value);
                                        form.setData('specialization', e.target.value);
                                    }}
                                    error={form.errors.academic_specialization}
                                />
                                <Input
                                    label="سنوات الخبرة في التدريب"
                                    type="number"
                                    value={form.data.training_experience_years}
                                    onChange={(e) => form.setData('training_experience_years', parseInt(e.target.value) || 0)}
                                    error={form.errors.training_experience_years}
                                />
                                <Select
                                    label="جنس التدريب"
                                    value={form.data.training_gender}
                                    onChange={(e) => form.setData('training_gender', e.target.value)}
                                >
                                    <option value="">-- اختر --</option>
                                    {trainingGenderOptions.map((g) => (
                                        <option key={g.value} value={g.value}>{g.label}</option>
                                    ))}
                                </Select>
                            </div>
                        </div>

                        {/* القسم 3: الشهادات والمجالات */}
                        <div>
                            <h4 className="text-sm font-bold text-slate-700 mb-3 pb-2 border-b border-slate-100">الشهادات والمجالات</h4>
                            <div className="flex items-center gap-6 mb-4">
                                <label className="flex items-center gap-2 cursor-pointer group">
                                    <input
                                        type="checkbox"
                                        checked={form.data.is_certified_trainer}
                                        onChange={(e) => form.setData('is_certified_trainer', e.target.checked)}
                                        className="w-4 h-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                                    />
                                    <span className="text-sm text-slate-700 group-hover:text-slate-900">شهادة مدرب معتمد</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer group">
                                    <input
                                        type="checkbox"
                                        checked={form.data.can_prepare_packages}
                                        onChange={(e) => form.setData('can_prepare_packages', e.target.checked)}
                                        className="w-4 h-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                                    />
                                    <span className="text-sm text-slate-700 group-hover:text-slate-900">إعداد الحقائب التدريبية</span>
                                </label>
                            </div>
                            <Textarea
                                label="مجالات التدريب وإعداد الحقائب"
                                value={form.data.training_fields}
                                onChange={(e) => form.setData('training_fields', e.target.value)}
                                error={form.errors.training_fields}
                                rows={3}
                            />
                        </div>

                        {/* القسم 4: التقييم والتواصل */}
                        <div>
                            <h4 className="text-sm font-bold text-slate-700 mb-3 pb-2 border-b border-slate-100">التقييم والتواصل</h4>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                <Input
                                    label="تقييم المدرب"
                                    value={form.data.trainer_evaluation}
                                    onChange={(e) => form.setData('trainer_evaluation', e.target.value)}
                                    error={form.errors.trainer_evaluation}
                                />
                                <Input
                                    label="حالة التعاون"
                                    value={form.data.cooperation_status}
                                    onChange={(e) => form.setData('cooperation_status', e.target.value)}
                                    error={form.errors.cooperation_status}
                                />
                                <Input
                                    label="رقم الجوال"
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
                            <div className="mt-4">
                                <Textarea
                                    label="ملاحظات"
                                    value={form.data.notes}
                                    onChange={(e) => form.setData('notes', e.target.value)}
                                    error={form.errors.notes}
                                    rows={2}
                                />
                            </div>
                            <div className="flex items-center gap-4 mt-4">
                                <label className="flex items-center gap-2 cursor-pointer group">
                                    <input
                                        type="checkbox"
                                        checked={form.data.is_active}
                                        onChange={(e) => form.setData('is_active', e.target.checked)}
                                        className="w-4 h-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                                    />
                                    <span className="text-sm text-slate-700 group-hover:text-slate-900">نشط</span>
                                </label>
                            </div>
                        </div>
                    </div>
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
                title="استيراد المدربين من Excel"
            >
                <form onSubmit={handleImportSubmit} className="space-y-6">
                    <div className="p-4 bg-purple-50 rounded-xl border border-purple-100">
                        <h4 className="font-semibold text-purple-800 mb-2 flex items-center gap-2">
                            <FileSpreadsheet className="h-5 w-5" />
                            خطوات الاستيراد
                        </h4>
                        <ol className="text-sm text-purple-700 space-y-1 list-decimal mr-5">
                            <li>قم بتحميل <a href={route('export.trainers-template')} className="underline font-medium hover:text-purple-900">قالب Excel</a> أولاً</li>
                            <li>املأ البيانات في القالب (لا تغير صف العناوين)</li>
                            <li>احفظ الملف بصيغة xlsx</li>
                            <li>ارفع الملف هنا</li>
                        </ol>
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
                action={deleting ? route('trainers.destroy', deleting.id) : ''}
                message={`هل أنت متأكد من حذف المدرب "${deleting?.name}"؟`}
            />

            {/* View Trainer Modal */}
            <Modal
                open={!!viewing}
                onClose={() => setViewing(null)}
                title="تفاصيل المدرب"
                size="xl"
            >
                {viewing && (
                    <div className="space-y-6">
                        <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-xl">
                            <div className="p-3.5 bg-violet-50 rounded-xl">
                                <GraduationCap className="h-7 w-7 text-violet-600" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-xl font-bold text-slate-800">{viewing.name}</h3>
                                {(viewing.academic_specialization || viewing.specialization) && (
                                    <p className="text-slate-500 mt-1">{viewing.academic_specialization || viewing.specialization}</p>
                                )}
                                <div className="flex flex-wrap gap-2 mt-3">
                                    <Badge variant={viewing.employer_type === 'داخلي' || viewing.is_internal ? 'primary' : 'warning'}>
                                        {viewing.employer_type || (viewing.is_internal ? 'مدرب داخلي' : 'مدرب خارجي')}
                                    </Badge>
                                    <Badge variant={viewing.is_active ? 'success' : 'danger'}>
                                        {viewing.is_active ? 'نشط' : 'غير نشط'}
                                    </Badge>
                                    {viewing.nationality_category && (
                                        <Badge variant={viewing.nationality_category === 'قطري' ? 'success' : 'default'}>
                                            {viewing.nationality_category}
                                        </Badge>
                                    )}
                                    {viewing.is_certified_trainer && (
                                        <Badge variant="info">مدرب معتمد</Badge>
                                    )}
                                    {viewing.can_prepare_packages && (
                                        <Badge variant="primary">معد حقائب</Badge>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            <div className="p-4 bg-teal-50 rounded-xl text-center">
                                <Layers className="h-6 w-6 text-teal-600 mx-auto mb-2" />
                                <p className="text-2xl font-bold text-teal-700">{viewing.program_groups_count}</p>
                                <p className="text-sm text-teal-600">مجموعة</p>
                            </div>
                            <div className="p-4 bg-sky-50 rounded-xl text-center">
                                <Calendar className="h-6 w-6 text-sky-600 mx-auto mb-2" />
                                <p className="text-2xl font-bold text-sky-700">{viewing.training_sessions_count}</p>
                                <p className="text-sm text-sky-600">جلسة</p>
                            </div>
                            <div className="p-4 bg-amber-50 rounded-xl text-center">
                                <Clock className="h-6 w-6 text-amber-600 mx-auto mb-2" />
                                <p className="text-2xl font-bold text-amber-700">{viewing.total_hours || 0}</p>
                                <p className="text-sm text-amber-600">ساعة تدريب</p>
                            </div>
                            <div className="p-4 bg-emerald-50 rounded-xl text-center">
                                <Users className="h-6 w-6 text-emerald-600 mx-auto mb-2" />
                                <p className="text-2xl font-bold text-emerald-700">{viewing.total_trainees || 0}</p>
                                <p className="text-sm text-emerald-600">متدرب</p>
                            </div>
                        </div>

                        {/* Detailed Info */}
                        <div className="grid grid-cols-2 gap-4">
                            {viewing.nationality && (
                                <div className="p-3 bg-slate-50 rounded-lg">
                                    <p className="text-xs text-slate-500">الجنسية</p>
                                    <p className="text-sm font-medium text-slate-800">{viewing.nationality}</p>
                                </div>
                            )}
                            {viewing.employer && (
                                <div className="p-3 bg-slate-50 rounded-lg">
                                    <p className="text-xs text-slate-500">جهة العمل</p>
                                    <p className="text-sm font-medium text-slate-800">{viewing.employer}</p>
                                </div>
                            )}
                            {viewing.job_title && (
                                <div className="p-3 bg-slate-50 rounded-lg">
                                    <p className="text-xs text-slate-500">المسمى الوظيفي</p>
                                    <p className="text-sm font-medium text-slate-800">{viewing.job_title}</p>
                                </div>
                            )}
                            {viewing.education_level && (
                                <div className="p-3 bg-slate-50 rounded-lg">
                                    <p className="text-xs text-slate-500">المستوى العلمي</p>
                                    <p className="text-sm font-medium text-slate-800">{viewing.education_level}</p>
                                </div>
                            )}
                            {viewing.current_experience_years > 0 && (
                                <div className="p-3 bg-slate-50 rounded-lg">
                                    <p className="text-xs text-slate-500">سنوات الخبرة</p>
                                    <p className="text-sm font-medium text-slate-800">{viewing.current_experience_years} سنة</p>
                                </div>
                            )}
                            {viewing.training_gender && (
                                <div className="p-3 bg-slate-50 rounded-lg">
                                    <p className="text-xs text-slate-500">جنس التدريب</p>
                                    <p className="text-sm font-medium text-slate-800">{trainingGenderLabels[viewing.training_gender] || viewing.training_gender}</p>
                                </div>
                            )}
                            {viewing.cooperation_status && (
                                <div className="p-3 bg-slate-50 rounded-lg">
                                    <p className="text-xs text-slate-500">حالة التعاون</p>
                                    <p className="text-sm font-medium text-slate-800">{viewing.cooperation_status}</p>
                                </div>
                            )}
                        </div>

                        {viewing.training_fields && (
                            <div className="p-4 bg-slate-50 rounded-xl">
                                <h4 className="font-semibold text-slate-700 mb-2">مجالات التدريب</h4>
                                <p className="text-sm text-slate-600">{viewing.training_fields}</p>
                            </div>
                        )}

                        {(viewing.email || viewing.phone) && (
                            <div className="p-4 bg-slate-50 rounded-xl">
                                <h4 className="font-semibold text-slate-700 mb-3">معلومات الاتصال</h4>
                                <div className="space-y-2">
                                    {viewing.email && (
                                        <p className="text-sm text-slate-600 flex items-center gap-2">
                                            <Mail className="h-4 w-4 text-slate-400" />
                                            {viewing.email}
                                        </p>
                                    )}
                                    {viewing.phone && (
                                        <p className="text-sm text-slate-600 flex items-center gap-2">
                                            <Phone className="h-4 w-4 text-slate-400" />
                                            {viewing.phone}
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}

                        {viewing.notes && (
                            <div className="p-4 bg-yellow-50 rounded-xl">
                                <h4 className="font-semibold text-yellow-700 mb-2">ملاحظات</h4>
                                <p className="text-sm text-yellow-800">{viewing.notes}</p>
                            </div>
                        )}

                        <div>
                            <h4 className="font-semibold text-slate-700 mb-3 flex items-center gap-2">
                                <BookOpen className="h-5 w-5" />
                                البرامج التي قام بتدريبها
                            </h4>
                            {viewing.training_history && viewing.training_history.length > 0 ? (
                                <div className="space-y-3 max-h-64 overflow-y-auto">
                                    {viewing.training_history.map((history) => (
                                        <div key={history.id} className="p-4 border border-slate-200 rounded-xl hover:border-teal-300 transition-colors">
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <h5 className="font-semibold text-slate-800">{history.program_name}</h5>
                                                    <p className="text-sm text-slate-500">{history.package_name} - {history.group_name}</p>
                                                </div>
                                                <Badge variant={statusLabels[history.status]?.variant || 'default'}>
                                                    {statusLabels[history.status]?.label || history.status}
                                                </Badge>
                                            </div>
                                            <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                                                <span className="flex items-center gap-1">
                                                    <Calendar className="h-3.5 w-3.5" />
                                                    {formatDate(history.start_date)} - {formatDate(history.end_date)}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Users className="h-3.5 w-3.5" />
                                                    {history.trainees_count} متدرب
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-slate-500 bg-slate-50 rounded-xl">
                                    <BookOpen className="h-10 w-10 mx-auto text-slate-300 mb-2" />
                                    <p>لا توجد برامج تدريبية مسجلة</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </Modal>
        </AuthenticatedLayout>
    );
}
