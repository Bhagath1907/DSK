'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import DynamicForm, { FieldConfig } from '@/components/service/dynamic-form';
import { fetchServiceById } from '@/lib/api';
import { Loader2 } from 'lucide-react';

export default function ServicePage() {
    const params = useParams();
    const serviceId = params.serviceId as string;
    const [service, setService] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            try {
                const data = await fetchServiceById(serviceId);
                setService(data);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, [serviceId]);

    if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin" /></div>;
    if (!service) return <div className="p-8">Service not found</div>;

    return (
        <div className="max-w-3xl mx-auto py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white drop-shadow-md">{service.name}</h1>
                <p className="text-white/90 mt-2 font-medium text-lg">{service.description}</p>
            </div>

            <div className="bg-black/30 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-6 md:p-8 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
                <DynamicForm serviceId={serviceId} fields={service.fields || []} />
            </div>
        </div>
    );
}
