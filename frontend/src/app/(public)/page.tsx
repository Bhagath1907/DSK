'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight, FileText, CreditCard, GraduationCap, Building2, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import HeroSlider from '@/components/HeroSlider';
import { DskLogo } from '@/components/ui/logo';

const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
} as const;

const staggerContainer = {
    visible: { transition: { staggerChildren: 0.1 } }
};

export default function LandingPage() {
    return (
        <div className="relative min-h-[calc(100vh-80px)] overflow-hidden">
            {/* Overlay to ensure text readability on bright gradient if needed, can be subtle */}
            <div className="absolute inset-0 -z-10 bg-black/10 pointer-events-none"></div>

            {/* Header */}
            <header className="absolute top-0 left-0 w-full z-50 flex justify-between items-center px-6 py-6 lg:px-12">
                <Link href="/" className="flex items-center gap-3">
                    <DskLogo className="w-10 h-10 rounded-xl shadow-xl shadow-black/20" />
                    <span className="text-2xl font-black text-white tracking-tight drop-shadow-md">DSK</span>
                </Link>
                <Link href="/login">
                    <Button className="rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 px-8 py-2 font-bold shadow-lg transition-all hover:scale-105">
                        Login
                    </Button>
                </Link>
            </header>

            {/* Hero Section */}
            <section className="container mx-auto px-6 py-12 lg:py-24 relative z-10">
                <div className="flex flex-col lg:grid lg:grid-cols-2 gap-12 items-center">
                    <motion.div
                        initial="hidden"
                        animate="visible"
                        variants={staggerContainer}
                        className="text-center lg:text-left"
                    >
                        <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 border border-white/30 shadow-sm mb-8 mx-auto lg:mx-0 backdrop-blur-md">
                            <span className="relative flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
                            </span>
                            <span className="text-sm font-bold text-white tracking-wide uppercase">New Services Added</span>
                        </motion.div>

                        <motion.h1
                            variants={fadeInUp}
                            className="text-5xl md:text-6xl lg:text-7xl font-black tracking-tight text-white mb-6 leading-[1.1] drop-shadow-md"
                        >
                            Digital Services <br />
                            <span className="text-white">
                                Reimagined.
                            </span>
                        </motion.h1>

                        <motion.p
                            variants={fadeInUp}
                            className="text-lg md:text-xl text-white/90 mb-8 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-medium drop-shadow-sm"
                        >
                            The modern way to apply for government documents.
                            <span className="font-bold text-white"> Fast, Secure, and Paperless.</span>
                        </motion.p>

                        <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start items-center">
                            <Link href="/signup">
                                <Button size="lg" className="h-12 px-8 text-lg rounded-full bg-white text-orange-600 hover:bg-orange-50 hover:text-orange-700 shadow-xl transition-all hover:scale-105 border-0 font-bold">
                                    Get Started <ArrowRight className="ml-2 w-5 h-5" />
                                </Button>
                            </Link>
                        </motion.div>
                    </motion.div>

                    {/* Slider Column */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="w-full max-w-[600px] mx-auto lg:max-w-none"
                    >
                        <HeroSlider />
                    </motion.div>
                </div>
            </section>

            {/* Services Grid */}
            <section className="container mx-auto px-6 pb-32">
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.8 }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
                >
                    {[
                        { title: "Driving License", icon: FileText, color: "text-white", bg: "bg-blue-500", border: "hover:border-white/50", glow: "hover:shadow-white/20" },
                        { title: "PAN Card", icon: CreditCard, color: "text-white", bg: "bg-purple-600", border: "hover:border-white/50", glow: "hover:shadow-white/20" },
                        { title: "Education Loan", icon: GraduationCap, color: "text-white", bg: "bg-pink-600", border: "hover:border-white/50", glow: "hover:shadow-white/20" },
                        { title: "Govt Jobs", icon: Building2, color: "text-white", bg: "bg-emerald-600", border: "hover:border-white/50", glow: "hover:shadow-white/20" },
                    ].map((service, i) => (
                        <motion.div
                            key={i}
                            whileHover={{ y: -10 }}
                            className={`group glass-card p-8 rounded-[2rem] transition-all duration-300 cursor-pointer border border-white/20 bg-black/20 backdrop-blur-xl hover:bg-black/30 hover:shadow-2xl ${service.glow} ${service.border}`}
                        >
                            <div className={`w-16 h-16 rounded-2xl ${service.bg} ${service.color} flex items-center justify-center mb-6 shadow-lg transition-transform group-hover:scale-110 duration-300 ring-2 ring-white/20`}>
                                <service.icon className="w-8 h-8" />
                            </div>
                            <h3 className="text-2xl font-bold text-slate-900 mb-3">{service.title}</h3>
                            <p className="text-slate-600 mb-6 leading-relaxed">Apply for new {service.title.toLowerCase()} or check status instantly.</p>

                            <div className="flex items-center text-sm font-bold text-slate-900 group-hover:text-orange-600 transition-colors">
                                Apply Now <ChevronRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            </section>
        </div>
    );
}
