import AuthenticatedLayout from '@/Components/Layout/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { Plus, Edit2, Trash2, Package, Clock, Calendar, Search, ChevronDown, ChevronUp, BookOpen, User, Layers, Eye, Users, Minimize2, Maximize2, X, Download } from 'lucide-react';
import Card from '@/Components/UI/Card';
import Button from '@/Components/UI/Button';
import Badge from '@/Components/UI/Badge';
import PageHeader from '@/Components/UI/PageHeader';
import FormModal from '@/Components/UI/FormModal';
import DeleteModal from '@/Components/UI/DeleteModal';
import Modal, { ModalFooter } from '@/Components/UI/Modal';
import Input from '@/Components/UI/Input';
import SearchableSelect from '@/Components/UI/SearchableSelect';
import Textarea from '@/Components/UI/Textarea';
import clsx from 'clsx';

interface Program {
    id: number;
    name: string;
    academic_year_id: number;
    hours: number;
    target_count: number;
    male_count: number;
    female_count: number;
    academic_year?: {
        id: number;
        name: string;
    };
}

interface UserType {
    id: number;
    name: string;
}

interface GroupType {
    id: number;
    name: string;
    gender: string;
    capacity: number;
    trainees_count: number;
    status: string;
}

interface PackageItem {
    id: number;
    program_id: number;
    name: string;
    description: string | null;
    hours: number;
    days: number;
    supervisor_id: number | null;
    supervisor?: UserType | null;
    program_groups_count: number;
    program_groups?: GroupType[];
    program?: Program;
}

interface GroupedPackages {
    program: Program;
    packages: PackageItem[];
}

interface TrainingHall {
    id: number;
    name: string;
    capacity: number;
}

interface Props {
    packages: {
        data: PackageItem[];
        current_page: number;
        last_page: number;
    };
    programs: Program[];
    supervisors: UserType[];
    halls: TrainingHall[];
    filters: {
        search?: string;
        program_id?: string;
    };
    hoursPerDay: number;
}

const statusLabels: Record<string, { label: string; variant: 'success' | 'warning' | 'danger' | 'info' | 'default' | 'primary' }> = {
    scheduled: { label: 'مجدول', variant: 'info' },
    in_progress: { label: 'قيد التنفيذ', variant: 'warning' },
    completed: { label: 'مكتمل', variant: 'success' },
    cancelled: { label: 'ملغي', variant: 'danger' },
};

const genderLabels: Record<string, string> = {
    male: 'ذكور',
    female: 'إناث',
    mixed: 'مختلط',
};

