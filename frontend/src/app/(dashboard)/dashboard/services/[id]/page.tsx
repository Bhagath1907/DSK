'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { ArrowLeft, CheckCircle2, AlertCircle, Clock, FileText, Download, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import FormRenderer from '@/components/form-builder/FormRenderer';
import Link from 'next/link';
import { API_URL } from '@/lib/api-config';

export default function ServiceApplicationPage({ params }: { params: Promise<{ id: string }> }) {
    const [unwrappedParams, setUnwrappedParams] = useState<{ id: string } | null>(null);
    useEffect(() => {
        params.then(setUnwrappedParams);
    }, [params]);

    const id = unwrappedParams?.id;
    const [service, setService] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [balance, setBalance] = useState(0);
    const router = useRouter();
    const supabase = createClient();

    // Changed from single submission to list
    const [submissions, setSubmissions] = useState<any[]>([]);

    const fetchData = async () => {
        if (!id) return;

        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            // Get Balance
            const { data: userData } = await supabase.from('users').select('wallet_balance').eq('id', user.id).single();
            if (userData) setBalance(userData.wallet_balance);

            // Get ALL Submissions for this service
            const { data: subs } = await supabase
                .from('submissions')
                .select('*')
                .eq('user_id', user.id)
                .eq('service_id', id)
                .order('created_at', { ascending: false });

            if (subs) setSubmissions(subs);
        }

        // Get Service Details
        const { data: srv } = await supabase.from('services').select('*').eq('id', id).single();
        if (srv) setService(srv);

        setLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, [id]);

    const handleSubmit = async (formData: any) => {
        // Use the Backend API to handle wallet deduction atomically
        const { data: { session } } = await supabase.auth.getSession();

        if (!session) {
            router.push('/login');
            return;
        }

        try {
            setLoading(true); // Start loading
            const res = await fetch(`${API_URL}/services/apply`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}`
                },
                body: JSON.stringify({
                    service_id: parseInt(id!),
                    data: {
                        ...formData,
                        user_id: session.user.id
                    }
                })
            });

            const result = await res.json();

            if (!res.ok) {
                throw new Error(result.detail || 'Submission failed');
            }

            // Success - Refresh data to show new submission in list
            alert('Application submitted successfully!');
            fetchData();

        } catch (error: any) {
            alert(error.message);
        } finally {
            setLoading(false); // Stop loading
        }
    };

    if (loading) return <div className="p-8">Loading application...</div>;
    if (!service) return <div className="p-8">Service not found.</div>;

    const canAfford = balance >= service.price;

    // Filter submissions
    const pendingApps = submissions.filter(s => s.status === 'pending');
    const approvedApps = submissions.filter(s => s.status === 'approved');
    const rejectedApps = submissions.filter(s => s.status === 'rejected');

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-20">
            {/* Header & Navigation */}
            <div>
                <Link href={`/dashboard/category/${service.category_id}`}>
                    <Button variant="ghost" size="sm" className="mb-4 pl-0 hover:bg-transparent hover:text-brand-primary">
                        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Services
                    </Button>
                </Link>
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                        {service.logo_url && (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img src={service.logo_url} alt={service.name} className="w-16 h-16 object-contain rounded-xl border border-gray-100 p-2 bg-white" />
                        )}
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">{service.name}</h1>
                            <p className="text-gray-500 mt-1">{service.description}</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-sm text-gray-500">Service Fee</p>
                        <p className="text-2xl font-bold text-brand-primary">₹ {service.price}</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: New Application Form */}
                <div className="lg:col-span-2 space-y-6" id="new-application">
                    <div className={`p-6 rounded-2xl border ${canAfford ? 'bg-white border-gray-100' : 'bg-red-50 border-red-100'}`}>
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-full bg-brand-light flex items-center justify-center text-brand-primary">
                                <FileText size={20} />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-gray-900">New Application</h2>
                                <p className="text-xs text-gray-500">Fill out the form below to apply</p>
                            </div>
                        </div>

                        {!canAfford && (
                            <div className="mb-6 p-4 rounded-xl bg-red-100/50 text-red-700 flex items-center gap-3">
                                <AlertCircle />
                                <div>
                                    <p className="font-bold">Insufficient Wallet Balance</p>
                                    <p className="text-sm">You need ₹{service.price - balance} more. Current Balance: ₹{balance.toFixed(2)}.</p>
                                    <Link href="/dashboard/wallet">
                                        <span className="underline font-bold cursor-pointer">Recharge Wallet</span>
                                    </Link>
                                </div>
                            </div>
                        )}

                        {canAfford && (
                            <div className="space-y-6">
                                <FormRenderer
                                    fields={service.fields}
                                    onSubmit={handleSubmit}
                                    submitLabel={`Pay ₹${service.price} & Submit`}
                                />
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column: History */}
                <div className="space-y-6">
                    <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                        Application History
                        <span className="px-2 py-0.5 rounded-full bg-gray-100 text-xs font-medium text-gray-600">
                            {submissions.length}
                        </span>
                    </h3>

                    <div className="space-y-6">
                        {/* Pending Section */}
                        {pendingApps.length > 0 && (
                            <div className="space-y-3" id="pending">
                                <h4 className="text-sm font-semibold text-amber-600 uppercase tracking-wider flex items-center gap-2">
                                    <Clock size={14} /> Pending Review
                                </h4>
                                {pendingApps.map(app => (
                                    <div key={app.id} className="bg-white p-4 rounded-xl border border-amber-100 shadow-sm relative overflow-hidden">
                                        <div className="absolute top-0 left-0 w-1 h-full bg-amber-400" />
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="text-xs font-mono text-gray-400">#{app.id}</span>
                                            <span className="text-xs text-gray-400">{new Date(app.created_at).toLocaleDateString()}</span>
                                        </div>
                                        <p className="text-sm text-gray-600">Your application is currently under review by the admin team.</p>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Approved Section */}
                        {approvedApps.length > 0 && (
                            <div className="space-y-3" id="approved">
                                <h4 className="text-sm font-semibold text-green-600 uppercase tracking-wider flex items-center gap-2">
                                    <CheckCircle2 size={14} /> Approved
                                </h4>
                                {approvedApps.map(app => (
                                    <div key={app.id} className="bg-white p-4 rounded-xl border border-green-100 shadow-sm relative overflow-hidden">
                                        <div className="absolute top-0 left-0 w-1 h-full bg-green-500" />
                                        <div className="flex justify-between items-start mb-3">
                                            <span className="text-xs font-mono text-gray-400">#{app.id}</span>
                                            <span className="text-xs text-gray-400">{new Date(app.created_at).toLocaleDateString()}</span>
                                        </div>

                                        {app.final_document_url ? (
                                            <Button
                                                size="sm"
                                                className="w-full bg-green-50 text-green-700 hover:bg-green-100 hover:text-green-800 border border-green-200 shadow-none"
                                                onClick={async () => {
                                                    const { data } = await supabase.storage
                                                        .from('final-documents')
                                                        .createSignedUrl(app.final_document_url, 60);
                                                    if (data?.signedUrl) window.open(data.signedUrl, '_blank');
                                                }}
                                            >
                                                <Download size={14} className="mr-2" /> Download Document
                                            </Button>
                                        ) : (
                                            <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded text-center">
                                                Document processing...
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Rejected Section */}
                        {rejectedApps.length > 0 && (
                            <div className="space-y-3" id="rejected">
                                <h4 className="text-sm font-semibold text-red-600 uppercase tracking-wider flex items-center gap-2">
                                    <AlertCircle size={14} /> Rejected
                                </h4>
                                {rejectedApps.map(app => (
                                    <div key={app.id} className="bg-white p-4 rounded-xl border border-red-100 shadow-sm relative overflow-hidden opacity-75 hover:opacity-100 transition-opacity">
                                        <div className="absolute top-0 left-0 w-1 h-full bg-red-400" />
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="text-xs font-mono text-gray-400">#{app.id}</span>
                                            <span className="text-xs text-gray-400">{new Date(app.created_at).toLocaleDateString()}</span>
                                        </div>
                                        <p className="text-sm text-gray-600">Application was rejected. You can try applying again.</p>
                                    </div>
                                ))}
                            </div>
                        )}

                        {submissions.length === 0 && (
                            <div className="text-center py-8 text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                <p className="text-sm">No history yet</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
