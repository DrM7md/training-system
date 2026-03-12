import AuthenticatedLayout from '@/Components/Layout/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';
import { Plus, Edit2, Trash2, Package, Clock, Calendar, Users, User, Building2, Layers, Target, BookOpen, Eye } from 'lucide-react';
import Card, { CardHeader } from '@/Components/UI/Card';
import Button from '@/Components/UI/Button';
import Badge from '@/Components/UI/Badge';
import PageHeader from '@/Components/UI/PageHeader';
import FormModal from '@/Components/UI/FormModal';
import DeleteModal from '@/Components/UI/DeleteModal';
import Input from '@/Components/UI/Input';
import Textarea from '@/Components/UI/Textarea';
import SearchableSelect from '@/Components/UI/SearchableSelect';

interface GroupType {
    id: number;
    name: string;
    status: string;
    gender: string;
    capacity: number;
    trainer: { name: string } | null;
    training_hall: { id: number; name: string; capacity: number } | null;
}

interface PackageType {
    id: number;
    name: string;
    description: string | null;
    hours: number;
    days: number;
    supervisor: { id: number; name: string } | null;
    program_groups: GroupType[];
}

interface TrainingHall {
    id: number;
    name: string;
    capacity: number;
}

interface Program {
    id: number;
    name: string;
    type: string;
    status: string;
    hours: number;
    target_count: number;
    male_count: number;
    female_count: number;
    academic_year: { id: number; name: string };
    supervisor: { id: number; name: string } | null;
    packages: PackageType[];
}

interface Props {
    program: Program;
    supervisors: Array<{ id: number; name: string }>;
    halls: TrainingHall[];
    hoursPerDay: number;
    usedHours: number;
}

const genderLabels: Record<string, string> = {
    male: 'ذكور',
    female: 'إناث',
    mixed: 'مختلط',
};

const statusLabels: Record<string, { label: string; variant: 'success' | 'warning' | 'danger' | 'info' | 'default' }> = {
    scheduled: { label: 'مجدول', variant: 'info' },
    in_progress: { label: 'قيد التنفيذ', variant: 'warning' },
    completed: { label: 'مكتمل', variant: 'success' },
    cancelled: { label: 'ملغي', variant: 'danger' },
};

