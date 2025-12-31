'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, ArrowLeft, Mail } from 'lucide-react';
import Link from 'next/link';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const supabase = createClient();

    const getRedirectUrl = () => {
        const origin = typeof window !== 'undefined' && window.location.origin
            ? window.location.origin
            : 'http://localhost:3000';
        return `${origin}/auth/callback?next=/dashboard/reset-password`; // Assuming a reset password page exists or just dashboard
    };

    const handleReset = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: getRedirectUrl(),
            });

            if (error) {
                setMessage({ type: 'error', text: error.message });
            } else {
                setMessage({ type: 'success', text: 'Password reset link sent! Check your email.' });
            }
        } catch (err) {
            setMessage({ type: 'error', text: 'An unexpected error occurred.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-sky-100 via-gray-50 to-white selection:bg-brand-primary/20">
            {/* Decorative Blobs */}
            <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-brand-primary/20 rounded-full blur-[100px] animate-blob -z-10" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-brand-secondary/20 rounded-full blur-[100px] animate-blob animation-delay-2000 -z-10" />

            <div className="w-full max-w-md bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/60 p-8 md:p-10 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-sky-500 to-purple-600" />

                <div className="mb-8">
                    <Link href="/login" className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-brand-primary mb-6 transition-colors">
                        <ArrowLeft className="w-4 h-4 mr-1" /> Back to Login
                    </Link>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Forgot Password?</h1>
                    <p className="text-gray-600">No worries, we'll send you reset instructions.</p>
                </div>

                {message && (
                    <div className={`p-4 rounded-xl mb-6 text-sm font-medium flex items-center gap-3 ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
                        <span className={`w-2 h-2 rounded-full ${message.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`} />
                        {message.text}
                    </div>
                )}

                <form onSubmit={handleReset} className="space-y-6">
                    <div className="space-y-2">
                        <label className="block text-sm font-bold text-gray-700 ml-1">Email Address</label>
                        <div className="relative">
                            <Input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="name@example.com"
                                className="pl-11 bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 focus:border-brand-primary focus:ring-brand-primary/20"
                                required
                            />
                            <Mail className="absolute left-4 top-3 text-gray-400 w-5 h-5 pointer-events-none" />
                        </div>
                    </div>

                    <Button disabled={loading} className="w-full py-6 text-lg rounded-xl font-bold bg-gradient-to-r from-sky-500 to-purple-600 shadow-lg shadow-sky-500/25 hover:shadow-xl hover:scale-[1.02] transition-all">
                        {loading ? <Loader2 className="animate-spin mr-2" /> : null}
                        {loading ? 'Sending Link...' : 'Send Reset Link'}
                    </Button>
                </form>
            </div>
        </div>
    );
}
