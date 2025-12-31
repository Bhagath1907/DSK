import { Briefcase, ExternalLink, Megaphone } from 'lucide-react';
import { Button } from './ui/button';

interface Job {
    id: number;
    title: string;
    description: string;
    link: string;
    created_at: string;
}

export default function JobNotificationsList({ jobs }: { jobs: Job[] }) {
    if (!jobs || jobs.length === 0) return null;

    return (
        <div className="bg-white rounded-2xl border border-indigo-100 p-6 shadow-sm overflow-hidden relative">
            <div className="absolute top-0 right-0 p-4 opacity-5">
                <Megaphone size={100} />
            </div>

            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2 relative z-10">
                <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                    <Megaphone size={20} />
                </div>
                Job Notifications
            </h2>

            <div className="space-y-4 relative z-10">
                {jobs.map((job) => (
                    <div key={job.id} className="group p-4 rounded-xl bg-gray-50 border border-gray-100 hover:bg-indigo-50/50 hover:border-indigo-100 transition-all duration-200">
                        <div className="flex gap-3 items-start">
                            <div className="mt-1">
                                <span className="flex h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-bold text-gray-900 text-sm">{job.title}</h3>
                                {job.description && (
                                    <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                                        {job.description}
                                    </p>
                                )}
                                <div className="flex items-center justify-between mt-3">
                                    <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                                        {new Date(job.created_at).toLocaleDateString()}
                                    </span>
                                    {job.link && (
                                        <a
                                            href={job.link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 bg-white px-2 py-1 rounded shadow-sm border border-gray-100 group-hover:border-indigo-200"
                                        >
                                            Apply Now <ExternalLink size={10} />
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
