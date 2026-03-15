import AuthenticatedLayout from '@/Components/Layout/AuthenticatedLayout';
import { Head, router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { Users, Calendar, Building2, GraduationCap, Plus, Trash2, RefreshCw, Edit2, Check, Clock, Package, ChevronDown, ChevronUp } from 'lucide-react';
import Card, { CardHeader } from '@/Components/UI/Card';
import Button from '@/Components/UI/Button';
import Badge from '@/Components/UI/Badge';
import PageHeader from '@/Components/UI/PageHeader';
import SearchableSelect from '@/Components/UI/SearchableSelect';
import Modal, { ModalFooter } from '@/Components/UI/Modal';
import Input from '@/Components/UI/Input';
import { formatDate } from '@/Utils/helpers';

interface Trainee {
    id: number;
    status: string;
    employee: {
        id: number;
        name: string;
        gender: string;
        job_title: string | null;
        school: { name: string } | null;
    };
}

interface Session {
    id: number;
    date: string;
    day_number: number;
    status: string;
}

interface Group {
    id: number;
    name: string;
    gender: string;
    status: string;
    notes: string | null;
    package: {
        id: number;
        name: string;
        hours: number;
        days: number;
        program: { id: number; name: string };
    };
    trainer: { id: number; name: string } | null;
    training_hall: { id: number; name: string; capacity: number } | null;
    semester: { id: number; name: string } | null;
    trainees: Trainee[];
    training_sessions: Session[];
}

interface Employee {
    id: number;
    name: string;
    gender: string;
    job_title: string | null;
    school: { name: string } | null;
}

interface Props {
    group: Group;
    trainers: Array<{ id: number; name: string }>;
    halls: Array<{ id: number; name: string; capacity: number }>;
    employees: Employee[];
}

const statusLabels: Record<string, { label: string; variant: 'success' | 'warning' | 'danger' | 'info' | 'default' | 'primary' }> = {
    scheduled: { label: 'مجدول', variant: 'info' },
    in_progress: { label: 'قيد التنفيذ', variant: 'warning' },
    completed: { label: 'مكتمل', variant: 'success' },
    cancelled: { label: 'ملغي', variant: 'danger' },
    postponed: { label: 'مؤجل', variant: 'default' },
};

const genderLabels: Record<string, string> = {
    male: 'ذكور',
    female: 'إناث',
    mixed: 'مختلط',
};

export default function Show({ group, employees }: Props) {
    const [showAddTrainee, setShowAddTrainee] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState<string | number>('');
    const [showGenerateSessions, setShowGenerateSessions] = useState(false);
    const [showAllTrainees, setShowAllTrainees] = useState(false);
    const [sessionDates, setSessionDates] = useState<string[]>(
        Array(group.package.days).fill('')
    );
    const [editingSession, setEditingSession] = useState<Session | null>(null);
    const [editSessionDate, setEditSessionDate] = useState('');
    const [genMode, setGenMode] = useState<'weekly' | 'manual'>('weekly');
    const [weeklyStartDate, setWeeklyStartDate] = useState('');

    const addTraineeForm = useForm({ employee_id: '' });
    const sessionForm = useForm({ dates: sessionDates });

    const availableEmployees = employees.filter(
        (emp) =>
            !group.trainees.some((t) => t.employee.id === emp.id) &&
            (group.gender === 'mixed' || emp.gender === group.gender)
    );

    const employeeOptions = availableEmployees.map(e => ({
        value: e.id,
        label: e.name,
        subLabel: e.school?.name || 'بدون مدرسة',
    }));

    const handleAddTrainee = () => {
        if (!selectedEmployee) return;
        addTraineeForm.setData('employee_id', String(selectedEmployee));
        addTraineeForm.post(route('groups.trainees.add', group.id), {
            preserveScroll: true,
            onSuccess: () => {
                setShowAddTrainee(false);
                setSelectedEmployee('');
            },
        });
    };

    const handleRemoveTrainee = (traineeId: number) => {
        if (confirm('هل أنت متأكد من إزالة هذا المتدرب؟')) {
            router.delete(route('groups.trainees.remove', [group.id, traineeId]), { preserveScroll: true });
        }
    };

    const handleGenerateSessions = () => {
        if (genMode === 'weekly') {
            if (!weeklyStartDate) {
                alert('الرجاء تحديد تاريخ البداية');
                return;
            }
            router.post(route('groups.generate-sessions', group.id), {
                mode: 'weekly',
                start_date: weeklyStartDate,
                session_count: group.package.days,
            }, {
                preserveScroll: true,
                onSuccess: () => setShowGenerateSessions(false),
            });
        } else {
            const validDates = sessionDates.filter(d => d);
            if (validDates.length === 0) {
                alert('الرجاء تحديد تاريخ واحد على الأقل');
                return;
            }
            router.post(route('groups.generate-sessions', group.id), { mode: 'manual', dates: sessionDates }, {
                preserveScroll: true,
                onSuccess: () => setShowGenerateSessions(false),
            });
        }
    };

    const handleUpdateSession = () => {
        if (!editingSession || !editSessionDate) return;

        router.put(route('sessions.update', editingSession.id), { date: editSessionDate }, {
            preserveScroll: true,
            onSuccess: () => {
                setEditingSession(null);
                setEditSessionDate('');
            }
        });
    };

    const openEditSession = (session: Session) => {
        setEditingSession(session);
        setEditSessionDate(session.date);
    };

    const updateSessionDate = (index: number, date: string) => {
        const newDates = [...sessionDates];
        newDates[index] = date;
        setSessionDates(newDates);
    };

    const TRAINEES_PREVIEW = 5;
    const visibleTrainees = showAllTrainees ? group.trainees : group.trainees.slice(0, TRAINEES_PREVIEW);
    const hasMoreTrainees = group.trainees.length > TRAINEES_PREVIEW;
    const today = new Date().toISOString().split('T')[0];
    const completedSessions = group.training_sessions.filter(s => s.status === 'completed' || s.date < today).length;
    const progressPercent = group.package.days > 0 ? Math.round((completedSessions / group.package.days) * 100) : 0;

    // Compute dates from actual sessions
    const sessionDatesComputed = group.training_sessions.map(s => s.date).sort();
    const firstSessionDate = sessionDatesComputed.length > 0 ? sessionDatesComputed[0] : null;
    const lastSessionDate = sessionDatesComputed.length > 0 ? sessionDatesComputed[sessionDatesComputed.length - 1] : null;

    return (
        <AuthenticatedLayout>
            <Head title={group.name} />

            <PageHeader
                title={group.name}
                breadcrumbs={[
                    { label: 'المجموعات', href: route('groups.index') },
                    { label: group.name },
                ]}
            />

            {/* Summary Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center gap-3">
                    <div className="p-2.5 bg-gradient-to-br from-sky-500 to-sky-600 rounded-xl shadow-sm">
                        <Package className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        <p className="text-xs text-slate-500">الحقيبة</p>
                        <p className="text-sm font-bold text-slate-800 truncate">{group.package.name}</p>
                    </div>
                </div>
                <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center gap-3">
                    <div className="p-2.5 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl shadow-sm">
                        <Users className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        <p className="text-xs text-slate-500">المتدربين</p>
                        <p className="text-sm font-bold text-slate-800">{group.trainees.length}{group.training_hall ? ` / ${group.training_hall.capacity}` : ''}</p>
                    </div>
                </div>
                <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center gap-3">
                    <div className="p-2.5 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl shadow-sm">
                        <Calendar className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        <p className="text-xs text-slate-500">الجلسات</p>
                        <p className="text-sm font-bold text-slate-800">{group.training_sessions.length} / {group.package.days}</p>
                    </div>
                </div>
                <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl shadow-sm bg-gradient-to-br ${
                        group.status === 'completed' ? 'from-emerald-500 to-emerald-600' :
                        group.status === 'cancelled' ? 'from-red-500 to-red-600' :
                        'from-violet-500 to-violet-600'
                    }`}>
                        <Clock className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        <p className="text-xs text-slate-500">الحالة</p>
                        <Badge variant={statusLabels[group.status]?.variant || 'default'}>
                            {statusLabels[group.status]?.label || group.status}
                        </Badge>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    {/* Trainees */}
                    <Card>
                        <CardHeader
                            title="المتدربين"
                            description={group.training_hall ? group.trainees.length + ' من ' + group.training_hall.capacity : group.trainees.length + ' متدرب'}
                            action={
                                <Button
                                    size="sm"
                                    icon={<Plus className="h-4 w-4" />}
                                    onClick={() => setShowAddTrainee(true)}
                                    disabled={group.training_hall ? group.trainees.length >= group.training_hall.capacity : false}
                                >
                                    إضافة متدرب
                                </Button>
                            }
                        />

                        {group.trainees.length === 0 ? (
                            <div className="text-center py-12 text-slate-500">
                                <Users className="h-12 w-12 mx-auto text-slate-300 mb-3" />
                                <p className="font-medium">لا يوجد متدربين في هذه المجموعة</p>
                                <p className="text-sm text-slate-400 mt-1">ابدأ بإضافة متدربين للمجموعة</p>
                            </div>
                        ) : (
                            <>
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-gradient-to-l from-slate-50 to-slate-100/50 border-b border-slate-200">
                                            <tr>
                                                <th className="px-4 py-3 text-right text-xs font-bold text-slate-600 uppercase tracking-wide w-8">#</th>
                                                <th className="px-4 py-3 text-right text-xs font-bold text-slate-600 uppercase tracking-wide">الاسم</th>
                                                <th className="px-4 py-3 text-right text-xs font-bold text-slate-600 uppercase tracking-wide">المدرسة</th>
                                                <th className="px-4 py-3 text-right text-xs font-bold text-slate-600 uppercase tracking-wide">الوظيفة</th>
                                                <th className="px-4 py-3 text-right text-xs font-bold text-slate-600 uppercase tracking-wide w-16">إزالة</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {visibleTrainees.map((trainee, index) => (
                                                <tr key={trainee.id} className="hover:bg-slate-50/50 transition-colors">
                                                    <td className="px-4 py-3 text-sm text-slate-400 font-medium">
                                                        {index + 1}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <span className="text-sm font-semibold text-slate-800">{trainee.employee.name}</span>
                                                    </td>
                                                    <td className="px-4 py-3 text-sm text-slate-600">
                                                        {trainee.employee.school?.name || '-'}
                                                    </td>
                                                    <td className="px-4 py-3 text-sm text-slate-600">
                                                        {trainee.employee.job_title || '-'}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <button
                                                            onClick={() => handleRemoveTrainee(trainee.id)}
                                                            className="p-1.5 rounded-lg hover:bg-red-100 text-red-500 hover:text-red-600 transition-colors"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                {hasMoreTrainees && (
                                    <button
                                        onClick={() => setShowAllTrainees(!showAllTrainees)}
                                        className="w-full py-3 text-sm font-medium text-teal-600 hover:text-teal-700 hover:bg-teal-50 rounded-b-xl transition-colors flex items-center justify-center gap-1.5 border-t border-slate-100"
                                    >
                                        {showAllTrainees ? (
                                            <>
                                                <ChevronUp className="h-4 w-4" />
                                                عرض أقل
                                            </>
                                        ) : (
                                            <>
                                                <ChevronDown className="h-4 w-4" />
                                                عرض الكل ({group.trainees.length} متدرب)
                                            </>
                                        )}
                                    </button>
                                )}
                            </>
                        )}
                    </Card>

                    {/* Sessions */}
                    <Card>
                        <CardHeader
                            title="جلسات التدريب"
                            description={`${group.training_sessions.length} جلسة`}
                            action={
                                <Button
                                    size="sm"
                                    variant="secondary"
                                    icon={<RefreshCw className="h-4 w-4" />}
                                    onClick={() => setShowGenerateSessions(true)}
                                >
                                    {group.training_sessions.length > 0 ? 'إعادة توليد' : 'توليد الجلسات'}
                                </Button>
                            }
                        />

                        {group.training_sessions.length > 0 && (
                            <div className="mb-4 flex items-center gap-3">
                                <div className="flex-1 bg-slate-200 rounded-full h-2">
                                    <div
                                        className="h-2 rounded-full bg-teal-500 transition-all"
                                        style={{ width: `${progressPercent}%` }}
                                    />
                                </div>
                                <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">{progressPercent}%</span>
                            </div>
                        )}

                        {group.training_sessions.length === 0 ? (
                            <div className="text-center py-12 text-slate-500">
                                <Calendar className="h-12 w-12 mx-auto text-slate-300 mb-3" />
                                <p className="font-medium">لا توجد جلسات مجدولة</p>
                                <Button
                                    size="sm"
                                    className="mt-3"
                                    onClick={() => setShowGenerateSessions(true)}
                                >
                                    توليد الجلسات
                                </Button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                                {group.training_sessions.map((session) => (
                                    <div
                                        key={session.id}
                                        className={`group relative p-4 border rounded-xl text-center hover:shadow-sm transition-all ${
                                            session.status === 'completed' ? 'border-emerald-200 bg-emerald-50/30' :
                                            session.status === 'cancelled' ? 'border-red-200 bg-red-50/30' :
                                            'border-slate-200 hover:border-teal-300'
                                        }`}
                                    >
                                        <button
                                            onClick={() => openEditSession(session)}
                                            className="absolute top-2 left-2 p-1.5 rounded-lg bg-white border border-slate-200 opacity-0 group-hover:opacity-100 hover:bg-teal-50 hover:border-teal-300 transition-all"
                                        >
                                            <Edit2 className="h-3.5 w-3.5 text-teal-600" />
                                        </button>
                                        <div className="text-xs text-slate-500 font-medium">اليوم {session.day_number}</div>
                                        <div className="text-sm font-semibold mt-1 text-slate-700">{formatDate(session.date)}</div>
                                        <div className="mt-1.5">
                                            <Badge
                                                variant={statusLabels[session.status]?.variant || 'default'}
                                                size="sm"
                                            >
                                                {statusLabels[session.status]?.label || session.status}
                                            </Badge>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </Card>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader title="معلومات المجموعة" />
                        <dl className="space-y-4">
                            <div className="flex justify-between items-center">
                                <dt className="text-sm text-slate-500">البرنامج</dt>
                                <dd className="text-sm font-semibold text-slate-700 max-w-[60%] text-left truncate">{group.package.program.name}</dd>
                            </div>
                            <div className="flex justify-between items-center">
                                <dt className="text-sm text-slate-500">الحقيبة</dt>
                                <dd className="text-sm font-semibold text-slate-700 max-w-[60%] text-left truncate">{group.package.name}</dd>
                            </div>
                            <div className="flex justify-between items-center">
                                <dt className="text-sm text-slate-500">النوع</dt>
                                <dd>
                                    <Badge variant={group.gender === 'male' ? 'info' : group.gender === 'female' ? 'primary' : 'default'}>
                                        {genderLabels[group.gender]}
                                    </Badge>
                                </dd>
                            </div>
                            <div className="flex justify-between items-center">
                                <dt className="text-sm text-slate-500">الطاقة الاستيعابية</dt>
                                <dd className="text-sm font-bold text-slate-700">{group.training_hall?.capacity ?? '-'} متدرب</dd>
                            </div>
                        </dl>
                    </Card>

                    <Card>
                        <CardHeader title="تفاصيل التنفيذ" />
                        <dl className="space-y-4">
                            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                                <GraduationCap className="h-5 w-5 text-teal-500 flex-shrink-0" />
                                <div>
                                    <dt className="text-xs text-slate-500">المدرب</dt>
                                    <dd className="text-sm font-semibold text-slate-700">{group.trainer?.name || 'لم يحدد'}</dd>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                                <Building2 className="h-5 w-5 text-sky-500 flex-shrink-0" />
                                <div>
                                    <dt className="text-xs text-slate-500">القاعة</dt>
                                    <dd className="text-sm font-semibold text-slate-700">{group.training_hall?.name || 'لم تحدد'}</dd>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                                <Calendar className="h-5 w-5 text-amber-500 flex-shrink-0" />
                                <div>
                                    <dt className="text-xs text-slate-500">التاريخ</dt>
                                    <dd className="text-sm font-semibold text-slate-700">
                                        {firstSessionDate
                                            ? (firstSessionDate === lastSessionDate
                                                ? formatDate(firstSessionDate)
                                                : `${formatDate(firstSessionDate)} - ${formatDate(lastSessionDate)}`)
                                            : 'لم يحدد'}
                                    </dd>
                                </div>
                            </div>
                        </dl>
                    </Card>

                    <Card>
                        <CardHeader title="معلومات الحقيبة" />
                        <dl className="space-y-3">
                            <div className="flex justify-between items-center">
                                <dt className="text-sm text-slate-500 flex items-center gap-1.5">
                                    <Clock className="h-4 w-4" /> عدد الساعات
                                </dt>
                                <dd className="text-sm font-bold text-slate-700">{group.package.hours} ساعة</dd>
                            </div>
                            <div className="flex justify-between items-center">
                                <dt className="text-sm text-slate-500 flex items-center gap-1.5">
                                    <Calendar className="h-4 w-4" /> عدد الأيام
                                </dt>
                                <dd className="text-sm font-bold text-slate-700">{group.package.days} يوم</dd>
                            </div>
                        </dl>
                    </Card>
                </div>
            </div>

            {/* Add Trainee Modal */}
            <Modal
                open={showAddTrainee}
                onClose={() => {
                    setShowAddTrainee(false);
                    setSelectedEmployee('');
                }}
                title="إضافة متدرب"
                size="lg"
            >
                <div className="min-h-[300px]">
                    <SearchableSelect
                        label="اختر الموظف"
                        value={selectedEmployee}
                        onChange={setSelectedEmployee}
                        options={employeeOptions}
                        placeholder="اختر موظف..."
                        searchPlaceholder="بحث بالاسم أو المدرسة..."
                    />
                    {selectedEmployee && (
                        <div className="mt-4 p-3 bg-teal-50 border border-teal-200 rounded-xl">
                            <p className="text-sm text-teal-700">
                                سيتم إضافة <strong>{employeeOptions.find(e => e.value === selectedEmployee)?.label}</strong> إلى المجموعة
                            </p>
                        </div>
                    )}
                </div>
                <ModalFooter>
                    <Button variant="secondary" onClick={() => setShowAddTrainee(false)}>
                        إلغاء
                    </Button>
                    <Button onClick={handleAddTrainee} loading={addTraineeForm.processing} disabled={!selectedEmployee}>
                        إضافة
                    </Button>
                </ModalFooter>
            </Modal>

            {/* Generate Sessions Modal */}
            <Modal
                open={showGenerateSessions}
                onClose={() => setShowGenerateSessions(false)}
                title="توليد جلسات التدريب"
                size="lg"
            >
                <div className="space-y-4">
                    {/* Mode Tabs */}
                    <div className="flex gap-1 bg-slate-100 p-1 rounded-xl">
                        <button
                            type="button"
                            onClick={() => setGenMode('weekly')}
                            className={`flex-1 py-2 px-3 text-sm font-medium rounded-lg transition-all ${
                                genMode === 'weekly'
                                    ? 'bg-white text-teal-700 shadow-sm'
                                    : 'text-slate-500 hover:text-slate-700'
                            }`}
                        >
                            تكرار أسبوعي تلقائي
                        </button>
                        <button
                            type="button"
                            onClick={() => setGenMode('manual')}
                            className={`flex-1 py-2 px-3 text-sm font-medium rounded-lg transition-all ${
                                genMode === 'manual'
                                    ? 'bg-white text-teal-700 shadow-sm'
                                    : 'text-slate-500 hover:text-slate-700'
                            }`}
                        >
                            تحديد يدوي
                        </button>
                    </div>

                    {genMode === 'weekly' ? (
                        <>
                            <div className="bg-teal-50 border border-teal-200 rounded-xl p-3 text-sm text-teal-700">
                                حدد تاريخ أول جلسة وسيتم توليد <strong>{group.package.days}</strong> جلسة تلقائياً
                                كل أسبوع في نفس اليوم، مع تخطي الإجازات الرسمية وأيام الجمعة.
                            </div>
                            <Input
                                label="تاريخ أول جلسة"
                                type="date"
                                value={weeklyStartDate}
                                onChange={(e) => setWeeklyStartDate(e.target.value)}
                                required
                            />
                            {weeklyStartDate && (
                                <div className="text-sm text-slate-500 bg-slate-50 rounded-lg p-3">
                                    سيتم التكرار كل يوم <strong className="text-slate-700">
                                        {new Date(weeklyStartDate).toLocaleDateString('ar-SA', { weekday: 'long' })}
                                    </strong> بدءاً من{' '}
                                    <strong className="text-slate-700">
                                        {new Date(weeklyStartDate).toLocaleDateString('ar-SA')}
                                    </strong>
                                </div>
                            )}
                        </>
                    ) : (
                        <>
                            <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-xl">
                                حدد تاريخ كل يوم تدريبي. عدد أيام الحقيبة: <strong>{group.package.days}</strong> يوم
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {Array.from({ length: group.package.days }, (_, i) => (
                                    <div key={i} className="flex items-center gap-3">
                                        <span className="text-sm font-semibold text-slate-600 whitespace-nowrap min-w-[60px]">
                                            اليوم {i + 1}
                                        </span>
                                        <Input
                                            type="date"
                                            value={sessionDates[i] || ''}
                                            onChange={(e) => updateSessionDate(i, e.target.value)}
                                            className="flex-1"
                                        />
                                    </div>
                                ))}
                            </div>
                        </>
                    )}

                    {group.training_sessions.length > 0 && (
                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-sm text-amber-700">
                            تنبيه: سيتم حذف الجلسات الحالية واستبدالها بالجديدة
                        </div>
                    )}
                </div>

                <ModalFooter>
                    <Button variant="secondary" onClick={() => setShowGenerateSessions(false)}>
                        إلغاء
                    </Button>
                    <Button onClick={handleGenerateSessions} icon={<RefreshCw className="h-4 w-4" />}>
                        توليد الجلسات
                    </Button>
                </ModalFooter>
            </Modal>

            {/* Edit Session Modal */}
            <Modal
                open={!!editingSession}
                onClose={() => {
                    setEditingSession(null);
                    setEditSessionDate('');
                }}
                title={`تعديل تاريخ اليوم ${editingSession?.day_number || ''}`}
            >
                <Input
                    label="التاريخ الجديد"
                    type="date"
                    value={editSessionDate}
                    onChange={(e) => setEditSessionDate(e.target.value)}
                />
                <ModalFooter>
                    <Button variant="secondary" onClick={() => setEditingSession(null)}>
                        إلغاء
                    </Button>
                    <Button onClick={handleUpdateSession} icon={<Check className="h-4 w-4" />}>
                        حفظ
                    </Button>
                </ModalFooter>
            </Modal>
        </AuthenticatedLayout>
    );
}
