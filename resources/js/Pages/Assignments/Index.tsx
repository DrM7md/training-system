import AuthenticatedLayout from '@/Components/Layout/AuthenticatedLayout';
import { Head, router, useForm } from '@inertiajs/react';
import { useState, useMemo } from 'react';
import { Plus, Edit2, Trash2, Search, X, FileText, Printer, ClipboardList } from 'lucide-react';
import Card from '@/Components/UI/Card';
import Button from '@/Components/UI/Button';
import Badge from '@/Components/UI/Badge';
import PageHeader from '@/Components/UI/PageHeader';
import DeleteModal from '@/Components/UI/DeleteModal';
import Modal from '@/Components/UI/Modal';
import Input from '@/Components/UI/Input';
import Select from '@/Components/UI/Select';
import Textarea from '@/Components/UI/Textarea';

interface DropdownOption {
    value: string;
    label: string;
}

interface Group {
    id: number;
    name: string;
    package_id: number;
}

interface Pkg {
    id: number;
    name: string;
    program_id: number;
    hours: number;
    days: number;
    groups?: Group[];
}

interface Program {
    id: number;
    name: string;
    packages: Pkg[];
}

interface Trainer {
    id: number;
    name: string;
    national_id: string | null;
    employee_id: string | null;
    employer: string | null;
}

interface Assignment {
    id: number;
    trainer_id: number;
    program_id: number;
    package_id: number;
    assignment_type: string;
    start_date: string | null;
    end_date: string | null;
    notes: string | null;
    trainer: Trainer;
    program: { id: number; name: string };
    package: { id: number; name: string; hours: number; days: number };
    groups: { id: number; name: string }[];
}

interface Props {
    assignments: {
        data: Assignment[];
        total: number;
        links: Array<{ url: string | null; label: string; active: boolean }>;
    };
    trainers: Trainer[];
    programs: Program[];
    assignmentTypes: DropdownOption[];
    filters: { search?: string; type?: string };
}

