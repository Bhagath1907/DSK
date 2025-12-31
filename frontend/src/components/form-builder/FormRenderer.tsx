'use client';

import { useState } from 'react';
import { Loader2, Upload, FileCheck, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '../ui/textarea';
import { FormField } from './FormBuilder';
import { createClient } from '@/lib/supabase/client';

interface FormRendererProps {
    fields: FormField[];
    onSubmit: (data: any) => Promise<void>;
    submitLabel?: string;
}

const MAX_FILE_SIZE_KB = 300;

export default function FormRenderer({ fields, onSubmit, submitLabel = 'Submit Application' }: FormRendererProps) {
    const [formData, setFormData] = useState<Record<string, any>>({});
    const [submitting, setSubmitting] = useState(false);
    const [fileUploading, setFileUploading] = useState<Record<string, boolean>>({});
    const [fileErrors, setFileErrors] = useState<Record<string, string>>({});
    const supabase = createClient();

    const handleChange = (id: string, value: any) => {
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    const handleFileUpload = async (fieldId: string, file: File) => {
        // Validate file size
        const fileSizeKB = file.size / 1024;
        if (fileSizeKB > MAX_FILE_SIZE_KB) {
            setFileErrors(prev => ({ ...prev, [fieldId]: `File too large. Maximum size is ${MAX_FILE_SIZE_KB}KB.` }));
            return;
        }

        setFileErrors(prev => ({ ...prev, [fieldId]: '' }));
        setFileUploading(prev => ({ ...prev, [fieldId]: true }));

        try {
            // Get current user for folder path
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                setFileErrors(prev => ({ ...prev, [fieldId]: 'Please login to upload files.' }));
                return;
            }

            // Upload to user-specific folder: {userId}/{timestamp}_{filename}
            const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
            const filePath = `${user.id}/${Date.now()}_${sanitizedName}`;

            const { data, error } = await supabase.storage
                .from('user-documents')
                .upload(filePath, file, {
                    cacheControl: '3600',
                    upsert: false
                });

            if (error) {
                console.error('Upload error:', error);
                setFileErrors(prev => ({ ...prev, [fieldId]: 'Upload failed. Please try again.' }));
                return;
            }

            // Store the file path (admin will use signed URLs to access)
            handleChange(fieldId, filePath);
        } catch (error) {
            console.error('Upload error:', error);
            setFileErrors(prev => ({ ...prev, [fieldId]: 'Upload failed. Please try again.' }));
        } finally {
            setFileUploading(prev => ({ ...prev, [fieldId]: false }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Basic Validation
        for (const field of fields) {
            if (field.required && !formData[field.id]) {
                alert(`Please fill in ${field.label}`);
                return;
            }
        }

        setSubmitting(true);
        try {
            await onSubmit(formData);
        } catch (error) {
            console.error(error);
            alert("Submission failed. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    if (fields.length === 0) {
        return <div className="text-gray-500 italic">No fields required. Click submit to proceed.</div>;
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {fields.map((field) => (
                <div key={field.id} className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">
                        {field.label} {field.required && <span className="text-red-500">*</span>}
                    </label>

                    {field.type === 'textarea' ? (
                        <textarea
                            className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary/20 min-h-[100px]"
                            value={formData[field.id] || ''}
                            onChange={(e) => handleChange(field.id, e.target.value)}
                            required={field.required}
                        />
                    ) : field.type === 'select' ? (
                        <select
                            className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
                            value={formData[field.id] || ''}
                            onChange={(e) => handleChange(field.id, e.target.value)}
                            required={field.required}
                        >
                            <option value="">Select an option</option>
                            {field.options?.map((opt, i) => (
                                <option key={i} value={opt} className="text-gray-900 bg-white">{opt}</option>
                            ))}
                        </select>
                    ) : field.type === 'file' ? (
                        <div className="space-y-2">
                            <div className="relative">
                                <input
                                    type="file"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) handleFileUpload(field.id, file);
                                    }}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                    required={field.required && !formData[field.id]}
                                />
                                <div className={`flex items-center justify-center gap-3 p-4 border-2 border-dashed rounded-xl transition-colors ${formData[field.id] ? 'border-green-300 bg-green-50' : 'border-gray-200 bg-gray-50 hover:border-brand-primary hover:bg-brand-light/30'
                                    }`}>
                                    {fileUploading[field.id] ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin text-brand-primary" />
                                            <span className="text-sm text-gray-600">Uploading...</span>
                                        </>
                                    ) : formData[field.id] ? (
                                        <>
                                            <FileCheck className="w-5 h-5 text-green-600" />
                                            <span className="text-sm text-green-700 font-medium">File uploaded successfully</span>
                                        </>
                                    ) : (
                                        <>
                                            <Upload className="w-5 h-5 text-gray-400" />
                                            <span className="text-sm text-gray-600">Click to upload (Max {MAX_FILE_SIZE_KB}KB)</span>
                                        </>
                                    )}
                                </div>
                            </div>
                            {fileErrors[field.id] && (
                                <div className="flex items-center gap-2 text-red-600 text-xs">
                                    <AlertCircle className="w-4 h-4" />
                                    {fileErrors[field.id]}
                                </div>
                            )}
                        </div>
                    ) : (
                        <Input
                            className="text-gray-900 bg-white"
                            type={field.type === 'number' ? 'number' : field.type === 'email' ? 'email' : field.type === 'date' ? 'date' : 'text'}
                            value={formData[field.id] || ''}
                            onChange={(e) => handleChange(field.id, e.target.value)}
                            required={field.required}
                        />
                    )}
                </div>
            ))}

            <Button type="submit" disabled={submitting} className="w-full bg-[#38BDF8] hover:bg-[#0C4A6E] text-white font-bold py-3 mt-4 transition-colors">
                {submitting ? <Loader2 className="animate-spin mr-2" /> : null}
                {submitLabel}
            </Button>
        </form>
    );
}
