import AuthenticatedLayout from '@/Components/Layout/AuthenticatedLayout';
import { Head, router, useForm } from '@inertiajs/react';
import { useState, useCallback, useMemo } from 'react';
import {
    Calendar,
    ChevronRight,
    ChevronLeft,
    Building2,
    Users,
    User,
    CalendarDays,
    CalendarRange,
    LayoutGrid,
    Eye,
    GripVertical,
    Plus,
    CheckSquare,
    Square,
    Pencil,
    Check,
    X,
} from 'lucide-react';
import Card from '@/Components/UI/Card';
import Button from '@/Components/UI/Button';
import Badge from '@/Components/UI/Badge';
import PageHeader from '@/Components/UI/PageHeader';
import Modal from '@/Components/UI/Modal';
import SearchableSelect from '@/Components/UI/SearchableSelect';
import clsx from 'clsx';
import { formatDate } from '@/Utils/helpers';

interface Session {
    id: number;
    date: string;
    day_number: number;
    status: string;
    program_group: {
        id: number;
        name: string;
        gender: string;
        capacity: number;
        trainees_count: number;
        trainer: { id: number; name: string } | null;
        package: {
            id: number;
            name: string;
            hours: number;
            days: number;
            supervisor: { id: number; name: string } | null;
            program: { id: number; name: string };
        };
    };
    training_hall: {
        id: number;
        name: string;
        capacity: number;
    };
}

interface Hall {
    id: number;
    name: string;
    capacity: number;
    is_active: boolean;
    gender_priority?: string | null;
}

interface GroupOption {
    id: number;
    name: string;
    gender: string;
    hall_name: string | null;
    training_hall_id: number | null;
    trainer_id: number | null;
}

interface CompletedGroup {
    id: number;
    name: string;
    last_session_date: string;
}

interface PackageOption {
    id: number;
    name: string;
    days: number;
    groups: GroupOption[];
    completed_groups?: CompletedGroup[];
}

interface ProgramOption {
    id: number;
    name: string;
    packages: PackageOption[];
}

interface TrainerOption {
    id: number;
    name: string;
}

interface Props {
    sessions: Session[];
    halls: Hall[];
    trainers: TrainerOption[];
    currentDate: string;
    viewType: 'daily' | 'weekly' | 'monthly';
    programs: ProgramOption[];
}

type ViewType = 'daily' | 'weekly' | 'monthly';

const genderLabels: Record<string, { label: string; color: string }> = {
    male: { label: 'رجال', color: 'bg-sky-100 text-sky-700 border-sky-200' },
    female: { label: 'نساء', color: 'bg-pink-100 text-pink-700 border-pink-200' },
    mixed: { label: 'مختلط', color: 'bg-purple-100 text-purple-700 border-purple-200' },
};

const statusLabels: Record<string, { label: string; variant: 'success' | 'warning' | 'danger' | 'info' | 'default' | 'primary' }> = {
    scheduled: { label: 'مجدول', variant: 'info' },
    in_progress: { label: 'قيد التنفيذ', variant: 'warning' },
    completed: { label: 'مكتمل', variant: 'success' },
    cancelled: { label: 'ملغي', variant: 'danger' },
};

const genderSessionColors: Record<string, string> = {
    male: 'bg-sky-50 border-sky-200 hover:bg-sky-100',
    female: 'bg-pink-50 border-pink-200 hover:bg-pink-100',
    mixed: 'bg-purple-50 border-purple-200 hover:bg-purple-100',
};

const genderDotColors: Record<string, string> = {
    male: 'bg-sky-500',
    female: 'bg-pink-500',
    mixed: 'bg-purple-500',
};

// Arabic month names with Latin (English) numbers
const monthNames = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
const dayNames = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
const dayNamesShort = ['أحد', 'اثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت'];

function formatLocalDate(y: number, m: number, d: number) {
    const mm = String(m + 1).padStart(2, '0');
    const dd = String(d).padStart(2, '0');
    return `${y}-${mm}-${dd}`;
}

function getTodayStr() {
    const now = new Date();
    return formatLocalDate(now.getFullYear(), now.getMonth(), now.getDate());
}

function setViewCookie(view: string) {
    document.cookie = `schedule_view=${view};path=/;max-age=${60 * 60 * 24 * 365};SameSite=Lax`;
}

function HallSelect({ halls, sessions, currentSession, value, onChange, genderPriorityLabels }: {
    halls: Hall[];
    sessions: Session[];
    currentSession: Session;
    value: number | '';
    onChange: (val: number | '') => void;
    genderPriorityLabels: Record<string, string>;
}) {
    const bookedHallIdsOnDay = sessions
        .filter(s => s.date === currentSession.date && s.id !== currentSession.id)
        .map(s => s.training_hall.id);

    const availableHalls = halls.filter(h => !bookedHallIdsOnDay.includes(h.id));

    return (
        <div className="space-y-2">
            <select
                value={value}
                onChange={(e) => onChange(e.target.value ? Number(e.target.value) : '')}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            >
                <option value="">اختر القاعة...</option>
                {availableHalls.map(h => (
                    <option key={h.id} value={h.id}>
                        {h.name} - السعة: {h.capacity}{h.gender_priority ? ` - ${genderPriorityLabels[h.gender_priority] || h.gender_priority}` : ''}
                    </option>
                ))}
            </select>
            {bookedHallIdsOnDay.length > 0 && (
                <p className="text-[11px] text-amber-600">
                    {bookedHallIdsOnDay.length} قاعة محجوزة في نفس اليوم ولا تظهر هنا
                </p>
            )}
        </div>
    );
}

