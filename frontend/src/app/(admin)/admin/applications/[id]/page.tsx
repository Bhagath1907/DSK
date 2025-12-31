'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { ArrowLeft, CheckCircle, XCircle, Clock, Loader2 } from 'lucide-react';

export default function ApplicationDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const [application, setApplication] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const supabase = createClient();

    const fetchApplication = async () => {
        setLoading(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;

            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';
            const res = await fetch(`${apiUrl}/admin/applications/${id}`, {
                headers: { 'Authorization': `Bearer ${session.access_token}` }
            });

            if (res.ok) {
                const data = await res.json();
                setApplication(data);
            } else {
                console.error("Failed to fetch application");
            }
        } catch (error) {
            console.error("Error fetching application:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchApplication();
    }, [id]);

    const updateStatus = async (status: string) => {
        setSubmitting(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;

            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';
            const res = await fetch(`${apiUrl}/admin/applications/${id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}`
                },
                body: JSON.stringify({ status })
            });

            if (res.ok) {
                fetchApplication(); // Refresh data
            }
        } catch (error) {
            console.error("Error updating status:", error);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-brand-primary" />
            </div>
        );
    }

    if (!application) {
        return (
            <div className="flex flex-col items-center justify-center h-[50vh] space-y-4">
                <p className="text-gray-500">Application not found.</p>
                <Button variant="outline" onClick={() => router.back()}>Go Back</Button>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full hover:bg-white hover:shadow-sm">
                    <ArrowLeft className="w-5 h-5 text-gray-500" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Application #{application.id}</h1>
                    <p className="text-gray-500 text-sm">Review submission details</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Main Content: Submission Data */}
                <div className="md:col-span-2 space-y-6">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
                        <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                            Submitted Information
                        </h2>

                        <div className="grid grid-cols-1 gap-6">
                            {Object.entries(application.data).map(([key, value]) => {
                                // KEY LOGIC: Match submission key to Service Field ID to find Label
                                const fieldDef = application.services?.fields?.find((f: any) => f.id === key);
                                const label = fieldDef ? fieldDef.label : key;
                                const isFileField = fieldDef?.type === 'file';

                                return (
                                    <div key={key} className="p-4 bg-gray-50/50 rounded-xl border border-gray-100/50">
                                        <p className="text-xs font-semibold text-brand-primary uppercase tracking-wider mb-2">
                                            {label}
                                        </p>
                                        {isFileField && value ? (
                                            <button
                                                onClick={async () => {
                                                    const { data } = await supabase.storage
                                                        .from('user-documents')
                                                        .createSignedUrl(String(value), 60);
                                                    if (data?.signedUrl) {
                                                        window.open(data.signedUrl, '_blank');
                                                    }
                                                }}
                                                className="flex items-center gap-2 px-4 py-2 bg-[#38BDF8] hover:bg-[#0C4A6E] !text-white rounded-lg transition-colors text-sm font-bold shadow-md"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                                                </svg>
                                                Download Document
                                            </button>
                                        ) : (
                                            <p className="text-gray-900 font-medium text-base break-words">
                                                {String(value)}
                                            </p>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
                        <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                            Final Document
                        </h2>

                        <div className="bg-gray-50 rounded-xl p-6 border border-gray-100 text-center">
                            {application.final_document_url ? (
                                <div className="space-y-4">
                                    <div className="flex items-center justify-center gap-2 text-green-600 font-bold">
                                        <CheckCircle className="w-6 h-6" />
                                        Document Uploaded
                                    </div>
                                    <p className="text-xs text-gray-500 break-all">{application.final_document_url}</p>
                                    <Button
                                        variant="outline"
                                        onClick={async () => {
                                            const { data } = await supabase.storage
                                                .from('final-documents')
                                                .createSignedUrl(application.final_document_url, 60);
                                            if (data?.signedUrl) window.open(data.signedUrl, '_blank');
                                        }}
                                    >
                                        View Document
                                    </Button>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <p className="text-sm text-gray-500">Upload a final document (PDF/Image) for the user to download.</p>
                                    <div className="flex items-center justify-center gap-2">
                                        <input
                                            type="file"
                                            id="final-doc-upload"
                                            className="hidden"
                                            onChange={async (e) => {
                                                const file = e.target.files?.[0];
                                                if (!file) return;

                                                const confirmed = confirm(`Upload ${file.name}?`);
                                                if (!confirmed) return;

                                                const formData = new FormData();
                                                formData.append('file', file);

                                                try {
                                                    const { data: { session } } = await supabase.auth.getSession();
                                                    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

                                                    const res = await fetch(`${apiUrl}/admin/applications/${id}/document`, {
                                                        method: 'POST',
                                                        headers: { 'Authorization': `Bearer ${session?.access_token}` },
                                                        body: formData
                                                    });

                                                    if (res.ok) {
                                                        alert("Document uploaded!");
                                                        fetchApplication();
                                                    } else {
                                                        const errorText = await res.text();
                                                        console.error("Upload failed details:", errorText);
                                                        alert(`Upload failed: ${res.status} - ${errorText}`);
                                                    }
                                                } catch (err) {
                                                    console.error(err);
                                                    alert("Upload error.");
                                                }
                                            }}
                                        />
                                        <Button onClick={() => document.getElementById('final-doc-upload')?.click()}>
                                            Upload Document
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                </div>

                {/* Sidebar: Meta & Actions */}
                <div className="space-y-6">
                    {/* Status Card */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <h3 className="text-sm font-semibold text-gray-500 mb-4 uppercase tracking-wide">Status</h3>
                        <div className="flex justify-center mb-6">
                            <StatusBadge status={application.status} size="lg" />
                        </div>

                        <div className="space-query-4 border-t border-gray-100 pt-6 mt-2 space-y-3">
                            {application.status === 'pending' ? (
                                <>
                                    <Button
                                        className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-6"
                                        onClick={() => updateStatus('approved')}
                                        disabled={submitting}
                                    >
                                        Approve Application
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="w-full border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 py-6"
                                        onClick={() => updateStatus('rejected')}
                                        disabled={submitting}
                                    >
                                        Reject Application
                                    </Button>
                                </>
                            ) : (
                                <div className="text-center text-gray-500 text-sm italic">
                                    Action taken on {new Date().toLocaleDateString()}
                                    <br />
                                    <span className="text-xs">(Status can still be changed if needed)</span>
                                </div>
                            )}
                            {application.status !== 'pending' && (
                                <Button
                                    variant="ghost"
                                    className="w-full text-xs text-gray-400 hover:text-gray-600 mt-2"
                                    onClick={() => updateStatus('pending')}
                                >
                                    Revert to Pending
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Meta Card */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
                        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Details</h3>

                        <div className="flex justify-between items-center py-2 border-b border-gray-50">
                            <span className="text-gray-400 text-sm">User</span>
                            <span className="text-gray-900 font-medium text-sm truncate max-w-[150px]" title={application.users?.email}>
                                {application.users?.email}
                            </span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-gray-50">
                            <span className="text-gray-400 text-sm">Service</span>
                            <span className="text-gray-900 font-medium text-sm">
                                {application.services?.name}
                            </span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-gray-50">
                            <span className="text-gray-400 text-sm">Category</span>
                            <span className="text-brand-primary font-medium text-sm px-2 py-0.5 bg-brand-light rounded-md">
                                {application.services?.Category?.name || 'General'}
                            </span>
                        </div>
                        <div className="flex justify-between items-center py-2">
                            <span className="text-gray-400 text-sm">Date</span>
                            <span className="text-gray-900 text-sm">
                                {new Date(application.created_at).toLocaleDateString()}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatusBadge({ status, size = 'sm' }: { status: string, size?: 'sm' | 'lg' }) {
    const styles = {
        pending: 'bg-amber-50 text-amber-700 border-amber-200',
        approved: 'bg-green-50 text-green-700 border-green-200',
        rejected: 'bg-red-50 text-red-700 border-red-200'
    };

    const sizeClasses = size === 'lg'
        ? 'px-6 py-2 text-base font-bold'
        : 'px-2.5 py-0.5 text-xs font-medium';

    return (
        <span className={`inline-flex items-center justify-center rounded-full border ${styles[status as keyof typeof styles]} ${sizeClasses} capitalize shadow-sm`}>
            {status}
        </span>
    );
}