export default function Index({ packages, programs, supervisors, halls, filters, hoursPerDay }: Props) {
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState<PackageItem | null>(null);
    const [deleting, setDeleting] = useState<PackageItem | null>(null);
    const [viewingDetails, setViewingDetails] = useState<PackageItem | null>(null);
    const [search, setSearch] = useState(filters.search || '');
    const [programFilter, setProgramFilter] = useState(filters.program_id || '');

    const groupedPackages: GroupedPackages[] = packages.data.reduce((acc: GroupedPackages[], pkg) => {
        if (!pkg.program) return acc;

        const existingGroup = acc.find(g => g.program.id === pkg.program!.id);
        if (existingGroup) {
            existingGroup.packages.push(pkg);
        } else {
            acc.push({
                program: pkg.program,
                packages: [pkg],
            });
        }
        return acc;
    }, []);

    const allProgramIds = groupedPackages.map(g => g.program.id);
    const [collapsedPrograms, setCollapsedPrograms] = useState<number[]>(allProgramIds);
    const [allCollapsed, setAllCollapsed] = useState(true);

    const initialData = editing
        ? {
              program_id: editing.program_id,
              name: editing.name,
              description: editing.description || '',
              hours: editing.hours,
              days: editing.days,
              supervisor_id: editing.supervisor_id || '',
              auto_create_groups: false,
          }
        : { program_id: '', name: '', description: '', hours: 5, days: 1, supervisor_id: '', auto_create_groups: true };

    const handleEdit = (pkg: PackageItem) => {
        setEditing(pkg);
        setShowForm(true);
    };

    const handleClose = () => {
        setShowForm(false);
        setEditing(null);
    };

    const doSearch = (s: string, p: string) => {
        router.get(route('packages.index'), {
            search: s || undefined,
            program_id: p || undefined,
        }, { preserveState: true, preserveScroll: true });
    };

    const [searchTimer, setSearchTimer] = useState<ReturnType<typeof setTimeout> | null>(null);
    const handleSearchChange = (val: string) => {
        setSearch(val);
        if (searchTimer) clearTimeout(searchTimer);
        setSearchTimer(setTimeout(() => doSearch(val, programFilter), 400));
    };

    const handleProgramChange = (val: string) => {
        setProgramFilter(val);
        doSearch(search, val);
    };

    const clearProgram = () => {
        setProgramFilter('');
        doSearch(search, '');
    };

    const toggleProgramCollapse = (programId: number) => {
        setCollapsedPrograms(prev => 
            prev.includes(programId) 
                ? prev.filter(id => id !== programId)
                : [...prev, programId]
        );
    };

    const isExpanded = (programId: number) => !collapsedPrograms.includes(programId);

    const toggleAllCollapse = () => {
        if (allCollapsed) {
            setCollapsedPrograms([]);
        } else {
            setCollapsedPrograms(allProgramIds);
        }
        setAllCollapsed(!allCollapsed);
    };

    const programOptions = programs.map(p => ({
        value: p.id,
        label: p.name,
        subLabel: p.academic_year?.name,
    }));

    const supervisorOptions = supervisors.map(s => ({
        value: s.id,
        label: s.name,
    }));

    const handleViewPackage = (pkg: PackageItem) => {
        router.reload({
            only: ['packageDetails'],
            data: { package_id: pkg.id },
            onSuccess: () => {
                setViewingDetails(pkg);
            },
        });
        setViewingDetails(pkg);
    };

    const getSelectedProgram = (programId: string | number) => {
        return programs.find(p => p.id === Number(programId));
    };

    return (
        <AuthenticatedLayout>
            <Head title="الحقائب التدريبية" />

            <PageHeader
                title="الحقائب التدريبية"
                description="إدارة الحقائب التدريبية المرتبطة بالبرامج"
                action={
                    <div className="flex items-center gap-2">
                        <a href={route('export.packages')} className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-colors">
                            <Download className="h-4 w-4" />
                            تصدير Excel
                        </a>
                        <Button icon={<Plus className="h-4 w-4" />} onClick={() => setShowForm(true)}>
                            إضافة حقيبة
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
                            placeholder="البحث في الحقائب..."
                            value={search}
                            onChange={(e) => handleSearchChange(e.target.value)}
                            className="w-full pr-10 pl-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all"
                        />
                    </div>
                    <div className="sm:w-64 relative">
                        <SearchableSelect
                            value={programFilter}
                            onChange={(val) => handleProgramChange(String(val))}
                            options={programOptions}
                            placeholder="كل البرامج"
                            searchPlaceholder="بحث في البرامج..."
                        />
                        {programFilter && (
                            <button
                                type="button"
                                onClick={clearProgram}
                                className="absolute left-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition-colors z-10"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        )}
                    </div>
                </div>
            </Card>

            {groupedPackages.length === 0 ? (
                <Card>
                    <div className="text-center py-12 text-slate-500">
                        <Package className="h-14 w-14 mx-auto text-slate-300 mb-3" />
                        <p className="font-medium">لا توجد حقائب تدريبية</p>
                        <p className="text-sm text-slate-400 mt-1">ابدأ بإضافة حقيبة جديدة</p>
                    </div>
                </Card>
            ) : (
                <div className="space-y-6">
                    <div className="flex justify-end">
                        <Button
                            variant="ghost"
                            size="sm"
                            icon={allCollapsed ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
                            onClick={toggleAllCollapse}
                        >
                            {allCollapsed ? 'فتح الكل' : 'طي الكل'}
                        </Button>
                    </div>

                    {groupedPackages.map((group) => (
                        <Card key={group.program.id} padding="none">
                            <button
                                type="button"
                                onClick={() => toggleProgramCollapse(group.program.id)}
                                className="w-full p-4 flex items-center justify-between bg-gradient-to-l from-slate-50 to-white hover:from-slate-100 hover:to-slate-50 transition-colors rounded-t-2xl"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl shadow-md shadow-emerald-200/50">
                                        <BookOpen className="h-6 w-6 text-white" />
                                    </div>
                                    <div className="text-right">
                                        <h2 className="text-lg font-bold text-slate-800">{group.program.name}</h2>
                                        <div className="flex items-center gap-3 text-sm text-slate-500 mt-1">
                                            <span>{group.program.academic_year?.name}</span>
                                            <span className="flex items-center gap-1">
                                                <Clock className="h-4 w-4" />
                                                {group.program.hours || 0} ساعة
                                            </span>
                                            <Badge variant="primary">{group.packages.length} حقيبة</Badge>
                                        </div>
                                    </div>
                                </div>
                                {isExpanded(group.program.id) ? (
                                    <ChevronUp className="h-5 w-5 text-slate-400" />
                                ) : (
                                    <ChevronDown className="h-5 w-5 text-slate-400" />
                                )}
                            </button>

                            {isExpanded(group.program.id) && (
                                <div className="p-4 pt-0">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 border-t border-slate-100">
                                        {group.packages.map((pkg) => (
                                            <div
                                                key={pkg.id}
                                                className="relative group p-4 bg-slate-50/50 border border-slate-200 rounded-xl hover:border-teal-300 hover:shadow-md transition-all"
                                            >
                                                <div className="absolute top-3 left-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => setViewingDetails(pkg)}
                                                        className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors"
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleEdit(pkg)}
                                                        className="p-1.5 rounded-lg hover:bg-teal-100 text-teal-600 transition-colors"
                                                    >
                                                        <Edit2 className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => setDeleting(pkg)}
                                                        className="p-1.5 rounded-lg hover:bg-red-100 text-red-600 transition-colors"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>

                                                <div className="flex items-start gap-3">
                                                    <div className="p-2.5 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl shadow-md shadow-teal-200/50">
                                                        <Package className="h-5 w-5 text-white" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h3 className="font-bold text-slate-800">{pkg.name}</h3>
                                                        {pkg.description && (
                                                            <p className="text-sm text-slate-500 mt-1 line-clamp-2">{pkg.description}</p>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="mt-4 flex flex-wrap gap-2">
                                                    <span className="flex items-center gap-1 text-xs px-2 py-1 bg-white border border-slate-200 rounded-lg text-slate-600">
                                                        <Clock className="h-3.5 w-3.5" />
                                                        {pkg.hours} ساعة
                                                    </span>
                                                    <span className="flex items-center gap-1 text-xs px-2 py-1 bg-white border border-slate-200 rounded-lg text-slate-600">
                                                        <Calendar className="h-3.5 w-3.5" />
                                                        {pkg.days} يوم
                                                    </span>
                                                    <span className="flex items-center gap-1 text-xs px-2 py-1 bg-emerald-100 text-emerald-700 rounded-lg font-medium">
                                                        <Layers className="h-3.5 w-3.5" />
                                                        {pkg.program_groups_count} مجموعة
                                                    </span>
                                                </div>

                                                {pkg.supervisor && (
                                                    <div className="mt-3 pt-3 border-t border-slate-200">
                                                        <span className="flex items-center gap-1.5 text-sm text-slate-500">
                                                            <User className="h-4 w-4" />
                                                            المشرف: <span className="font-semibold text-slate-700">{pkg.supervisor.name}</span>
                                                        </span>
                                                    </div>
                                                )}

                                                <button
                                                    onClick={() => setViewingDetails(pkg)}
                                                    className="mt-3 w-full py-2 text-sm text-teal-600 hover:text-teal-700 hover:bg-teal-50 rounded-lg transition-colors font-medium"
                                                >
                                                    عرض التفاصيل والمجموعات
                                                </button>
                                            </div>
                                        ))}

                                        <button
                                            onClick={() => {
                                                setEditing(null);
                                                setShowForm(true);
                                            }}
                                            className="flex items-center justify-center gap-2 p-4 border-2 border-dashed border-slate-200 rounded-xl text-slate-400 hover:border-teal-400 hover:text-teal-600 hover:bg-teal-50/50 transition-all min-h-[150px]"
                                        >
                                            <Plus className="h-5 w-5" />
                                            <span>إضافة حقيبة</span>
                                        </button>
                                    </div>
                                </div>
                            )}
                        </Card>
                    ))}
                </div>
            )}

            <FormModal
                open={showForm}
                onClose={handleClose}
                title={editing ? 'تعديل الحقيبة' : 'إضافة حقيبة تدريبية'}
                initialData={initialData}
                action={editing ? route('packages.update', editing.id) : route('packages.store')}
                method={editing ? 'put' : 'post'}
                size="lg"
            >
                {(form) => {
                    const selectedProgram = getSelectedProgram(form.data.program_id);
                    
                    return (
                        <>
                            {!editing && (
                                <SearchableSelect
                                    label="البرنامج التدريبي"
                                    value={form.data.program_id}
                                    onChange={(val) => form.setData('program_id', val)}
                                    options={programOptions}
                                    placeholder="اختر البرنامج"
                                    searchPlaceholder="بحث في البرامج..."
                                    error={form.errors.program_id}
                                    required
                                />
                            )}
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
                                <Input
                                    label="عدد الساعات"
                                    type="number"
                                    min={1}
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
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">عدد الأيام</label>
                                    <div className="px-4 py-2.5 border border-slate-200 rounded-xl bg-slate-50 text-sm font-bold text-teal-700">
                                        {form.data.days} يوم
                                        <span className="text-xs text-slate-400 font-normal mr-2">({hoursPerDay} ساعات/يوم)</span>
                                    </div>
                                    <input type="hidden" value={form.data.days} />
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

                            {!editing && selectedProgram && (selectedProgram.target_count > 0 || selectedProgram.male_count > 0 || selectedProgram.female_count > 0) && (
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
                                            <p>سيتم إنشاء المجموعات بناءً على العدد المستهدف للبرنامج:</p>
                                            <div className="flex flex-wrap gap-3 mt-2">
                                                {selectedProgram.male_count > 0 && (
                                                    <span className="px-3 py-1 bg-sky-100 text-sky-700 rounded-lg">
                                                        ذكور: {selectedProgram.male_count} = {Math.ceil(selectedProgram.male_count / 25)} مجموعة
                                                    </span>
                                                )}
                                                {selectedProgram.female_count > 0 && (
                                                    <span className="px-3 py-1 bg-pink-100 text-pink-700 rounded-lg">
                                                        إناث: {selectedProgram.female_count} = {Math.ceil(selectedProgram.female_count / 25)} مجموعة
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </>
                    );
                }}
            </FormModal>

            <DeleteModal
                open={!!deleting}
                onClose={() => setDeleting(null)}
                action={deleting ? route('packages.destroy', deleting.id) : ''}
                message={`هل أنت متأكد من حذف الحقيبة "${deleting?.name}"؟`}
            />

            <Modal
                open={!!viewingDetails}
                onClose={() => setViewingDetails(null)}
                title="تفاصيل الحقيبة التدريبية"
                size="xl"
            >
                {viewingDetails && (
                    <div className="space-y-6">
                        <div className="flex items-start gap-4 p-4 bg-gradient-to-l from-teal-50 to-emerald-50 rounded-xl">
                            <div className="p-4 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl shadow-lg">
                                <Package className="h-8 w-8 text-white" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-xl font-bold text-slate-800">{viewingDetails.name}</h3>
                                {viewingDetails.program && (
                                    <p className="text-slate-500 mt-1">{viewingDetails.program.name}</p>
                                )}
                                {viewingDetails.description && (
                                    <p className="text-sm text-slate-600 mt-2">{viewingDetails.description}</p>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            <div className="p-4 bg-slate-50 rounded-xl text-center">
                                <Clock className="h-6 w-6 text-slate-500 mx-auto mb-2" />
                                <p className="text-2xl font-bold text-slate-700">{viewingDetails.hours}</p>
                                <p className="text-sm text-slate-500">ساعة</p>
                            </div>
                            <div className="p-4 bg-slate-50 rounded-xl text-center">
                                <Calendar className="h-6 w-6 text-slate-500 mx-auto mb-2" />
                                <p className="text-2xl font-bold text-slate-700">{viewingDetails.days}</p>
                                <p className="text-sm text-slate-500">يوم</p>
                            </div>
                            <div className="p-4 bg-emerald-50 rounded-xl text-center">
                                <Layers className="h-6 w-6 text-emerald-600 mx-auto mb-2" />
                                <p className="text-2xl font-bold text-emerald-700">{viewingDetails.program_groups_count}</p>
                                <p className="text-sm text-emerald-600">مجموعة</p>
                            </div>
                            <div className="p-4 bg-violet-50 rounded-xl text-center">
                                <User className="h-6 w-6 text-violet-600 mx-auto mb-2" />
                                <p className="text-lg font-bold text-violet-700">{viewingDetails.supervisor?.name || '-'}</p>
                                <p className="text-sm text-violet-600">المشرف</p>
                            </div>
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <h4 className="font-semibold text-slate-700 flex items-center gap-2">
                                    <Users className="h-5 w-5" />
                                    المجموعات ({viewingDetails.program_groups?.length || 0})
                                </h4>
                                <Link
                                    href={route('groups.index', { package_id: viewingDetails.id })}
                                    className="text-sm text-teal-600 hover:text-teal-700 font-medium"
                                >
                                    عرض الكل
                                </Link>
                            </div>
                            {viewingDetails.program_groups && viewingDetails.program_groups.length > 0 ? (
                                <div className="space-y-2 max-h-48 overflow-y-auto">
                                    {viewingDetails.program_groups.map((group) => (
                                        <Link
                                            key={group.id}
                                            href={route('groups.show', group.id)}
                                            className="flex items-center justify-between p-3 border border-slate-200 rounded-xl hover:border-teal-300 hover:bg-teal-50/50 transition-all"
                                        >
                                            <div>
                                                <span className="font-semibold text-slate-700">{group.name}</span>
                                                <span className="text-sm text-slate-500 mr-2">
                                                    ({genderLabels[group.gender]})
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm text-slate-500">
                                                    {group.trainees_count}/{group.capacity}
                                                </span>
                                                <Badge variant={statusLabels[group.status]?.variant || 'default'}>
                                                    {statusLabels[group.status]?.label || group.status}
                                                </Badge>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-slate-500 bg-slate-50 rounded-xl">
                                    <Layers className="h-10 w-10 mx-auto text-slate-300 mb-2" />
                                    <p>لا توجد مجموعات</p>
                                </div>
                            )}
                        </div>

                        <ModalFooter>
                            <Button
                                variant="secondary"
                                onClick={() => setViewingDetails(null)}
                            >
                                إغلاق
                            </Button>
                            <Link href={route('groups.index', { package_id: viewingDetails.id })}>
                                <Button icon={<Plus className="h-4 w-4" />}>
                                    إدارة المجموعات
                                </Button>
                            </Link>
                        </ModalFooter>
                    </div>
                )}
            </Modal>
        </AuthenticatedLayout>
    );
}
