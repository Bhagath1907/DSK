'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { LayoutDashboard, FileText, User, LogOut, Menu, X, ChevronRight, Wallet, History, GraduationCap, Building2, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import ChatAssistant from '@/components/ChatAssistant';
import NoticeBoard from '@/components/NoticeBoard';
import JobAlertBell from '@/components/JobAlertBell';
import { DskLogo } from '@/components/ui/logo';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [userEmail, setUserEmail] = useState<string | null>(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [walletBalance, setWalletBalance] = useState<number>(0);
    const pathname = usePathname();
    const router = useRouter();
    const supabase = createClient();

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push(`/login?next=${pathname}`);
            } else {
                setUserEmail(user.email ?? null);
                // Check Role and Wallet
                const { data } = await supabase
                    .from('users')
                    .select('role, wallet_balance')
                    .eq('id', user.id)
                    .single();

                if (data?.role === 'admin') {
                    setIsAdmin(true);
                }
                if (data?.wallet_balance !== undefined) {
                    setWalletBalance(data.wallet_balance);
                }
            }
        };
        getUser();
    }, [router, supabase]);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/login');
    };

    const [categories, setCategories] = useState<any[]>([]);
    const [expandedCategory, setExpandedCategory] = useState<number | null>(null);

    useEffect(() => {
        const fetchCategories = async () => {
            const { data } = await supabase.from('categories').select('*').eq('is_active', true).order('name');
            if (data) setCategories(data);
        };
        fetchCategories();
    }, []);

    const toggleCategory = (id: number) => {
        setExpandedCategory(expandedCategory === id ? null : id);
    };

    const navItems = [
        { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
        { href: '/dashboard/wallet', label: 'Wallet', icon: Wallet },
        { href: '/dashboard/history', label: 'History', icon: History },
        { href: '/dashboard/profile', label: 'Profile', icon: User },
    ];

    return (
        <div className="flex min-h-screen bg-[url('/bg-wave.png')] bg-cover bg-fixed bg-center text-slate-200">
            <aside
                className={cn(
                    "fixed inset-y-0 left-0 z-40 w-72 bg-black/20 backdrop-blur-xl flex flex-col border-r border-white/10 shadow-2xl transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0",
                    isSidebarOpen ? "translate-x-0" : "-translate-x-full"
                )}
            >
                <div className="h-20 flex items-center justify-between px-8 border-b border-white/10">
                    <Link href="/" className="flex items-center gap-2">
                        <DskLogo className="w-10 h-10 rounded-lg shadow-xl shadow-black/20" />
                        <span className="text-xl font-bold text-white drop-shadow-md">DSK Portal</span>
                    </Link>
                    <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-white hover:text-white">
                        <X size={20} />
                    </button>
                </div>

                <nav className="p-4 space-y-2 mt-4 flex-1 overflow-y-auto custom-scrollbar">
                    <p className="px-4 text-xs font-bold text-white uppercase tracking-wider mb-2">Menu</p>
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "group flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold transition-all duration-200",
                                    isActive
                                        ? "bg-white/20 text-white border border-white/20 shadow-lg backdrop-blur-md"
                                        : "text-white hover:bg-white/10 hover:text-white"
                                )}
                            >
                                <div className="flex items-center gap-3">
                                    <Icon size={20} className={isActive ? "text-white" : "text-white group-hover:text-white"} />
                                    {item.label}
                                </div>
                                {isActive && <ChevronRight size={16} className="text-white" />}
                            </Link>
                        )
                    })}

                    {/* Categories Accordion */}
                    <div className="my-4 border-t border-white/10"></div>
                    <p className="px-4 text-xs font-bold text-white uppercase tracking-wider mb-2">Service Categories</p>

                    {categories.map((category) => (
                        <div key={category.id} className="px-4 mb-2">
                            <button
                                onClick={() => toggleCategory(category.id)}
                                className={cn(
                                    "w-full flex items-center justify-between px-4 py-2 rounded-lg text-sm font-bold transition-all duration-200",
                                    (pathname.includes(`/category/${category.id}`) || expandedCategory === category.id)
                                        ? "bg-white/10 text-white"
                                        : "text-white hover:bg-white/5 hover:text-white"
                                )}
                            >
                                <div className="flex items-center gap-3">
                                    <FileText size={18} className="text-white" />
                                    <span className="truncate max-w-[140px] text-left">{category.name}</span>
                                </div>
                                <ChevronRight
                                    size={14}
                                    className={cn("transition-transform text-white", expandedCategory === category.id ? "rotate-90" : "")}
                                />
                            </button>

                            {/* Sub-menu */}
                            {expandedCategory === category.id && (
                                <div className="mt-1 ml-4 pl-4 border-l-2 border-white/20 space-y-1">
                                    <Link
                                        href={`/dashboard/category/${category.id}#services`}
                                        className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-white hover:text-white rounded-md hover:bg-white/10 transition-colors"
                                    >
                                        <div className="w-1.5 h-1.5 rounded-full border border-current opacity-80" />
                                        New Application
                                    </Link>
                                    <Link
                                        href={`/dashboard/category/${category.id}#pending`}
                                        className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-white hover:text-white rounded-md hover:bg-white/10 transition-colors"
                                    >
                                        <div className="w-1.5 h-1.5 rounded-full border border-current opacity-80 bg-amber-500 border-amber-500" />
                                        Pending
                                    </Link>
                                    <Link
                                        href={`/dashboard/category/${category.id}#approved`}
                                        className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-white hover:text-white rounded-md hover:bg-white/10 transition-colors"
                                    >
                                        <div className="w-1.5 h-1.5 rounded-full border border-current opacity-80 bg-green-500 border-green-500" />
                                        Approved
                                    </Link>
                                    <Link
                                        href={`/dashboard/category/${category.id}#rejected`}
                                        className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-white hover:text-white rounded-md hover:bg-white/10 transition-colors"
                                    >
                                        <div className="w-1.5 h-1.5 rounded-full border border-current opacity-80 bg-red-500 border-red-500" />
                                        Rejected
                                    </Link>
                                </div>
                            )}
                        </div>
                    ))}
                </nav>

                <div className="p-6 border-t border-white/10 bg-black/10 mt-auto">
                    <div className="flex items-center gap-3 mb-4 p-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-red-500 text-white flex items-center justify-center font-bold text-sm shadow-md">
                            {userEmail?.[0]?.toUpperCase() || 'U'}
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-sm font-bold text-white truncate w-32">{userEmail}</p>
                            <p className="text-xs text-white font-bold">Applicant</p>
                        </div>
                    </div>

                    <Button variant="ghost" className="w-full justify-start text-white hover:text-white hover:bg-red-500/20 rounded-xl font-bold" onClick={handleLogout}>
                        <LogOut size={18} className="mr-3" />
                        Sign Out
                    </Button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0 bg-transparent overflow-hidden text-white">
                {/* Top Header with Wallet */}
                <header className="h-16 border-b border-white/10 bg-black/10 backdrop-blur-xl flex items-center px-6 justify-between sticky top-0 z-30">
                    <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 rounded-lg hover:bg-white/10 text-white">
                        <Menu size={24} />
                    </button>
                    <span className="font-bold text-white text-lg lg:hidden">Dashboard</span>
                    <div className="hidden lg:block"></div>

                    <div className="flex items-center gap-4">
                        {/* Job Alert Bell */}
                        <JobAlertBell />

                        <div className="flex items-center gap-2 px-4 py-2 bg-black/20 rounded-full border border-white/10 shadow-sm backdrop-blur-md">
                            <Wallet size={18} className="text-emerald-400" />
                            <span className="text-sm font-bold text-white">₹{walletBalance}</span>
                        </div>
                    </div>
                </header>

                <main className="flex-1 p-6 lg:p-10 overflow-y-auto w-full max-w-7xl mx-auto custom-scrollbar">
                    {children}
                </main>
            </div>
            <ChatAssistant />
            <NoticeBoard />
        </div>
    );
}
