'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { LayoutDashboard, FileText, CheckCircle, XCircle, Users, LogOut, Menu, X, ChevronRight, Settings, ShieldAlert, Layers, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { DskLogo } from '@/components/ui/logo';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [userEmail, setUserEmail] = useState<string | null>(null);
    const pathname = usePathname();
    const router = useRouter();
    const supabase = createClient();

    useEffect(() => {
        const checkAdmin = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push('/login');
                return;
            }

            setUserEmail(user.email ?? null);

            const { data } = await supabase
                .from('users')
                .select('role')
                .eq('id', user.id)
                .single();

            if (data?.role !== 'admin') {
                router.push('/dashboard');
            }
        };
        checkAdmin();
    }, [router, supabase]);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/login');
    };

    const navItems = [
        { href: '/admin', label: 'Overview', icon: LayoutDashboard },
        { href: '/admin/applications', label: 'Applications', icon: FileText },
        { href: '/admin/services', label: 'Services', icon: Layers },
        { href: '/admin/categories', label: 'Categories', icon: Settings },
    ];

    return (
        <div className="flex min-h-screen bg-gradient-to-br from-yellow-400 via-orange-500 to-red-600 text-white">
            {/* Sidebar */}
            <aside
                className={cn(
                    "fixed inset-y-0 left-0 z-40 w-72 bg-black/20 backdrop-blur-xl flex flex-col border-r border-white/10 shadow-2xl transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0",
                    isSidebarOpen ? "translate-x-0" : "-translate-x-full"
                )}
            >
                <div className="h-20 flex items-center justify-between px-8 border-b border-white/10">
                    <Link href="/admin" className="flex items-center gap-2">
                        <DskLogo className="w-10 h-10 rounded-lg shadow-xl shadow-black/20" />
                        <span className="text-xl font-bold text-white drop-shadow-md">Admin Panel</span>
                    </Link>
                    <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-white/80 hover:text-white">
                        <X size={20} />
                    </button>
                </div>

                <nav className="p-4 space-y-2 mt-4 flex-1 overflow-y-auto custom-scrollbar">
                    <p className="px-4 text-xs font-semibold text-white/60 uppercase tracking-wider mb-2">Management</p>
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "group flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                                    isActive
                                        ? "bg-white/20 text-white border border-white/20 shadow-lg backdrop-blur-md"
                                        : "text-white/70 hover:bg-white/10 hover:text-white"
                                )}
                            >
                                <div className="flex items-center gap-3">
                                    <Icon size={20} className={isActive ? "text-white" : "text-white/70 group-hover:text-white"} />
                                    {item.label}
                                </div>
                                {isActive && <ChevronRight size={16} className="text-white" />}
                            </Link>
                        )
                    })}
                </nav>

                <div className="p-6 border-t border-white/10 bg-black/10 mt-auto">
                    <div className="flex items-center gap-3 mb-4 p-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-red-500 text-white flex items-center justify-center font-bold text-sm shadow-md">
                            {userEmail?.[0]?.toUpperCase() || 'A'}
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-sm font-bold text-white truncate w-32">{userEmail}</p>
                            <p className="text-xs text-white/60 font-semibold">Administrator</p>
                        </div>
                    </div>

                    <Button variant="ghost" className="w-full justify-start text-white/80 hover:text-white hover:bg-red-500/20 rounded-xl" onClick={handleLogout}>
                        <LogOut size={18} className="mr-3" />
                        Sign Out
                    </Button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0 bg-transparent overflow-hidden">
                {/* Top Header */}
                <header className="h-16 border-b border-white/10 bg-black/10 backdrop-blur-xl flex items-center px-6 justify-between sticky top-0 z-30">
                    <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 rounded-lg hover:bg-white/10 text-white">
                        <Menu size={24} />
                    </button>
                    <span className="font-bold text-white text-lg lg:hidden">Admin Dashboard</span>
                    <div className="hidden lg:block"></div>

                    <div className="flex items-center gap-4">
                        <div className="px-3 py-1 rounded-full bg-red-600/20 border border-red-500/30 text-red-100 text-xs font-bold uppercase tracking-wide backdrop-blur-sm shadow-sm">
                            Admin Mode
                        </div>
                    </div>
                </header>

                <main className="flex-1 p-6 lg:p-10 overflow-y-auto w-full max-w-7xl mx-auto custom-scrollbar">
                    {children}
                </main>
            </div>
        </div>
    );
}
