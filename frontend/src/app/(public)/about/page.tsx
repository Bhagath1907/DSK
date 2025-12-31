'use client';

import { motion } from 'framer-motion';
import { Users, Target, ShieldCheck, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-white">
            {/* Hero Section */}
            <section className="relative py-24 overflow-hidden">
                <div className="absolute inset-0 bg-slate-50 -z-10" />
                <div className="absolute top-0 right-0 w-1/2 h-full bg-sky-50/50 -skew-x-12 -z-10 translate-x-1/4" />

                <div className="container mx-auto px-6">
                    <div className="max-w-3xl mx-auto text-center">
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-4xl md:text-6xl font-black text-slate-900 mb-6 leading-tight"
                        >
                            We Bridge the Gap Between <br />
                            <span className="text-sky-500">You & Government</span>
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-lg text-slate-600 leading-relaxed"
                        >
                            DSK (Digital Seva Kendra) is a unified platform dedicated to making essential government services accessible, transparent, and hassle-free for every citizen of India.
                        </motion.p>
                    </div>
                </div>
            </section>

            {/* Mission & Vision */}
            <section className="py-20">
                <div className="container mx-auto px-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="p-10 rounded-3xl bg-slate-50 border border-slate-100"
                        >
                            <div className="w-12 h-12 bg-sky-100 rounded-xl flex items-center justify-center mb-6">
                                <Target className="w-6 h-6 text-sky-600" />
                            </div>
                            <h2 className="text-3xl font-bold text-slate-900 mb-4">Our Mission</h2>
                            <p className="text-slate-600 leading-relaxed">
                                To empower citizens by providing a single-window portal for all government document services. We aim to eliminate the complexities associated with traditional application processes through automation and expert assistance.
                            </p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="p-10 rounded-3xl bg-purple-50 border border-purple-100"
                        >
                            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-6">
                                <Users className="w-6 h-6 text-purple-600" />
                            </div>
                            <h2 className="text-3xl font-bold text-slate-900 mb-4">Our Vision</h2>
                            <p className="text-slate-600 leading-relaxed">
                                To become the most trusted and efficient digital service provider in the country, fostering a digital-first governance model where every citizen can access their rights and entitlements with just a few clicks.
                            </p>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Values */}
            <section className="py-20 bg-slate-50">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-slate-900 mb-4">Why Choose Us?</h2>
                        <p className="text-slate-600">Built on trust, speed, and reliability.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            { title: "100% Secure", desc: "Your data is encrypted and handled with the highest security standards.", icon: ShieldCheck },
                            { title: "Expert Support", desc: "Our dedicated team verifies every application to reduce rejection rates.", icon: Users },
                            { title: "Customer First", desc: "We prioritize your convenience with 24/7 support and tracking.", icon: Heart },
                        ].map((item, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 text-center"
                            >
                                <div className="w-14 h-14 mx-auto bg-slate-50 rounded-full flex items-center justify-center mb-6">
                                    <item.icon className="w-6 h-6 text-slate-700" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-3">{item.title}</h3>
                                <p className="text-slate-500">{item.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-20 text-center">
                <div className="container mx-auto px-6">
                    <h2 className="text-3xl font-bold text-slate-900 mb-8">Ready to get started?</h2>
                    <Link href="/signup">
                        <Button className="px-10 py-6 text-lg rounded-full bg-sky-500 hover:bg-sky-600 text-white font-bold shadow-lg shadow-sky-500/30 border-0">
                            Create Free Account
                        </Button>
                    </Link>
                </div>
            </section>
        </div>
    );
}
