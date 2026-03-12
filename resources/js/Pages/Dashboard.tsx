import AuthenticatedLayout from '@/Components/Layout/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import {
    BookOpen,
    Users,
    GraduationCap,
    Building2,
    School,
    UserCheck,
    Calendar,
    TrendingUp,
    Clock,
    Activity,
} from 'lucide-react';
import clsx from 'clsx';
import Card from '@/Components/UI/Card';
import Badge from '@/Components/UI/Badge';

interface DashboardProps {
    stats: {
        programs: number;
        groups: number;
        trainers: number;
        trainingHalls: number;
        schools: number;
        employees: number;
    };
    todaySessions: Array<{
        id: number;
        program: string;
        package: string;
        group: string;
        hall: string;
        trainer: string;
        status: string;
        day_number: number;
    }>;
    hallsStatus: Array<{
        id: number;
        name: string;
        capacity: number;
        is_busy: boolean;
    }>;
    upcomingSessions: Array<{
        id: number;
        program: string;
        group: string;
        hall: string;
        date: string;
        day_name: string;
    }>;
    recentPrograms: Array<{
        id: number;
        name: string;
        type: string;
        supervisor: string;
        status: string;
    }>;
    currentYear: { id: number; name: string } | null;
}

interface StatCardProps {
    title: string;
    value: number;
    icon: React.ElementType;
    borderColor: string;
    iconBg: string;
    iconColor: string;
}

function StatCard({ title, value, icon: Icon, borderColor, iconBg, iconColor }: StatCardProps) {
    return (
        <Card className={clsx('border-r-4 hover:shadow-sm transition-all', borderColor)}>
            <div className="flex items-center gap-4">
                <div className={clsx('p-3 rounded-xl', iconBg)}>
                    <Icon className={clsx('h-5 w-5', iconColor)} />
                </div>
                <div>
                    <p className="text-sm text-slate-500">{title}</p>
                    <p className="text-2xl font-bold text-slate-800">{value}</p>
                </div>
            </div>
        </Card>
    );
}

const statusLabels: Record<string, { label: string; variant: 'success' | 'warning' | 'danger' | 'info' | 'default' | 'primary' }> = {
    scheduled: { label: 'مجدول', variant: 'info' },
    in_progress: { label: 'قيد التنفيذ', variant: 'warning' },
    completed: { label: 'مكتمل', variant: 'success' },
    cancelled: { label: 'ملغي', variant: 'danger' },
    new: { label: 'جديد', variant: 'primary' },
    existing: { label: 'قائم', variant: 'default' },
};

const typeLabels: Record<string, string> = {
    qualification: 'تأهيل',
    licensing: 'ترخيص',
    development: 'تطوير',
    other: 'أخرى',
};

