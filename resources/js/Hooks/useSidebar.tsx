import { useState, createContext, useContext, ReactNode, useEffect, useCallback } from 'react';

interface SidebarContextType {
    isOpen: boolean;
    isCollapsed: boolean;
    expandedMenus: string[];
    toggleSidebar: () => void;
    toggleCollapse: () => void;
    closeSidebar: () => void;
    toggleMenu: (menuTitle: string) => void;
    isMenuExpanded: (menuTitle: string) => boolean;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function useSidebar() {
    const context = useContext(SidebarContext);
    if (!context) {
        throw new Error('useSidebar must be used within SidebarProvider');
    }
    return context;
}

export function SidebarProvider({ children }: { children: ReactNode }) {
    const [isOpen, setIsOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('sidebar_collapsed') === 'true';
        }
        return false;
    });
    const [expandedMenus, setExpandedMenus] = useState<string[]>(() => {
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem('sidebar_expanded_menus');
            return stored ? JSON.parse(stored) : [];
        }
        return [];
    });

    useEffect(() => {
        localStorage.setItem('sidebar_collapsed', String(isCollapsed));
    }, [isCollapsed]);

    useEffect(() => {
        localStorage.setItem('sidebar_expanded_menus', JSON.stringify(expandedMenus));
    }, [expandedMenus]);

    const toggleSidebar = () => setIsOpen(!isOpen);
    const toggleCollapse = () => setIsCollapsed(!isCollapsed);
    const closeSidebar = () => setIsOpen(false);

    const toggleMenu = useCallback((menuTitle: string) => {
        setExpandedMenus(prev => {
            if (prev.includes(menuTitle)) {
                return prev.filter(m => m !== menuTitle);
            }
            return [...prev, menuTitle];
        });
    }, []);

    const isMenuExpanded = useCallback((menuTitle: string) => {
        return expandedMenus.includes(menuTitle);
    }, [expandedMenus]);

    return (
        <SidebarContext.Provider value={{ 
            isOpen, 
            isCollapsed, 
            expandedMenus,
            toggleSidebar, 
            toggleCollapse, 
            closeSidebar,
            toggleMenu,
            isMenuExpanded,
        }}>
            {children}
        </SidebarContext.Provider>
    );
}
