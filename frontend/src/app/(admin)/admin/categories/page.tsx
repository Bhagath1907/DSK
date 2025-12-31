'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Plus, Edit2, Trash2, Check, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch'; // Ensure you have this component or use standard checkbox

export default function CategoriesPage() {
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');
    const supabase = createClient();

    const fetchCategories = async () => {
        setLoading(true);
        const { data } = await supabase.from('categories').select('*').order('id');
        if (data) setCategories(data);
        setLoading(false);
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const handleCreate = async () => {
        if (!newCategoryName.trim()) return;
        const { error } = await supabase.from('categories').insert([{ name: newCategoryName }]);
        if (!error) {
            setNewCategoryName('');
            setIsCreating(false);
            fetchCategories();
        }
    };

    const toggleActive = async (id: number, current: boolean) => {
        await supabase.from('categories').update({ is_active: !current }).eq('id', id);
        fetchCategories();
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
                <Button onClick={() => setIsCreating(true)} className="bg-sky-500 text-white hover:bg-sky-600">
                    <Plus className="w-4 h-4 mr-2" /> Add Category
                </Button>
            </div>

            {isCreating && (
                <div className="bg-white p-4 rounded-xl shadow-sm border border-brand-primary/20 flex gap-4 items-center animate-in fade-in slide-in-from-top-2">
                    <Input
                        placeholder="Category Name"
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        className="max-w-md"
                    />
                    <Button onClick={handleCreate} className="bg-green-600 hover:bg-green-700 text-white">Save</Button>
                    <Button variant="ghost" onClick={() => setIsCreating(false)}>Cancel</Button>
                </div>
            )}

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 uppercase">
                        <tr>
                            <th className="px-6 py-4 font-medium">ID</th>
                            <th className="px-6 py-4 font-medium">Name</th>
                            <th className="px-6 py-4 font-medium">Status</th>
                            <th className="px-6 py-4 font-medium text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {loading ? (
                            <tr><td colSpan={4} className="p-6 text-center text-gray-500">Loading...</td></tr>
                        ) : categories.length === 0 ? (
                            <tr><td colSpan={4} className="p-6 text-center text-gray-500">No categories found.</td></tr>
                        ) : (
                            categories.map((cat) => (
                                <tr key={cat.id} className="hover:bg-gray-50/50">
                                    <td className="px-6 py-4 text-gray-500">#{cat.id}</td>
                                    <td className="px-6 py-4 font-bold text-gray-900">{cat.name}</td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${cat.is_active ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                            {cat.is_active ? 'Active' : 'Disabled'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => toggleActive(cat.id, cat.is_active)}
                                            className={cat.is_active ? "text-red-600 hover:bg-red-50" : "text-green-600 hover:bg-green-50"}
                                        >
                                            {cat.is_active ? 'Disable' : 'Enable'}
                                        </Button>
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
