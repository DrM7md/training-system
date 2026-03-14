import AuthenticatedLayout from '@/Components/Layout/AuthenticatedLayout';
import { Head, router, useForm } from '@inertiajs/react';
import { useState, useMemo } from 'react';
import { Plus, Edit2, Trash2, Building2, Users, MapPin, Eye, BookOpen, Calendar, GraduationCap, Search, Lock, Unlock, X } from 'lucide-react';
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

interface BookedProgram {
    id: number;
    program_name: string;
    package_name: string;
    group_name: string;
    trainer_name: string;
    start_date: string | null;
    end_date: string | null;
    session_start: string | null;
    session_end: string | null;
    sessions_count: number;
    trainees_count: number;
    status: string;
    gender: string;
}

interface Reservation {
    id: number;
    training_hall_id: number;
    reserved_by: number;
    purpose: string;
    start_date: string;
    end_date: string;
    notes: string | null;
    training_hall: { id: number; name: string };
    reserved_by_user?: { id: number; name: string };
}

interface TrainingHall {
    id: number;
    name: string;
    capacity: number;
    gender_priority: string | null;
    location: string | null;
    description: string | null;
    is_active: boolean;
    program_groups_count: number;
    training_sessions_count: number;
    reservations_count: number;
    booked_programs?: BookedProgram[];
}

interface Props {
    halls: {
        data: TrainingHall[];
        current_page: number;
        last_page: number;
    };
    hall?: TrainingHall;
    reservations: Reservation[];
}

const genderPriorityLabels: Record<string, { label: string; variant: 'info' | 'danger' | 'primary' | 'default' }> = {
    male: { label: 'رجال', variant: 'info' },
    female: { label: 'نساء', variant: 'danger' },
    all: { label: 'الكل', variant: 'primary' },
};

const statusLabels: Record<string, { label: string; variant: 'success' | 'warning' | 'danger' | 'info' | 'default' | 'primary' }> = {
    scheduled: { label: 'مجدول', variant: 'info' },
    in_progress: { label: 'قيد التنفيذ', variant: 'warning' },
    completed: { label: 'مكتمل', variant: 'success' },
    cancelled: { label: 'ملغي', variant: 'danger' },
    postponed: { label: 'مؤجل', variant: 'default' },
};

const genderLabels: Record<string, string> = {
    male: 'رجال',
    female: 'نساء',
    mixed: 'مختلط',
};

