import AuthenticatedLayout from '@/Components/Layout/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { useState, useMemo } from 'react';
import { Plus, ChevronLeft, ChevronRight, Clock, User, Building2, Edit2, Trash2, CalendarDays, X, Calendar } from 'lucide-react';
import Card from '@/Components/UI/Card';
import Button from '@/Components/UI/Button';
import PageHeader from '@/Components/UI/PageHeader';
import FormModal from '@/Components/UI/FormModal';
import DeleteModal from '@/Components/UI/DeleteModal';
import Input from '@/Components/UI/Input';
import SearchableSelect from '@/Components/UI/SearchableSelect';
import clsx from 'clsx';

// ————— ألوان القاعات —————
const HALL_COLORS = [
    { bg: 'bg-teal-50',    border: 'border-r-teal-500',   text: 'text-teal-700',   dot: 'bg-teal-500',   light: 'bg-teal-100',   ring: 'ring-teal-200' },
    { bg: 'bg-violet-50',  border: 'border-r-violet-500', text: 'text-violet-700', dot: 'bg-violet-500', light: 'bg-violet-100', ring: 'ring-violet-200' },
    { bg: 'bg-amber-50',   border: 'border-r-amber-500',  text: 'text-amber-700',  dot: 'bg-amber-500',  light: 'bg-amber-100',  ring: 'ring-amber-200' },
    { bg: 'bg-rose-50',    border: 'border-r-rose-500',   text: 'text-rose-700',   dot: 'bg-rose-500',   light: 'bg-rose-100',   ring: 'ring-rose-200' },
    { bg: 'bg-blue-50',    border: 'border-r-blue-500',   text: 'text-blue-700',   dot: 'bg-blue-500',   light: 'bg-blue-100',   ring: 'ring-blue-200' },
    { bg: 'bg-emerald-50', border: 'border-r-emerald-500',text: 'text-emerald-700',dot: 'bg-emerald-500',light: 'bg-emerald-100',ring: 'ring-emerald-200' },
    { bg: 'bg-orange-50',  border: 'border-r-orange-500', text: 'text-orange-700', dot: 'bg-orange-500', light: 'bg-orange-100', ring: 'ring-orange-200' },
    { bg: 'bg-pink-50',    border: 'border-r-pink-500',   text: 'text-pink-700',   dot: 'bg-pink-500',   light: 'bg-pink-100',   ring: 'ring-pink-200' },
];

const ARABIC_MONTHS = ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'];
const ARABIC_DAYS = ['الأحد','الاثنين','الثلاثاء','الأربعاء','الخميس','الجمعة','السبت'];

// ————— أنواع البيانات —————
interface DropdownOption { id: number; value: string; label: string; is_active: boolean; }
interface UserItem { id: number; name: string; }
interface Booking {
    id: number; hall_name: string; booked_by: number;
    booker: { id: number; name: string };
    date: string; start_time: string; end_time: string; notes: string | null;
}
interface Props { bookings: Booking[]; users: UserItem[]; halls: DropdownOption[]; }

