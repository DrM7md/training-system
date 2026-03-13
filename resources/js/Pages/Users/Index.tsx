import AuthenticatedLayout from '@/Components/Layout/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import { Plus, Edit2, Trash2, UserCog, Search, Shield, X, Upload, Trash } from 'lucide-react';
import Card from '@/Components/UI/Card';
import Button from '@/Components/UI/Button';
import Badge from '@/Components/UI/Badge';
import PageHeader from '@/Components/UI/PageHeader';
import FormModal from '@/Components/UI/FormModal';
import DeleteModal from '@/Components/UI/DeleteModal';
import Input from '@/Components/UI/Input';
import Select from '@/Components/UI/Select';

interface User {
    id: number;
    name: string;
    email: string;
    phone: string | null;
    gender: string | null;
    job_title: string | null;
    is_active: boolean;
    signature: string | null;
    roles: Array<{ id: number; name: string }>;
}

interface Role {
    id: number;
    name: string;
}

interface Props {
    users: { data: User[]; current_page: number; last_page: number };
    roles: Role[];
    filters: { search?: string; role?: string };
}

const roleLabels: Record<string, string> = {
    super_admin: 'مدير النظام',
    admin: 'مدير',
    supervisor: 'مشرف',
    trainee: 'متدرب',
};

const genderOptions = [
    { value: 'male', label: 'ذكر' },
    { value: 'female', label: 'أنثى' },
];

