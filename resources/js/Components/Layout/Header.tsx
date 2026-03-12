import { Link, usePage } from '@inertiajs/react';
import { Menu, Bell, Search, User, LogOut, Settings, ChevronDown } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import clsx from 'clsx';
import { useSidebar } from '@/Hooks/useSidebar';

interface UserType {
    id: number;
    name: string;
    email: string;
}

export default function Header() {
    const { auth } = usePage().props as { auth: { user: UserType } };
    const { toggleSidebar, isCollapsed } = useSidebar();
    const [showUserMenu, setShowUserMenu] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setShowUserMenu(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <header
            className={clsx(
                'fixed top-0 left-0 h-16 bg-white/95 backdrop-blur-sm border-b border-slate-200/80 z-30 transition-all duration-300',
                isCollapsed ? 'right-20' : 'right-72',
                'max-lg:right-0'
            )}
        >
            <div className="flex items-center justify-between h-full px-4 lg:px-6">
                <div className="flex items-center gap-4">
                    <button
                        onClick={toggleSidebar}
                        className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 lg:hidden transition-colors"
                    >
                        <Menu className="h-5 w-5" />
                    </button>
                    <div className="relative hidden md:block">
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="بحث..."
                            className="w-72 pr-10 pl-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                        />
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button className="relative p-2.5 rounded-xl hover:bg-slate-100 text-slate-500 transition-colors">
                        <Bell className="h-5 w-5" />
                        <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"></span>
                    </button>
                    <div className="relative" ref={menuRef}>
                        <button
                            onClick={() => setShowUserMenu(!showUserMenu)}
                            className="flex items-center gap-2 py-1.5 px-3 rounded-xl hover:bg-slate-100 transition-colors"
                        >
                            <div className="w-9 h-9 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl flex items-center justify-center shadow-md shadow-teal-200/50">
                                <span className="text-white font-bold text-sm">{auth.user?.name?.charAt(0)}</span>
                            </div>
                            <div className="hidden sm:block text-right">
                                <span className="text-sm font-semibold text-slate-700 block">{auth.user?.name}</span>
                                <span className="text-xs text-slate-400">مدير النظام</span>
                            </div>
                            <ChevronDown className={clsx(
                                'h-4 w-4 text-slate-400 transition-transform hidden sm:block',
                                showUserMenu && 'rotate-180'
                            )} />
                        </button>
                        {showUserMenu && (
                            <div className="absolute left-0 mt-2 w-56 bg-white rounded-xl shadow-xl shadow-slate-200/50 border border-slate-200 py-2 z-50">
                                <div className="px-4 py-2 border-b border-slate-100">
                                    <p className="text-sm font-semibold text-slate-700">{auth.user?.name}</p>
                                    <p className="text-xs text-slate-400">{auth.user?.email}</p>
                                </div>
                                <Link
                                    href="/profile"
                                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 transition-colors"
                                >
                                    <User className="h-4 w-4" />
                                    الملف الشخصي
                                </Link>
                                <Link
                                    href="/settings"
                                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 transition-colors"
                                >
                                    <Settings className="h-4 w-4" />
                                    الإعدادات
                                </Link>
                                <hr className="my-2 border-slate-100" />
                                <Link
                                    href="/logout"
                                    method="post"
                                    as="button"
                                    className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                >
                                    <LogOut className="h-4 w-4" />
                                    تسجيل الخروج
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}
