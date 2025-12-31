
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Card } from '@/components/ui/card';
import { FileText, Clock, CheckCircle, XCircle, LogIn, Monitor, Smartphone } from 'lucide-react';
import { fetchServices } from '@/lib/api';
import NewJobAlerts from '@/components/NewJobAlerts';

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

export default async function DashboardPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Fetch Services and Submissions
    let services = [];
    let stats = { total: 0, pending: 0, approved: 0, rejected: 0 };
    let recentActivity: any[] = [];
    let loginHistory: any[] = [];
    let activeJobs: any[] = [];

    try {
        services = await fetchServices();

        if (user) {
            const { data: submissions } = await supabase
                .from('submissions')
                .select('*, service:services(name)')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (submissions) {
                stats.total = submissions.length;
                stats.pending = submissions.filter(s => s.status === 'pending').length;
                stats.approved = submissions.filter(s => s.status === 'approved').length;
                stats.rejected = submissions.filter(s => s.status === 'rejected').length;

                recentActivity = submissions.slice(0, 5).map(sub => ({
                    title: `${sub.service?.name || 'Application'} ${sub.status}`,
                    time: new Date(sub.created_at).toLocaleDateString(),
                    status: sub.status === 'approved' ? 'success' : sub.status === 'pending' ? 'warning' : 'info'
                }));
            }

            // Fetch Login History
            const { data: logins } = await supabase
                .from('login_history')
                .select('*')
                .eq('user_id', user.id)
                .order('login_at', { ascending: false })
                .limit(5);

            if (logins) loginHistory = logins;


            // Fetch Job Notifications
            const { data: jobs } = await supabase
                .from('job_notifications')
                .select('*')
                .eq('is_active', true)
                .order('created_at', { ascending: false })
                .limit(5); // Show top 5

            if (jobs) activeJobs = jobs;
        }
    } catch (e) {
        console.error("Backend offline or error", e);
    }

    const maxCount = Math.max(stats.pending, stats.approved, stats.rejected, 1);

    return (
        <div className="space-y-10">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight drop-shadow-md">Dashboard Overview</h1>
                    <p className="text-white mt-1 font-bold text-lg">Manage your applications and services.</p>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: "Total Applications", value: stats.total, icon: FileText, color: "text-white", bg: "bg-indigo-600", border: "border-white/20", glow: "shadow-white/10" },
                    { label: "Pending", value: stats.pending, icon: Clock, color: "text-white", bg: "bg-sky-500", border: "border-white/20", glow: "shadow-white/10" },
                    { label: "Approved", value: stats.approved, icon: CheckCircle, color: "text-white", bg: "bg-emerald-500", border: "border-white/20", glow: "shadow-white/10" },
                    { label: "Rejected", value: stats.rejected, icon: XCircle, color: "text-white", bg: "bg-pink-500", border: "border-white/20", glow: "shadow-white/10" },
                ].map((stat, i) => (
                    <div key={i} className={`bg-black/40 backdrop-blur-lg p-6 rounded-2xl border ${stat.border} shadow-lg hover:shadow-xl transition-all hover:bg-black/50 flex items-center gap-5 group`}>
                        <div className={`p-4 rounded-xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform duration-300 shadow-inner`}>
                            <stat.icon size={28} />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-white uppercase tracking-wider">{stat.label}</p>
                            <p className="text-3xl font-black text-white mt-1 drop-shadow-sm">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Main Content Areas */}
            <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    {/* Application Status Chart */}
                    <div className="bg-black/40 backdrop-blur-lg rounded-2xl border border-white/10 p-8 shadow-xl">
                        <h2 className="text-xl font-bold text-white mb-6 drop-shadow-sm">Application Status Overview</h2>

                        {stats.total > 0 ? (
                            <div className="space-y-6">
                                {/* Pending Bar */}
                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-sm font-bold text-white flex items-center gap-2">
                                            <Clock size={16} className="text-sky-400" />
                                            Pending
                                        </span>
                                        <span className="text-sm font-bold text-white">{stats.pending}</span>
                                    </div>
                                    <div className="h-4 bg-white/20 rounded-full overflow-hidden border border-white/10">
                                        <div
                                            className="h-full bg-sky-500 rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(14,165,233,0.6)]"
                                            style={{ width: `${(stats.pending / maxCount) * 100}%` }}
                                        ></div>
                                    </div>
                                </div>

                                {/* Approved Bar */}
                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-sm font-bold text-white flex items-center gap-2">
                                            <CheckCircle size={16} className="text-emerald-400" />
                                            Approved
                                        </span>
                                        <span className="text-sm font-bold text-white">{stats.approved}</span>
                                    </div>
                                    <div className="h-4 bg-white/20 rounded-full overflow-hidden border border-white/10">
                                        <div
                                            className="h-full bg-emerald-500 rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(16,185,129,0.6)]"
                                            style={{ width: `${(stats.approved / maxCount) * 100}%` }}
                                        ></div>
                                    </div>
                                </div>

                                {/* Rejected Bar */}
                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-sm font-bold text-white flex items-center gap-2">
                                            <XCircle size={16} className="text-pink-400" />
                                            Rejected
                                        </span>
                                        <span className="text-sm font-bold text-white">{stats.rejected}</span>
                                    </div>
                                    <div className="h-4 bg-white/20 rounded-full overflow-hidden border border-white/10">
                                        <div
                                            className="h-full bg-pink-500 rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(236,72,153,0.6)]"
                                            style={{ width: `${(stats.rejected / maxCount) * 100}%` }}
                                        ></div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center text-white py-8">
                                <FileText size={48} className="mx-auto mb-3 opacity-80" />
                                <p className="font-bold">No applications yet</p>
                            </div>
                        )}
                    </div>

                    {/* Login History */}
                    <div className="bg-black/40 backdrop-blur-lg rounded-2xl border border-white/10 p-8 shadow-xl">
                        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2 drop-shadow-sm">
                            <LogIn size={24} className="text-white" />
                            Login History
                        </h2>

                        {loginHistory.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-white/20">
                                            <th className="text-left py-3 px-4 text-xs font-bold text-white uppercase">Device</th>
                                            <th className="text-left py-3 px-4 text-xs font-bold text-white uppercase">IP Address</th>
                                            <th className="text-left py-3 px-4 text-xs font-bold text-white uppercase">Date & Time</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {loginHistory.map((login, i) => {
                                            const device = parseUserAgent(login.user_agent);
                                            return (
                                                <tr key={i} className="border-b border-white/5 hover:bg-white/10 transition-colors">
                                                    <td className="py-3 px-4">
                                                        <div className="flex items-center gap-2">
                                                            {device.isDesktop ? <Monitor size={16} className="text-white" /> : <Smartphone size={16} className="text-white" />}
                                                            <span className="text-sm font-bold text-white">{device.name}</span>
                                                        </div>
                                                    </td>
                                                    <td className="py-3 px-4 text-sm text-white font-mono font-bold">
                                                        {login.ip_address || 'N/A'}
                                                    </td>
                                                    <td className="py-3 px-4 text-sm text-white font-bold">
                                                        {new Date(login.login_at).toLocaleString()}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="text-center text-white py-8">
                                <LogIn size={48} className="mx-auto mb-3 opacity-80" />
                                <p className="font-bold">No login history available</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="space-y-6">
                    {/* New Job Alerts for opted-in users */}
                    <NewJobAlerts />

                    <h2 className="text-xl font-bold text-white drop-shadow-sm">Recent Updates</h2>
                    <div className="bg-black/40 backdrop-blur-lg rounded-2xl border border-white/10 p-6 space-y-6 shadow-xl">
                        {recentActivity.length > 0 ? recentActivity.map((update, i) => (
                            <div key={i} className="flex gap-4 items-start">
                                <div className={`mt-1.5 w-2.5 h-2.5 rounded-full shrink-0 ${update.status === 'success' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]' :
                                    update.status === 'warning' ? 'bg-sky-500 shadow-[0_0_8px_rgba(14,165,233,0.6)]' : 'bg-pink-500 shadow-[0_0_8px_rgba(236,72,153,0.6)]'
                                    }`} />
                                <div>
                                    <p className="font-bold text-white text-sm leading-snug capitalize">{update.title}</p>
                                    <p className="text-xs text-white mt-1 font-bold">{update.time}</p>
                                </div>
                            </div>
                        )) : (
                            <div className="text-center text-white text-sm py-4 font-bold">No recent activity</div>
                        )}
                    </div>

                    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 text-white shadow-xl border border-white/10">
                        <h3 className="font-bold text-lg mb-2 text-white">Need Help?</h3>
                        <p className="text-white text-sm mb-4 font-bold">Our support team is available 24/7 to assist you.</p>
                        <button className="bg-white text-orange-600 px-4 py-2 rounded-lg text-sm font-bold hover:bg-orange-50 transition-colors shadow-lg">
                            Contact Support
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
