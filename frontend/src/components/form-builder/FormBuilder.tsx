'use client';

import { useState, useEffect, useRef } from 'react';
import { Plus, Trash2, GripVertical, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select'; // Assuming you have this or use standard select

// Field Types
export type FormField = {
    id: string;
    label: string;
    type: 'text' | 'number' | 'email' | 'date' | 'file' | 'select' | 'textarea';
    required: boolean;
    options?: string[]; // For select outputs
};

interface FormBuilderProps {
    initialFields?: FormField[];
    onChange: (fields: FormField[]) => void;
}

export default function FormBuilder({ initialFields = [], onChange }: FormBuilderProps) {
    const [fields, setFields] = useState<FormField[]>(initialFields);

    // Use a ref to store the latest onChange callback to avoid triggering effects when the function reference changes
    const onChangeRef = useRef(onChange);

    useEffect(() => {
        onChangeRef.current = onChange;
    }, [onChange]);

    // Update parent whenever fields change
    useEffect(() => {
        onChangeRef.current(fields);
    }, [fields]);

    const addField = () => {
        const newField: FormField = {
            id: crypto.randomUUID(),
            label: 'New Field',
            type: 'text',
            required: false
        };
        setFields([...fields, newField]);
    };

    const removeField = (id: string) => {
        setFields(fields.filter(f => f.id !== id));
    };

    const updateField = (id: string, updates: Partial<FormField>) => {
        setFields(fields.map(f => f.id === id ? { ...f, ...updates } : f));
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="font-bold text-gray-700">Application Form Fields</h3>
                <Button onClick={addField} size="sm" variant="outline" className="border-brand-primary text-brand-primary hover:bg-brand-primary/10">
                    <Plus className="w-4 h-4 mr-2" /> Add Field
                </Button>
            </div>

            <div className="space-y-3">
                {fields.length === 0 && (
                    <div className="p-8 border-2 border-dashed border-gray-200 rounded-xl text-center text-gray-400 text-sm">
                        No fields defined. Click "Add Field" to build the form.
                    </div>
                )}

                {fields.map((field, index) => (
                    <div key={field.id} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-start gap-4 animate-in slide-in-from-bottom-2">
                        <div className="mt-3 text-gray-300 cursor-move">
                            <GripVertical size={20} />
                        </div>

                        <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-4">
                            {/* Label */}
                            <div className="md:col-span-4">
                                <label className="text-xs font-semibold text-gray-500 mb-1 block">Field Label</label>
                                <Input
                                    value={field.label}
                                    onChange={(e) => updateField(field.id, { label: e.target.value })}
                                />
                            </div>

                            {/* Type */}
                            <div className="md:col-span-3">
                                <label className="text-xs font-semibold text-gray-500 mb-1 block">Type</label>
                                <select
                                    className="w-full h-10 rounded-md border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
                                    value={field.type}
                                    onChange={(e) => updateField(field.id, { type: e.target.value as any })}
                                >
                                    <option value="text">Short Text</option>
                                    <option value="textarea">Long Text</option>
                                    <option value="number">Number</option>
                                    <option value="email">Email</option>
                                    <option value="date">Date</option>
                                    <option value="file">File Upload</option>
                                    <option value="select">Dropdown</option>
                                </select>
                            </div>

                            {/* Required Checkbox */}
                            <div className="md:col-span-2 flex items-center pt-6">
                                <label className="flex items-center space-x-2 text-sm text-gray-700 cursor-pointer select-none">
                                    <input
                                        type="checkbox"
                                        checked={field.required}
                                        onChange={(e) => updateField(field.id, { required: e.target.checked })}
                                        className="rounded border-gray-300 text-brand-primary focus:ring-brand-primary"
                                    />
                                    <span>Required</span>
                                </label>
                            </div>

                            {/* Actions */}
                            <div className="md:col-span-3 flex justify-end pt-2">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeField(field.id)}
                                    className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                >
                                    <Trash2 size={16} />
                                </Button>
                            </div>

                            {/* Dropdown Options Input */}
                            {field.type === 'select' && (
                                <div className="md:col-span-12">
                                    <label className="text-xs font-semibold text-gray-500 mb-1 block">Options (comma separated)</label>
                                    <Input
                                        placeholder="Option 1, Option 2, Option 3"
                                        value={field.options?.join(', ') || ''}
                                        onChange={(e) => updateField(field.id, { options: e.target.value.split(',').map(s => s.trim()) })}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
