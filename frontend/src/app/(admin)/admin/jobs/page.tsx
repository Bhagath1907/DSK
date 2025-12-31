'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2, ExternalLink, Briefcase } from 'lucide-react';
import { API_URL } from '@/lib/api-config';

interface Job {
    id: number;
    title: string;
    description: string;
    link: string;
    is_active: boolean;
    created_at: string;
}

export default function JobNotificationsPage() {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [formData, setFormData] = useState({ title: '', description: '', link: '' });
    const supabase = createClient();

    useEffect(() => {
        fetchJobs();
    }, []);

    const fetchJobs = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        try {
            const res = await fetch(`${API_URL}/jobs/all`, {
                headers: { 'Authorization': `Bearer ${session.access_token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setJobs(data);
            }
        } catch (error) {
            console.error('Failed to fetch jobs:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to remove this job notification?')) return;

        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        try {
            const res = await fetch(`${API_URL}/jobs/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${session.access_token}` }
            });
            if (res.ok) {
                setJobs(prev => prev.filter(j => j.id !== id));
            }
        } catch (error) {
            console.error('Failed to delete job:', error);
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        try {
            const res = await fetch(`${API_URL}/jobs/`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${session.access_token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                const newJob = await res.json();
                setJobs([newJob, ...jobs]);
                setIsCreating(false);
                setFormData({ title: '', description: '', link: '' });
            }
        } catch (error) {
            console.error('Failed to create job:', error);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Job Notifications</h1>
                    <p className="text-gray-500">Manage daily job updates for users.</p>
                </div>
                <Button onClick={() => setIsCreating(!isCreating)} className={isCreating ? "bg-gray-200 text-gray-800 hover:bg-gray-300" : "bg-sky-500 text-white hover:bg-sky-600"}>
                    {isCreating ? <span className="flex items-center">Cancel</span> : <span className="flex items-center"><Plus className="w-4 h-4 mr-2" /> Add New Job</span>}
                </Button>
            </div>

            {isCreating && (
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 animate-in fade-in slide-in-from-top-4">
                    <form onSubmit={handleCreate} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Job Title / Notification Title</label>
                            <Input
                                required
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                placeholder="e.g. IBPS PO Recruitment 2024"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
                            <Textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Short details about the job..."
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Link (Optional)</label>
                            <Input
                                value={formData.link} // Changed 'Link' to 'link' to match state key
                                onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                                placeholder="https://..."
                            />
                        </div>
                        <div className="flex justify-end pt-2">
                            <Button type="submit" className="bg-sky-500 text-white hover:bg-sky-600">
                                Publish Notification
                            </Button>
                        </div>
                    </form>
                </div>
            )}

            <div className="grid gap-4">
                {jobs.map((job) => (
                    <div key={job.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-start justify-between group hover:shadow-md transition-shadow">
                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
                                <Briefcase size={20} />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900">{job.title}</h3>
                                {job.description && <p className="text-gray-500 text-sm mt-1">{job.description}</p>}
                                {job.link && (
                                    <a href={job.link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-sm text-sky-600 hover:underline mt-2">
                                        View Details <ExternalLink size={12} />
                                    </a>
                                )}
                                <div className="text-xs text-gray-400 mt-2">
                                    Posted: {new Date(job.created_at).toLocaleDateString()}
                                </div>
                            </div>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(job.id)}
                            className="text-gray-400 hover:text-red-600 hover:bg-red-50"
                        >
                            <Trash2 size={18} />
                        </Button>
                    </div>
                ))}

                {!loading && jobs.length === 0 && (
                    <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                        <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <h3 className="text-gray-900 font-medium">No active job notifications</h3>
                        <p className="text-gray-500 text-sm">Click "Add New Job" to post updates.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
