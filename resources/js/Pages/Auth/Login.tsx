import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';
import { Eye, EyeOff, Lock, Mail, GraduationCap } from 'lucide-react';

export default function Login({
    status,
}: {
    status?: string;
    canResetPassword: boolean;
}) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false as boolean,
    });

    const [showPassword, setShowPassword] = useState(false);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <>
            <Head title="تسجيل الدخول" />
            <div className="min-h-screen flex" dir="rtl">
                {/* Right Side - Form */}
                <div className="flex-1 flex items-center justify-center p-6 bg-white">
                    <div className="w-full max-w-md">
                        {/* Logo & Title */}
                        <div className="text-center mb-10">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 shadow-lg shadow-blue-500/30 mb-5">
                                <GraduationCap className="h-8 w-8 text-white" />
                            </div>
                            <h1 className="text-2xl font-bold text-slate-800">نظام إدارة التدريب</h1>
                            <p className="text-slate-500 mt-2 text-sm">سجّل دخولك للوصول إلى لوحة التحكم</p>
                        </div>

                        {status && (
                            <div className="mb-6 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-sm text-emerald-700 text-center">
                                {status}
                            </div>
                        )}

                        <form onSubmit={submit} className="space-y-5">
                            {/* Email */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">البريد الإلكتروني</label>
                                <div className="relative">
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                                        <Mail className="h-5 w-5" />
                                    </div>
                                    <input
                                        type="email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        className={`w-full pr-11 pl-4 py-3 rounded-xl border ${errors.email ? 'border-red-400 bg-red-50' : 'border-slate-200 bg-slate-50'} text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 focus:bg-white transition-all`}
                                        placeholder="أدخل بريدك الإلكتروني"
                                        autoComplete="username"
                                        autoFocus
                                    />
                                </div>
                                {errors.email && <p className="mt-1.5 text-sm text-red-600">{errors.email}</p>}
                            </div>

                            {/* Password */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">كلمة المرور</label>
                                <div className="relative">
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                                        <Lock className="h-5 w-5" />
                                    </div>
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                        className={`w-full pr-11 pl-11 py-3 rounded-xl border ${errors.password ? 'border-red-400 bg-red-50' : 'border-slate-200 bg-slate-50'} text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 focus:bg-white transition-all`}
                                        placeholder="أدخل كلمة المرور"
                                        autoComplete="current-password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                    </button>
                                </div>
                                {errors.password && <p className="mt-1.5 text-sm text-red-600">{errors.password}</p>}
                            </div>

                            {/* Remember */}
                            <div className="flex items-center">
                                <label className="flex items-center gap-2 cursor-pointer select-none">
                                    <input
                                        type="checkbox"
                                        checked={data.remember}
                                        onChange={(e) => setData('remember', e.target.checked as false)}
                                        className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500/40"
                                    />
                                    <span className="text-sm text-slate-600">تذكرني</span>
                                </label>
                            </div>

                            {/* Submit */}
                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full py-3 px-4 rounded-xl bg-gradient-to-l from-blue-600 to-indigo-700 text-white font-semibold shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:from-blue-700 hover:to-indigo-800 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200"
                            >
                                {processing ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                        </svg>
                                        جاري تسجيل الدخول...
                                    </span>
                                ) : 'تسجيل الدخول'}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Left Side - Decorative */}
                <div className="hidden lg:flex flex-1 items-center justify-center bg-gradient-to-bl from-blue-600 via-indigo-700 to-blue-800 relative overflow-hidden">
                    <div className="absolute top-20 left-20 w-72 h-72 bg-white/5 rounded-full" />
                    <div className="absolute bottom-20 right-20 w-96 h-96 bg-white/5 rounded-full" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-white/5 rounded-full" />

                    <div className="relative z-10 text-center text-white px-12 max-w-lg">
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-white/10 backdrop-blur-sm mb-8">
                            <GraduationCap className="h-10 w-10 text-white" />
                        </div>
                        <h2 className="text-3xl font-bold mb-4">مرحباً بك في نظام إدارة التدريب</h2>
                        <p className="text-blue-100 text-lg leading-relaxed">
                            نظام متكامل لإدارة البرامج التدريبية والحقائب والمجموعات وجدولة القاعات
                        </p>
                        <div className="mt-10 grid grid-cols-3 gap-4">
                            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
                                <div className="text-2xl font-bold">+50</div>
                                <div className="text-sm text-blue-200 mt-1">برنامج تدريبي</div>
                            </div>
                            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
                                <div className="text-2xl font-bold">+30</div>
                                <div className="text-sm text-blue-200 mt-1">قاعة تدريبية</div>
                            </div>
                            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
                                <div className="text-2xl font-bold">+100</div>
                                <div className="text-sm text-blue-200 mt-1">مجموعة نشطة</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