export default function Index({ users, roles, filters }: Props) {
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState<User | null>(null);
    const [deleting, setDeleting] = useState<User | null>(null);
    const [search, setSearch] = useState(filters.search || '');
    const [roleFilter, setRoleFilter] = useState(filters.role || '');
    const [searchTimer, setSearchTimer] = useState<ReturnType<typeof setTimeout> | null>(null);

    const initialData = editing
        ? {
              name: editing.name,
              email: editing.email,
              password: '',
              password_confirmation: '',
              phone: editing.phone || '',
              gender: editing.gender || '',
              job_title: editing.job_title || '',
              role: editing.roles[0]?.name || '',
              is_active: editing.is_active,
              signature: null as File | null,
              remove_signature: false,
          }
        : {
              name: '',
              email: '',
              password: '',
              password_confirmation: '',
              phone: '',
              gender: '',
              job_title: '',
              role: '',
              is_active: true,
              signature: null as File | null,
              remove_signature: false,
          };

    const doSearch = (s: string, r: string) => {
        router.get(route('users.index'), { search: s || undefined, role: r || undefined }, { preserveState: true, preserveScroll: true });
    };

    const handleSearchChange = (val: string) => {
        setSearch(val);
        if (searchTimer) clearTimeout(searchTimer);
        setSearchTimer(setTimeout(() => doSearch(val, roleFilter), 400));
    };

    const handleRoleChange = (val: string) => {
        setRoleFilter(val);
        if (searchTimer) clearTimeout(searchTimer);
        doSearch(search, val);
    };

    const clearRoleFilter = () => {
        setRoleFilter('');
        if (searchTimer) clearTimeout(searchTimer);
        doSearch(search, '');
    };

    return (
        <AuthenticatedLayout>
            <Head title="المستخدمين" />

            <PageHeader
                title="المستخدمين"
                description="إدارة المستخدمين والصلاحيات"
                action={
                    <Button icon={<Plus className="h-4 w-4" />} onClick={() => setShowForm(true)}>
                        إضافة مستخدم
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
                            placeholder="بحث بالاسم أو البريد..."
                            className="w-full pr-10 pl-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all"
                        />
                    </div>
                    <div className="relative">
                        <select
                            value={roleFilter}
                            onChange={(e) => handleRoleChange(e.target.value)}
                            className="px-4 py-2.5 pl-8 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all"
                        >
                            <option value="">كل الأدوار</option>
                            {roles.map((r) => (
                                <option key={r.id} value={r.name}>{roleLabels[r.name] || r.name}</option>
                            ))}
                        </select>
                        {roleFilter && (
                            <button
                                onClick={clearRoleFilter}
                                className="absolute left-2 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition-colors"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        )}
                    </div>
                </div>
            </Card>

            <Card padding="none">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gradient-to-l from-slate-50 to-slate-100/50 border-b border-slate-200">
                            <tr>
                                <th className="px-4 py-3.5 text-right text-xs font-bold text-slate-600 uppercase tracking-wide">المستخدم</th>
                                <th className="px-4 py-3.5 text-right text-xs font-bold text-slate-600 uppercase tracking-wide">البريد</th>
                                <th className="px-4 py-3.5 text-right text-xs font-bold text-slate-600 uppercase tracking-wide">الدور</th>
                                <th className="px-4 py-3.5 text-right text-xs font-bold text-slate-600 uppercase tracking-wide">الوظيفة</th>
                                <th className="px-4 py-3.5 text-right text-xs font-bold text-slate-600 uppercase tracking-wide">الحالة</th>
                                <th className="px-4 py-3.5 text-right text-xs font-bold text-slate-600 uppercase tracking-wide">الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {users.data.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-4 py-12 text-center text-slate-500">
                                        <UserCog className="h-12 w-12 mx-auto text-slate-300 mb-3" />
                                        <p className="font-medium">لا يوجد مستخدمين</p>
                                    </td>
                                </tr>
                            ) : (
                                users.data.map((user) => (
                                    <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-4 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center">
                                                    <span className="text-violet-600 font-bold text-sm">{user.name.charAt(0)}</span>
                                                </div>
                                                <span className="font-semibold text-slate-800">{user.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 text-sm text-slate-600">{user.email}</td>
                                        <td className="px-4 py-4">
                                            {user.roles.map((role) => (
                                                <Badge key={role.id} variant="primary">
                                                    <Shield className="h-3 w-3 ml-1" />
                                                    {roleLabels[role.name] || role.name}
                                                </Badge>
                                            ))}
                                        </td>
                                        <td className="px-4 py-4 text-sm text-slate-600">{user.job_title || '-'}</td>
                                        <td className="px-4 py-4">
                                            <Badge variant={user.is_active ? 'success' : 'danger'}>
                                                {user.is_active ? 'نشط' : 'غير نشط'}
                                            </Badge>
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="flex items-center gap-1">
                                                <button
                                                    onClick={() => {
                                                        setEditing(user);
                                                        setShowForm(true);
                                                    }}
                                                    className="p-2 rounded-lg hover:bg-teal-100 text-teal-600 transition-colors"
                                                >
                                                    <Edit2 className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => setDeleting(user)}
                                                    className="p-2 rounded-lg hover:bg-red-100 text-red-600 transition-colors"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            <FormModal
                open={showForm}
                onClose={() => {
                    setShowForm(false);
                    setEditing(null);
                }}
                title={editing ? 'تعديل المستخدم' : 'إضافة مستخدم جديد'}
                initialData={initialData}
                action={editing ? route('users.update', editing.id) : route('users.store')}
                method={editing ? 'put' : 'post'}
                size="lg"
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
                            <Input
                                label="البريد الإلكتروني"
                                type="email"
                                value={form.data.email}
                                onChange={(e) => form.setData('email', e.target.value)}
                                error={form.errors.email}
                                required
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <Input
                                label={editing ? 'كلمة المرور الجديدة (اتركها فارغة للإبقاء)' : 'كلمة المرور'}
                                type="password"
                                value={form.data.password}
                                onChange={(e) => form.setData('password', e.target.value)}
                                error={form.errors.password}
                                required={!editing}
                            />
                            <Input
                                label="تأكيد كلمة المرور"
                                type="password"
                                value={form.data.password_confirmation}
                                onChange={(e) => form.setData('password_confirmation', e.target.value)}
                                error={form.errors.password_confirmation}
                                required={!editing}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <Select
                                label="الدور"
                                value={form.data.role}
                                onChange={(e) => form.setData('role', e.target.value)}
                                error={form.errors.role}
                                required
                            >
                                <option value="">اختر الدور</option>
                                {roles.map((r) => (
                                    <option key={r.id} value={r.name}>{roleLabels[r.name] || r.name}</option>
                                ))}
                            </Select>
                            <Select
                                label="الجنس"
                                value={form.data.gender}
                                onChange={(e) => form.setData('gender', e.target.value)}
                                error={form.errors.gender}
                            >
                                <option value="">اختر...</option>
                                {genderOptions.map((g) => (
                                    <option key={g.value} value={g.value}>{g.label}</option>
                                ))}
                            </Select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <Input
                                label="الوظيفة"
                                value={form.data.job_title}
                                onChange={(e) => form.setData('job_title', e.target.value)}
                                error={form.errors.job_title}
                            />
                            <Input
                                label="رقم الجوال"
                                value={form.data.phone}
                                onChange={(e) => form.setData('phone', e.target.value)}
                                error={form.errors.phone}
                            />
                        </div>
                        <label className="flex items-center gap-2 cursor-pointer group">
                            <input
                                type="checkbox"
                                checked={form.data.is_active}
                                onChange={(e) => form.setData('is_active', e.target.checked)}
                                className="w-4 h-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                            />
                            <span className="text-sm text-slate-700 group-hover:text-slate-900">مستخدم نشط</span>
                        </label>

                        {/* التوقيع */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">التوقيع</label>
                            {(editing?.signature && !form.data.remove_signature && !form.data.signature) ? (
                                <div className="flex items-center gap-4">
                                    <div className="border border-slate-200 rounded-lg p-2 bg-slate-50">
                                        <img
                                            src={`/storage/${editing.signature}`}
                                            alt="التوقيع"
                                            className="h-16 max-w-[200px] object-contain"
                                        />
                                    </div>
                                    <div className="flex gap-2">
                                        <label className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-teal-50 text-teal-700 rounded-lg cursor-pointer hover:bg-teal-100 transition-colors">
                                            <Upload className="h-3.5 w-3.5" />
                                            تغيير
                                            <input
                                                type="file"
                                                accept="image/png,image/jpeg,image/jpg"
                                                className="hidden"
                                                onChange={(e) => {
                                                    if (e.target.files?.[0]) {
                                                        form.setData('signature', e.target.files[0]);
                                                    }
                                                }}
                                            />
                                        </label>
                                        <button
                                            type="button"
                                            onClick={() => form.setData('remove_signature', true)}
                                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                                        >
                                            <Trash className="h-3.5 w-3.5" />
                                            حذف
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div>
                                    {form.data.signature ? (
                                        <div className="flex items-center gap-4">
                                            <div className="border border-slate-200 rounded-lg p-2 bg-slate-50">
                                                <img
                                                    src={URL.createObjectURL(form.data.signature)}
                                                    alt="التوقيع الجديد"
                                                    className="h-16 max-w-[200px] object-contain"
                                                />
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => form.setData('signature', null)}
                                                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                                            >
                                                <X className="h-3.5 w-3.5" />
                                                إزالة
                                            </button>
                                        </div>
                                    ) : (
                                        <label className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-slate-300 rounded-xl cursor-pointer hover:border-teal-400 hover:bg-teal-50/50 transition-all">
                                            <Upload className="h-5 w-5 text-slate-400" />
                                            <span className="text-sm text-slate-500">اختر صورة التوقيع (PNG, JPG)</span>
                                            <input
                                                type="file"
                                                accept="image/png,image/jpeg,image/jpg"
                                                className="hidden"
                                                onChange={(e) => {
                                                    if (e.target.files?.[0]) {
                                                        form.setData('signature', e.target.files[0]);
                                                    }
                                                }}
                                            />
                                        </label>
                                    )}
                                    {form.data.remove_signature && !form.data.signature && (
                                        <p className="text-xs text-amber-600 mt-1">سيتم حذف التوقيع عند الحفظ</p>
                                    )}
                                </div>
                            )}
                            {form.errors.signature && (
                                <p className="text-xs text-red-500 mt-1">{form.errors.signature}</p>
                            )}
                        </div>
                    </>
                )}
            </FormModal>

            <DeleteModal
                open={!!deleting}
                onClose={() => setDeleting(null)}
                action={deleting ? route('users.destroy', deleting.id) : ''}
                message={`هل أنت متأكد من حذف المستخدم "${deleting?.name}"؟`}
            />
        </AuthenticatedLayout>
    );
}
