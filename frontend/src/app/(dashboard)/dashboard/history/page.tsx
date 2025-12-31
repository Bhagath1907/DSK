'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { History as HistoryIcon, Monitor, Smartphone, Globe, ArrowUpRight, ArrowDownLeft } from 'lucide-react';

// Define types since we are fetching real data
type Transaction = {
    id: string;
    type: 'credit' | 'debit';
    description: string;
    amount: number;
    created_at: string;
    status?: string; // Optional if not in DB yet
};

type LoginSession = {
    id: string;
    ip_address: string;
    user_agent: string;
    login_at: string;
};

type Application = {
    id: number;
    service_id: number;
    status: string;
    created_at: string;
    services: {
        name: string;
        price: number;
    };
};

// Helper to parse user agent into a friendly browser/device name
function parseUserAgent(ua: string | null): { name: string; isDesktop: boolean } {
    if (!ua) return { name: 'Unknown', isDesktop: true };
    const uaLower = ua.toLowerCase();

    // Check for mobile devices first
    if (uaLower.includes('android')) return { name: 'Android', isDesktop: false };
    if (uaLower.includes('iphone') || uaLower.includes('ipad')) return { name: 'iOS', isDesktop: false };

    // Check for browsers
    if (uaLower.includes('edg/') || uaLower.includes('edge')) return { name: 'Edge', isDesktop: true };
    if (uaLower.includes('chrome') && !uaLower.includes('edg')) return { name: 'Chrome', isDesktop: true };
    if (uaLower.includes('firefox')) return { name: 'Firefox', isDesktop: true };
    if (uaLower.includes('safari') && !uaLower.includes('chrome')) return { name: 'Safari', isDesktop: true };
    if (uaLower.includes('opera') || uaLower.includes('opr')) return { name: 'Opera', isDesktop: true };

    return { name: 'Browser', isDesktop: true };
}

export default function HistoryPage() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [logins, setLogins] = useState<LoginSession[]>([]);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();

            if (user) {
                // Fetch Transactions
                const { data: txData } = await supabase
                    .from('transactions')
                    .select('*')
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: false });

                if (txData) setTransactions(txData as any);

                // Fetch Login History
                const { data: loginData } = await supabase
                    .from('login_history')
                    .select('*')
                    .eq('user_id', user.id)
                    .order('login_at', { ascending: false });

                if (loginData) setLogins(loginData as any);
            }
            setLoading(false);
        };
        fetchData();
    }, []);
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('en-IN', {
            day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
        });
    };

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Activity History</h1>
                <p className="text-gray-500">Track your applications and wallet usage.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content: Applications & Transactions */}
                <div className="lg:col-span-2 space-y-8">

                    {/* Application History Removed */}

                    {/* Wallet History */}
                    <div className="space-y-4">
                        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                            Wallet Transactions
                        </h2>
                        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden min-h-[150px]">
                            {loading ? (
                                <div className="p-8 text-center text-gray-500">Loading history...</div>
                            ) : transactions.length === 0 ? (
                                <div className="p-8 text-center text-gray-500">No transactions found.</div>
                            ) : (
                                transactions.map((tx, i) => (
                                    <div key={tx.id} className={`p-6 flex items-center justify-between hover:bg-gray-50 transition-colors ${i !== transactions.length - 1 ? 'border-b border-gray-100' : ''}`}>
                                        <div className="flex items-center gap-4">
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${tx.type === 'credit' ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'}`}>
                                                {tx.type === 'credit' ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownLeft className="w-5 h-5" />}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-gray-900 text-sm">{tx.description}</h3>
                                                <p className="text-xs text-gray-500">{formatDate(tx.created_at)}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className={`font-bold ${tx.type === 'credit' ? 'text-green-600' : 'text-gray-900'}`}>
                                                {tx.type === 'credit' ? '+' : '-'}₹{tx.amount}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Sidebar: Login History */}
                <div className="space-y-6">
                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        <Globe className="w-5 h-5 text-brand-secondary" /> Login Sessions
                    </h2>

                    <div className="bg-white/60 backdrop-blur-sm rounded-3xl shadow-sm border border-gray-100 p-6 space-y-6">
                        {loading ? (
                            <div className="text-center text-gray-500">Loading sessions...</div>
                        ) : logins.length === 0 ? (
                            <div className="text-center text-gray-500">No login history available.</div>
                        ) : (
                            logins.map((login) => {
                                const device = parseUserAgent(login.user_agent);
                                return (
                                    <div key={login.id} className="flex items-start gap-4">
                                        <div className="p-3 bg-white rounded-xl shadow-sm border border-gray-100 text-gray-500">
                                            {device.isDesktop ? <Monitor className="w-5 h-5" /> : <Smartphone className="w-5 h-5" />}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-900 text-sm">{device.name}</h4>
                                            <p className="text-xs text-brand-primary font-medium mt-0.5">{login.ip_address}</p>
                                            <p className="text-xs text-gray-400 mt-1">{formatDate(login.login_at)}</p>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

// Removed Application Logic for cleaner Wallet History
function EmptyComponent() { return null; }
