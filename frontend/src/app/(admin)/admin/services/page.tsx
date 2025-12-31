'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Plus, Edit2, Trash2, Eye, EyeOff, Box, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ServicesPage() {
    const [services, setServices] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
    const supabase = createClient();

    useEffect(() => {
        const fetchServices = async () => {
            // Join with categories for better display
            const { data } = await supabase
                .from('services')
                .select('*, categories(name)')
                .order('created_at', { ascending: false });

            if (data) setServices(data);
            setLoading(false);
        };
        fetchServices();
    }, []);

    const toggleActive = async (id: number, current: boolean) => {
        await supabase.from('services').update({ is_active: !current }).eq('id', id);
        // Optimistic update
        setServices(services.map(s => s.id === id ? { ...s, is_active: !current } : s));
    };

    const deleteService = async (id: number) => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                alert('Not authenticated');
                return;
            }

            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';
            const res = await fetch(`${apiUrl}/services/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${session.access_token}`
                }
            });

            if (res.ok) {
                setServices(services.filter(s => s.id !== id));
            } else {
                const data = await res.json();
                alert(`Failed to delete: ${data.detail || 'Unknown error'}`);
            }
        } catch (error: any) {
            alert(`Error: ${error.message}`);
        }
        setDeleteConfirm(null);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">Services</h1>
                <Link href="/admin/services/new">
                    <Button className="bg-sky-500 text-white hover:bg-sky-600">
                        <Plus className="w-4 h-4 mr-2" /> Create Service
                    </Button>
                </Link>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 uppercase">
                        <tr>
                            <th className="px-6 py-4 font-medium">Service Name</th>
                            <th className="px-6 py-4 font-medium">Category</th>
                            <th className="px-6 py-4 font-medium">Price</th>
                            <th className="px-6 py-4 font-medium">Status</th>
                            <th className="px-6 py-4 font-medium sticky right-0 bg-gray-50 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {loading ? (
                            <tr><td colSpan={5} className="p-6 text-center text-gray-500">Loading services...</td></tr>
                        ) : services.length === 0 ? (
                            <tr><td colSpan={5} className="p-6 text-center text-gray-500">No services found.</td></tr>
                        ) : (
                            services.map((service) => (
                                <tr key={service.id} className="hover:bg-gray-50/50">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                                                <Box size={20} />
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-900">{service.name}</p>
                                                <p className="text-xs text-gray-400 line-clamp-1 max-w-[200px]">
                                                    {service.description || 'No description'}
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-500">
                                        <span className="bg-gray-100 px-2 py-1 rounded-md text-xs font-medium">
                                            {service.categories?.name || 'Uncategorized'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 font-medium text-gray-900">₹{service.price}</td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold ${service.is_active
                                            ? 'bg-green-100 text-green-700'
                                            : 'bg-gray-100 text-gray-500'
                                            }`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${service.is_active ? 'bg-green-500' : 'bg-gray-400'}`} />
                                            {service.is_active ? 'Active' : 'Disabled'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-1">
                                            {/* Toggle Active/Disable */}
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => toggleActive(service.id, service.is_active)}
                                                title={service.is_active ? "Disable Service" : "Enable Service"}
                                                className={service.is_active
                                                    ? "text-green-600 hover:bg-green-50"
                                                    : "text-gray-400 hover:bg-gray-100"}
                                            >
                                                {service.is_active ? <Eye size={16} /> : <EyeOff size={16} />}
                                            </Button>

                                            {/* Edit */}
                                            <Link href={`/admin/services/${service.id}`}>
                                                <Button size="sm" variant="ghost" className="text-blue-600 hover:bg-blue-50">
                                                    <Edit2 size={16} />
                                                </Button>
                                            </Link>

                                            {/* Delete with confirmation */}
                                            {deleteConfirm === service.id ? (
                                                <div className="flex items-center gap-1 bg-red-50 rounded-lg px-2">
                                                    <span className="text-xs text-red-600 font-medium">Delete?</span>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() => deleteService(service.id)}
                                                        className="text-red-600 hover:bg-red-100 px-2"
                                                    >
                                                        Yes
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() => setDeleteConfirm(null)}
                                                        className="text-gray-500 hover:bg-gray-100 px-2"
                                                    >
                                                        No
                                                    </Button>
                                                </div>
                                            ) : (
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => setDeleteConfirm(service.id)}
                                                    className="text-red-500 hover:bg-red-50"
                                                    title="Delete Service"
                                                >
                                                    <Trash2 size={16} />
                                                </Button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
