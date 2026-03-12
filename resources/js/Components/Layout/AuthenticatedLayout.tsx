import { PropsWithChildren } from 'react';
import clsx from 'clsx';
import Sidebar from './Sidebar';
import Header from './Header';
import { SidebarProvider, useSidebar } from '@/Hooks/useSidebar';

function MainContent({ children }: PropsWithChildren) {
    const { isCollapsed } = useSidebar();

    return (
        <div
            className={clsx(
                'min-h-screen bg-slate-50/50 transition-all duration-300',
                isCollapsed ? 'lg:mr-20' : 'lg:mr-72'
            )}
        >
            <Header />
            <main className="pt-20 pb-8 px-4 lg:px-8">{children}</main>
        </div>
    );
}

export default function AuthenticatedLayout({ children }: PropsWithChildren) {
    return (
        <SidebarProvider>
            <div dir="rtl" className="font-sans">
                <Sidebar />
                <MainContent>{children}</MainContent>
            </div>
        </SidebarProvider>
    );
}
