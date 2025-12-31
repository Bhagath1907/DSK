'use client';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Mail, ArrowLeft, Lock } from 'lucide-react';
import Link from 'next/link';
import { DskLogo } from '@/components/ui/logo';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const router = useRouter();
    const searchParams = useSearchParams();
    const supabase = createClient();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) {
                setMessage({ type: 'error', text: error.message });
            } else {
                setMessage({ type: 'success', text: 'Logged in successfully!' });

                // Log Login History via Backend (to capture real IP)
                try {
                    const baseUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1').replace(/\/$/, '');
                    // Check if /api/v1 is already in the URL
                    const apiBase = baseUrl.endsWith('/api/v1') ? baseUrl : `${baseUrl}/api/v1`;
                    await fetch(`${apiBase}/auth/record-login`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            user_id: data.user.id,
                            user_agent: navigator.userAgent
                        })
                    });
                } catch (logErr) {
                    // Don't block login if history recording fails
                    console.error('Failed to record login history:', logErr);
                }

                const next = searchParams.get('next') || '/dashboard';
                router.refresh();
                router.push(next);
            }
        } catch (err) {
            setMessage({ type: 'error', text: 'An unexpected error occurred.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-yellow-400 via-orange-500 to-red-600">

            <div className="w-full max-w-md bg-black/30 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/20 p-8 md:p-10 relative overflow-hidden">
                {/* Top Accent Line (Optional - can be white or keep gradient if visible) */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-300 to-orange-500 opacity-50" />

                <div className="mb-8">
                    <Link href="/" className="inline-flex items-center text-sm font-medium text-white/80 hover:text-white mb-6 transition-colors">
                        <ArrowLeft className="w-4 h-4 mr-1" /> Back to Home
                    </Link>
                    <div className="mb-6">
                        <DskLogo className="w-14 h-14 rounded-2xl shadow-2xl mb-4" />
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2">Welcome Back! <span className="text-2xl">👋</span></h1>
                    <p className="text-white/80">Enter your credentials to access your dashboard.</p>
                </div>

                {message && (
                    <div className={`p-4 rounded-xl mb-6 text-sm font-medium flex items-center gap-3 ${message.type === 'success' ? 'bg-green-500/20 text-green-100 border border-green-500/30' : 'bg-red-500/20 text-red-100 border border-red-500/30'}`}>
                        <span className={`w-2 h-2 rounded-full ${message.type === 'success' ? 'bg-green-400' : 'bg-red-400'}`} />
                        {message.text}
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-6">
                    <div className="space-y-2">
                        <label className="block text-sm font-bold text-white ml-1">Email Address</label>
                        <div className="relative">
                            <Input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="name@example.com"
                                className="pl-11 bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-white/50 focus:ring-white/20"
                                required
                            />
                            <Mail className="absolute left-4 top-3 text-white/60 w-5 h-5 pointer-events-none" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between items-center ml-1">
                            <label className="block text-sm font-bold text-white">Password</label>
                            <Link href="/forgot-password" className="text-xs font-semibold text-yellow-300 hover:text-yellow-200 transition-colors">
                                Forgot Password?
                            </Link>
                        </div>
                        <div className="relative">
                            <Input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="pl-11 bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-white/50 focus:ring-white/20"
                                required
                            />
                            <Lock className="absolute left-4 top-3 text-white/60 w-5 h-5 pointer-events-none" />
                        </div>
                    </div>

                    <Button disabled={loading} className="w-full py-6 text-lg rounded-xl font-bold bg-white text-orange-600 hover:bg-orange-50 shadow-lg transition-all hover:scale-[1.02]">
                        {loading ? <Loader2 className="animate-spin mr-2" /> : null}
                        {loading ? 'Signing In...' : 'Sign In'}
                    </Button>
                </form>

                <div className="mt-8 text-center">
                    <p className="text-sm text-white/80">
                        Don&apos;t have an account?{' '}
                        <Link href="/signup" className="font-bold text-yellow-300 hover:text-yellow-200 transition-colors underline decoration-2 underline-offset-4 decoration-transparent hover:decoration-yellow-300/30">
                            Create one
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
