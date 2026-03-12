import AuthenticatedLayout from '@/Components/Layout/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import { Plus, Edit2, Trash2, GraduationCap, Search, Mail, Phone, Layers, Calendar, Eye, BookOpen, Users, Clock, X } from 'lucide-react';
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
    email: string | null;
    phone: string | null;
    gender: string;
    specialization: string | null;
    bio: string | null;
    is_internal: boolean;
    is_active: boolean;
    program_groups_count: number;
    training_sessions_count: number;
    training_history?: TrainingHistory[];
    total_hours?: number;
    total_trainees?: number;
}

interface Props {
    trainers: { data: Trainer[]; current_page: number; last_page: number };
    filters: { search?: string; gender?: string; is_internal?: string };
    trainer?: Trainer;
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
};

export default function Index({ trainers, filters, trainer }: Props) {
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState<Trainer | null>(null);
    const [deleting, setDeleting] = useState<Trainer | null>(null);
    const [viewing, setViewing] = useState<Trainer | null>(trainer || null);
    const [search, setSearch] = useState(filters.search || '');
    const [genderFilter, setGenderFilter] = useState(filters.gender || '');
    const [internalFilter, setInternalFilter] = useState(filters.is_internal || '');

    const initialData = editing
        ? {
              name: editing.name,
              email: editing.email || '',
              phone: editing.phone || '',
              gender: editing.gender,
              specialization: editing.specialization || '',
              bio: editing.bio || '',
              is_internal: editing.is_internal,
              is_active: editing.is_active,
          }
        : {
              name: '',
              email: '',
              phone: '',
              gender: 'male',
              specialization: '',
              bio: '',
              is_internal: true,
              is_active: true,
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

    return (
        <AuthenticatedLayout>
            <Head title="المدربين" />

            <PageHeader
                title="المدربين"
                description="إدارة قائمة المدربين"
                action={
                    <Button icon={<Plus className="h-4 w-4" />} onClick={() => setShowForm(true)}>
                        إضافة مدرب
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
                            <p className="text-sm text-slate-400 mt-1">ابدأ بإضافة مدرب جديد</p>
                        </div>
                    </Card>
                ) : (
                    trainers.data.map((trainer) => (
                        <Card key={trainer.id} className="relative group hover:shadow-md transition-shadow">
                            <div className="absolute top-4 left-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={() => handleViewTrainer(trainer)}
                                    className="p-2 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors"
                                >
                                    <Eye className="h-4 w-4" />
                                </button>
                                <button
                                    onClick={() => {
                                        setEditing(trainer);
                                        setShowForm(true);
                                    }}
                                    className="p-2 rounded-lg hover:bg-teal-100 text-teal-600 transition-colors"
                                >
                                    <Edit2 className="h-4 w-4" />
                                </button>
                                <button
                                    onClick={() => setDeleting(trainer)}
                                    className="p-2 rounded-lg hover:bg-red-100 text-red-600 transition-colors"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="p-2.5 bg-violet-50 rounded-xl">
                                    <GraduationCap className="h-5 w-5 text-violet-600" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-bold text-slate-800 text-lg">{trainer.name}</h3>
                                    {trainer.specialization && (
                                        <p className="text-sm text-slate-500 mt-0.5">{trainer.specialization}</p>
                                    )}
                                </div>
                            </div>

                            <div className="mt-5 pt-4 border-t border-slate-100 flex flex-wrap gap-2">
                                <Badge variant={trainer.is_internal ? 'primary' : 'warning'}>
                                    {trainer.is_internal ? 'داخلي' : 'خارجي'}
                                </Badge>
                                <Badge variant={trainer.is_active ? 'success' : 'danger'}>
                                    {trainer.is_active ? 'نشط' : 'غير نشط'}
                                </Badge>
                                <Badge variant={trainer.gender === 'male' ? 'info' : 'danger'}>
                                    {trainer.gender === 'male' ? 'ذكر' : 'أنثى'}
                                </Badge>
                            </div>

                            <div className="mt-4 flex items-center gap-4 text-xs">
                                <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded-lg font-medium flex items-center gap-1">
                                    <Layers className="h-3.5 w-3.5" />
                                    {trainer.program_groups_count} مجموعة
                                </span>
                                <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded-lg font-medium flex items-center gap-1">
                                    <Calendar className="h-3.5 w-3.5" />
                                    {trainer.training_sessions_count} جلسة
                                </span>
                            </div>

                            {(trainer.email || trainer.phone) && (
                                <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5">
                                    {trainer.email && (
                                        <p className="text-xs text-slate-500 flex items-center gap-1.5">
                                            <Mail className="h-3.5 w-3.5" />
                                            {trainer.email}
                                        </p>
                                    )}
                                    {trainer.phone && (
                                        <p className="text-xs text-slate-500 flex items-center gap-1.5">
                                            <Phone className="h-3.5 w-3.5" />
                                            {trainer.phone}
                                        </p>
                                    )}
                                </div>
                            )}

                            <button
                                onClick={() => handleViewTrainer(trainer)}
                                className="mt-4 w-full py-2 text-sm text-teal-600 hover:text-teal-700 hover:bg-teal-50 rounded-lg transition-colors font-medium"
                            >
                                عرض التفاصيل والبرامج
                            </button>
                        </Card>
                    ))
                )}
            </div>

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
                        <Input
                            label="التخصص"
                            value={form.data.specialization}
                            onChange={(e) => form.setData('specialization', e.target.value)}
                            error={form.errors.specialization}
                        />
                        <Textarea
                            label="نبذة"
                            value={form.data.bio}
                            onChange={(e) => form.setData('bio', e.target.value)}
                            error={form.errors.bio}
                            rows={3}
                        />
                        <div className="flex items-center gap-4">
                            <label className="flex items-center gap-2 cursor-pointer group">
                                <input
                                    type="checkbox"
                                    checked={form.data.is_internal}
                                    onChange={(e) => form.setData('is_internal', e.target.checked)}
                                    className="w-4 h-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                                />
                                <span className="text-sm text-slate-700 group-hover:text-slate-900">مدرب داخلي</span>
                            </label>
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
                    </>
                )}
            </FormModal>

            <DeleteModal
                open={!!deleting}
                onClose={() => setDeleting(null)}
                action={deleting ? route('trainers.destroy', deleting.id) : ''}
                message={`هل أنت متأكد من حذف المدرب "${deleting?.name}"؟`}
            />

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
                                {viewing.specialization && (
                                    <p className="text-slate-500 mt-1">{viewing.specialization}</p>
                                )}
                                <div className="flex flex-wrap gap-2 mt-3">
                                    <Badge variant={viewing.is_internal ? 'primary' : 'warning'}>
                                        {viewing.is_internal ? 'مدرب داخلي' : 'مدرب خارجي'}
                                    </Badge>
                                    <Badge variant={viewing.is_active ? 'success' : 'danger'}>
                                        {viewing.is_active ? 'نشط' : 'غير نشط'}
                                    </Badge>
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

                        {(viewing.email || viewing.phone || viewing.bio) && (
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
                                    {viewing.bio && (
                                        <p className="text-sm text-slate-600 mt-3 pt-3 border-t border-slate-200">
                                            {viewing.bio}
                                        </p>
                                    )}
                                </div>
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
