import { Link, usePage } from '@inertiajs/react';
import {
    Home,
    Calendar,
    Building2,
    BookOpen,
    Package,
    Users,
    GraduationCap,
    School,
    Settings,
    ChevronDown,
    PanelLeftClose,
    PanelLeft,
    UserCog,
    Layers,
    ClipboardList,
    Banknote,
    Award,
    CalendarOff,
} from 'lucide-react';
import clsx from 'clsx';
import { useSidebar } from '@/Hooks/useSidebar';

interface MenuItem {
    title: string;
    icon: React.ElementType;
    href?: string;
    permission?: string;
    children?: MenuItem[];
}

const menuItems: MenuItem[] = [
    { title: 'لوحة التحكم', icon: Home, href: '/dashboard' },
    {
        title: 'إدارة التدريب',
        icon: BookOpen,
        children: [
            { title: 'الأعوام الدراسية', icon: Calendar, href: '/academic-years' },
            { title: 'البرامج التدريبية', icon: BookOpen, href: '/programs' },
            { title: 'الحقائب التدريبية', icon: Package, href: '/packages' },
            { title: 'المجموعات', icon: Layers, href: '/groups' },
            { title: 'جدولة القاعات', icon: Calendar, href: '/schedule' },
        ],
    },
    {
        title: 'القاعات والمدربين',
        icon: Building2,
        children: [
            { title: 'القاعات التدريبية', icon: Building2, href: '/training-halls' },
            { title: 'المدربين', icon: GraduationCap, href: '/trainers' },
        ],
    },
    {
        title: 'العمليات التدريبية',
        icon: ClipboardList,
        children: [
            { title: 'التكليفات', icon: ClipboardList, href: '/assignments' },
            { title: 'صرف المستحقات', icon: Banknote, href: '/payments' },
            { title: 'الشهادات', icon: Award, href: '/certificates' },
        ],
    },
    { title: 'تقويم الاجتماعات', icon: Calendar, href: '/meeting-bookings' },
    {
        title: 'المدارس والمتدربين',
        icon: School,
        children: [
            { title: 'المدارس', icon: School, href: '/schools' },
            { title: 'المتدربين', icon: Users, href: '/employees' },
        ],
    },
    {
        title: 'إدارة النظام',
        icon: Settings,
        children: [
            { title: 'الإجازات الرسمية', icon: CalendarOff, href: '/official-holidays' },
            { title: 'المستخدمين', icon: UserCog, href: '/users' },
            { title: 'الأدوار والصلاحيات', icon: Settings, href: '/roles' },
            { title: 'الإعدادات', icon: Settings, href: '/settings' },
        ],
    },
];

function MenuItem({ item, depth = 0 }: { item: MenuItem; depth?: number }) {
    const { url } = usePage();
    const { isCollapsed, closeSidebar, toggleMenu, isMenuExpanded } = useSidebar();
    const hasChildren = item.children && item.children.length > 0;
    const isActive = item.href ? url.startsWith(item.href) : false;
    const isExpanded = hasChildren ? isMenuExpanded(item.title) : false;
    const Icon = item.icon;

    const hasActiveChild = hasChildren && item.children!.some(child => child.href && url.startsWith(child.href));

    const handleClick = () => {
        if (hasChildren) {
            toggleMenu(item.title);
        } else {
            closeSidebar();
        }
    };

    const content = (
        <>
            <Icon className={clsx(
                'h-5 w-5 shrink-0 transition-colors',
                isActive || hasActiveChild ? 'text-teal-600' : 'text-slate-400 group-hover:text-slate-600'
            )} />
            {!isCollapsed && (
                <>
                    <span className="flex-1 text-right">{item.title}</span>
                    {hasChildren && (
                        <ChevronDown
                            className={clsx(
                                'h-4 w-4 transition-transform duration-200 text-slate-400',
                                isExpanded ? 'rotate-180' : ''
                            )}
                        />
                    )}
                </>
            )}
        </>
    );

    const className = clsx(
        'group flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 w-full',
        isActive || hasActiveChild
            ? 'bg-gradient-to-l from-teal-50 to-teal-100/50 text-teal-700 font-semibold shadow-sm'
            : 'text-slate-600 hover:bg-slate-100/80',
        depth > 0 && 'mr-4 pr-4'
    );

    return (
        <div>
            {item.href && !hasChildren ? (
                <Link href={item.href} className={className} onClick={closeSidebar}>
                    {content}
                </Link>
            ) : (
                <button type="button" className={className} onClick={handleClick}>
                    {content}
                </button>
            )}
            {hasChildren && isExpanded && !isCollapsed && (
                <div className="mt-1.5 mr-3 pr-3 space-y-1 border-r-2 border-slate-200">
                    {item.children!.map((child, index) => (
                        <MenuItem key={index} item={child} depth={depth + 1} />
                    ))}
                </div>
            )}
        </div>
    );
}

export default function Sidebar() {
    const { isOpen, isCollapsed, toggleCollapse, closeSidebar } = useSidebar();

    return (
        <>
            {isOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden"
                    onClick={closeSidebar}
                />
            )}
            <aside
                className={clsx(
                    'fixed top-0 right-0 h-full bg-white/95 backdrop-blur-lg border-l border-slate-200/80 z-50 transition-all duration-300',
                    'flex flex-col shadow-xl',
                    isCollapsed ? 'w-20' : 'w-72',
                    isOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
                )}
            >
                <div className="flex items-center justify-between h-16 px-4 border-b border-slate-200/80 bg-gradient-to-l from-slate-50 to-white">
                    {!isCollapsed && (
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center shadow-md">
                                <GraduationCap className="h-5 w-5 text-white" />
                            </div>
                            <h1 className="text-lg font-bold bg-gradient-to-l from-slate-700 to-slate-900 bg-clip-text text-transparent">
                                نظام التدريب
                            </h1>
                        </div>
                    )}
                    <button
                        onClick={toggleCollapse}
                        className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 hidden lg:flex transition-colors"
                    >
                        {isCollapsed ? <PanelLeft className="h-5 w-5" /> : <PanelLeftClose className="h-5 w-5" />}
                    </button>
                </div>
                <nav className="flex-1 overflow-y-auto p-4 space-y-1.5">
                    {menuItems.map((item, index) => (
                        <MenuItem key={index} item={item} />
                    ))}
                </nav>
                <div className="p-4 border-t border-slate-200/80">
                    <div className={clsx(
                        'text-xs text-slate-400 text-center transition-opacity',
                        isCollapsed ? 'opacity-0' : 'opacity-100'
                    )}>
                        الإصدار 1.0.0
                    </div>
                </div>
            </aside>
        </>
    );
}
