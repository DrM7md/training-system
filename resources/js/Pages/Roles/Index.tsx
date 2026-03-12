import AuthenticatedLayout from '@/Components/Layout/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { Plus, Edit2, Trash2, Shield, Users } from 'lucide-react';
import Card, { CardHeader } from '@/Components/UI/Card';
import Button from '@/Components/UI/Button';
import Badge from '@/Components/UI/Badge';
import PageHeader from '@/Components/UI/PageHeader';
import Modal, { ModalFooter } from '@/Components/UI/Modal';
import DeleteModal from '@/Components/UI/DeleteModal';
import Input from '@/Components/UI/Input';

interface Permission {
    id: number;
    name: string;
}

interface Role {
    id: number;
    name: string;
    users_count: number;
    permissions: Permission[];
}

interface Props {
    roles: Role[];
    permissions: Record<string, Permission[]>;
}

const roleLabels: Record<string, string> = {
    super_admin: 'مدير النظام',
    admin: 'مدير',
    supervisor: 'مشرف',
    trainee: 'متدرب',
};

const permissionGroups: Record<string, string> = {
    users: 'المستخدمين',
    roles: 'الأدوار',
    academic_years: 'الأعوام الدراسية',
    semesters: 'الفصول',
    training_halls: 'القاعات',
    programs: 'البرامج',
    packages: 'الحقائب',
    groups: 'المجموعات',
    sessions: 'الجلسات',
    schools: 'المدارس',
    employees: 'الموظفين',
    trainers: 'المدربين',
    trainees: 'المتدربين',
    reports: 'التقارير',
    settings: 'الإعدادات',
};

const permissionActions: Record<string, string> = {
    view: 'عرض',
    create: 'إضافة',
    edit: 'تعديل',
    delete: 'حذف',
    approve: 'اعتماد',
    schedule: 'جدولة',
    export: 'تصدير',
};

export default function Index({ roles, permissions }: Props) {
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState<Role | null>(null);
    const [deleting, setDeleting] = useState<Role | null>(null);

    const form = useForm({
        name: '',
        permissions: [] as string[],
    });

    const handleEdit = (role: Role) => {
        setEditing(role);
        form.setData({
            name: role.name,
            permissions: role.permissions.map((p) => p.name),
        });
        setShowForm(true);
    };

    const handleClose = () => {
        setShowForm(false);
        setEditing(null);
        form.reset();
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editing) {
            form.put(route('roles.update', editing.id), {
                onSuccess: handleClose,
            });
        } else {
            form.post(route('roles.store'), {
                onSuccess: handleClose,
            });
        }
    };

    const togglePermission = (permName: string) => {
        const perms = [...form.data.permissions];
        const index = perms.indexOf(permName);
        if (index > -1) {
            perms.splice(index, 1);
        } else {
            perms.push(permName);
        }
        form.setData('permissions', perms);
    };

    const toggleGroup = (groupPerms: Permission[]) => {
        const perms = [...form.data.permissions];
        const groupNames = groupPerms.map((p) => p.name);
        const allSelected = groupNames.every((n) => perms.includes(n));

        if (allSelected) {
            form.setData('permissions', perms.filter((p) => !groupNames.includes(p)));
        } else {
            const newPerms = [...new Set([...perms, ...groupNames])];
            form.setData('permissions', newPerms);
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title="الأدوار والصلاحيات" />

            <PageHeader
                title="الأدوار والصلاحيات"
                description="إدارة أدوار المستخدمين وصلاحياتهم"
                action={
                    <Button icon={<Plus className="h-4 w-4" />} onClick={() => setShowForm(true)}>
                        إضافة دور
                    </Button>
                }
            />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {roles.map((role) => (
                    <Card key={role.id}>
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-teal-50 rounded-lg">
                                    <Shield className="h-5 w-5 text-teal-600" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-slate-900">
                                        {roleLabels[role.name] || role.name}
                                    </h3>
                                    <p className="text-xs text-slate-500">{role.name}</p>
                                </div>
                            </div>
                            {role.name !== 'super_admin' && (
                                <div className="flex gap-1">
                                    <button
                                        onClick={() => handleEdit(role)}
                                        className="p-1.5 rounded-lg hover:bg-teal-100 text-teal-600"
                                    >
                                        <Edit2 className="h-4 w-4" />
                                    </button>
                                    <button
                                        onClick={() => setDeleting(role)}
                                        className="p-1.5 rounded-lg hover:bg-red-100 text-red-600"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="flex items-center gap-2 mb-3">
                            <Users className="h-4 w-4 text-slate-400" />
                            <span className="text-sm text-slate-600">{role.users_count} مستخدم</span>
                        </div>

                        <div className="text-sm text-slate-500">
                            <span className="font-medium">{role.permissions.length}</span> صلاحية
                        </div>
                    </Card>
                ))}
            </div>

            <Modal
                open={showForm}
                onClose={handleClose}
                title={editing ? 'تعديل الدور' : 'إضافة دور جديد'}
                size="xl"
            >
                <form onSubmit={handleSubmit}>
                    <Input
                        label="اسم الدور"
                        value={form.data.name}
                        onChange={(e) => form.setData('name', e.target.value)}
                        error={form.errors.name}
                        placeholder="مثال: supervisor"
                        required
                        disabled={editing?.name === 'super_admin'}
                    />

                    <div className="mt-4">
                        <h4 className="font-medium text-slate-900 mb-3">الصلاحيات</h4>
                        <div className="space-y-4 max-h-96 overflow-y-auto">
                            {Object.entries(permissions).map(([group, perms]) => (
                                <div key={group} className="border border-slate-200 rounded-lg p-3">
                                    <label className="flex items-center gap-2 mb-2">
                                        <input
                                            type="checkbox"
                                            checked={perms.every((p) => form.data.permissions.includes(p.name))}
                                            onChange={() => toggleGroup(perms)}
                                            className="rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                                        />
                                        <span className="font-medium text-slate-900">
                                            {permissionGroups[group] || group}
                                        </span>
                                    </label>
                                    <div className="flex flex-wrap gap-2 mr-6">
                                        {perms.map((perm) => {
                                            const action = perm.name.split('.')[1];
                                            return (
                                                <label
                                                    key={perm.id}
                                                    className="flex items-center gap-1 text-sm"
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={form.data.permissions.includes(perm.name)}
                                                        onChange={() => togglePermission(perm.name)}
                                                        className="rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                                                    />
                                                    <span className="text-slate-600">
                                                        {permissionActions[action] || action}
                                                    </span>
                                                </label>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <ModalFooter>
                        <Button type="button" variant="secondary" onClick={handleClose}>
                            إلغاء
                        </Button>
                        <Button type="submit" loading={form.processing}>
                            حفظ
                        </Button>
                    </ModalFooter>
                </form>
            </Modal>

            <DeleteModal
                open={!!deleting}
                onClose={() => setDeleting(null)}
                action={deleting ? route('roles.destroy', deleting.id) : ''}
                message={`هل أنت متأكد من حذف الدور "${roleLabels[deleting?.name || ''] || deleting?.name}"؟`}
            />
        </AuthenticatedLayout>
    );
}
