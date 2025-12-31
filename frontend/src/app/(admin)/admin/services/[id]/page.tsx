'use client';

import { useState, useEffect, use } from 'react'; // use() for params in Next.js 15+
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { ArrowLeft, Save, Loader2, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '../../../../../components/ui/textarea';
import FormBuilder, { FormField } from '@/components/form-builder/FormBuilder';
import Link from 'next/link';
import { sendJobNotification } from '@/components/JobAlertBell';
import { API_URL } from '@/lib/api-config';

export default function ServiceEditorPage({ params }: { params: Promise<{ id: string }> }) {
    // Unwrap params in newer Next.js
    const [unwrappedParams, setUnwrappedParams] = useState<{ id: string } | null>(null);
    useEffect(() => {
        params.then(setUnwrappedParams);
    }, [params]);

    const id = unwrappedParams?.id;
    const isNew = id === 'new';

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [categories, setCategories] = useState<any[]>([]);

    // Service State
    const [service, setService] = useState({
        name: '',
        category_id: '',
        price: '',
        description: '',
        logo_url: '',
        fields: [] as FormField[],
        is_active: true
    });

    const [uploadingLogo, setUploadingLogo] = useState(false);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) {
            return;
        }
        const file = e.target.files[0];
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `${fileName}`;

        setUploadingLogo(true);
        try {
            const formData = new FormData();
            formData.append('file', file);

            // Get session for Authorization header
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) throw new Error("Not authenticated");

            const res = await fetch(`${API_URL}/admin/upload-logo`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${session.access_token}`
                },
                body: formData
            });

            if (!res.ok) {
                const result = await res.json();
                throw new Error(result.detail || 'Upload failed');
            }

            const data = await res.json();
            setService(prev => ({ ...prev, logo_url: data.url }));

        } catch (error: any) {
            alert('Error uploading image: ' + error.message);
        } finally {
            setUploadingLogo(false);
        }
    };

    const router = useRouter();
    const supabase = createClient();

    useEffect(() => {
        if (!id) return;

        const init = async () => {
            // Fetch Categories
            const { data: cats } = await supabase.from('categories').select('*').eq('is_active', true);
            if (cats) setCategories(cats);

            if (!isNew) {
                // Fetch Service Details
                const { data: srv } = await supabase.from('services').select('*').eq('id', id).single();
                if (srv) {
                    setService({
                        name: srv.name,
                        category_id: srv.category_id.toString(),
                        price: srv.price.toString(),
                        description: srv.description || '',
                        logo_url: srv.logo_url || '',
                        fields: srv.fields || [],
                        is_active: srv.is_active
                    });
                }
            }
            setLoading(false);
        };
        init();
    }, [id, isNew]);

    const handleSave = async () => {
        if (!service.name || !service.category_id || !service.price) {
            alert("Please fill all required fields (Name, Category, Price)");
            return;
        }

        setSaving(true);
        const payload = {
            name: service.name,
            category_id: parseInt(service.category_id),
            price: parseFloat(service.price),
            description: service.description,
            logo_url: service.logo_url,
            fields: service.fields,
            is_active: service.is_active
        };

        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) throw new Error("Not authenticated");

            const endpoint = isNew ? `${API_URL}/services` : `${API_URL}/services/${id}`;
            const method = isNew ? 'POST' : 'PUT';

            const res = await fetch(endpoint, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}`
                },
                body: JSON.stringify(payload)
            });

            if (!res.ok) {
                const result = await res.json();
                throw new Error(result.detail || 'Failed to save service');
            }

            // If this is a new service in the Job Applications category, send notification
            if (isNew) {
                const selectedCategory = categories.find(c => c.id.toString() === service.category_id);
                if (selectedCategory && selectedCategory.name.toLowerCase().includes('job')) {
                    sendJobNotification(
                        service.name,
                        service.description || `New job opportunity available: ${service.name}`
                    );
                }
            }

            router.push('/admin/services');
        } catch (error: any) {
            alert('Error saving service: ' + error.message);
        } finally {
            setSaving(false);
        }
    };

    if (loading || !id) return <div className="p-8">Loading editor...</div>;

    return (
        <div className="max-w-5xl mx-auto pb-20">
            <div className="flex items-center gap-4 mb-8">
                <Link href="/admin/services">
                    <Button variant="ghost" size="icon"><ArrowLeft size={20} /></Button>
                </Link>
                <div className="flex-1">
                    <h1 className="text-2xl font-bold text-gray-900">{isNew ? 'Create New Service' : 'Edit Service'}</h1>
                    <p className="text-gray-500 text-sm">Configure service details and dynamic application form.</p>
                </div>
                <Button onClick={handleSave} disabled={saving} className="bg-brand-primary text-white">
                    {saving ? <Loader2 className="animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                    Save Service
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left: Basic Info */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-4">
                        <h3 className="font-bold text-gray-900">Basic Details</h3>

                        <div>
                            <label className="text-xs font-semibold text-gray-500 mb-1 block">Service Name</label>
                            <Input value={service.name} onChange={(e) => setService({ ...service, name: e.target.value })} placeholder="e.g., Business Loan" />
                        </div>

                        <div>
                            <label className="text-xs font-semibold text-gray-500 mb-1 block">Category</label>
                            <select
                                className="w-full h-10 rounded-md border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 bg-white"
                                value={service.category_id}
                                onChange={(e) => setService({ ...service, category_id: e.target.value })}
                            >
                                <option value="">Select Category</option>
                                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>

                        <div>
                            <label className="text-xs font-semibold text-gray-500 mb-1 block">Price (₹)</label>
                            <Input type="number" value={service.price} onChange={(e) => setService({ ...service, price: e.target.value })} placeholder="0.00" />
                        </div>

                        <div>
                            <label className="text-xs font-semibold text-gray-500 mb-1 block">Service Logo</label>
                            <div className="flex flex-col gap-3">
                                {service.logo_url && (
                                    <div className="relative w-20 h-20 rounded-lg overflow-hidden border border-gray-200 bg-gray-50 p-1">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img src={service.logo_url} alt="Logo Preview" className="w-full h-full object-contain" />
                                    </div>
                                )}
                                <div className="flex-1">
                                    <Input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        disabled={uploadingLogo}
                                        className="cursor-pointer file:cursor-pointer text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-brand-primary/10 file:text-brand-primary hover:file:bg-brand-primary/20"
                                    />
                                    {uploadingLogo && <p className="text-xs text-brand-primary mt-1 animate-pulse">Uploading logo...</p>}
                                    <input type="hidden" value={service.logo_url} />
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-semibold text-gray-500 mb-1 block">Description</label>
                            <textarea
                                className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 min-h-[100px]"
                                value={service.description}
                                onChange={(e) => setService({ ...service, description: e.target.value })}
                                placeholder="Service description..."
                            />
                        </div>
                    </div>
                </div>

                {/* Right: Form Builder */}
                <div className="lg:col-span-2">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <div className="mb-6 border-b border-gray-100 pb-4">
                            <h3 className="font-bold text-gray-900">Form Builder</h3>
                            <p className="text-sm text-gray-500">Define the fields users must fill out for this service.</p>
                        </div>

                        <FormBuilder
                            initialFields={service.fields}
                            onChange={(fields) => setService(prev => ({ ...prev, fields: fields }))}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