export default function Show({ program, supervisors, halls, hoursPerDay, usedHours }: Props) {
    const [showPackageForm, setShowPackageForm] = useState(false);
    const [editingPackage, setEditingPackage] = useState<PackageType | null>(null);
    const [deletingPackage, setDeletingPackage] = useState<PackageType | null>(null);

    const remainingHours = program.hours - usedHours;
    const totalGroups = program.packages.reduce((sum, p) => sum + p.program_groups.length, 0);
    const hoursPercent = program.hours > 0 ? Math.min(100, (usedHours / program.hours) * 100) : 0;

    const packageInitialData = editingPackage
        ? {
              program_id: program.id,
              name: editingPackage.name,
              description: editingPackage.description || '',
              hours: editingPackage.hours,
              days: editingPackage.days,
              supervisor_id: editingPackage.supervisor?.id || '',
              auto_create_groups: false,
          }
        : {
              program_id: program.id,
              name: '',
              description: '',
              hours: Math.min(5, Math.max(0, remainingHours)),
              days: Math.ceil(Math.min(5, Math.max(0, remainingHours)) / hoursPerDay) || 1,
              supervisor_id: '',
              auto_create_groups: true,
          };

    const supervisorOptions = supervisors.map(s => ({
        value: s.id,
        label: s.name,
    }));

    return (
        <AuthenticatedLayout>
            <Head title={program.name} />

            <PageHeader
                title={program.name}
                breadcrumbs={[
                    { label: 'البرامج التدريبية', href: route('programs.index') },
                    { label: program.name },
                ]}
                action={
                    <Button
                        size="sm"
                        icon={<Plus className="h-4 w-4" />}
                        onClick={() => setShowPackageForm(true)}
                    >
                        إضافة حقيبة
                    </Button>
                }
            />

            {/* Summary Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center gap-3">
                    <div className="p-2.5 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl shadow-sm">
                        <Package className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        <p className="text-xs text-slate-500">الحقائب</p>
                        <p className="text-lg font-bold text-slate-800">{program.packages.length}</p>
                    </div>
                </div>
                <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center gap-3">
                    <div className="p-2.5 bg-gradient-to-br from-violet-500 to-violet-600 rounded-xl shadow-sm">
                        <Layers className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        <p className="text-xs text-slate-500">المجموعات</p>
                        <p className="text-lg font-bold text-slate-800">{totalGroups}</p>
                    </div>
                </div>
                <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center gap-3">
                    <div className="p-2.5 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl shadow-sm">
                        <Clock className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        <p className="text-xs text-slate-500">الساعات</p>
                        <p className="text-lg font-bold text-slate-800">
                            <span className="text-amber-600">{usedHours}</span>
                            <span className="text-slate-400 text-sm font-normal"> / {program.hours}</span>
                        </p>
                    </div>
                </div>
                <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center gap-3">
                    <div className="p-2.5 bg-gradient-to-br from-sky-500 to-sky-600 rounded-xl shadow-sm">
                        <Target className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        <p className="text-xs text-slate-500">المستهدفين</p>
                        <p className="text-lg font-bold text-slate-800">{program.target_count}</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    {/* Packages */}
                    {program.packages.length === 0 ? (
                        <Card>
                            <div className="text-center py-16 text-slate-500">
                                <Package className="h-14 w-14 mx-auto text-slate-300 mb-3" />
                                <p className="font-semibold text-lg">لا توجد حقائب تدريبية</p>
                                <p className="text-sm text-slate-400 mt-1">ابدأ بإضافة حقيبة تدريبية جديدة</p>
                                <Button
                                    size="sm"
                                    className="mt-4"
                                    icon={<Plus className="h-4 w-4" />}
                                    onClick={() => setShowPackageForm(true)}
                                >
                                    إضافة حقيبة
                                </Button>
                            </div>
                        </Card>
                    ) : (
                        program.packages.map((pkg) => (
                            <Card key={pkg.id} padding="none">
                                {/* Package Header */}
                                <div className="p-5 flex items-start justify-between">
                                    <div className="flex items-start gap-4">
                                        <div className="p-3 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl shadow-md shadow-teal-200/50">
                                            <Package className="h-6 w-6 text-white" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-slate-800">{pkg.name}</h3>
                                            {pkg.description && (
                                                <p className="text-sm text-slate-500 mt-0.5">{pkg.description}</p>
                                            )}
                                            <div className="flex flex-wrap items-center gap-3 mt-3">
                                                <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg">
                                                    <Clock className="h-3.5 w-3.5" />
                                                    {pkg.hours} ساعة
                                                </span>
                                                <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg">
                                                    <Calendar className="h-3.5 w-3.5" />
                                                    {pkg.days} يوم
                                                </span>
                                                <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 bg-emerald-100 text-emerald-700 rounded-lg">
                                                    <Users className="h-3.5 w-3.5" />
                                                    {pkg.program_groups.length} مجموعة
                                                </span>
                                                {pkg.supervisor && (
                                                    <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 bg-violet-100 text-violet-700 rounded-lg">
                                                        <User className="h-3.5 w-3.5" />
                                                        {pkg.supervisor.name}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={() => {
                                                setEditingPackage(pkg);
                                                setShowPackageForm(true);
                                            }}
                                            className="p-2 rounded-lg hover:bg-teal-100 text-teal-600 transition-colors"
                                            title="تعديل"
                                        >
                                            <Edit2 className="h-4 w-4" />
                                        </button>
                                        <button
                                            onClick={() => setDeletingPackage(pkg)}
                                            className="p-2 rounded-lg hover:bg-red-100 text-red-600 transition-colors"
                                            title="حذف"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>

                                {/* Groups Grid */}
                                {pkg.program_groups.length > 0 && (
                                    <div className="border-t border-slate-100 p-5 pt-4">
                                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">المجموعات</p>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            {pkg.program_groups.map((group) => (
                                                <Link
                                                    key={group.id}
                                                    href={route('groups.show', group.id)}
                                                    className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl hover:border-teal-300 hover:bg-teal-50/30 transition-all group"
                                                >
                                                    <div className="flex items-center gap-3 min-w-0">
                                                        <div className={`w-2 h-8 rounded-full flex-shrink-0 ${
                                                            group.gender === 'male' ? 'bg-sky-400' :
                                                            group.gender === 'female' ? 'bg-pink-400' : 'bg-slate-400'
                                                        }`} />
                                                        <div className="min-w-0">
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-sm font-semibold text-slate-700">{group.name}</span>
                                                                <span className="text-[11px] text-slate-400">({genderLabels[group.gender]})</span>
                                                            </div>
                                                            <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500">
                                                                {group.training_hall && (
                                                                    <span className="flex items-center gap-1">
                                                                        <Building2 className="h-3 w-3" />
                                                                        {group.training_hall.name}
                                                                    </span>
                                                                )}
                                                                <span>{group.capacity} متدرب</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2 flex-shrink-0">
                                                        <Badge variant={statusLabels[group.status]?.variant || 'default'} size="sm">
                                                            {statusLabels[group.status]?.label || group.status}
                                                        </Badge>
                                                        <Eye className="h-4 w-4 text-slate-300 group-hover:text-teal-500 transition-colors" />
                                                    </div>
                                                </Link>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </Card>
                        ))
                    )}
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Program Info */}
                    <Card>
                        <CardHeader title="معلومات البرنامج" />
                        <dl className="space-y-4">
                            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                                <BookOpen className="h-5 w-5 text-teal-500 flex-shrink-0" />
                                <div>
                                    <dt className="text-xs text-slate-500">العام الدراسي</dt>
                                    <dd className="text-sm font-semibold text-slate-700">{program.academic_year.name}</dd>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                                <Layers className="h-5 w-5 text-violet-500 flex-shrink-0" />
                                <div>
                                    <dt className="text-xs text-slate-500">النوع</dt>
                                    <dd className="text-sm font-semibold text-slate-700">{program.type}</dd>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                                <User className="h-5 w-5 text-sky-500 flex-shrink-0" />
                                <div>
                                    <dt className="text-xs text-slate-500">المشرف</dt>
                                    <dd className="text-sm font-semibold text-slate-700">{program.supervisor?.name || 'لم يحدد'}</dd>
                                </div>
                            </div>
                        </dl>
                    </Card>

                    {/* Hours */}
                    <Card>
                        <CardHeader title="الساعات التدريبية" />
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-slate-500">التقدم</span>
                                <span className="text-sm font-bold text-slate-700">{Math.round(hoursPercent)}%</span>
                            </div>
                            <div className="w-full bg-slate-200 rounded-full h-3">
                                <div
                                    className={`h-3 rounded-full transition-all ${hoursPercent >= 100 ? 'bg-red-500' : 'bg-gradient-to-l from-teal-400 to-teal-600'}`}
                                    style={{ width: `${hoursPercent}%` }}
                                />
                            </div>
                            <div className="grid grid-cols-3 gap-2 text-center">
                                <div className="p-2 bg-slate-50 rounded-lg">
                                    <p className="text-lg font-bold text-slate-700">{program.hours}</p>
                                    <p className="text-[10px] text-slate-500">إجمالي</p>
                                </div>
                                <div className="p-2 bg-amber-50 rounded-lg">
                                    <p className="text-lg font-bold text-amber-600">{usedHours}</p>
                                    <p className="text-[10px] text-amber-600">مستخدمة</p>
                                </div>
                                <div className={`p-2 rounded-lg ${remainingHours > 0 ? 'bg-emerald-50' : 'bg-red-50'}`}>
                                    <p className={`text-lg font-bold ${remainingHours > 0 ? 'text-emerald-600' : 'text-red-600'}`}>{remainingHours}</p>
                                    <p className={`text-[10px] ${remainingHours > 0 ? 'text-emerald-600' : 'text-red-600'}`}>متبقية</p>
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Target Audience */}
                    <Card>
                        <CardHeader title="الفئة المستهدفة" />
                        <div className="space-y-3">
                            <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                                <span className="text-sm text-slate-500">العدد الإجمالي</span>
                                <span className="text-lg font-bold text-slate-700">{program.target_count}</span>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="p-3 bg-sky-50 border border-sky-100 rounded-xl text-center">
                                    <p className="text-xl font-bold text-sky-600">{program.male_count}</p>
                                    <p className="text-xs text-sky-500 mt-0.5">ذكور</p>
                                </div>
                                <div className="p-3 bg-pink-50 border border-pink-100 rounded-xl text-center">
                                    <p className="text-xl font-bold text-pink-600">{program.female_count}</p>
                                    <p className="text-xs text-pink-500 mt-0.5">إناث</p>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>

            <FormModal
                open={showPackageForm}
                onClose={() => {
                    setShowPackageForm(false);
                    setEditingPackage(null);
                }}
                title={editingPackage ? 'تعديل الحقيبة' : 'إضافة حقيبة تدريبية'}
                initialData={packageInitialData}
                action={editingPackage ? route('packages.update', editingPackage.id) : route('packages.store')}
                method={editingPackage ? 'put' : 'post'}
                size="lg"
            >
                {(form) => (
                    <>
                        <Input
                            label="اسم الحقيبة"
                            value={form.data.name}
                            onChange={(e) => form.setData('name', e.target.value)}
                            error={form.errors.name}
                            placeholder="أدخل اسم الحقيبة التدريبية"
                            required
                        />
                        <Textarea
                            label="الوصف"
                            value={form.data.description}
                            onChange={(e) => form.setData('description', e.target.value)}
                            error={form.errors.description}
                            placeholder="وصف مختصر للحقيبة..."
                            rows={3}
                        />
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Input
                                    label="عدد الساعات"
                                    type="number"
                                    min={1}
                                    max={editingPackage ? remainingHours + editingPackage.hours : remainingHours}
                                    value={form.data.hours}
                                    onChange={(e) => {
                                        const hours = Number.parseInt(e.target.value) || 0;
                                        form.setData({
                                            ...form.data,
                                            hours,
                                            days: Math.ceil(hours / hoursPerDay) || 1,
                                        });
                                    }}
                                    error={form.errors.hours}
                                    required
                                />
                                {!editingPackage && (
                                    <p className={`text-xs mt-1 ${remainingHours > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                                        المتبقي: {remainingHours} ساعة من {program.hours}
                                    </p>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1.5">عدد الأيام</label>
                                <div className="px-4 py-2.5 border border-slate-200 rounded-xl bg-slate-50 text-sm font-bold text-teal-700">
                                    {form.data.days} يوم
                                    <span className="text-xs text-slate-400 font-normal mr-2">({hoursPerDay} ساعات/يوم)</span>
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

                        {!editingPackage && (program.target_count > 0 || program.male_count > 0 || program.female_count > 0) && (
                            <div className="p-4 bg-teal-50 border border-teal-200 rounded-xl space-y-3">
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={form.data.auto_create_groups}
                                        onChange={(e) => form.setData('auto_create_groups', e.target.checked)}
                                        className="w-5 h-5 rounded border-teal-300 text-teal-600 focus:ring-teal-500"
                                    />
                                    <span className="font-semibold text-teal-800">إنشاء المجموعات تلقائياً</span>
                                </label>

                                {form.data.auto_create_groups && (
                                    <div className="text-sm text-teal-700 space-y-1 pr-8">
                                        <p>سيتم إنشاء المجموعات بناءً على العدد المستهدف وتوزيعها على القاعات المتاحة:</p>
                                        <div className="flex flex-wrap gap-3 mt-2">
                                            {program.male_count > 0 && (
                                                <span className="px-3 py-1 bg-sky-100 text-sky-700 rounded-lg">
                                                    ذكور: {program.male_count} = {Math.ceil(program.male_count / 25)} مجموعة
                                                </span>
                                            )}
                                            {program.female_count > 0 && (
                                                <span className="px-3 py-1 bg-pink-100 text-pink-700 rounded-lg">
                                                    إناث: {program.female_count} = {Math.ceil(program.female_count / 25)} مجموعة
                                                </span>
                                            )}
                                            {program.male_count === 0 && program.female_count === 0 && program.target_count > 0 && (
                                                <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-lg">
                                                    مختلط: {program.target_count} = {Math.ceil(program.target_count / 25)} مجموعة
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs text-teal-600 mt-2">
                                            القاعات المتاحة: {halls.length} قاعة
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}
                    </>
                )}
            </FormModal>

            <DeleteModal
                open={!!deletingPackage}
                onClose={() => setDeletingPackage(null)}
                action={deletingPackage ? route('packages.destroy', deletingPackage.id) : ''}
                message={`هل أنت متأكد من حذف الحقيبة "${deletingPackage?.name}"؟`}
            />
        </AuthenticatedLayout>
    );
}
