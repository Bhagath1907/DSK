'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { Box, ArrowRight, Clock, CheckCircle2, AlertCircle, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function CategoryViewPage({ params }: { params: Promise<{ id: string }> }) {
    const [unwrappedParams, setUnwrappedParams] = useState<{ id: string } | null>(null);
    useEffect(() => {
        params.then(setUnwrappedParams);
    }, [params]);

    const id = unwrappedParams?.id;
    const [services, setServices] = useState<any[]>([]);
    const [categoryName, setCategoryName] = useState('');
    const [submissions, setSubmissions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        if (!id) return;

        const fetchData = async () => {
            // Fetch Category Details
            const { data: cat } = await supabase.from('categories').select('name').eq('id', id).single();
            if (cat) setCategoryName(cat.name);

            // Fetch Services
            const { data: srvs } = await supabase
                .from('services')
                .select('*')
                .eq('category_id', id)
                .eq('is_active', true)
                .order('name');

            if (srvs) {
                setServices(srvs);

                // Fetch Submissions for these services
                const { data: { user } } = await supabase.auth.getUser();
                if (user && srvs.length > 0) {
                    const serviceIds = srvs.map(s => s.id);
                    const { data: subs } = await supabase
                        .from('submissions')
                        .select('*, service:services(*)')
                        .eq('user_id', user.id)
                        .in('service_id', serviceIds)
                        .order('created_at', { ascending: false });

                    if (subs) setSubmissions(subs);
                }
            }
            setLoading(false);
        };
        fetchData();
    }, [id]);

    if (loading) return <div className="p-8">Loading...</div>;

    const pendingApps = submissions.filter(s => s.status === 'pending');
    const approvedApps = submissions.filter(s => s.status === 'approved');
    const rejectedApps = submissions.filter(s => s.status === 'rejected');

    return (
        <div className="space-y-12 pb-20">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-white shadow-sm">{categoryName || 'Services'}</h1>
                <p className="text-slate-200 font-medium">Manage your applications and view services.</p>
            </div>

            {/* Services Grid (New Application) */}
            <section id="services" className="scroll-mt-24">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
                        <Box size={20} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white shadow-sm">Available Services</h2>
                        <p className="text-sm text-slate-300 font-medium">Click to start a new application</p>
                    </div>
                </div>

                {services.length === 0 ? (
                    <div className="bg-slate-950/80 p-8 rounded-xl shadow-lg text-center border border-white/10 backdrop-blur-sm">
                        <p className="text-slate-400">No services currently available.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {services.map((service, index) => {
                            // curated list of distinct vibrant gradients that support white text
                            const gradients = [
                                "bg-gradient-to-br from-violet-600 to-indigo-600",
                                "bg-gradient-to-br from-emerald-500 to-teal-600",
                                "bg-gradient-to-br from-rose-500 to-pink-600",
                                "bg-gradient-to-br from-amber-500 to-orange-600",
                                "bg-gradient-to-br from-blue-500 to-cyan-600",
                                "bg-gradient-to-br from-fuchsia-600 to-purple-600",
                                "bg-gradient-to-br from-red-500 to-rose-600",
                                "bg-gradient-to-br from-indigo-500 to-blue-600",
                            ];
                            const gradientClass = gradients[index % gradients.length];

                            return (
                                <div key={service.id} className={`${gradientClass} rounded-2xl p-6 shadow-xl border border-white/20 hover:shadow-2xl hover:scale-[1.02] transition-all group flex flex-col h-full backdrop-blur-sm relative overflow-hidden`}>
                                    {/* Glass sheen effect */}
                                    <div className="absolute inset-0 bg-white/5 pointer-events-none" />

                                    <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg relative z-10 overflow-hidden">
                                        {service.logo_url ? (
                                            /* eslint-disable-next-line @next/next/no-img-element */
                                            <img src={service.logo_url} alt={service.name} className="w-full h-full object-contain p-2" />
                                        ) : (
                                            <Box size={24} className="text-slate-900" />
                                        )}
                                    </div>

                                    <h3 className="font-bold text-xl text-white mb-2 relative z-10 drop-shadow-sm">{service.name}</h3>
                                    <p className="text-white/90 text-sm line-clamp-2 mb-4 flex-1 relative z-10 font-medium leading-relaxed">
                                        {service.description || 'No description available.'}
                                    </p>

                                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/20 relative z-10">
                                        <span className="font-bold text-white text-lg">₹ {service.price}</span>
                                        <Link href={`/dashboard/services/${service.id}`}>
                                            <Button size="sm" className="bg-white text-slate-900 hover:bg-white/90 font-bold shadow-lg border-none">
                                                Apply Now <ArrowRight className="w-4 h-4 ml-1" />
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </section>

            {/* History Sections */}

            {/* Pending */}
            {pendingApps.length > 0 && (
                <section id="pending" className="scroll-mt-24">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-full bg-amber-500/20 text-amber-500 flex items-center justify-center border border-amber-500/30">
                            <Clock size={20} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white shadow-sm">Pending Applications</h2>
                            <p className="text-sm text-slate-300 font-medium">Under review by admin</p>
                        </div>
                    </div>
                    <div className="grid gap-4">
                        {pendingApps.map(app => (
                            <div key={app.id} className="bg-slate-950/80 p-6 rounded-xl border border-amber-500/20 shadow-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 backdrop-blur-sm">
                                <div>
                                    <h3 className="font-bold text-white">{app.service?.name}</h3>
                                    <p className="text-sm text-slate-400">Submitted on {new Date(app.created_at).toLocaleDateString()}</p>
                                    <div className="mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-500/20 text-amber-400 border border-amber-500/20">
                                        Pending Review
                                    </div>
                                </div>
                                <div className="text-sm text-slate-500">
                                    ID: <span className="font-mono text-slate-400">{app.id}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Approved */}
            {approvedApps.length > 0 && (
                <section id="approved" className="scroll-mt-24">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center border border-emerald-500/30">
                            <CheckCircle2 size={20} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white shadow-sm">Approved Applications</h2>
                            <p className="text-sm text-slate-300 font-medium">Ready for download</p>
                        </div>
                    </div>
                    <div className="grid gap-4">
                        {approvedApps.map(app => (
                            <div key={app.id} className="bg-slate-950/80 p-6 rounded-xl border border-emerald-500/20 shadow-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 backdrop-blur-sm">
                                <div>
                                    <h3 className="font-bold text-white">{app.service?.name}</h3>
                                    <p className="text-sm text-slate-400">Approved on {new Date(app.updated_at || app.created_at).toLocaleDateString()}</p>
                                    <div className="mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-400 border border-emerald-500/20">
                                        Approved
                                    </div>
                                </div>

                                {app.final_document_url ? (
                                    <Button
                                        className="bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg font-bold"
                                        onClick={async () => {
                                            const { data } = await supabase.storage
                                                .from('final-documents')
                                                .createSignedUrl(app.final_document_url, 60);
                                            if (data?.signedUrl) window.open(data.signedUrl, '_blank');
                                        }}
                                    >
                                        <Download size={16} className="mr-2" /> Download Document
                                    </Button>
                                ) : (
                                    <span className="text-sm text-slate-500 italic">Document preparing...</span>
                                )}
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Rejected */}
            {rejectedApps.length > 0 && (
                <section id="rejected" className="scroll-mt-24">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-full bg-red-500/20 text-red-500 flex items-center justify-center border border-red-500/30">
                            <AlertCircle size={20} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white shadow-sm">Rejected Applications</h2>
                            <p className="text-sm text-slate-300 font-medium">Action required</p>
                        </div>
                    </div>
                    <div className="grid gap-4">
                        {rejectedApps.map(app => (
                            <div key={app.id} className="bg-slate-950/80 p-6 rounded-xl border border-red-500/20 shadow-lg opacity-90 hover:opacity-100 transition-opacity backdrop-blur-sm">
                                <div>
                                    <h3 className="font-bold text-white">{app.service?.name}</h3>
                                    <p className="text-sm text-slate-400">Rejected on {new Date(app.updated_at || app.created_at).toLocaleDateString()}</p>
                                    <div className="mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-500/20 text-red-400 border border-red-500/20">
                                        Rejected
                                    </div>
                                </div>
                                <Link href={`/dashboard/services/${app.service_id}`}>
                                    <Button variant="outline" size="sm" className="mt-4 sm:mt-0 text-red-400 border-red-500/50 hover:bg-red-500/10 hover:text-red-300">
                                        Apply Again
                                    </Button>
                                </Link>
                            </div>
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
}
