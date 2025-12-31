'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { User, Mail, Shield, Wallet, LogOut, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type UserProfile = {
    id: string;
    email: string;
    role: string;
    wallet_balance: number;
    created_at: string;
};

export default function ProfilePage() {
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const supabase = createClient();

    useEffect(() => {
        const fetchProfile = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data } = await supabase
                    .from('users')
                    .select('*')
                    .eq('id', user.id)
                    .single();

                if (data) {
                    setProfile(data as UserProfile);
                } else {
                    // Fallback if user record missing (shouldn't happen with trigger)
                    setProfile({
                        id: user.id,
                        email: user.email!,
                        role: 'user',
                        wallet_balance: 0,
                        created_at: new Date().toISOString()
                    });
                }
            }
            setLoading(false);
        };
        fetchProfile();
    }, []);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/login');
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[50vh]">
                <Loader2 className="w-8 h-8 animate-spin text-brand-primary" />
            </div>
        );
    }

    if (!profile) return null;

    return (
        <div className="max-w-2xl mx-auto space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
                <p className="text-gray-500">Manage your account settings and preferences.</p>
            </div>

            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-sky-500 to-purple-600 opacity-10" />

                <div className="relative flex items-end gap-6 mb-8 mt-4 px-4">
                    <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-sky-500 to-purple-600 flex items-center justify-center text-white text-3xl font-bold shadow-xl border-4 border-white">
                        {profile.email[0].toUpperCase()}
                    </div>
                    <div className="mb-2">
                        <h2 className="text-2xl font-bold text-gray-900">{profile.email.split('@')[0]}</h2>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${profile.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}`}>
                            {profile.role.toUpperCase()}
                        </span>
                    </div>
                </div>

                <div className="grid gap-6 px-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-500">Email Address</label>
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                            <Mail className="w-5 h-5 text-gray-400" />
                            <span className="text-gray-900">{profile.email}</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-500">User ID</label>
                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                                <Shield className="w-5 h-5 text-gray-400" />
                                <span className="text-gray-900 text-xs font-mono truncate">{profile.id}</span>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-500">Wallet Balance</label>
                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                                <Wallet className="w-5 h-5 text-brand-primary" />
                                <span className="text-gray-900 font-bold">₹ {(profile.wallet_balance || 0).toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-10 px-4 pt-8 border-t border-gray-100">
                    <Button
                        variant="destructive"
                        onClick={handleLogout}
                        className="w-full md:w-auto bg-red-50 text-red-600 hover:bg-red-100 border-0"
                    >
                        <LogOut className="w-4 h-4 mr-2" />
                        Sign Out
                    </Button>
                </div>
            </div>
        </div>
    );
}