export default function Index({ halls, hall, reservations }: Props) {
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState<TrainingHall | null>(null);
    const [deleting, setDeleting] = useState<TrainingHall | null>(null);
    const [viewing, setViewing] = useState<TrainingHall | null>(hall || null);
    const [search, setSearch] = useState('');
    const [reservingHall, setReservingHall] = useState<TrainingHall | null>(null);
    const [showReservations, setShowReservations] = useState(false);
    const [deletingReservation, setDeletingReservation] = useState<Reservation | null>(null);

    const reserveForm = useForm({
        purpose: '',
        start_date: '',
        end_date: '',
        notes: '',
    });

    const filteredHalls = useMemo(() => {
        if (!search.trim()) return halls.data;
        const term = search.trim().toLowerCase();
        return halls.data.filter((h) => h.name.toLowerCase().includes(term));
    }, [halls.data, search]);

    const initialData = editing
        ? {
              name: editing.name,
              capacity: editing.capacity,
              gender_priority: editing.gender_priority || '',
              location: editing.location || '',
              description: editing.description || '',
              is_active: editing.is_active,
          }
        : { name: '', capacity: 25, gender_priority: '', location: '', description: '', is_active: true };

    const handleEdit = (h: TrainingHall) => {
        setEditing(h);
        setShowForm(true);
    };

    const handleClose = () => {
        setShowForm(false);
        setEditing(null);
    };

    const handleViewHall = (h: TrainingHall) => {
        setViewing(h);
        router.get(route('training-halls.show', h.id), {}, {
            preserveState: true,
            only: ['hall'],
            onSuccess: (page) => {
                const hallData = (page.props as { hall?: TrainingHall }).hall;
                if (hallData) {
                    setViewing(hallData);
                }
            }
        });
    };

    const handleReserve = (h: TrainingHall) => {
        setReservingHall(h);
        reserveForm.reset();
    };

    const submitReservation = (e: React.FormEvent) => {
        e.preventDefault();
        if (!reservingHall) return;
        reserveForm.post(route('training-halls.reserve', reservingHall.id), {
            preserveScroll: true,
            onSuccess: () => {
                setReservingHall(null);
                reserveForm.reset();
            },
        });
    };

    const handleDeleteReservation = (reservation: Reservation) => {
        setDeletingReservation(reservation);
    };

    const confirmDeleteReservation = () => {
        if (!deletingReservation) return;
        router.delete(route('hall-reservations.destroy', deletingReservation.id), {
            preserveScroll: true,
            onSuccess: () => setDeletingReservation(null),
        });
    };

    const getGenderPriorityBadge = (priority: string | null) => {
        if (!priority) return <Badge variant="default">لم يحدد</Badge>;
        const config = genderPriorityLabels[priority];
        return config ? <Badge variant={config.variant}>{config.label}</Badge> : null;
    };

    return (
        <AuthenticatedLayout>
            <Head title="القاعات التدريبية" />

            <PageHeader
                title="القاعات التدريبية"
                description={`إدارة القاعات والطاقة الاستيعابية (${halls.data.length} قاعة)`}
                action={
                    <div className="flex gap-2">
                        <Button
                            variant="secondary"
                            icon={<Lock className="h-4 w-4" />}
                            onClick={() => setShowReservations(true)}
                        >
                            الحجوزات اليدوية
                            {reservations.length > 0 && (
                                <span className="mr-1.5 px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded-full text-xs font-bold">
                                    {reservations.length}
                                </span>
                            )}
                        </Button>
                        <Button icon={<Plus className="h-4 w-4" />} onClick={() => setShowForm(true)}>
                            إضافة قاعة
                        </Button>
                    </div>
                }
            />

            <Card className="mb-5">
                <div className="relative">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="بحث سريع عن قاعة..."
                        className="w-full pr-10 pl-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all"
                    />
                </div>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredHalls.length === 0 ? (
                    <Card className="col-span-full">
                        <div className="text-center py-12 text-slate-500">
                            <Building2 className="h-14 w-14 mx-auto text-slate-300 mb-3" />
                            <p className="font-medium">لا توجد قاعات تدريبية</p>
                            <p className="text-sm text-slate-400 mt-1">ابدأ بإضافة قاعة جديدة</p>
                        </div>
                    </Card>
                ) : (
                    filteredHalls.map((h) => (
                        <Card key={h.id} className="relative group hover:shadow-md transition-shadow">
                            <div className="absolute top-3 left-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={() => handleViewHall(h)}
                                    className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors"
                                    title="عرض التفاصيل"
                                >
                                    <Eye className="h-4 w-4" />
                                </button>
                                <button
                                    onClick={() => handleReserve(h)}
                                    className="p-1.5 rounded-lg hover:bg-amber-100 text-amber-600 transition-colors"
                                    title="حجز القاعة"
                                >
                                    <Lock className="h-4 w-4" />
                                </button>
                                <button
                                    onClick={() => handleEdit(h)}
                                    className="p-1.5 rounded-lg hover:bg-teal-100 text-teal-600 transition-colors"
                                    title="تعديل"
                                >
                                    <Edit2 className="h-4 w-4" />
                                </button>
                                <button
                                    onClick={() => setDeleting(h)}
                                    className="p-1.5 rounded-lg hover:bg-red-100 text-red-600 transition-colors"
                                    title="حذف"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>

                            <div className="flex items-start gap-3">
                                <div className="p-2.5 bg-amber-50 rounded-xl">
                                    <Building2 className="h-5 w-5 text-amber-600" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-bold text-slate-800">{h.name}</h3>
                                    {h.location && (
                                        <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                                            <MapPin className="h-3 w-3" />
                                            {h.location}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="mt-4 pt-3 border-t border-slate-100">
                                <div className="flex items-center justify-between flex-wrap gap-2">
                                    <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 rounded-lg text-sm">
                                        <Users className="h-3.5 w-3.5 text-slate-500" />
                                        <span className="font-semibold text-slate-700">{h.capacity}</span>
                                        <span className="text-slate-500 text-xs">متدرب</span>
                                    </div>
                                    {getGenderPriorityBadge(h.gender_priority)}
                                </div>
                            </div>

                            <div className="mt-3 flex items-center gap-2 text-xs flex-wrap">
                                <span className="px-2 py-1 bg-teal-50 text-teal-700 rounded-lg font-medium">
                                    {h.program_groups_count} مجموعة
                                </span>
                                <span className="px-2 py-1 bg-sky-50 text-sky-700 rounded-lg font-medium">
                                    {h.training_sessions_count} جلسة
                                </span>
                                {h.reservations_count > 0 && (
                                    <span className="px-2 py-1 bg-amber-50 text-amber-700 rounded-lg font-medium flex items-center gap-1">
                                        <Lock className="h-3 w-3" />
                                        {h.reservations_count} حجز
                                    </span>
                                )}
                                {!h.is_active && (
                                    <Badge variant="danger">غير نشطة</Badge>
                                )}
                            </div>

                            <button
                                onClick={() => handleViewHall(h)}
                                className="mt-3 w-full py-1.5 text-sm text-teal-600 hover:text-teal-700 hover:bg-teal-50 rounded-lg transition-colors font-medium"
                            >
                                عرض الحجوزات
                            </button>
                        </Card>
                    ))
                )}
            </div>

            {/* Form Modal - Add/Edit Hall */}
            <FormModal
                open={showForm}
                onClose={handleClose}
                title={editing ? 'تعديل القاعة' : 'إضافة قاعة جديدة'}
                initialData={initialData}
                action={editing ? route('training-halls.update', editing.id) : route('training-halls.store')}
                method={editing ? 'put' : 'post'}
            >
                {(form) => (
                    <>
                        <Input
                            label="اسم القاعة"
                            value={form.data.name}
                            onChange={(e) => form.setData('name', e.target.value)}
                            error={form.errors.name}
                            required
                        />
                        <div className="grid grid-cols-2 gap-4">
                            <Input
                                label="الطاقة الاستيعابية"
                                type="number"
                                min={1}
                                value={form.data.capacity}
                                onChange={(e) => form.setData('capacity', parseInt(e.target.value))}
                                error={form.errors.capacity}
                                required
                            />
                            <Select
                                label="أولوية فئة المتدربين"
                                value={form.data.gender_priority}
                                onChange={(e) => form.setData('gender_priority', e.target.value)}
                                error={form.errors.gender_priority}
                            >
                                <option value="">لم يحدد</option>
                                <option value="male">رجال</option>
                                <option value="female">نساء</option>
                                <option value="all">الكل</option>
                            </Select>
                        </div>
                        <Input
                            label="الموقع"
                            value={form.data.location}
                            onChange={(e) => form.setData('location', e.target.value)}
                            error={form.errors.location}
                            placeholder="مثال: المبنى أ - الدور الأول"
                        />
                        <Textarea
                            label="الوصف"
                            value={form.data.description}
                            onChange={(e) => form.setData('description', e.target.value)}
                            error={form.errors.description}
                            rows={3}
                        />
                        <label className="flex items-center gap-2 cursor-pointer group">
                            <input
                                type="checkbox"
                                checked={form.data.is_active}
                                onChange={(e) => form.setData('is_active', e.target.checked)}
                                className="w-4 h-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                            />
                            <span className="text-sm text-slate-700 group-hover:text-slate-900">قاعة نشطة</span>
                        </label>
                    </>
                )}
            </FormModal>

            {/* Delete Hall Modal */}
            <DeleteModal
                open={!!deleting}
                onClose={() => setDeleting(null)}
                action={deleting ? route('training-halls.destroy', deleting.id) : ''}
                message={`هل أنت متأكد من حذف القاعة "${deleting?.name}"؟`}
            />

            {/* View Hall Details Modal */}
            <Modal
                open={!!viewing}
                onClose={() => setViewing(null)}
                title={`تفاصيل القاعة: ${viewing?.name || ''}`}
                size="xl"
            >
                {viewing && (
                    <div className="space-y-5">
                        <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-xl">
                            <div className="p-4 bg-amber-50 rounded-xl">
                                <Building2 className="h-8 w-8 text-amber-600" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-xl font-bold text-slate-800">{viewing.name}</h3>
                                {viewing.location && (
                                    <p className="text-slate-500 mt-1 flex items-center gap-1.5">
                                        <MapPin className="h-4 w-4" />
                                        {viewing.location}
                                    </p>
                                )}
                                <div className="flex flex-wrap gap-2 mt-3">
                                    {getGenderPriorityBadge(viewing.gender_priority)}
                                    <Badge variant={viewing.is_active ? 'success' : 'danger'}>
                                        {viewing.is_active ? 'نشطة' : 'غير نشطة'}
                                    </Badge>
                                </div>
                            </div>
                            <div className="text-center px-4 py-2 bg-white rounded-xl border border-slate-200">
                                <Users className="h-5 w-5 text-amber-600 mx-auto mb-1" />
                                <p className="text-2xl font-bold text-amber-700">{viewing.capacity}</p>
                                <p className="text-xs text-slate-500">متدرب</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-teal-50 rounded-xl text-center">
                                <BookOpen className="h-6 w-6 text-teal-600 mx-auto mb-2" />
                                <p className="text-2xl font-bold text-teal-700">{viewing.program_groups_count}</p>
                                <p className="text-sm text-teal-600">مجموعة محجوزة</p>
                            </div>
                            <div className="p-4 bg-sky-50 rounded-xl text-center">
                                <Calendar className="h-6 w-6 text-sky-600 mx-auto mb-2" />
                                <p className="text-2xl font-bold text-sky-700">{viewing.training_sessions_count}</p>
                                <p className="text-sm text-sky-600">جلسة تدريبية</p>
                            </div>
                        </div>

                        <div>
                            <h4 className="font-semibold text-slate-700 mb-3 flex items-center gap-2">
                                <GraduationCap className="h-5 w-5" />
                                الدورات المحجوزة في هذه القاعة
                            </h4>
                            {viewing.booked_programs && viewing.booked_programs.length > 0 ? (
                                <div className="space-y-3 max-h-72 overflow-y-auto">
                                    {viewing.booked_programs.map((program) => (
                                        <div key={program.id} className="p-4 border border-slate-200 rounded-xl hover:border-amber-300 transition-colors">
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <h5 className="font-semibold text-slate-800">{program.program_name}</h5>
                                                    <p className="text-sm text-slate-500 mt-0.5">
                                                        {program.package_name} - {program.group_name}
                                                    </p>
                                                </div>
                                                <Badge variant={statusLabels[program.status]?.variant || 'default'}>
                                                    {statusLabels[program.status]?.label || program.status}
                                                </Badge>
                                            </div>
                                            <div className="flex items-center gap-3 mt-3 text-xs text-slate-500 flex-wrap">
                                                <span className="flex items-center gap-1">
                                                    <GraduationCap className="h-3.5 w-3.5" />
                                                    {program.trainer_name}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Users className="h-3.5 w-3.5" />
                                                    {program.trainees_count} متدرب
                                                </span>
                                                <span className="px-1.5 py-0.5 bg-slate-100 rounded text-slate-600">
                                                    {genderLabels[program.gender] || program.gender}
                                                </span>
                                            </div>
                                            {(program.start_date || program.session_start) && (
                                                <div className="flex items-center gap-3 mt-2 text-xs text-slate-500 flex-wrap">
                                                    {program.start_date && (
                                                        <span className="flex items-center gap-1 px-2 py-0.5 bg-amber-50 text-amber-700 rounded">
                                                            <Calendar className="h-3.5 w-3.5" />
                                                            تاريخ المجموعة: {formatDate(program.start_date)}
                                                            {program.end_date && ` - ${formatDate(program.end_date)}`}
                                                        </span>
                                                    )}
                                                    {program.session_start && (
                                                        <span className="flex items-center gap-1 px-2 py-0.5 bg-sky-50 text-sky-700 rounded">
                                                            <Calendar className="h-3.5 w-3.5" />
                                                            الجلسات: {formatDate(program.session_start)}
                                                            {program.session_end && program.session_end !== program.session_start && ` - ${formatDate(program.session_end)}`}
                                                            {' '}({program.sessions_count} جلسة)
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-slate-500 bg-slate-50 rounded-xl">
                                    <BookOpen className="h-10 w-10 mx-auto text-slate-300 mb-2" />
                                    <p>لا توجد دورات محجوزة في هذه القاعة</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </Modal>

            {/* Reserve Hall Modal */}
            <Modal
                open={!!reservingHall}
                onClose={() => setReservingHall(null)}
                title={`حجز القاعة: ${reservingHall?.name || ''}`}
            >
                {reservingHall && (
                    <form onSubmit={submitReservation} className="space-y-4">
                        <div className="p-3 bg-amber-50 rounded-xl flex items-center gap-3">
                            <Lock className="h-5 w-5 text-amber-600" />
                            <p className="text-sm text-amber-800">
                                سيتم حجز هذه القاعة ولن تكون متاحة للتوليد التلقائي خلال الفترة المحددة
                            </p>
                        </div>

                        <Input
                            label="الغرض من الحجز"
                            value={reserveForm.data.purpose}
                            onChange={(e) => reserveForm.setData('purpose', e.target.value)}
                            error={reserveForm.errors.purpose}
                            placeholder="مثال: اجتماع إداري، صيانة، فعالية خاصة..."
                            required
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <Input
                                label="تاريخ البداية"
                                type="date"
                                value={reserveForm.data.start_date}
                                onChange={(e) => reserveForm.setData('start_date', e.target.value)}
                                error={reserveForm.errors.start_date}
                                required
                            />
                            <Input
                                label="تاريخ النهاية"
                                type="date"
                                value={reserveForm.data.end_date}
                                onChange={(e) => reserveForm.setData('end_date', e.target.value)}
                                error={reserveForm.errors.end_date}
                                required
                            />
                        </div>

                        <Textarea
                            label="ملاحظات"
                            value={reserveForm.data.notes}
                            onChange={(e) => reserveForm.setData('notes', e.target.value)}
                            error={reserveForm.errors.notes}
                            rows={2}
                            placeholder="ملاحظات إضافية (اختياري)"
                        />

                        <div className="flex gap-3 pt-2">
                            <Button type="submit" icon={<Lock className="h-4 w-4" />} loading={reserveForm.processing}>
                                تأكيد الحجز
                            </Button>
                            <Button type="button" variant="ghost" onClick={() => setReservingHall(null)}>
                                إلغاء
                            </Button>
                        </div>
                    </form>
                )}
            </Modal>

            {/* All Reservations Modal */}
            <Modal
                open={showReservations}
                onClose={() => setShowReservations(false)}
                title="الحجوزات اليدوية للقاعات"
                size="xl"
            >
                <div className="space-y-4">
                    {reservations.length === 0 ? (
                        <div className="text-center py-10 text-slate-500">
                            <Unlock className="h-12 w-12 mx-auto text-slate-300 mb-3" />
                            <p className="font-medium">لا توجد حجوزات يدوية</p>
                            <p className="text-sm text-slate-400 mt-1">يمكنك حجز قاعة من خلال أيقونة القفل على بطاقة القاعة</p>
                        </div>
                    ) : (
                        <div className="space-y-3 max-h-[28rem] overflow-y-auto">
                            {reservations.map((r) => (
                                <div key={r.id} className="p-4 border border-slate-200 rounded-xl hover:border-amber-200 transition-colors">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-start gap-3">
                                            <div className="p-2 bg-amber-50 rounded-lg">
                                                <Lock className="h-4 w-4 text-amber-600" />
                                            </div>
                                            <div>
                                                <h5 className="font-bold text-slate-800">{r.training_hall?.name}</h5>
                                                <p className="text-sm text-slate-600 mt-0.5">{r.purpose}</p>
                                                {r.notes && (
                                                    <p className="text-xs text-slate-400 mt-1">{r.notes}</p>
                                                )}
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleDeleteReservation(r)}
                                            className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition-colors"
                                            title="إلغاء الحجز"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    </div>
                                    <div className="flex items-center gap-3 mt-3 text-xs text-slate-500 flex-wrap">
                                        <span className="flex items-center gap-1 px-2 py-1 bg-amber-50 text-amber-700 rounded-lg">
                                            <Calendar className="h-3.5 w-3.5" />
                                            {formatDate(r.start_date)} - {formatDate(r.end_date)}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </Modal>

            {/* Delete Reservation Confirmation */}
            <Modal
                open={!!deletingReservation}
                onClose={() => setDeletingReservation(null)}
                title="إلغاء الحجز"
            >
                {deletingReservation && (
                    <div className="space-y-4">
                        <p className="text-slate-600">
                            هل أنت متأكد من إلغاء حجز القاعة <strong>{deletingReservation.training_hall?.name}</strong>؟
                        </p>
                        <p className="text-sm text-slate-500">
                            الغرض: {deletingReservation.purpose}
                        </p>
                        <p className="text-sm text-slate-500">
                            الفترة: {formatDate(deletingReservation.start_date)} - {formatDate(deletingReservation.end_date)}
                        </p>
                        <div className="flex gap-3 pt-2">
                            <Button variant="danger" onClick={confirmDeleteReservation}>
                                نعم، إلغاء الحجز
                            </Button>
                            <Button variant="ghost" onClick={() => setDeletingReservation(null)}>
                                تراجع
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>
        </AuthenticatedLayout>
    );
}
