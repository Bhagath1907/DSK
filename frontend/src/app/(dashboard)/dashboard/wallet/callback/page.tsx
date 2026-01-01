'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { CheckCircle, XCircle, Loader2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

// Valid plans - used for validation
const VALID_PLANS = ['Go', 'Pro', 'Plus'];

function PaymentCallbackContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const supabase = createClient();

    const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'already_processed'>('loading');
    const [message, setMessage] = useState('Processing your payment...');
    const [newBalance, setNewBalance] = useState<number | null>(null);
    const [amount, setAmount] = useState<number | null>(null);
    const [planName, setPlanName] = useState<string | null>(null);

    useEffect(() => {
        const processPayment = async () => {
            try {
                // Get plan info from URL params or localStorage
                const planFromUrl = searchParams.get('plan');
                const razorpayPaymentId = searchParams.get('razorpay_payment_id');

                // Also check localStorage for pending payment
                const storedPaymentInfo = localStorage.getItem('pending_payment');
                let plan = planFromUrl;

                if (storedPaymentInfo) {
                    try {
                        const paymentInfo = JSON.parse(storedPaymentInfo);
                        // Use stored info if URL params are missing
                        if (!plan) plan = paymentInfo.planName;
                    } catch (e) {
                        console.error('Error parsing stored payment info:', e);
                    }
                }

                // Validate plan
                if (!plan || !VALID_PLANS.includes(plan)) {
                    setStatus('error');
                    setMessage('Invalid payment information. Please try again from the wallet page.');
                    return;
                }

                setPlanName(plan);

                // Get current user
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) {
                    setStatus('error');
                    setMessage('Please log in to complete your payment.');
                    return;
                }

                // Call the secure RPC function to credit wallet
                const { data, error } = await supabase.rpc('credit_wallet_topup', {
                    p_plan_name: plan,
                    p_payment_reference: razorpayPaymentId || null
                });

                if (error) {
                    console.error('RPC error:', error);

                    // Check for rate limiting or other specific errors
                    if (error.message?.includes('Too many top-ups')) {
                        setStatus('error');
                        setMessage('Too many top-ups in a short time. Please wait a few minutes and try again.');
                    } else if (error.message?.includes('Invalid plan')) {
                        setStatus('error');
                        setMessage('Invalid plan selected. Please go back and try again.');
                    } else {
                        setStatus('error');
                        setMessage('Failed to process payment. Please contact support.');
                    }
                    return;
                }

                // Handle response from RPC
                if (data && data.success) {
                    setStatus('success');
                    setMessage('Your wallet has been credited successfully!');
                    setNewBalance(data.new_balance);
                    setAmount(data.amount);

                    // Clear stored payment info
                    localStorage.removeItem('pending_payment');
                } else if (data && !data.success) {
                    setStatus('error');
                    setMessage(data.error || 'Failed to credit wallet.');
                } else {
                    setStatus('error');
                    setMessage('Unexpected response. Please contact support.');
                }

            } catch (error) {
                console.error('Payment processing error:', error);
                setStatus('error');
                setMessage('An error occurred. Please contact support if your payment was deducted.');
            }
        };

        processPayment();
    }, [searchParams, supabase]);

    const handleContinue = () => {
        router.push('/dashboard/wallet');
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 p-8 md:p-12 max-w-md w-full text-center"
            >
                {status === 'loading' && (
                    <>
                        <div className="w-20 h-20 rounded-full bg-sky-50 flex items-center justify-center mx-auto mb-6">
                            <Loader2 className="w-10 h-10 text-sky-500 animate-spin" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">Processing Payment</h1>
                        <p className="text-gray-500">{message}</p>
                    </>
                )}

                {status === 'success' && (
                    <>
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 200, damping: 15 }}
                            className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-6"
                        >
                            <CheckCircle className="w-12 h-12 text-green-500" />
                        </motion.div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
                        <p className="text-gray-500 mb-4">{message}</p>

                        {amount && (
                            <div className="bg-green-50 rounded-2xl p-4 mb-4">
                                <span className="text-green-600 font-medium">{planName} Plan</span>
                                <div className="text-3xl font-bold text-green-700">₹{amount.toFixed(2)}</div>
                            </div>
                        )}

                        {newBalance !== null && (
                            <div className="bg-slate-50 rounded-2xl p-4 mb-6">
                                <span className="text-gray-500 font-medium">New Wallet Balance</span>
                                <div className="text-3xl font-bold text-gray-900">₹{newBalance.toFixed(2)}</div>
                            </div>
                        )}

                        <Button
                            onClick={handleContinue}
                            className="w-full py-6 text-lg bg-gradient-to-r from-sky-500 to-purple-600 hover:from-sky-600 hover:to-purple-700 text-white rounded-xl font-bold"
                        >
                            Continue to Wallet <ArrowRight className="w-5 h-5 ml-2" />
                        </Button>
                    </>
                )}

                {status === 'already_processed' && (
                    <>
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="w-20 h-20 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-6"
                        >
                            <CheckCircle className="w-12 h-12 text-blue-500" />
                        </motion.div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">Already Credited</h1>
                        <p className="text-gray-500 mb-4">{message}</p>

                        {newBalance !== null && (
                            <div className="bg-slate-50 rounded-2xl p-4 mb-6">
                                <span className="text-gray-500 font-medium">Current Wallet Balance</span>
                                <div className="text-3xl font-bold text-gray-900">₹{newBalance.toFixed(2)}</div>
                            </div>
                        )}

                        <Button
                            onClick={handleContinue}
                            className="w-full py-6 text-lg bg-gradient-to-r from-sky-500 to-purple-600 text-white rounded-xl font-bold"
                        >
                            Go to Wallet <ArrowRight className="w-5 h-5 ml-2" />
                        </Button>
                    </>
                )}

                {status === 'error' && (
                    <>
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-6"
                        >
                            <XCircle className="w-12 h-12 text-red-500" />
                        </motion.div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Issue</h1>
                        <p className="text-gray-500 mb-6">{message}</p>

                        <div className="space-y-3">
                            <Button
                                onClick={handleContinue}
                                className="w-full py-6 text-lg bg-gradient-to-r from-sky-500 to-purple-600 text-white rounded-xl font-bold"
                            >
                                Back to Wallet
                            </Button>
                        </div>
                    </>
                )}
            </motion.div>
        </div>
    );
}

export default function PaymentCallbackPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
                <Loader2 className="w-10 h-10 text-sky-500 animate-spin" />
            </div>
        }>
            <PaymentCallbackContent />
        </Suspense>
    );
}
