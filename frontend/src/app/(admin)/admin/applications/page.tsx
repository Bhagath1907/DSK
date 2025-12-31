'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Filter, Eye, CheckCircle, XCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"; // Assuming shadcn dialog exists or standard modal

export default function ApplicationsPage() {
    const [applications, setApplications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const supabase = createClient();

    const fetchApplications = async () => {
        setLoading(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;

            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';
            const url = new URL(`${apiUrl}/admin/applications`);

            const res = await fetch(url.toString(), {
                headers: { 'Authorization': `Bearer ${session.access_token}` }
            });

            if (res.ok) {
                const data = await res.json();
                setApplications(data);
            }
        } catch (error) {
            console.error("Failed to fetch applications", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchApplications();
    }, []);

    const updateStatus = async (id: number, status: string) => {
        const { data: { session } } = await supabase.auth.getSession();
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

        await fetch(`${apiUrl}/admin/applications/${id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session?.access_token}`
            },
            body: JSON.stringify({ status })
        });

        fetchApplications();
    };



    // Filter logic handled in render now
    const pendingApps = applications.filter(app => app.status === 'pending');
    const approvedApps = applications.filter(app => app.status === 'approved');
    const rejectedApps = applications.filter(app => app.status === 'rejected');

    return (
        <div className="space-y-8 pb-20">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Application Management</h1>
                <p className="text-gray-500 text-sm">Review pending, approved, and rejected submissions.</p>
            </div>

            {loading ? (
                <div className="p-12 text-center text-gray-500">Loading applications...</div>
            ) : (
                <div className="grid grid-cols-1 gap-12">

                    {/* Pending Section */}
                    <StatusSection
                        title="Pending Applications"
                        apps={pendingApps}
                        color="amber"
                        onView={(app) => router.push(`/admin/applications/${app.id}`)}
                    />

                    {/* Approved Section */}
                    <StatusSection
                        title="Approved Applications"
                        apps={approvedApps}
                        color="green"
                        onView={(app) => router.push(`/admin/applications/${app.id}`)}
                    />

                    {/* Rejected Section */}
                    <StatusSection
                        title="Rejected Applications"
                        apps={rejectedApps}
                        color="red"
                        onView={(app) => router.push(`/admin/applications/${app.id}`)}
                    />

                </div>
            )}
        </div>
    );
}

function StatusSection({ title, apps, color, onView }: { title: string, apps: any[], color: string, onView: (app: any) => void }) {
    if (apps.length === 0) return null; // Hide empty sections? Or show placeholder? Let's hide to be cleaner or show placeholder if all empty

    const colorClasses = {
        amber: 'bg-amber-50 text-amber-900 border-amber-200',
        green: 'bg-green-50 text-green-900 border-green-200',
        red: 'bg-red-50 text-red-900 border-red-200',
    }

    return (
        <div className="space-y-4">
            <h2 className={`text-lg font-bold flex items-center gap-2 px-4 py-2 w-fit rounded-lg border ${colorClasses[color as keyof typeof colorClasses]}`}>
                {title}
                <span className="bg-white/50 px-2 py-0.5 rounded-md text-sm ml-2">{apps.length}</span>
            </h2>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50/50 border-b border-gray-100 text-gray-500 uppercase text-xs tracking-wider">
                        <tr>
                            <th className="px-6 py-3 font-semibold">User</th>
                            <th className="px-6 py-3 font-semibold">Service</th>
                            <th className="px-6 py-3 font-semibold">Date</th>
                            <th className="px-6 py-3 font-semibold text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {apps.map((app: any) => (
                            <tr key={app.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 font-medium text-gray-900">{app.users?.email}</td>
                                <td className="px-6 py-4 text-gray-700">{app.services?.name}</td>
                                <td className="px-6 py-4 text-gray-400 text-xs">
                                    {new Date(app.created_at).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <Button
                                        onClick={() => onView(app)}
                                        variant="ghost"
                                        className="text-blue-600 hover:text-blue-800 font-bold hover:bg-blue-50 h-8 px-3"
                                    >
                                        View Details
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

// StatusBadge is used in render
function StatusBadge({ status }: { status: string }) {
    const styles = {
        pending: 'bg-amber-50 text-amber-700 border-amber-100',
        approved: 'bg-green-50 text-green-700 border-green-100',
        rejected: 'bg-red-50 text-red-700 border-red-100'
    };
    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[status as keyof typeof styles]}`}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
    );
}
