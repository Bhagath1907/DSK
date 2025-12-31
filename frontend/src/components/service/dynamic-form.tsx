'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Loader2, UploadCloud, CheckCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export type FieldConfig = {
    id: string;
    label: string;
    type: 'text' | 'number' | 'email' | 'date' | 'select' | 'file' | 'textarea';
    required?: boolean;
    options?: string[]; // For select
};

interface DynamicFormProps {
    serviceId: string;
    fields: FieldConfig[];
    onSubmitSuccess?: () => void;
}

export default function DynamicForm({ serviceId, fields, onSubmitSuccess }: DynamicFormProps) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<Record<string, any>>({});
    const supabase = createClient();

    const handleChange = (id: string, value: any) => {
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // In a real app, you would upload files to Storage first and get URLs
            // Then post the data to your backend API
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) throw new Error("Not authenticated");

            // Mock submission to Supabase for now
            const { error } = await supabase
                .from('submissions')
                .insert({
                    user_id: user.id,
                    service_id: parseInt(serviceId), // Assuming ID is int
                    data: formData,
                    status: 'pending'
                });

            if (error) throw error;

            alert("Application submitted successfully!");
            if (onSubmitSuccess) onSubmitSuccess();
            setFormData({});
        } catch (error: any) {
            console.error(error);
            alert(`Error: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
            {fields.map((field) => (
                <div key={field.id} className="space-y-2">
                    <Label htmlFor={field.id}>
                        {field.label} {field.required && <span className="text-red-500">*</span>}
                    </Label>

                    {field.type === 'select' ? (
                        <Select
                            id={field.id}
                            required={field.required}
                            value={formData[field.id] || ''}
                            onChange={(e) => handleChange(field.id, e.target.value)}
                        >
                            <option value="">Select an option</option>
                            {field.options?.map(opt => (
                                <option key={opt} value={opt}>{opt}</option>
                            ))}
                        </Select>
                    ) : field.type === 'textarea' ? (
                        <textarea
                            id={field.id}
                            required={field.required}
                            className="flex min-h-[100px] w-full rounded-xl border border-gray-200 bg-white/50 px-3 py-2 text-base shadow-sm ring-offset-background placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/20 focus-visible:border-brand-primary disabled:cursor-not-allowed disabled:opacity-50"
                            value={formData[field.id] || ''}
                            onChange={(e) => handleChange(field.id, e.target.value)}
                        />
                    ) : field.type === 'file' ? (
                        <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center hover:bg-brand-light/20 hover:border-brand-primary/50 transition-all cursor-pointer group">
                            <div className="w-12 h-12 rounded-full bg-gray-50 group-hover:bg-brand-light flex items-center justify-center mx-auto mb-3 transition-colors">
                                <UploadCloud className="h-6 w-6 text-gray-400 group-hover:text-brand-primary" />
                            </div>
                            <p className="font-medium text-gray-700">Click to upload or drag and drop</p>
                            <p className="text-xs text-gray-400 mt-1">SVG, PNG, JPG or PDF (max. 10MB)</p>
                            <input
                                type="file"
                                id={field.id}
                                required={field.required}
                                className="hidden"
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) handleChange(field.id, file.name); // Just storing name for mock
                                }}
                            />
                            {formData[field.id] && (
                                <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-light text-brand-primary text-sm font-medium">
                                    <CheckCircle size={14} /> {formData[field.id]}
                                </div>
                            )}
                        </div>
                    ) : (
                        <Input
                            type={field.type}
                            id={field.id}
                            required={field.required}
                            value={formData[field.id] || ''}
                            onChange={(e) => handleChange(field.id, e.target.value)}
                        />
                    )}
                </div>
            ))}

            <Button disabled={loading} className="w-full">
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Submit Application
            </Button>
        </form>
    );
}