export default function Dashboard({
    stats = { programs: 0, groups: 0, trainers: 0, trainingHalls: 0, schools: 0, employees: 0 },
    todaySessions = [],
    hallsStatus = [],
    upcomingSessions = [],
    recentPrograms = [],
    currentYear,
}: DashboardProps) {
    const busyHalls = hallsStatus.filter((h) => h.is_busy).length;
    const availableHalls = hallsStatus.length - busyHalls;

    return (
        <AuthenticatedLayout>
            <Head title="لوحة التحكم" />

            <div className="space-y-6">
                <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800">
                            لوحة التحكم
                        </h1>
                        {currentYear && (
                            <p className="text-sm text-slate-500 mt-1 flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                العام الدراسي: <span className="font-semibold text-teal-600">{currentYear.name}</span>
                            </p>
                        )}
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl border border-slate-200">
                        <Clock className="h-4 w-4 text-slate-400" />
                        <span className="text-sm text-slate-600 font-medium">
                            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </span>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                    <StatCard
                        title="البرامج التدريبية"
                        value={stats.programs}
                        icon={BookOpen}
                        borderColor="border-r-teal-400"
                        iconBg="bg-teal-50"
                        iconColor="text-teal-600"
                    />
                    <StatCard
                        title="المجموعات"
                        value={stats.groups}
                        icon={Users}
                        borderColor="border-r-sky-400"
                        iconBg="bg-sky-50"
                        iconColor="text-sky-600"
                    />
                    <StatCard
                        title="المدربين"
                        value={stats.trainers}
                        icon={GraduationCap}
                        borderColor="border-r-violet-400"
                        iconBg="bg-violet-50"
                        iconColor="text-violet-600"
                    />
                    <StatCard
                        title="القاعات"
                        value={stats.trainingHalls}
                        icon={Building2}
                        borderColor="border-r-amber-400"
                        iconBg="bg-amber-50"
                        iconColor="text-amber-600"
                    />
                    <StatCard
                        title="المدارس"
                        value={stats.schools}
                        icon={School}
                        borderColor="border-r-indigo-400"
                        iconBg="bg-indigo-50"
                        iconColor="text-indigo-600"
                    />
                    <StatCard
                        title="المتدربين"
                        value={stats.employees}
                        icon={UserCheck}
                        borderColor="border-r-emerald-400"
                        iconBg="bg-emerald-50"
                        iconColor="text-emerald-600"
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <Card className="lg:col-span-2" padding="none">
                        <div className="p-5 border-b border-slate-100">
                            <div className="flex items-center justify-between">
                                <h2 className="font-bold text-slate-800 flex items-center gap-2">
                                    <div className="p-2 bg-teal-50 rounded-lg">
                                        <Calendar className="h-5 w-5 text-teal-600" />
                                    </div>
                                    جلسات اليوم
                                </h2>
                                <Badge variant={todaySessions.length > 0 ? 'success' : 'default'}>
                                    {todaySessions.length} جلسة
                                </Badge>
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            {todaySessions.length === 0 ? (
                                <div className="p-12 text-center text-slate-500">
                                    <Calendar className="h-14 w-14 mx-auto text-slate-200 mb-4" />
                                    <p className="font-medium text-slate-600">لا توجد جلسات مجدولة لهذا اليوم</p>
                                    <p className="text-sm text-slate-400 mt-1">ستظهر الجلسات المجدولة هنا</p>
                                </div>
                            ) : (
                                <table className="w-full">
                                    <thead className="bg-slate-50/80">
                                        <tr>
                                            <th className="px-4 py-3.5 text-right text-xs font-bold text-slate-600 uppercase tracking-wide">البرنامج</th>
                                            <th className="px-4 py-3.5 text-right text-xs font-bold text-slate-600 uppercase tracking-wide">المجموعة</th>
                                            <th className="px-4 py-3.5 text-right text-xs font-bold text-slate-600 uppercase tracking-wide">القاعة</th>
                                            <th className="px-4 py-3.5 text-right text-xs font-bold text-slate-600 uppercase tracking-wide">المدرب</th>
                                            <th className="px-4 py-3.5 text-right text-xs font-bold text-slate-600 uppercase tracking-wide">اليوم</th>
                                            <th className="px-4 py-3.5 text-right text-xs font-bold text-slate-600 uppercase tracking-wide">الحالة</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {todaySessions.map((session) => (
                                            <tr key={session.id} className="hover:bg-slate-50/50 transition-colors">
                                                <td className="px-4 py-4 text-sm font-semibold text-slate-800">{session.program}</td>
                                                <td className="px-4 py-4 text-sm text-slate-600">{session.group}</td>
                                                <td className="px-4 py-4 text-sm text-slate-600">{session.hall}</td>
                                                <td className="px-4 py-4 text-sm text-slate-600">{session.trainer}</td>
                                                <td className="px-4 py-4">
                                                    <span className="px-2 py-1 bg-slate-100 rounded-lg text-sm font-medium text-slate-700">
                                                        اليوم {session.day_number}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-4">
                                                    <Badge variant={statusLabels[session.status]?.variant || 'default'}>
                                                        {statusLabels[session.status]?.label || session.status}
                                                    </Badge>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </Card>

                    <Card padding="none">
                        <div className="p-5 border-b border-slate-100">
                            <h2 className="font-bold text-slate-800 flex items-center gap-2">
                                <div className="p-2 bg-amber-50 rounded-lg">
                                    <Building2 className="h-5 w-5 text-amber-600" />
                                </div>
                                حالة القاعات
                            </h2>
                        </div>
                        <div className="p-5">
                            <div className="flex items-center justify-center gap-4 mb-5">
                                <div className="text-center p-4 bg-emerald-50 rounded-xl border border-emerald-100 flex-1">
                                    <p className="text-3xl font-bold text-emerald-600">{availableHalls}</p>
                                    <p className="text-sm text-emerald-700 mt-1 font-medium">متاحة</p>
                                </div>
                                <div className="text-center p-4 bg-rose-50 rounded-xl border border-rose-100 flex-1">
                                    <p className="text-3xl font-bold text-rose-600">{busyHalls}</p>
                                    <p className="text-sm text-rose-700 mt-1 font-medium">مشغولة</p>
                                </div>
                            </div>
                            <div className="space-y-2 max-h-64 overflow-y-auto">
                                {hallsStatus.length === 0 ? (
                                    <p className="text-center text-slate-500 py-8">لا توجد قاعات مسجلة</p>
                                ) : (
                                    hallsStatus.map((hall) => (
                                        <div
                                            key={hall.id}
                                            className={clsx(
                                                'flex items-center justify-between p-3 rounded-xl border transition-all hover:shadow-sm',
                                                hall.is_busy
                                                    ? 'bg-rose-50/50 border-rose-100'
                                                    : 'bg-emerald-50/50 border-emerald-100'
                                            )}
                                        >
                                            <div className="flex items-center gap-2.5">
                                                <div
                                                    className={clsx(
                                                        'w-2 h-2 rounded-full',
                                                        hall.is_busy ? 'bg-rose-500' : 'bg-emerald-500'
                                                    )}
                                                />
                                                <span className="text-sm font-semibold text-slate-700">{hall.name}</span>
                                            </div>
                                            <span className="text-xs text-slate-500 font-medium">{hall.capacity} متدرب</span>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card padding="none">
                        <div className="p-5 border-b border-slate-100">
                            <h2 className="font-bold text-slate-800 flex items-center gap-2">
                                <div className="p-2 bg-sky-50 rounded-lg">
                                    <TrendingUp className="h-5 w-5 text-sky-600" />
                                </div>
                                الجلسات القادمة
                            </h2>
                        </div>
                        <div className="divide-y divide-slate-100">
                            {upcomingSessions.length === 0 ? (
                                <div className="p-12 text-center text-slate-500">
                                    <Calendar className="h-12 w-12 mx-auto text-slate-200 mb-3" />
                                    <p className="font-medium">لا توجد جلسات قادمة</p>
                                </div>
                            ) : (
                                upcomingSessions.map((session) => (
                                    <div key={session.id} className="p-4 hover:bg-slate-50/50 transition-colors">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <p className="font-semibold text-slate-800">{session.program}</p>
                                                <p className="text-sm text-slate-500">{session.group}</p>
                                            </div>
                                            <div className="text-left">
                                                <p className="text-sm font-semibold text-teal-600">{session.day_name}</p>
                                                <p className="text-xs text-slate-400">{session.date}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-2">
                                            <Building2 className="h-3.5 w-3.5" />
                                            {session.hall}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </Card>

                    <Card padding="none">
                        <div className="p-5 border-b border-slate-100">
                            <h2 className="font-bold text-slate-800 flex items-center gap-2">
                                <div className="p-2 bg-violet-50 rounded-lg">
                                    <Activity className="h-5 w-5 text-violet-600" />
                                </div>
                                أحدث البرامج
                            </h2>
                        </div>
                        <div className="divide-y divide-slate-100">
                            {recentPrograms.length === 0 ? (
                                <div className="p-12 text-center text-slate-500">
                                    <BookOpen className="h-12 w-12 mx-auto text-slate-200 mb-3" />
                                    <p className="font-medium">لا توجد برامج مضافة</p>
                                </div>
                            ) : (
                                recentPrograms.map((program) => (
                                    <div key={program.id} className="p-4 hover:bg-slate-50/50 transition-colors">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <p className="font-semibold text-slate-800">{program.name}</p>
                                                <p className="text-sm text-slate-500 flex items-center gap-1 mt-0.5">
                                                    <UserCheck className="h-3.5 w-3.5" />
                                                    {program.supervisor}
                                                </p>
                                            </div>
                                            <div className="flex flex-col items-end gap-1.5">
                                                <Badge variant={statusLabels[program.status]?.variant || 'default'}>
                                                    {statusLabels[program.status]?.label || program.status}
                                                </Badge>
                                                <span className="text-xs text-slate-400 font-medium">
                                                    {typeLabels[program.type] || program.type}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </Card>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
