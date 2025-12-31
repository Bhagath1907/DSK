'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Wallet, CreditCard, ArrowUpRight, History as HistoryIcon, ShieldCheck, Zap, Star } from 'lucide-react';
import { motion } from 'framer-motion';

export default function WalletPage() {
    const [balance, setBalance] = useState(0.00);
    const [loading, setLoading] = useState(false);
    const supabase = createClient();

    useEffect(() => {
        const fetchBalance = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data, error } = await supabase
                    .from('users')
                    .select('wallet_balance')
                    .eq('id', user.id)
                    .single();

                if (data) setBalance(data.wallet_balance || 0.00);
            }
        };
        fetchBalance();
    }, []);

    const plans = [
        {
            name: 'Go',
            price: 100,
            icon: Zap,
            color: 'from-blue-400 to-cyan-300',
            features: ['Basic Access', 'Instant Credit', 'Standard Support'],
            popular: false
        },
        {
            name: 'Pro',
            price: 300,
            icon: Star,
            color: 'from-purple-500 to-indigo-500',
            features: ['Priority Processing', 'Bonus Credits', 'Premium Support'],
            popular: true
        },
        {
            name: 'Plus',
            price: 600,
            icon: ShieldCheck,
            color: 'from-emerald-400 to-teal-500',
            features: ['All Features', 'Max Transaction Limit', '24/7 Dedicated Support'],
            popular: false
        }
    ];

    const handleTopUp = (planName: string, price: number) => {
        setLoading(true);

        let paymentLink = '';

        switch (planName) {
            case 'Go':
                paymentLink = 'https://rzp.io/rzp/Kkl6l0Dh';
                break;
            case 'Pro':
                paymentLink = 'https://rzp.io/rzp/YndA3X1w';
                break;
            case 'Plus':
                paymentLink = 'https://rzp.io/rzp/8Jjspdx';
                break;
            default:
                alert('Invalid plan selected');
                setLoading(false);
                return;
        }

        // Redirect to Razorpay
        window.open(paymentLink, '_blank');
        setLoading(false);
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">My Wallet</h1>
                    <p className="text-gray-500">Manage your funds and transactions securely.</p>
                </div>
                <div className="bg-gradient-to-r from-sky-500 to-purple-600 p-6 rounded-2xl text-white shadow-xl shadow-sky-500/20 w-full md:w-auto min-w-[300px]">
                    <div className="flex justify-between items-start mb-2">
                        <span className="text-indigo-100 font-medium text-sm">Available Balance</span>
                        <Wallet className="w-5 h-5 text-indigo-100" />
                    </div>
                    <div className="text-4xl font-bold mb-4">₹ {balance.toFixed(2)}</div>
                    <div className="flex gap-2">
                        <Button size="sm" className="bg-white hover:bg-indigo-50 text-indigo-600 font-bold border-0 shadow-sm w-full transition-colors">
                            <ArrowUpRight className="w-4 h-4 mr-1" /> Add Funds
                        </Button>
                        <Button size="sm" className="bg-white hover:bg-indigo-50 text-indigo-600 font-bold border-0 shadow-sm w-full transition-colors">
                            <HistoryIcon className="w-4 h-4 mr-1" /> History
                        </Button>
                    </div>
                </div>
            </div>

            <section>
                <h2 className="text-xl font-bold text-gray-900 mb-6">Top-up Plans</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {plans.map((plan) => (
                        <motion.div
                            key={plan.name}
                            whileHover={{ y: -5 }}
                            className={`relative bg-white rounded-3xl p-8 border ${plan.popular ? 'border-sky-500 shadow-2xl shadow-sky-500/10 ring-4 ring-sky-500/5' : 'border-gray-100 shadow-xl shadow-gray-200/50'} overflow-hidden transition-all`}
                        >
                            {plan.popular && (
                                <div className="absolute top-0 right-0 bg-sky-500 text-white text-xs font-bold px-3 py-1 rounded-bl-xl">
                                    MOST POPULAR
                                </div>
                            )}

                            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${plan.color} flex items-center justify-center mb-6 text-white shadow-lg`}>
                                <plan.icon className="w-7 h-7" />
                            </div>

                            <h3 className="text-2xl font-bold text-gray-900">{plan.name}</h3>
                            <div className="flex items-baseline gap-1 mt-2 mb-6">
                                <span className="text-4xl font-black text-gray-900">₹{plan.price}</span>
                                <span className="text-gray-400 font-medium">/ recharge</span>
                            </div>

                            <ul className="space-y-4 mb-8">
                                {plan.features.map((feature, i) => (
                                    <li key={i} className="flex items-center text-gray-600 text-sm font-medium">
                                        <div className="w-5 h-5 rounded-full bg-green-50 text-green-600 flex items-center justify-center mr-3">
                                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                                        </div>
                                        {feature}
                                    </li>
                                ))}
                            </ul>

                            <Button
                                onClick={() => handleTopUp(plan.name, plan.price)}
                                disabled={loading}
                                className={`w-full py-6 text-lg rounded-xl font-bold transition-all ${plan.popular ? 'bg-gradient-to-r from-sky-500 to-purple-600 text-white shadow-lg shadow-sky-500/25 hover:scale-[1.02]' : 'bg-slate-100 hover:bg-slate-200 text-slate-900 border-2 border-slate-200'}`}
                            >
                                {loading ? 'Processing...' : 'Select Plan'}
                            </Button>
                        </motion.div>
                    ))}
                </div>
            </section>
        </div>
    );
}
