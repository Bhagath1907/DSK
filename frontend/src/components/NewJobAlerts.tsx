'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Briefcase, ExternalLink, Sparkles } from 'lucide-react';
import Link from 'next/link';

interface JobService {
    id: number;
    name: string;
    description: string;
    price: number;
    created_at: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

export default function NewJobAlerts() {
    const [jobs, setJobs] = useState<JobService[]>([]);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        fetchNewJobs();
    }, []);

    const fetchNewJobs = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            setLoading(false);
            return;
        }

        try {
            const res = await fetch(`${API_URL}/notifications/jobs`, {
                headers: { 'Authorization': `Bearer ${session.access_token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setJobs(data);
            }
        } catch (error) {
            console.error('Failed to fetch new jobs:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return null;
    if (jobs.length === 0) return null;

    return (
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border-2 border-amber-200 p-6 shadow-sm overflow-hidden relative">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 p-4 opacity-10">
                <Sparkles size={80} />
            </div>

            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2 relative z-10">
                <div className="p-2 bg-amber-100 rounded-lg text-amber-600">
                    <Briefcase size={18} />
                </div>
                <span>New Job Opportunities</span>
                <span className="ml-2 px-2 py-0.5 bg-amber-500 text-white text-xs font-bold rounded-full animate-pulse">
                    {jobs.length} NEW
                </span>
            </h2>

            <div className="space-y-3 relative z-10">
                {jobs.slice(0, 5).map((job) => (
                    <Link
                        key={job.id}
                        href={`/dashboard/services/${job.id}`}
                        className="block group p-4 rounded-xl bg-white border border-amber-100 hover:border-amber-300 hover:shadow-md transition-all duration-200"
                    >
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="font-bold text-gray-900 text-sm group-hover:text-amber-600 transition-colors">
                                    {job.name}
                                </h3>
                                {job.description && (
                                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                                        {job.description}
                                    </p>
                                )}
                            </div>
                            <div className="text-right shrink-0 ml-4">
                                <span className="text-sm font-bold text-green-600">₹{job.price}</span>
                                <div className="text-[10px] text-gray-400 mt-1">
                                    {new Date(job.created_at).toLocaleDateString()}
                                </div>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>

            <div className="mt-4 text-center relative z-10">
                <Link
                    href="/dashboard/category/1"
                    className="text-sm font-bold text-amber-600 hover:text-amber-700 inline-flex items-center gap-1"
                >
                    View All Job Applications <ExternalLink size={12} />
                </Link>
            </div>
        </div>
    );
}