export default function Index({ sessions, halls, trainers, currentDate, viewType: serverViewType, programs }: Props) {
    const [viewType, setViewType] = useState<ViewType>(serverViewType || 'daily');
    const [selectedDate, setSelectedDate] = useState(currentDate || getTodayStr());
    const [selectedSession, setSelectedSession] = useState<Session | null>(null);
    const [dailyTab, setDailyTab] = useState<'busy' | 'available'>('busy');

    // Monthly assign modal
    const [assignDate, setAssignDate] = useState<string | null>(null);
    const [selectedProgramId, setSelectedProgramId] = useState<number | null>(null);
    const [selectedPackageId, setSelectedPackageId] = useState<number | null>(null);
    const [selectedGroupIds, setSelectedGroupIds] = useState<number[]>([]);

    // Drag state
    const [dragSessionId, setDragSessionId] = useState<number | null>(null);

    // Inline edit state for session detail modal
    const [editingDate, setEditingDate] = useState(false);
    const [editDateValue, setEditDateValue] = useState('');
    const [editingHall, setEditingHall] = useState(false);
    const [editHallValue, setEditHallValue] = useState<number | ''>('');
    const [editingTrainer, setEditingTrainer] = useState(false);
    const [editTrainerValue, setEditTrainerValue] = useState<number | ''>('');

    const assignForm = useForm({
        date: '',
        group_ids: [] as number[],
    });

    const navigateDate = (direction: 'prev' | 'next') => {
        const date = new Date(selectedDate);
        if (viewType === 'daily') {
            date.setDate(date.getDate() + (direction === 'next' ? 1 : -1));
        } else if (viewType === 'weekly') {
            date.setDate(date.getDate() + (direction === 'next' ? 7 : -7));
        } else {
            date.setMonth(date.getMonth() + (direction === 'next' ? 1 : -1));
        }
        const newDate = formatLocalDate(date.getFullYear(), date.getMonth(), date.getDate());
        setSelectedDate(newDate);
        router.get(route('schedule.index'), { date: newDate, view: viewType }, { preserveState: true, preserveScroll: true });
    };

    const changeView = (newView: ViewType) => {
        setViewType(newView);
        setViewCookie(newView);
        router.get(route('schedule.index'), { date: selectedDate, view: newView }, { preserveState: true, preserveScroll: true });
    };

    const goToToday = () => {
        const today = getTodayStr();
        setSelectedDate(today);
        router.get(route('schedule.index'), { date: today, view: viewType }, { preserveState: true, preserveScroll: true });
    };

    const getSessionsForHall = useCallback((hallId: number, date?: string) => {
        return sessions.filter((s) => {
            const matchHall = s.training_hall.id === hallId;
            if (date) return matchHall && s.date === date;
            return matchHall;
        });
    }, [sessions]);

    const getDateLabel = () => {
        const date = new Date(selectedDate);
        const day = date.getDate();
        const month = monthNames[date.getMonth()];
        const year = date.getFullYear();

        if (viewType === 'daily') {
            const dayName = dayNames[date.getDay()];
            return `${dayName}، ${day} ${month} ${year}`;
        } else if (viewType === 'weekly') {
            // Calculate Sunday as start of week
            const sunday = new Date(date);
            sunday.setDate(sunday.getDate() - sunday.getDay());
            const saturday = new Date(sunday);
            saturday.setDate(saturday.getDate() + 6);

            const startDay = sunday.getDate();
            const startMonth = monthNames[sunday.getMonth()];
            const endDay = saturday.getDate();
            const endMonth = monthNames[saturday.getMonth()];
            const endYear = saturday.getFullYear();

            if (sunday.getMonth() === saturday.getMonth()) {
                return `${startDay} - ${endDay} ${startMonth} ${endYear}`;
            }
            return `${startDay} ${startMonth} - ${endDay} ${endMonth} ${endYear}`;
        } else {
            return `${month} ${year}`;
        }
    };

    const getWeekDays = useCallback(() => {
        const startDate = new Date(selectedDate);
        const dayOfWeek = startDate.getDay();
        startDate.setDate(startDate.getDate() - dayOfWeek);
        const days: string[] = [];
        for (let i = 0; i < 7; i++) {
            const d = new Date(startDate);
            d.setDate(d.getDate() + i);
            days.push(formatLocalDate(d.getFullYear(), d.getMonth(), d.getDate()));
        }
        return days;
    }, [selectedDate]);

    const todayStr = getTodayStr();

    // Daily view stats
    const busyHalls = useMemo(() => halls.filter((hall) => getSessionsForHall(hall.id, selectedDate).length > 0), [halls, sessions, selectedDate]);
    const availableHalls = useMemo(() => halls.filter((hall) => getSessionsForHall(hall.id, selectedDate).length === 0), [halls, sessions, selectedDate]);

    // Monthly calendar data
    const getMonthData = useCallback(() => {
        const date = new Date(selectedDate);
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDayOfMonth = new Date(year, month, 1);
        const firstDay = firstDayOfMonth.getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        return { year, month, firstDay, daysInMonth };
    }, [selectedDate]);

    // Assign modal helpers
    const selectedProgram = programs.find(p => p.id === selectedProgramId);
    const selectedPackage = selectedProgram?.packages.find(p => p.id === selectedPackageId);

    const toggleGroup = (groupId: number) => {
        setSelectedGroupIds(prev =>
            prev.includes(groupId) ? prev.filter(id => id !== groupId) : [...prev, groupId]
        );
    };

    const selectAllGroups = () => {
        if (selectedPackage) {
            setSelectedGroupIds(selectedPackage.groups.map(g => g.id));
        }
    };

    const deselectAllGroups = () => {
        setSelectedGroupIds([]);
    };

    const openAssignModal = (dateStr: string) => {
        setAssignDate(dateStr);
        setSelectedProgramId(null);
        setSelectedPackageId(null);
        setSelectedGroupIds([]);
    };

    const handleAssignSubmit = () => {
        if (!assignDate || selectedGroupIds.length === 0) return;
        assignForm.setData({ date: assignDate, group_ids: selectedGroupIds });
        router.post(route('schedule.sessions.store'), {
            date: assignDate,
            group_ids: selectedGroupIds,
        }, {
            preserveState: false,
            onSuccess: () => {
                setAssignDate(null);
            },
        });
    };

    const genderPriorityLabels: Record<string, string> = {
        male: 'رجال',
        female: 'نساء',
        all: 'مشتركة',
    };

    const handleSaveDate = () => {
        if (!selectedSession || !editDateValue) return;
        router.patch(route('schedule.sessions.update', selectedSession.id), {
            date: editDateValue,
        }, {
            preserveState: false,
            onSuccess: () => {
                setEditingDate(false);
                setSelectedSession(null);
            },
        });
    };

    const handleSaveHall = () => {
        if (!selectedSession || !editHallValue) return;
        router.patch(route('schedule.sessions.update', selectedSession.id), {
            training_hall_id: editHallValue,
        }, {
            preserveState: false,
            onSuccess: () => {
                setEditingHall(false);
                setSelectedSession(null);
            },
        });
    };

    const handleSaveTrainer = () => {
        if (!selectedSession) return;
        router.patch(route('schedule.sessions.update', selectedSession.id), {
            trainer_id: editTrainerValue || null,
        }, {
            preserveState: false,
            onSuccess: () => {
                setEditingTrainer(false);
                setSelectedSession(null);
            },
        });
    };

    // Drag and drop handlers
    const handleDragStart = (e: React.DragEvent, sessionId: number) => {
        setDragSessionId(sessionId);
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', String(sessionId));
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = (e: React.DragEvent, targetDate: string) => {
        e.preventDefault();
        const sessionId = parseInt(e.dataTransfer.getData('text/plain'));
        if (!sessionId) return;

        const session = sessions.find(s => s.id === sessionId);
        if (session && session.date !== targetDate) {
            router.patch(route('schedule.sessions.move', sessionId), {
                date: targetDate,
            }, { preserveState: false });
        }
        setDragSessionId(null);
    };

    return (
        <AuthenticatedLayout>
            <Head title="جدولة القاعات" />

            <PageHeader
                title="جدولة القاعات التدريبية"
                description="عرض وإدارة جدول القاعات والبرامج"
            />

            <div className="space-y-6">
                {/* Navigation Bar */}
                <Card>
                    <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => navigateDate('prev')}
                                className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors"
                            >
                                <ChevronRight className="h-5 w-5" />
                            </button>
                            <div className="text-center min-w-[220px]">
                                <h2 className="text-xl font-bold text-slate-800">{getDateLabel()}</h2>
                            </div>
                            <button
                                onClick={() => navigateDate('next')}
                                className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors"
                            >
                                <ChevronLeft className="h-5 w-5" />
                            </button>
                            <button
                                onClick={goToToday}
                                className="px-4 py-2 text-sm font-medium text-teal-600 hover:bg-teal-50 rounded-xl transition-colors border border-teal-200"
                            >
                                اليوم
                            </button>
                        </div>

                        <div className="flex items-center gap-4">
                            {/* Legend */}
                            <div className="hidden lg:flex items-center gap-4 text-sm">
                                <span className="flex items-center gap-1.5">
                                    <span className="w-2.5 h-2.5 rounded-full bg-sky-500"></span>
                                    رجال
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <span className="w-2.5 h-2.5 rounded-full bg-pink-500"></span>
                                    نساء
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span>
                                    مختلط
                                </span>
                            </div>

                            <div className="h-6 w-px bg-slate-200 hidden lg:block"></div>

                            {/* View Switcher */}
                            <div className="flex bg-slate-100 rounded-xl p-1">
                                {([
                                    { key: 'daily' as ViewType, label: 'يومي', icon: CalendarDays },
                                    { key: 'weekly' as ViewType, label: 'أسبوعي', icon: CalendarRange },
                                    { key: 'monthly' as ViewType, label: 'شهري', icon: LayoutGrid },
                                ]).map(({ key, label, icon: Icon }) => (
                                    <button
                                        key={key}
                                        onClick={() => changeView(key)}
                                        className={clsx(
                                            'flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all',
                                            viewType === key
                                                ? 'bg-white text-teal-600 shadow-sm'
                                                : 'text-slate-500 hover:text-slate-700'
                                        )}
                                    >
                                        <Icon className="h-4 w-4" />
                                        {label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </Card>

                {/* =================== DAILY VIEW =================== */}
                {viewType === 'daily' && (
                    <div className="space-y-4">
                        {/* Tabs */}
                        <div className="flex gap-2">
                            <button
                                onClick={() => setDailyTab('busy')}
                                className={clsx(
                                    'flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm transition-all',
                                    dailyTab === 'busy'
                                        ? 'bg-red-500 text-white shadow-lg shadow-red-200'
                                        : 'bg-white text-slate-600 border border-slate-200 hover:border-red-200 hover:text-red-600'
                                )}
                            >
                                <Building2 className="h-4 w-4" />
                                القاعات المشغولة
                                <span className={clsx(
                                    'px-2 py-0.5 rounded-full text-xs font-bold',
                                    dailyTab === 'busy' ? 'bg-white/20 text-white' : 'bg-red-100 text-red-600'
                                )}>
                                    {busyHalls.length}
                                </span>
                            </button>
                            <button
                                onClick={() => setDailyTab('available')}
                                className={clsx(
                                    'flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm transition-all',
                                    dailyTab === 'available'
                                        ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-200'
                                        : 'bg-white text-slate-600 border border-slate-200 hover:border-emerald-200 hover:text-emerald-600'
                                )}
                            >
                                <Calendar className="h-4 w-4" />
                                القاعات المتاحة
                                <span className={clsx(
                                    'px-2 py-0.5 rounded-full text-xs font-bold',
                                    dailyTab === 'available' ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-600'
                                )}>
                                    {availableHalls.length}
                                </span>
                            </button>
                        </div>

                        {/* Hall Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {dailyTab === 'busy' ? (
                                busyHalls.length === 0 ? (
                                    <Card className="col-span-full">
                                        <div className="text-center py-12 text-slate-400">
                                            <Calendar className="h-14 w-14 mx-auto mb-3 opacity-40" />
                                            <p className="font-medium text-lg">لا توجد قاعات مشغولة</p>
                                            <p className="text-sm mt-1">جميع القاعات متاحة في هذا اليوم</p>
                                        </div>
                                    </Card>
                                ) : (
                                    busyHalls.map((hall) => {
                                        const hallSessions = getSessionsForHall(hall.id, selectedDate);
                                        return (
                                            <Card key={hall.id} className="border-r-4 border-r-red-400 hover:shadow-lg transition-shadow" padding="none">
                                                <div className="p-4">
                                                    <div className="flex items-center justify-between mb-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="p-2.5 bg-gradient-to-br from-red-500 to-red-600 rounded-xl shadow-sm">
                                                                <Building2 className="h-5 w-5 text-white" />
                                                            </div>
                                                            <div>
                                                                <h3 className="font-bold text-slate-800">{hall.name}</h3>
                                                                <p className="text-xs text-slate-500">السعة: {hall.capacity} متدرب</p>
                                                            </div>
                                                        </div>
                                                        <Badge variant="danger">مشغولة</Badge>
                                                    </div>

                                                    <div className="space-y-3">
                                                        {hallSessions.map((session) => (
                                                            <button
                                                                key={session.id}
                                                                onClick={() => setSelectedSession(session)}
                                                                className={clsx(
                                                                    'w-full p-3 rounded-xl border text-right transition-all',
                                                                    genderSessionColors[session.program_group.gender]
                                                                )}
                                                            >
                                                                <div className="flex items-start justify-between mb-2">
                                                                    <h4 className="font-bold text-slate-800 text-sm">
                                                                        {session.program_group.package.program.name}
                                                                    </h4>
                                                                    <span className={clsx(
                                                                        'text-[10px] px-2 py-0.5 rounded-full font-bold border',
                                                                        genderLabels[session.program_group.gender]?.color
                                                                    )}>
                                                                        {genderLabels[session.program_group.gender]?.label}
                                                                    </span>
                                                                </div>
                                                                <p className="text-xs text-slate-600 mb-2">
                                                                    {session.program_group.package.name} &middot; {session.program_group.name}
                                                                </p>
                                                                <div className="flex items-center gap-3 text-[11px] text-slate-500">
                                                                    <span className="flex items-center gap-1">
                                                                        <Users className="h-3 w-3" />
                                                                        {session.program_group.trainees_count}/{session.program_group.capacity}
                                                                    </span>
                                                                    <span>اليوم {session.day_number}/{session.program_group.package.days}</span>
                                                                    {session.program_group.trainer && (
                                                                        <span className="flex items-center gap-1">
                                                                            <User className="h-3 w-3" />
                                                                            {session.program_group.trainer.name}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            </Card>
                                        );
                                    })
                                )
                            ) : (
                                availableHalls.length === 0 ? (
                                    <Card className="col-span-full">
                                        <div className="text-center py-12 text-slate-400">
                                            <Building2 className="h-14 w-14 mx-auto mb-3 opacity-40" />
                                            <p className="font-medium text-lg">جميع القاعات مشغولة</p>
                                            <p className="text-sm mt-1">لا توجد قاعات متاحة في هذا اليوم</p>
                                        </div>
                                    </Card>
                                ) : (
                                    availableHalls.map((hall) => (
                                        <Card key={hall.id} className="border-r-4 border-r-emerald-400 hover:shadow-lg transition-shadow" padding="none">
                                            <div className="p-4">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <div className="p-2.5 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl shadow-sm">
                                                            <Building2 className="h-5 w-5 text-white" />
                                                        </div>
                                                        <div>
                                                            <h3 className="font-bold text-slate-800">{hall.name}</h3>
                                                            <p className="text-xs text-slate-500">السعة: {hall.capacity} متدرب</p>
                                                        </div>
                                                    </div>
                                                    <Badge variant="success">متاحة</Badge>
                                                </div>
                                                <div className="mt-4 text-center py-6 bg-emerald-50/50 rounded-xl border border-dashed border-emerald-200">
                                                    <Calendar className="h-8 w-8 mx-auto text-emerald-300 mb-2" />
                                                    <p className="text-sm text-emerald-600 font-medium">القاعة متاحة للحجز</p>
                                                </div>
                                            </div>
                                        </Card>
                                    ))
                                )
                            )}
                        </div>
                    </div>
                )}

                {/* =================== WEEKLY VIEW =================== */}
                {viewType === 'weekly' && (
                    <Card padding="none">
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[900px]">
                                <thead>
                                    <tr>
                                        <th className="p-3 text-right text-xs font-bold text-slate-500 uppercase tracking-wider bg-slate-50 sticky right-0 z-10 min-w-[160px] border-b border-slate-200">
                                            القاعة
                                        </th>
                                        {getWeekDays().map((day) => {
                                            const dayDate = new Date(day);
                                            const isToday = day === todayStr;
                                            return (
                                                <th
                                                    key={day}
                                                    className={clsx(
                                                        'p-3 text-center min-w-[130px] border-b border-slate-200',
                                                        isToday ? 'bg-teal-50' : 'bg-slate-50'
                                                    )}
                                                >
                                                    <div className={clsx(
                                                        'text-sm font-bold',
                                                        isToday ? 'text-teal-700' : 'text-slate-600'
                                                    )}>
                                                        {dayNamesShort[dayDate.getDay()]}
                                                    </div>
                                                    <div className={clsx(
                                                        'text-xs mt-0.5',
                                                        isToday ? 'text-teal-600 font-semibold' : 'text-slate-400'
                                                    )}>
                                                        {dayDate.getDate()} {monthNames[dayDate.getMonth()]}
                                                    </div>
                                                </th>
                                            );
                                        })}
                                    </tr>
                                </thead>
                                <tbody>
                                    {halls.map((hall) => (
                                        <tr key={hall.id} className="border-b border-slate-100 hover:bg-slate-50/30 transition-colors">
                                            <td className="p-3 bg-white sticky right-0 z-10 border-l border-slate-100">
                                                <div className="flex items-center gap-2.5">
                                                    <div className="p-1.5 bg-slate-100 rounded-lg">
                                                        <Building2 className="h-4 w-4 text-slate-500" />
                                                    </div>
                                                    <div>
                                                        <span className="font-semibold text-slate-700 text-sm block">{hall.name}</span>
                                                        <span className="text-[11px] text-slate-400">{hall.capacity} متدرب</span>
                                                    </div>
                                                </div>
                                            </td>
                                            {getWeekDays().map((day) => {
                                                const daySessions = getSessionsForHall(hall.id, day);
                                                const isToday = day === todayStr;
                                                return (
                                                    <td key={day} className={clsx('p-1.5', isToday && 'bg-teal-50/30')}>
                                                        {daySessions.length > 0 ? (
                                                            <div className="space-y-1">
                                                                {daySessions.map((session) => (
                                                                    <button
                                                                        key={session.id}
                                                                        onClick={() => setSelectedSession(session)}
                                                                        className={clsx(
                                                                            'w-full p-2 rounded-lg text-xs text-right transition-all border',
                                                                            genderSessionColors[session.program_group.gender]
                                                                        )}
                                                                    >
                                                                        <div className="font-bold truncate text-slate-800">{session.program_group.package.program.name}</div>
                                                                        <div className="truncate text-slate-500 mt-0.5">{session.program_group.name}</div>
                                                                        <div className="flex items-center gap-1 mt-1 text-[10px] text-slate-400">
                                                                            <span className={clsx('w-1.5 h-1.5 rounded-full', genderDotColors[session.program_group.gender])}></span>
                                                                            يوم {session.day_number}
                                                                        </div>
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        ) : (
                                                            <div className="h-16"></div>
                                                        )}
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                )}

                {/* =================== MONTHLY VIEW =================== */}
                {viewType === 'monthly' && (() => {
                    const { year, month, firstDay, daysInMonth } = getMonthData();

                    return (
                        <Card padding="none">
                            {/* Day headers */}
                            <div className="grid grid-cols-7 border-b border-slate-200">
                                {dayNames.map((day, i) => (
                                    <div key={day} className={clsx(
                                        'py-3 text-center text-sm font-bold',
                                        i === 5 ? 'text-emerald-600 bg-emerald-50/50' : 'text-slate-600 bg-slate-50'
                                    )}>
                                        {day}
                                    </div>
                                ))}
                            </div>

                            {/* Calendar grid */}
                            <div className="grid grid-cols-7">
                                {/* Empty cells before first day */}
                                {Array.from({ length: firstDay }).map((_, i) => (
                                    <div key={`empty-${i}`} className="min-h-[140px] bg-slate-50/30 border-b border-r border-slate-100"></div>
                                ))}

                                {/* Day cells */}
                                {Array.from({ length: daysInMonth }).map((_, idx) => {
                                    const day = idx + 1;
                                    const dayStr = formatLocalDate(year, month, day);
                                    const isToday = dayStr === todayStr;
                                    const daySessions = sessions.filter(s => s.date === dayStr);
                                    const isFriday = (firstDay + idx) % 7 === 5;

                                    // Group sessions by hall for display
                                    const uniquePrograms = new Map<number, { name: string; gender: string; count: number }>();
                                    daySessions.forEach(s => {
                                        const progId = s.program_group.package.program.id;
                                        if (!uniquePrograms.has(progId)) {
                                            uniquePrograms.set(progId, {
                                                name: s.program_group.package.program.name,
                                                gender: s.program_group.gender,
                                                count: 1,
                                            });
                                        } else {
                                            uniquePrograms.get(progId)!.count++;
                                        }
                                    });

                                    return (
                                        <div
                                            key={day}
                                            className={clsx(
                                                'min-h-[140px] border-b border-r border-slate-100 transition-all relative group',
                                                isToday && 'bg-teal-50/40 ring-2 ring-inset ring-teal-400',
                                                isFriday && 'bg-emerald-50/20',
                                                dragSessionId && 'hover:bg-blue-50',
                                            )}
                                            onDragOver={handleDragOver}
                                            onDrop={(e) => handleDrop(e, dayStr)}
                                        >
                                            {/* Day number + add button */}
                                            <div className="flex items-center justify-between p-2">
                                                <span className={clsx(
                                                    'inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold',
                                                    isToday
                                                        ? 'bg-teal-500 text-white shadow-sm'
                                                        : 'text-slate-700 hover:bg-slate-100'
                                                )}>
                                                    {day}
                                                </span>
                                                <button
                                                    onClick={() => openAssignModal(dayStr)}
                                                    className="opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:bg-teal-100 text-teal-600 transition-all"
                                                    title="إضافة جلسات"
                                                >
                                                    <Plus className="h-4 w-4" />
                                                </button>
                                            </div>

                                            {/* Sessions */}
                                            <div className="px-1.5 pb-1.5 space-y-1">
                                                {daySessions.slice(0, 3).map((session) => (
                                                    <div
                                                        key={session.id}
                                                        draggable
                                                        onDragStart={(e) => handleDragStart(e, session.id)}
                                                        onClick={() => setSelectedSession(session)}
                                                        className={clsx(
                                                            'px-2 py-1.5 rounded-lg text-[11px] cursor-grab active:cursor-grabbing border transition-all',
                                                            genderSessionColors[session.program_group.gender],
                                                            dragSessionId === session.id && 'opacity-50'
                                                        )}
                                                    >
                                                        <div className="flex items-center gap-1 mb-0.5">
                                                            <GripVertical className="h-3 w-3 text-slate-400 flex-shrink-0" />
                                                            <span className="font-bold text-slate-800 truncate">{session.program_group.package.program.name}</span>
                                                        </div>
                                                        <div className="text-[10px] text-slate-500 truncate pr-4">
                                                            {session.program_group.name}
                                                            {session.training_hall && (
                                                                <span> · {session.training_hall.name}</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                                {daySessions.length > 3 && (
                                                    <button
                                                        onClick={() => {
                                                            setSelectedDate(dayStr);
                                                            changeView('daily');
                                                        }}
                                                        className="w-full text-center text-[10px] text-teal-600 font-bold hover:text-teal-700 py-0.5"
                                                    >
                                                        +{daySessions.length - 3} المزيد
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </Card>
                    );
                })()}
            </div>

            {/* =================== SESSION DETAIL MODAL =================== */}
            <Modal
                open={!!selectedSession}
                onClose={() => { setSelectedSession(null); setEditingDate(false); setEditingHall(false); setEditingTrainer(false); }}
                title="تفاصيل الجلسة التدريبية"
                size="lg"
            >
                {selectedSession && (
                    <div className="space-y-5">
                        <div className="p-5 bg-gradient-to-l from-teal-50 to-emerald-50 rounded-xl border border-teal-100">
                            <h3 className="text-xl font-bold text-slate-800">
                                {selectedSession.program_group.package.program.name}
                            </h3>
                            <p className="text-slate-600 mt-1">
                                {selectedSession.program_group.package.name} &middot; {selectedSession.program_group.name}
                            </p>
                            <div className="flex flex-wrap gap-2 mt-3">
                                <Badge variant={statusLabels[selectedSession.status]?.variant || 'default'}>
                                    {statusLabels[selectedSession.status]?.label || selectedSession.status}
                                </Badge>
                                <span className={clsx(
                                    'text-xs px-2.5 py-1 rounded-lg font-bold border',
                                    genderLabels[selectedSession.program_group.gender]?.color
                                )}>
                                    {genderLabels[selectedSession.program_group.gender]?.label}
                                </span>
                                <span className="text-xs px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg font-bold border border-slate-200">
                                    اليوم {selectedSession.day_number} من {selectedSession.program_group.package.days}
                                </span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            {/* Hall - editable */}
                            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2 text-slate-500">
                                        <Building2 className="h-4 w-4" />
                                        <span className="text-sm font-semibold">القاعة</span>
                                    </div>
                                    {!editingHall ? (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setEditingHall(true);
                                                setEditHallValue(selectedSession.training_hall.id);
                                            }}
                                            className="p-1 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-teal-600 transition-colors"
                                            title="تعديل القاعة"
                                        >
                                            <Pencil className="h-3.5 w-3.5" />
                                        </button>
                                    ) : (
                                        <div className="flex items-center gap-1">
                                            <button
                                                type="button"
                                                onClick={handleSaveHall}
                                                className="p-1 rounded-lg hover:bg-teal-100 text-teal-600 transition-colors"
                                            >
                                                <Check className="h-3.5 w-3.5" />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setEditingHall(false)}
                                                className="p-1 rounded-lg hover:bg-slate-200 text-slate-400 transition-colors"
                                            >
                                                <X className="h-3.5 w-3.5" />
                                            </button>
                                        </div>
                                    )}
                                </div>
                                {editingHall ? (
                                    <HallSelect
                                        halls={halls}
                                        sessions={sessions}
                                        currentSession={selectedSession}
                                        value={editHallValue}
                                        onChange={setEditHallValue}
                                        genderPriorityLabels={genderPriorityLabels}
                                    />
                                ) : (
                                    <>
                                        <p className="font-bold text-slate-800">{selectedSession.training_hall.name}</p>
                                        <p className="text-sm text-slate-500">السعة: {selectedSession.training_hall.capacity}</p>
                                    </>
                                )}
                            </div>

                            {/* Date - editable */}
                            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2 text-slate-500">
                                        <Calendar className="h-4 w-4" />
                                        <span className="text-sm font-semibold">التاريخ</span>
                                    </div>
                                    {!editingDate ? (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setEditingDate(true);
                                                setEditDateValue(selectedSession.date);
                                            }}
                                            className="p-1 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-teal-600 transition-colors"
                                            title="تعديل التاريخ"
                                        >
                                            <Pencil className="h-3.5 w-3.5" />
                                        </button>
                                    ) : (
                                        <div className="flex items-center gap-1">
                                            <button
                                                type="button"
                                                onClick={handleSaveDate}
                                                className="p-1 rounded-lg hover:bg-teal-100 text-teal-600 transition-colors"
                                            >
                                                <Check className="h-3.5 w-3.5" />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setEditingDate(false)}
                                                className="p-1 rounded-lg hover:bg-slate-200 text-slate-400 transition-colors"
                                            >
                                                <X className="h-3.5 w-3.5" />
                                            </button>
                                        </div>
                                    )}
                                </div>
                                {editingDate ? (
                                    <input
                                        type="date"
                                        value={editDateValue}
                                        onChange={(e) => setEditDateValue(e.target.value)}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                                    />
                                ) : (
                                    <>
                                        <p className="font-bold text-slate-800">{formatDate(selectedSession.date)}</p>
                                        <p className="text-sm text-slate-500">{selectedSession.program_group.package.hours} ساعة</p>
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                                <div className="flex items-center gap-2 text-slate-500 mb-2">
                                    <Users className="h-4 w-4" />
                                    <span className="text-sm font-semibold">المتدربين</span>
                                </div>
                                <p className="font-bold text-slate-800 text-lg">
                                    {selectedSession.program_group.trainees_count}
                                    <span className="text-slate-400 text-sm font-normal"> / {selectedSession.program_group.capacity}</span>
                                </p>
                            </div>
                            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2 text-slate-500">
                                        <User className="h-4 w-4" />
                                        <span className="text-sm font-semibold">المدرب</span>
                                    </div>
                                    {!editingTrainer ? (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setEditingTrainer(true);
                                                setEditTrainerValue(selectedSession.program_group.trainer?.id || '');
                                            }}
                                            className="p-1 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-teal-600 transition-colors"
                                            title="تعديل المدرب"
                                        >
                                            <Pencil className="h-3.5 w-3.5" />
                                        </button>
                                    ) : (
                                        <div className="flex items-center gap-1">
                                            <button
                                                type="button"
                                                onClick={handleSaveTrainer}
                                                className="p-1 rounded-lg hover:bg-teal-100 text-teal-600 transition-colors"
                                            >
                                                <Check className="h-3.5 w-3.5" />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setEditingTrainer(false)}
                                                className="p-1 rounded-lg hover:bg-slate-200 text-slate-400 transition-colors"
                                            >
                                                <X className="h-3.5 w-3.5" />
                                            </button>
                                        </div>
                                    )}
                                </div>
                                {editingTrainer ? (() => {
                                    const busyTrainerIds = sessions
                                        .filter(s => s.date === selectedSession.date && s.id !== selectedSession.id && s.program_group.trainer)
                                        .map(s => s.program_group.trainer!.id);
                                    const availableTrainers = trainers.filter(t => !busyTrainerIds.includes(t.id));
                                    return (
                                        <div className="space-y-2">
                                            <select
                                                value={editTrainerValue}
                                                onChange={(e) => setEditTrainerValue(e.target.value ? Number(e.target.value) : '')}
                                                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                                            >
                                                <option value="">بدون مدرب</option>
                                                {availableTrainers.map(t => (
                                                    <option key={t.id} value={t.id}>{t.name}</option>
                                                ))}
                                            </select>
                                            {busyTrainerIds.length > 0 && (
                                                <p className="text-[11px] text-amber-600">
                                                    {busyTrainerIds.length} مدرب مشغول في نفس اليوم ولا يظهر هنا
                                                </p>
                                            )}
                                        </div>
                                    );
                                })() : (
                                    <p className="font-bold text-slate-800">
                                        {selectedSession.program_group.trainer?.name || 'غير محدد'}
                                    </p>
                                )}
                            </div>
                        </div>

                        {selectedSession.program_group.package.supervisor && (
                            <div className="p-4 bg-amber-50 rounded-xl border border-amber-100">
                                <div className="flex items-center gap-2 text-amber-600 mb-1">
                                    <User className="h-4 w-4" />
                                    <span className="text-sm font-semibold">المشرف المسؤول</span>
                                </div>
                                <p className="font-bold text-amber-800">{selectedSession.program_group.package.supervisor.name}</p>
                            </div>
                        )}

                        <Button
                            variant="secondary"
                            className="w-full"
                            onClick={() => router.visit(route('groups.show', selectedSession.program_group.id))}
                        >
                            <Eye className="h-4 w-4 ml-2" />
                            عرض المجموعة
                        </Button>
                    </div>
                )}
            </Modal>

            {/* =================== ASSIGN GROUPS MODAL =================== */}
            <Modal
                open={!!assignDate}
                onClose={() => setAssignDate(null)}
                title={`إضافة جلسات - ${assignDate ? (() => {
                    const d = new Date(assignDate);
                    return `${d.getDate()} ${monthNames[d.getMonth()]} ${d.getFullYear()}`;
                })() : ''}`}
                size="lg"
            >
                <div className="space-y-5">
                    {/* Step 1: Select Program */}
                    <div>
                        <SearchableSelect
                            label="البرنامج التدريبي"
                            value={selectedProgramId || ''}
                            onChange={(val) => {
                                setSelectedProgramId(val ? Number(val) : null);
                                setSelectedPackageId(null);
                                setSelectedGroupIds([]);
                            }}
                            options={programs
                                .filter(p => p.packages.some(pkg => pkg.groups.length > 0))
                                .map(p => ({ value: p.id, label: p.name }))
                            }
                            placeholder="اختر البرنامج..."
                            searchPlaceholder="ابحث عن برنامج..."
                        />
                    </div>

                    {/* Step 2: Select Package */}
                    {selectedProgram && (
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">الحقيبة التدريبية</label>
                            <select
                                value={selectedPackageId || ''}
                                onChange={(e) => {
                                    const val = e.target.value ? Number(e.target.value) : null;
                                    setSelectedPackageId(val);
                                    setSelectedGroupIds([]);
                                }}
                                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all"
                            >
                                <option value="">اختر الحقيبة...</option>
                                {selectedProgram.packages
                                    .filter(pkg => pkg.groups.length > 0)
                                    .map(pkg => (
                                        <option key={pkg.id} value={pkg.id}>{pkg.name} ({pkg.days} يوم)</option>
                                    ))
                                }
                            </select>
                        </div>
                    )}

                    {/* Step 3: Select Groups */}
                    {selectedPackage && selectedPackage.groups.length > 0 && (
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="text-sm font-bold text-slate-700">المجموعات</label>
                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        onClick={selectAllGroups}
                                        className="text-xs text-teal-600 hover:text-teal-700 font-semibold"
                                    >
                                        تحديد الكل
                                    </button>
                                    <span className="text-slate-300">|</span>
                                    <button
                                        type="button"
                                        onClick={deselectAllGroups}
                                        className="text-xs text-slate-500 hover:text-slate-700 font-semibold"
                                    >
                                        إلغاء الكل
                                    </button>
                                </div>
                            </div>
                            <div className="space-y-2 max-h-[300px] overflow-y-auto">
                                {selectedPackage.groups.map(group => {
                                    const isSelected = selectedGroupIds.includes(group.id);
                                    // Check if already has session on this date
                                    const alreadyBooked = sessions.some(
                                        s => s.program_group.id === group.id && s.date === assignDate
                                    );
                                    return (
                                        <button
                                            key={group.id}
                                            type="button"
                                            disabled={alreadyBooked}
                                            onClick={() => toggleGroup(group.id)}
                                            className={clsx(
                                                'w-full flex items-center gap-3 p-3 rounded-xl border text-right transition-all',
                                                alreadyBooked
                                                    ? 'bg-slate-50 border-slate-200 opacity-50 cursor-not-allowed'
                                                    : isSelected
                                                    ? 'bg-teal-50 border-teal-300 ring-1 ring-teal-200'
                                                    : 'bg-white border-slate-200 hover:border-teal-200 hover:bg-teal-50/30'
                                            )}
                                        >
                                            {isSelected ? (
                                                <CheckSquare className="h-5 w-5 text-teal-600 flex-shrink-0" />
                                            ) : (
                                                <Square className="h-5 w-5 text-slate-300 flex-shrink-0" />
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-semibold text-slate-800 text-sm">{group.name}</span>
                                                    <span className={clsx(
                                                        'text-[10px] px-1.5 py-0.5 rounded-full font-bold border',
                                                        genderLabels[group.gender]?.color
                                                    )}>
                                                        {genderLabels[group.gender]?.label}
                                                    </span>
                                                    {alreadyBooked && (
                                                        <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold bg-amber-100 text-amber-700 border border-amber-200">
                                                            محجوزة
                                                        </span>
                                                    )}
                                                </div>
                                                {group.hall_name && (
                                                    <p className="text-xs text-slate-500 mt-0.5">القاعة: {group.hall_name}</p>
                                                )}
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {selectedPackage && selectedPackage.groups.length === 0 && (
                        <div className="text-center py-6 text-slate-400 bg-slate-50 rounded-xl">
                            <p className="font-medium">لا توجد مجموعات متبقية في هذه الحقيبة</p>
                        </div>
                    )}

                    {/* Completed groups warning */}
                    {selectedPackage && selectedPackage.completed_groups && selectedPackage.completed_groups.length > 0 && (
                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                            <p className="text-sm font-bold text-amber-700 mb-2">مجموعات منتهية في هذه الحقيبة:</p>
                            <div className="space-y-1">
                                {selectedPackage.completed_groups.map(g => (
                                    <div key={g.id} className="flex items-center justify-between text-xs">
                                        <span className="text-amber-800 font-medium">{g.name}</span>
                                        <span className="text-amber-600">انتهت في {formatDate(g.last_session_date)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Submit */}
                    <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                        <span className="text-sm text-slate-500">
                            {selectedGroupIds.length > 0 && (
                                <span className="font-bold text-teal-600">{selectedGroupIds.length}</span>
                            )}
                            {selectedGroupIds.length > 0 && ' مجموعة محددة'}
                        </span>
                        <div className="flex gap-3">
                            <Button variant="secondary" onClick={() => setAssignDate(null)}>إلغاء</Button>
                            <Button
                                onClick={handleAssignSubmit}
                                disabled={selectedGroupIds.length === 0 || assignForm.processing}
                            >
                                {assignForm.processing ? 'جاري الإضافة...' : 'إضافة الجلسات'}
                            </Button>
                        </div>
                    </div>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}