export default function Index({ bookings, users, halls }: Props) {
    const today = new Date();
    const [year,  setYear]  = useState(today.getFullYear());
    const [month, setMonth] = useState(today.getMonth());

    const [showForm,  setShowForm]  = useState(false);
    const [editing,   setEditing]   = useState<Booking | null>(null);
    const [deleting,  setDeleting]  = useState<Booking | null>(null);
    const [activeDay, setActiveDay] = useState<string | null>(null);

    // خريطة اسم القاعة → لون
    const hallColorMap = useMemo(() => {
        const map: Record<string, typeof HALL_COLORS[0]> = {};
        const names = [...new Set([...halls.map(h => h.value), ...bookings.map(b => b.hall_name)])];
        names.forEach((n, i) => { map[n] = HALL_COLORS[i % HALL_COLORS.length]; });
        return map;
    }, [halls, bookings]);

    const clr = (hall: string) => hallColorMap[hall] ?? HALL_COLORS[0];

    const bookingsByDate = useMemo(() => {
        const map: Record<string, Booking[]> = {};
        bookings.forEach(b => {
            if (!map[b.date]) map[b.date] = [];
            map[b.date].push(b);
        });
        return map;
    }, [bookings]);

    const fmt = (y: number, m: number, d: number) =>
        `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

    const todayStr = fmt(today.getFullYear(), today.getMonth(), today.getDate());

    const { firstDay, totalDays } = useMemo(() => ({
        firstDay:  new Date(year, month, 1).getDay(),
        totalDays: new Date(year, month + 1, 0).getDate(),
    }), [year, month]);

    const cells: (number | null)[] = [
        ...new Array(firstDay).fill(null),
        ...Array.from({ length: totalDays }, (_, i) => i + 1),
    ];

    const prevMonth = () => { if (month === 0) { setMonth(11); setYear(y => y - 1); } else setMonth(m => m - 1); };
    const nextMonth = () => { if (month === 11) { setMonth(0);  setYear(y => y + 1); } else setMonth(m => m + 1); };
    const goToday   = () => { setMonth(today.getMonth()); setYear(today.getFullYear()); };

    const openAdd = (dateStr: string) => { setEditing(null); setActiveDay(dateStr); setShowForm(true); };
    const openEdit = (b: Booking) => { setEditing(b); setActiveDay(b.date); setShowForm(true); };
    const closeForm = () => { setShowForm(false); setEditing(null); };

    const formInitial = editing ? {
        hall_name: editing.hall_name, booked_by: String(editing.booked_by),
        date: editing.date, start_time: editing.start_time, end_time: editing.end_time, notes: editing.notes ?? '',
    } : {
        hall_name: '', booked_by: '', date: activeDay ?? '', start_time: '', end_time: '', notes: '',
    };

    const activeDayBookings = activeDay
        ? (bookingsByDate[activeDay] ?? []).slice().sort((a, b) => a.start_time.localeCompare(b.start_time))
        : [];

    const monthBookingsCount = Object.entries(bookingsByDate)
        .filter(([d]) => d.startsWith(`${year}-${String(month + 1).padStart(2, '0')}`))
        .reduce((acc, [, arr]) => acc + arr.length, 0);

    return (
        <AuthenticatedLayout>
            <Head title="تقويم الاجتماعات" />

            <PageHeader
                title="تقويم الاجتماعات"
                description="إدارة حجوزات قاعات الاجتماعات"
            />

            <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
                {/* ==================== التقويم ==================== */}
                <div className="xl:col-span-3">
                    <Card padding="none">
                        {/* رأس التقويم */}
                        <div className="flex items-center justify-between px-6 py-5 bg-gradient-to-l from-slate-50 to-white border-b border-slate-200">
                            <div className="flex items-center gap-2">
                                <button onClick={prevMonth} className="p-2.5 rounded-xl hover:bg-slate-100 text-slate-500 transition-colors border border-slate-200">
                                    <ChevronRight className="h-5 w-5" />
                                </button>
                                <button onClick={nextMonth} className="p-2.5 rounded-xl hover:bg-slate-100 text-slate-500 transition-colors border border-slate-200">
                                    <ChevronLeft className="h-5 w-5" />
                                </button>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl shadow-sm">
                                    <Calendar className="h-5 w-5 text-white" />
                                </div>
                                <h2 className="text-xl font-bold text-slate-800">
                                    {ARABIC_MONTHS[month]} <span className="text-teal-600">{year}</span>
                                </h2>
                            </div>
                            <button onClick={goToday} className="px-4 py-2 text-sm font-semibold text-teal-600 hover:text-teal-700 bg-teal-50 hover:bg-teal-100 rounded-xl transition-colors border border-teal-200">
                                اليوم
                            </button>
                        </div>

                        {/* أيام الأسبوع */}
                        <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50">
                            {ARABIC_DAYS.map(d => (
                                <div key={d} className="py-3 text-center text-sm font-bold text-slate-600">
                                    {d}
                                </div>
                            ))}
                        </div>

                        {/* خلايا التقويم */}
                        <div className="grid grid-cols-7">
                            {cells.map((day, idx) => {
                                if (!day) return (
                                    <div key={`e-${idx}`} className="min-h-[120px] bg-slate-50/50 border-b border-l border-slate-100" />
                                );
                                const ds = fmt(year, month, day);
                                const dayBookings = bookingsByDate[ds] ?? [];
                                const isToday  = ds === todayStr;
                                const isActive = ds === activeDay;
                                const hasBookings = dayBookings.length > 0;

                                return (
                                    <div
                                        key={ds}
                                        onClick={() => setActiveDay(isActive ? null : ds)}
                                        className={clsx(
                                            'min-h-[120px] border-b border-l border-slate-100 p-2 cursor-pointer transition-all duration-200 group relative',
                                            isActive
                                                ? 'bg-teal-50 ring-2 ring-inset ring-teal-400 z-10'
                                                : isToday
                                                    ? 'bg-teal-50/40'
                                                    : 'hover:bg-slate-50/80'
                                        )}
                                    >
                                        {/* رقم اليوم */}
                                        <div className="flex items-center justify-between mb-2">
                                            <span className={clsx(
                                                'text-sm font-bold w-8 h-8 flex items-center justify-center rounded-full transition-colors',
                                                isToday
                                                    ? 'bg-gradient-to-br from-teal-500 to-teal-600 text-white shadow-md shadow-teal-200'
                                                    : hasBookings
                                                        ? 'text-slate-800'
                                                        : 'text-slate-500'
                                            )}>
                                                {day}
                                            </span>
                                            <button
                                                type="button"
                                                onClick={(e) => { e.stopPropagation(); openAdd(ds); }}
                                                className="opacity-0 group-hover:opacity-100 w-7 h-7 flex items-center justify-center rounded-lg bg-teal-500 text-white shadow-sm hover:bg-teal-600 transition-all"
                                            >
                                                <Plus className="h-3.5 w-3.5" />
                                            </button>
                                        </div>

                                        {/* الحجوزات */}
                                        <div className="space-y-1">
                                            {dayBookings.slice(0, 2).map(b => (
                                                <div
                                                    key={b.id}
                                                    onClick={(e) => { e.stopPropagation(); openEdit(b); }}
                                                    className={clsx(
                                                        'text-xs rounded-lg px-2 py-1.5 truncate font-semibold border-r-[3px] cursor-pointer hover:opacity-80 transition-opacity shadow-sm',
                                                        clr(b.hall_name).bg,
                                                        clr(b.hall_name).border,
                                                        clr(b.hall_name).text
                                                    )}
                                                >
                                                    {b.start_time.slice(0,5)} - {b.hall_name}
                                                </div>
                                            ))}
                                            {dayBookings.length > 2 && (
                                                <div className="text-xs text-slate-500 font-semibold bg-slate-100 rounded-lg px-2 py-1 text-center">
                                                    +{dayBookings.length - 2} حجوزات أخرى
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* مفتاح ألوان القاعات */}
                        {halls.length > 0 && (
                            <div className="flex flex-wrap items-center gap-4 px-6 py-4 border-t border-slate-100 bg-slate-50/50">
                                <span className="text-sm font-bold text-slate-500">القاعات:</span>
                                {halls.map(h => (
                                    <span key={h.id} className={clsx('inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium', clr(h.value).light, clr(h.value).text)}>
                                        <span className={clsx('w-3 h-3 rounded-full shadow-sm', clr(h.value).dot)} />
                                        {h.label}
                                    </span>
                                ))}
                            </div>
                        )}
                    </Card>
                </div>

                {/* ==================== الشريط الجانبي ==================== */}
                <div className="space-y-6">
                    {/* إحصائيات */}
                    <Card>
                        <div className="text-center">
                            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-500 to-teal-600 shadow-lg shadow-teal-200 mb-3">
                                <CalendarDays className="h-7 w-7 text-white" />
                            </div>
                            <p className="text-3xl font-bold text-slate-800 mb-1">{monthBookingsCount}</p>
                            <p className="text-sm text-slate-500">حجز هذا الشهر</p>
                        </div>
                    </Card>

                    {/* تفاصيل اليوم المحدد */}
                    <Card padding="none">
                        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-gradient-to-l from-slate-50 to-white">
                            <div className="flex items-center gap-2.5">
                                <div className="p-2 bg-teal-100 rounded-lg">
                                    <CalendarDays className="h-4 w-4 text-teal-600" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-slate-800">
                                        {activeDay ? `حجوزات ${activeDay}` : 'تفاصيل اليوم'}
                                    </h3>
                                    {activeDay && (
                                        <p className="text-xs text-slate-500">{activeDayBookings.length} حجز</p>
                                    )}
                                </div>
                            </div>
                            {activeDay && (
                                <button onClick={() => setActiveDay(null)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400">
                                    <X className="h-4 w-4" />
                                </button>
                            )}
                        </div>

                        <div className="p-4">
                            {!activeDay ? (
                                <div className="text-center py-12">
                                    <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-3">
                                        <CalendarDays className="h-8 w-8 text-slate-300" />
                                    </div>
                                    <p className="text-sm font-medium text-slate-400">اضغط على يوم لعرض تفاصيله</p>
                                </div>
                            ) : activeDayBookings.length === 0 ? (
                                <div className="text-center py-12">
                                    <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-3">
                                        <CalendarDays className="h-8 w-8 text-slate-300" />
                                    </div>
                                    <p className="text-sm font-medium text-slate-400 mb-3">لا توجد حجوزات لهذا اليوم</p>
                                    <Button size="sm" icon={<Plus className="h-3.5 w-3.5" />} onClick={() => openAdd(activeDay)}>
                                        أضف حجزاً
                                    </Button>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {activeDayBookings.map(b => (
                                        <div
                                            key={b.id}
                                            className={clsx(
                                                'rounded-xl p-4 border-r-4 transition-shadow hover:shadow-md',
                                                clr(b.hall_name).bg,
                                                clr(b.hall_name).border
                                            )}
                                        >
                                            <div className="flex items-start justify-between gap-2">
                                                <div className="space-y-2 min-w-0 flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <Building2 className={clsx('h-4 w-4 shrink-0', clr(b.hall_name).text)} />
                                                        <span className={clsx('text-sm font-bold truncate', clr(b.hall_name).text)}>
                                                            {b.hall_name}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <User className="h-4 w-4 text-slate-400 shrink-0" />
                                                        <span className="text-sm text-slate-600 truncate">{b.booker.name}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Clock className="h-4 w-4 text-slate-400 shrink-0" />
                                                        <span className="text-sm font-mono text-slate-700 bg-white/60 px-2 py-0.5 rounded-md">
                                                            {b.start_time.slice(0,5)} ← {b.end_time.slice(0,5)}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="flex flex-col gap-1 shrink-0">
                                                    <button
                                                        onClick={() => openEdit(b)}
                                                        className="p-2 rounded-lg bg-white/60 hover:bg-white text-slate-500 hover:text-teal-600 transition-colors shadow-sm"
                                                    >
                                                        <Edit2 className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => setDeleting(b)}
                                                        className="p-2 rounded-lg bg-white/60 hover:bg-red-50 text-slate-500 hover:text-red-500 transition-colors shadow-sm"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}

                                    <button
                                        onClick={() => openAdd(activeDay)}
                                        className="w-full py-3 border-2 border-dashed border-slate-200 rounded-xl text-sm font-semibold text-slate-400 hover:text-teal-600 hover:border-teal-300 hover:bg-teal-50/50 transition-all flex items-center justify-center gap-2"
                                    >
                                        <Plus className="h-4 w-4" />
                                        إضافة حجز جديد
                                    </button>
                                </div>
                            )}
                        </div>
                    </Card>
                </div>
            </div>

            {/* ——— Modal إضافة / تعديل ——— */}
            <FormModal
                open={showForm}
                onClose={closeForm}
                title={editing ? 'تعديل الحجز' : 'حجز اجتماع جديد'}
                initialData={formInitial}
                action={editing ? route('meeting-bookings.update', editing.id) : route('meeting-bookings.store')}
                method={editing ? 'put' : 'post'}
                size="md"
                submitLabel={editing ? 'حفظ التعديلات' : 'حجز الاجتماع'}
            >
                {(form) => (
                    <>
                        {form.errors.conflict && (
                            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm font-medium">
                                <X className="h-4 w-4 shrink-0" />
                                {form.errors.conflict}
                            </div>
                        )}

                        <SearchableSelect
                            label="القاعة"
                            required
                            value={form.data.hall_name}
                            onChange={(v) => form.setData('hall_name', String(v))}
                            options={halls.filter(h => h.is_active).map(h => ({ value: h.value, label: h.label }))}
                            placeholder="اختر القاعة"
                            error={form.errors.hall_name}
                        />

                        <SearchableSelect
                            label="صاحب الحجز"
                            required
                            value={form.data.booked_by}
                            onChange={(v) => form.setData('booked_by', String(v))}
                            options={users.map(u => ({ value: u.id, label: u.name }))}
                            placeholder="اختر المستخدم"
                            searchPlaceholder="ابحث عن مستخدم..."
                            error={form.errors.booked_by}
                        />

                        <Input
                            label="التاريخ"
                            type="date"
                            value={form.data.date}
                            onChange={(e) => form.setData('date', e.target.value)}
                            error={form.errors.date}
                            required
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <Input
                                label="من"
                                type="time"
                                value={form.data.start_time}
                                onChange={(e) => form.setData('start_time', e.target.value)}
                                error={form.errors.start_time}
                                required
                            />
                            <Input
                                label="إلى"
                                type="time"
                                value={form.data.end_time}
                                onChange={(e) => form.setData('end_time', e.target.value)}
                                error={form.errors.end_time}
                                required
                            />
                        </div>

                        <Input
                            label="ملاحظات"
                            value={form.data.notes}
                            onChange={(e) => form.setData('notes', e.target.value)}
                            error={form.errors.notes}
                            placeholder="ملاحظات اختيارية..."
                        />
                    </>
                )}
            </FormModal>

            <DeleteModal
                open={!!deleting}
                onClose={() => setDeleting(null)}
                action={deleting ? route('meeting-bookings.destroy', deleting.id) : ''}
                message={`هل أنت متأكد من حذف حجز قاعة "${deleting?.hall_name}" ليوم ${deleting?.date}؟`}
            />
        </AuthenticatedLayout>
    );
}