export default function Index({ assignments, trainers, programs, assignmentTypes, filters }: Props) {
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState<Assignment | null>(null);
    const [deleting, setDeleting] = useState<Assignment | null>(null);
    const [search, setSearch] = useState(filters.search || '');
    const [typeFilter, setTypeFilter] = useState(filters.type || '');

    const [selectedTrainerId, setSelectedTrainerId] = useState<number | ''>(editing?.trainer_id || '');
    const [selectedProgramId, setSelectedProgramId] = useState<number | ''>(editing?.program_id || '');
    const [selectedPackageId, setSelectedPackageId] = useState<number | ''>(editing?.package_id || '');
    const [selectedGroupIds, setSelectedGroupIds] = useState<number[]>(editing?.groups?.map(g => g.id) || []);
    const [assignmentType, setAssignmentType] = useState(editing?.assignment_type || '');
    const [startDate, setStartDate] = useState(editing?.start_date || '');
    const [endDate, setEndDate] = useState(editing?.end_date || '');
    const [notes, setNotes] = useState(editing?.notes || '');

    const form = useForm({
        trainer_id: '' as number | '',
        program_id: '' as number | '',
        package_id: '' as number | '',
        assignment_type: '',
        group_ids: [] as number[],
        start_date: '',
        end_date: '',
        notes: '',
    });

    const selectedTrainer = useMemo(() =>
        trainers.find(t => t.id === selectedTrainerId), [trainers, selectedTrainerId]
    );

    const availablePackages = useMemo(() => {
        const prog = programs.find(p => p.id === selectedProgramId);
        return prog?.packages || [];
    }, [programs, selectedProgramId]);

    const selectedPkg = useMemo(() =>
        availablePackages.find(p => p.id === selectedPackageId), [availablePackages, selectedPackageId]
    );

    const availableGroups = useMemo(() => {
        return selectedPkg?.groups || [];
    }, [selectedPkg]);

    const openCreateForm = () => {
        setEditing(null);
        setSelectedTrainerId('');
        setSelectedProgramId('');
        setSelectedPackageId('');
        setSelectedGroupIds([]);
        setAssignmentType('');
        setStartDate('');
        setEndDate('');
        setNotes('');
        setShowForm(true);
    };

    const openEditForm = (a: Assignment) => {
        setEditing(a);
        setSelectedTrainerId(a.trainer_id);
        setSelectedProgramId(a.program_id);
        setSelectedPackageId(a.package_id);
        setSelectedGroupIds(a.groups.map(g => g.id));
        setAssignmentType(a.assignment_type);
        setStartDate(a.start_date ? a.start_date.substring(0, 10) : '');
        setEndDate(a.end_date ? a.end_date.substring(0, 10) : '');
        setNotes(a.notes || '');
        setShowForm(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const data = {
            trainer_id: selectedTrainerId as number,
            program_id: selectedProgramId as number,
            package_id: selectedPackageId as number,
            assignment_type: assignmentType,
            group_ids: selectedGroupIds,
            start_date: startDate || null,
            end_date: endDate || null,
            notes: notes || null,
        };

        if (editing) {
            router.put(route('assignments.update', editing.id), data, {
                onSuccess: () => setShowForm(false),
            });
        } else {
            router.post(route('assignments.store'), data, {
                onSuccess: () => setShowForm(false),
            });
        }
    };

    const doSearch = (s: string, t: string) => {
        router.get(route('assignments.index'), {
            search: s || undefined,
            type: t || undefined,
        }, { preserveState: true, preserveScroll: true });
    };

    const [searchTimer, setSearchTimer] = useState<ReturnType<typeof setTimeout> | null>(null);
    const handleSearchChange = (val: string) => {
        setSearch(val);
        if (searchTimer) clearTimeout(searchTimer);
        setSearchTimer(setTimeout(() => doSearch(val, typeFilter), 400));
    };

    const toggleGroup = (groupId: number) => {
        setSelectedGroupIds(prev =>
            prev.includes(groupId)
                ? prev.filter(id => id !== groupId)
                : [...prev, groupId]
        );
    };

    return (
        <AuthenticatedLayout>
            <Head title="التكليفات" />

            <PageHeader
                title={<>التكليفات <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-teal-100 text-teal-700 mr-2">{assignments.total}</span></>}
                description="إدارة تكليفات المدربين"
                action={
                    <Button icon={<Plus className="h-4 w-4" />} onClick={openCreateForm}>
                        استمارة تكليف
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
                            placeholder="بحث بالمدرب أو البرنامج..."
                            className="w-full pr-10 pl-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all"
                        />
                    </div>
                    <div className="relative">
                        <select
                            value={typeFilter}
                            onChange={(e) => { setTypeFilter(e.target.value); doSearch(search, e.target.value); }}
                            className="px-4 py-2.5 pl-10 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all appearance-none"
                        >
                            <option value="">كل الأنواع</option>
                            {assignmentTypes.map(t => (
                                <option key={t.value} value={t.value}>{t.label}</option>
                            ))}
                        </select>
                        {typeFilter && (
                            <button type="button" onClick={() => { setTypeFilter(''); doSearch(search, ''); }} className="absolute left-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition-colors">
                                <X className="h-4 w-4" />
                            </button>
                        )}
                    </div>
                </div>
            </Card>

            {/* Table */}
            <Card>
                {assignments.data.length === 0 ? (
                    <div className="text-center py-12 text-slate-500">
                        <ClipboardList className="h-14 w-14 mx-auto text-slate-300 mb-3" />
                        <p className="font-medium">لا توجد تكليفات</p>
                        <p className="text-sm text-slate-400 mt-1">ابدأ بإضافة استمارة تكليف جديدة</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-slate-200 bg-slate-50/50">
                                    <th className="px-4 py-3.5 text-right text-xs font-bold text-slate-600 uppercase tracking-wide">#</th>
                                    <th className="px-4 py-3.5 text-right text-xs font-bold text-slate-600 uppercase tracking-wide">المدرب</th>
                                    <th className="px-4 py-3.5 text-right text-xs font-bold text-slate-600 uppercase tracking-wide">البرنامج</th>
                                    <th className="px-4 py-3.5 text-right text-xs font-bold text-slate-600 uppercase tracking-wide">الحقيبة</th>
                                    <th className="px-4 py-3.5 text-right text-xs font-bold text-slate-600 uppercase tracking-wide">المجموعات</th>
                                    <th className="px-4 py-3.5 text-right text-xs font-bold text-slate-600 uppercase tracking-wide">نوع التكليف</th>
                                    <th className="px-4 py-3.5 text-right text-xs font-bold text-slate-600 uppercase tracking-wide">الفترة</th>
                                    <th className="px-4 py-3.5 text-center text-xs font-bold text-slate-600 uppercase tracking-wide">الإجراءات</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {assignments.data.map((a, i) => (
                                    <tr key={a.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-4 py-3 text-slate-500">{i + 1}</td>
                                        <td className="px-4 py-3">
                                            <div className="font-medium text-slate-800">{a.trainer.name}</div>
                                            {a.trainer.employer && <div className="text-xs text-slate-400">{a.trainer.employer}</div>}
                                        </td>
                                        <td className="px-4 py-3 text-slate-700">{a.program.name}</td>
                                        <td className="px-4 py-3">
                                            <div className="text-slate-700">{a.package.name}</div>
                                            <div className="text-xs text-slate-400">{a.package.hours} ساعة / {a.package.days} يوم</div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex flex-wrap gap-1">
                                                {a.groups.map(g => (
                                                    <Badge key={g.id} variant="default">{g.name}</Badge>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <Badge variant="primary">{a.assignment_type}</Badge>
                                        </td>
                                        <td className="px-4 py-3 text-slate-600 text-xs">
                                            {a.start_date && <div>من: {a.start_date.substring(0, 10)}</div>}
                                            {a.end_date && <div>إلى: {a.end_date.substring(0, 10)}</div>}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center justify-center gap-1">
                                                <button title="طباعة" className="p-2 rounded-lg hover:bg-purple-100 text-purple-600 transition-colors">
                                                    <Printer className="h-4 w-4" />
                                                </button>
                                                <button onClick={() => openEditForm(a)} className="p-2 rounded-lg hover:bg-teal-100 text-teal-600 transition-colors">
                                                    <Edit2 className="h-4 w-4" />
                                                </button>
                                                <button onClick={() => setDeleting(a)} className="p-2 rounded-lg hover:bg-red-100 text-red-600 transition-colors">
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </Card>

            {/* Pagination */}
            {assignments.links && assignments.links.length > 3 && (
                <div className="mt-6 flex justify-center">
                    <nav className="flex items-center gap-1">
                        {assignments.links.map((link, i) => (
                            <button
                                key={i}
                                disabled={!link.url}
                                onClick={() => link.url && router.get(link.url, {}, { preserveState: true, preserveScroll: true })}
                                className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                                    link.active ? 'bg-teal-600 text-white' : link.url ? 'text-slate-600 hover:bg-slate-100' : 'text-slate-300 cursor-not-allowed'
                                }`}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </nav>
                </div>
            )}

            {/* Form Modal */}
            <Modal
                open={showForm}
                onClose={() => setShowForm(false)}
                title={editing ? 'تعديل التكليف' : 'استمارة تكليف جديدة'}
                size="xl"
            >
                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* بيانات المدرب */}
                    <div>
                        <h4 className="text-sm font-bold text-slate-700 mb-3 pb-2 border-b border-slate-100">بيانات المدرب</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="sm:col-span-2">
                                <label className="block text-sm font-medium text-slate-700 mb-1">اسم المدرب <span className="text-red-500">*</span></label>
                                <select
                                    value={selectedTrainerId}
                                    onChange={(e) => setSelectedTrainerId(Number(e.target.value) || '')}
                                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all"
                                    required
                                >
                                    <option value="">-- اختر المدرب --</option>
                                    {trainers.map(t => (
                                        <option key={t.id} value={t.id}>{t.name}</option>
                                    ))}
                                </select>
                            </div>
                            {selectedTrainer && (
                                <>
                                    <div className="p-3 bg-slate-50 rounded-lg">
                                        <p className="text-xs text-slate-500">الرقم الشخصي</p>
                                        <p className="text-sm font-medium text-slate-800">{selectedTrainer.national_id || '-'}</p>
                                    </div>
                                    <div className="p-3 bg-slate-50 rounded-lg">
                                        <p className="text-xs text-slate-500">الرقم الوظيفي</p>
                                        <p className="text-sm font-medium text-slate-800">{selectedTrainer.employee_id || '-'}</p>
                                    </div>
                                    <div className="p-3 bg-slate-50 rounded-lg sm:col-span-2">
                                        <p className="text-xs text-slate-500">جهة العمل</p>
                                        <p className="text-sm font-medium text-slate-800">{selectedTrainer.employer || '-'}</p>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* بيانات البرنامج التدريبي */}
                    <div>
                        <h4 className="text-sm font-bold text-slate-700 mb-3 pb-2 border-b border-slate-100">بيانات البرنامج التدريبي</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">البرنامج التدريبي <span className="text-red-500">*</span></label>
                                <select
                                    value={selectedProgramId}
                                    onChange={(e) => {
                                        setSelectedProgramId(Number(e.target.value) || '');
                                        setSelectedPackageId('');
                                        setSelectedGroupIds([]);
                                    }}
                                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all"
                                    required
                                >
                                    <option value="">-- اختر البرنامج --</option>
                                    {programs.map(p => (
                                        <option key={p.id} value={p.id}>{p.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">الحقيبة التدريبية <span className="text-red-500">*</span></label>
                                <select
                                    value={selectedPackageId}
                                    onChange={(e) => {
                                        setSelectedPackageId(Number(e.target.value) || '');
                                        setSelectedGroupIds([]);
                                    }}
                                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all"
                                    required
                                    disabled={!selectedProgramId}
                                >
                                    <option value="">-- اختر الحقيبة --</option>
                                    {availablePackages.map(p => (
                                        <option key={p.id} value={p.id}>{p.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* تفاصيل الحقيبة */}
                        {selectedPkg && (
                            <div className="mt-3 grid grid-cols-2 gap-3">
                                <div className="p-3 bg-teal-50 rounded-lg text-center">
                                    <p className="text-xs text-teal-600">عدد الساعات</p>
                                    <p className="text-lg font-bold text-teal-700">{selectedPkg.hours}</p>
                                </div>
                                <div className="p-3 bg-sky-50 rounded-lg text-center">
                                    <p className="text-xs text-sky-600">عدد الأيام</p>
                                    <p className="text-lg font-bold text-sky-700">{selectedPkg.days}</p>
                                </div>
                            </div>
                        )}

                        {/* المجموعات */}
                        {availableGroups.length > 0 && (
                            <div className="mt-4">
                                <label className="block text-sm font-medium text-slate-700 mb-2">المجموعات المتوفرة <span className="text-red-500">*</span></label>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                    {availableGroups.map(g => (
                                        <label
                                            key={g.id}
                                            className={`flex items-center gap-2 p-2.5 rounded-lg border-2 cursor-pointer transition-all ${
                                                selectedGroupIds.includes(g.id)
                                                    ? 'border-teal-500 bg-teal-50'
                                                    : 'border-slate-200 hover:border-slate-300'
                                            }`}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={selectedGroupIds.includes(g.id)}
                                                onChange={() => toggleGroup(g.id)}
                                                className="w-4 h-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                                            />
                                            <span className="text-sm text-slate-700">{g.name}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* نوع التكليف والتواريخ */}
                    <div>
                        <h4 className="text-sm font-bold text-slate-700 mb-3 pb-2 border-b border-slate-100">نوع التكليف والفترة</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">نوع التكليف <span className="text-red-500">*</span></label>
                                <select
                                    value={assignmentType}
                                    onChange={(e) => setAssignmentType(e.target.value)}
                                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all"
                                    required
                                >
                                    <option value="">-- اختر النوع --</option>
                                    {assignmentTypes.map(t => (
                                        <option key={t.value} value={t.value}>{t.label}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">تاريخ البدء</label>
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">تاريخ الانتهاء</label>
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all"
                                />
                            </div>
                        </div>
                        <div className="mt-4">
                            <Textarea
                                label="ملاحظات"
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                rows={2}
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                        <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 rounded-xl transition-colors">
                            إلغاء
                        </button>
                        <button
                            type="submit"
                            disabled={!selectedTrainerId || !selectedProgramId || !selectedPackageId || selectedGroupIds.length === 0 || !assignmentType}
                            className="px-6 py-2 text-sm font-medium bg-teal-600 text-white rounded-xl hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {editing ? 'تحديث التكليف' : 'حفظ التكليف'}
                        </button>
                    </div>
                </form>
            </Modal>

            <DeleteModal
                open={!!deleting}
                onClose={() => setDeleting(null)}
                action={deleting ? route('assignments.destroy', deleting.id) : ''}
                message="هل أنت متأكد من حذف هذا التكليف؟"
            />
        </AuthenticatedLayout>
    );
}
