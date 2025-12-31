'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, ArrowLeft, Mail, Lock, User, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { API_URL } from '@/lib/api-config';

export default function SignUpPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [privacyAccepted, setPrivacyAccepted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const router = useRouter();

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!privacyAccepted) {
            setMessage({ type: 'error', text: 'You must agree to the Privacy Policy.' });
            return;
        }

        setLoading(true);
        setMessage(null);

        try {
            const res = await fetch(`${API_URL}/auth/signup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email,
                    password,
                    full_name: fullName,
                    privacy_policy_accepted: privacyAccepted
                })
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.detail || 'Signup failed');
            }

            setMessage({ type: 'success', text: data.message });
            // Clear form
            setEmail('');
            setPassword('');
            setFullName('');
            setPrivacyAccepted(false);

        } catch (err: any) {
            setMessage({ type: 'error', text: err.message || 'An unexpected error occurred.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-yellow-400 via-orange-500 to-red-600">

            <div className="w-full max-w-md bg-black/30 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/20 p-8 md:p-10 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-300 to-orange-500 opacity-50" />

                <div className="mb-8">
                    <Link href="/" className="inline-flex items-center text-sm font-medium text-white/80 hover:text-white mb-6 transition-colors">
                        <ArrowLeft className="w-4 h-4 mr-1" /> Back to Home
                    </Link>
                    <h1 className="text-3xl font-bold text-white mb-2">Create Account</h1>
                    <p className="text-white/80">Join us to get started with your journey.</p>
                </div>

                {message && (
                    <div className={`p-4 rounded-xl mb-6 text-sm font-medium flex items-center gap-3 ${message.type === 'success' ? 'bg-green-500/20 text-green-100 border border-green-500/30' : 'bg-red-500/20 text-red-100 border border-red-500/30'}`}>
                        <span className={`w-2 h-2 rounded-full ${message.type === 'success' ? 'bg-green-400' : 'bg-red-400'}`} />
                        {message.text}
                    </div>
                )}

                <form onSubmit={handleSignUp} className="space-y-5">
                    <div className="space-y-2">
                        <label className="block text-sm font-bold text-white ml-1">Full Name</label>
                        <div className="relative">
                            <Input
                                type="text"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                placeholder="John Doe"
                                className="pl-11 bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-white/50 focus:ring-white/20"
                                required
                            />
                            <User className="absolute left-4 top-3 text-white/60 w-5 h-5 pointer-events-none" />
                        </div>
                    </div>

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
                        <label className="block text-sm font-bold text-white ml-1">Password</label>
                        <div className="relative">
                            <Input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="pl-11 bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-white/50 focus:ring-white/20"
                                required
                                minLength={6}
                            />
                            <Lock className="absolute left-4 top-3 text-white/60 w-5 h-5 pointer-events-none" />
                        </div>
                    </div>

                    {/* Privacy Policy Checkbox */}
                    <div className="flex items-start gap-3 p-3 bg-white/5 rounded-xl border border-white/10">
                        <div className="flex items-center h-5">
                            <input
                                id="privacy"
                                type="checkbox"
                                checked={privacyAccepted}
                                onChange={(e) => setPrivacyAccepted(e.target.checked)}
                                className="w-4 h-4 text-orange-600 border-white/30 rounded focus:ring-orange-500 bg-white/10"
                            />
                        </div>
                        <label htmlFor="privacy" className="text-sm text-white/80">
                            I agree to the <Link href="/privacy-policy" target="_blank" className="font-bold text-yellow-300 hover:underline">Privacy Policy & Terms</Link>.
                        </label>
                    </div>

                    <Button
                        disabled={loading || !privacyAccepted}
                        className="w-full py-6 text-lg rounded-xl font-bold bg-white text-orange-600 hover:bg-orange-50 shadow-lg transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? <Loader2 className="animate-spin mr-2" /> : <ShieldCheck className="w-5 h-5 mr-2" />}
                        {loading ? 'Creating Account...' : 'Sign Up Securely'}
                    </Button>
                </form>

                <div className="mt-8 text-center">
                    <p className="text-sm text-white/80">
                        Already have an account?{' '}
                        <Link href="/login" className="font-bold text-yellow-300 hover:text-yellow-200 transition-colors underline decoration-2 underline-offset-4 decoration-transparent hover:decoration-yellow-300/30">
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
