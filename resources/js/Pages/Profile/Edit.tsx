import AuthenticatedLayout from '@/Components/Layout/AuthenticatedLayout';
import { Head, useForm, usePage } from '@inertiajs/react';
import { FormEventHandler, useRef, useState } from 'react';
import { User, Mail, Lock, Shield, Eye, EyeOff, Check, AlertTriangle } from 'lucide-react';
import Card from '@/Components/UI/Card';
import PageHeader from '@/Components/UI/PageHeader';
import Button from '@/Components/UI/Button';

export default function Edit({
    mustVerifyEmail,
    status,
}: {
    mustVerifyEmail: boolean;
    status?: string;
}) {
    const user = usePage().props.auth.user;

    const profileForm = useForm({
        name: user.name,
        email: user.email,
    });

    const passwordForm = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [profileSaved, setProfileSaved] = useState(false);
    const [passwordSaved, setPasswordSaved] = useState(false);
    const passwordInput = useRef<HTMLInputElement>(null);

    const submitProfile: FormEventHandler = (e) => {
        e.preventDefault();
        profileForm.patch(route('profile.update'), {
            onSuccess: () => {
                setProfileSaved(true);
                setTimeout(() => setProfileSaved(false), 3000);
            },
        });
    };

    const submitPassword: FormEventHandler = (e) => {
        e.preventDefault();
        passwordForm.put(route('password.update'), {
            preserveScroll: true,
            onSuccess: () => {
                passwordForm.reset();
                setPasswordSaved(true);
                setTimeout(() => setPasswordSaved(false), 3000);
            },
            onError: (errors) => {
                if (errors.password) {
                    passwordForm.reset('password', 'password_confirmation');
                    passwordInput.current?.focus();
                }
                if (errors.current_password) {
                    passwordForm.reset('current_password');
                }
            },
        });
    };

    const inputClass = (error?: string) =>
        `w-full py-3 rounded-xl border text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 focus:bg-white transition-all ${
            error ? 'border-red-400 bg-red-50' : 'border-slate-200 bg-slate-50'
        }`;

    return (
        <AuthenticatedLayout>
            <Head title="الملف الشخصي" />

            <PageHeader title="الملف الشخصي" />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Profile Card - Right Side */}
                <div className="lg:col-span-1">
                    <Card>
                        <div className="flex flex-col items-center py-6">
                            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-lg shadow-blue-500/20 mb-4">
                                <span className="text-3xl font-bold text-white">
                                    {user.name.charAt(0)}
                                </span>
                            </div>
                            <h3 className="text-lg font-bold text-slate-800">{user.name}</h3>
                            <p className="text-sm text-slate-500 mt-1">{user.email}</p>
                            <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700">
                                <Shield className="h-4 w-4" />
                                <span className="text-xs font-semibold">مدير النظام</span>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Forms - Left Side */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Profile Info */}
                    <Card>
                        <div className="p-6">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2.5 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-sm">
                                    <User className="h-5 w-5 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-base font-bold text-slate-800">المعلومات الشخصية</h3>
                                    <p className="text-xs text-slate-500">تعديل الاسم والبريد الإلكتروني</p>
                                </div>
                                {profileSaved && (
                                    <div className="mr-auto flex items-center gap-1.5 text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg">
                                        <Check className="h-4 w-4" />
                                        <span className="text-sm font-medium">تم الحفظ</span>
                                    </div>
                                )}
                            </div>

                            <form onSubmit={submitProfile} className="space-y-5">
                                <div>
                                    <label htmlFor="profile_name" className="block text-sm font-semibold text-slate-700 mb-2">الاسم</label>
                                    <div className="relative">
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                                            <User className="h-5 w-5" />
                                        </div>
                                        <input
                                            id="profile_name"
                                            type="text"
                                            value={profileForm.data.name}
                                            onChange={(e) => profileForm.setData('name', e.target.value)}
                                            className={`pr-11 pl-4 ${inputClass(profileForm.errors.name)}`}
                                            placeholder="أدخل اسمك"
                                        />
                                    </div>
                                    {profileForm.errors.name && <p className="mt-1.5 text-sm text-red-600">{profileForm.errors.name}</p>}
                                </div>

                                <div>
                                    <label htmlFor="profile_email" className="block text-sm font-semibold text-slate-700 mb-2">البريد الإلكتروني</label>
                                    <div className="relative">
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                                            <Mail className="h-5 w-5" />
                                        </div>
                                        <input
                                            id="profile_email"
                                            type="email"
                                            value={profileForm.data.email}
                                            onChange={(e) => profileForm.setData('email', e.target.value)}
                                            className={`pr-11 pl-4 ${inputClass(profileForm.errors.email)}`}
                                            placeholder="أدخل بريدك الإلكتروني"
                                        />
                                    </div>
                                    {profileForm.errors.email && <p className="mt-1.5 text-sm text-red-600">{profileForm.errors.email}</p>}
                                </div>

                                {mustVerifyEmail && user.email_verified_at === null && (
                                    <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-700">
                                        <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                                        <span className="text-sm">بريدك الإلكتروني غير مُفعّل</span>
                                    </div>
                                )}

                                <div className="flex justify-end">
                                    <Button type="submit" loading={profileForm.processing}>
                                        حفظ التغييرات
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </Card>

                    {/* Password */}
                    <Card>
                        <div className="p-6">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2.5 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl shadow-sm">
                                    <Lock className="h-5 w-5 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-base font-bold text-slate-800">تغيير كلمة المرور</h3>
                                    <p className="text-xs text-slate-500">استخدم كلمة مرور قوية للحفاظ على أمان حسابك</p>
                                </div>
                                {passwordSaved && (
                                    <div className="mr-auto flex items-center gap-1.5 text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg">
                                        <Check className="h-4 w-4" />
                                        <span className="text-sm font-medium">تم التغيير</span>
                                    </div>
                                )}
                            </div>

                            <form onSubmit={submitPassword} className="space-y-5">
                                <div>
                                    <label htmlFor="current_password" className="block text-sm font-semibold text-slate-700 mb-2">كلمة المرور الحالية</label>
                                    <div className="relative">
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                                            <Lock className="h-5 w-5" />
                                        </div>
                                        <input
                                            id="current_password"
                                            ref={passwordInput}
                                            type={showCurrentPassword ? 'text' : 'password'}
                                            value={passwordForm.data.current_password}
                                            onChange={(e) => passwordForm.setData('current_password', e.target.value)}
                                            className={`pr-11 pl-11 ${inputClass(passwordForm.errors.current_password)}`}
                                            placeholder="أدخل كلمة المرور الحالية"
                                        />
                                        <button type="button" onClick={() => setShowCurrentPassword(!showCurrentPassword)} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                                            {showCurrentPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                        </button>
                                    </div>
                                    {passwordForm.errors.current_password && <p className="mt-1.5 text-sm text-red-600">{passwordForm.errors.current_password}</p>}
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                    <div>
                                        <label htmlFor="new_password" className="block text-sm font-semibold text-slate-700 mb-2">كلمة المرور الجديدة</label>
                                        <div className="relative">
                                            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                                                <Lock className="h-5 w-5" />
                                            </div>
                                            <input
                                                id="new_password"
                                                type={showNewPassword ? 'text' : 'password'}
                                                value={passwordForm.data.password}
                                                onChange={(e) => passwordForm.setData('password', e.target.value)}
                                                className={`pr-11 pl-11 ${inputClass(passwordForm.errors.password)}`}
                                                placeholder="كلمة المرور الجديدة"
                                            />
                                            <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                                                {showNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                            </button>
                                        </div>
                                        {passwordForm.errors.password && <p className="mt-1.5 text-sm text-red-600">{passwordForm.errors.password}</p>}
                                    </div>

                                    <div>
                                        <label htmlFor="password_confirmation" className="block text-sm font-semibold text-slate-700 mb-2">تأكيد كلمة المرور</label>
                                        <div className="relative">
                                            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                                                <Lock className="h-5 w-5" />
                                            </div>
                                            <input
                                                id="password_confirmation"
                                                type={showConfirmPassword ? 'text' : 'password'}
                                                value={passwordForm.data.password_confirmation}
                                                onChange={(e) => passwordForm.setData('password_confirmation', e.target.value)}
                                                className={`pr-11 pl-11 ${inputClass(passwordForm.errors.password_confirmation)}`}
                                                placeholder="أعد إدخال كلمة المرور"
                                            />
                                            <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                                                {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                            </button>
                                        </div>
                                        {passwordForm.errors.password_confirmation && <p className="mt-1.5 text-sm text-red-600">{passwordForm.errors.password_confirmation}</p>}
                                    </div>
                                </div>

                                <div className="flex justify-end">
                                    <Button type="submit" loading={passwordForm.processing}>
                                        تغيير كلمة المرور
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </Card>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
