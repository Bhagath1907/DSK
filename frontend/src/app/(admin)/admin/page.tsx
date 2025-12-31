'use client';

import { useState, useEffect } from 'react';
import { Users, Layers, Box, FileText, Activity } from 'lucide-react';
import { API_URL } from '@/lib/api-config';
import { createClient } from '@/lib/supabase/client';

export default function AdminDashboard() {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const supabase = createClient();

    useEffect(() => {
        let isMounted = true;

        const fetchStats = async (session: any) => {
            if (!session) {
                setError("Not authenticated. Please log in.");
                setLoading(false);
                return;
            }

            try {
                const res = await fetch(`${API_URL}/admin/stats`, {
                    headers: {
                        'Authorization': `Bearer ${session.access_token}`
                    }
                });

                if (res.ok) {
                    const data = await res.json();
                    if (isMounted) setStats(data);
                } else {
                    const errorMsg = await res.text().catch(() => res.statusText);
                    console.error("Stats API Error:", res.status, errorMsg);
                    if (isMounted) setError(`Error ${res.status}: ${errorMsg}`);
                }
            } catch (e: any) {
                console.error("Failed to fetch stats connection", e);
                if (isMounted) setError(e.message || "Connection Failed");
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        // Use onAuthStateChange to wait for session
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (event === 'INITIAL_SESSION' || event === 'SIGNED_IN') {
                // Refresh the session to ensure we have a fresh token
                const { data } = await supabase.auth.refreshSession();
                fetchStats(data.session || session);
            } else if (event === 'SIGNED_OUT') {
                setError("Not authenticated");
                setLoading(false);
            }
        });

        return () => {
            isMounted = false;
            subscription.unsubscribe();
        };
    }, []);

    if (loading) return <div className="p-8">Loading stats...</div>;
    if (error) return <div className="p-8 text-red-500 font-bold">Failed to load statistics: {error}</div>;
    if (!stats) return <div className="p-8">No statistics data available.</div>;

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-gray-500">Platform overview and performance metrics.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    label="Total Users"
                    value={stats.total_users}
                    icon={Users}
                    color="bg-blue-500"
                />
                <StatCard
                    label="Services Active"
                    value={stats.total_services}
                    icon={Box}
                    color="bg-indigo-500"
                />
                <StatCard
                    label="Total Applications"
                    value={stats.total_applications}
                    icon={FileText}
                    color="bg-purple-500"
                />
                <StatCard
                    label="Pending Review"
                    value={stats.pending_applications}
                    icon={Activity}
                    color="bg-amber-500"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 md:col-span-2">
                    <h3 className="font-bold text-gray-900 mb-4">Application Status</h3>
                    <div className="flex items-center gap-8">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-green-600">{stats.approved_applications}</div>
                            <div className="text-sm text-gray-500">Approved</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-red-600">{stats.rejected_applications}</div>
                            <div className="text-sm text-gray-500">Rejected</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-amber-600">{stats.pending_applications}</div>
                            <div className="text-sm text-gray-500">Pending</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatCard({ label, value, icon: Icon, color }: any) {
    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
            <div>
                <p className="text-sm font-medium text-gray-500">{label}</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
            </div>
            <div className={`w-12 h-12 rounded-xl ${color} text-white flex items-center justify-center shadow-lg shadow-gray-200`}>
                <Icon size={24} />
            </div>
        </div>
    )
}
