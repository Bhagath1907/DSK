'use client';

import { motion } from 'framer-motion';
import { FileText, CreditCard, GraduationCap, Building2, Car, Plane, Home, Shield, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

const services = [
    {
        title: "Driving License",
        description: "Apply for a new Learner's or Permanent Driving License. Renew existing licenses or change address details with ease.",
        icon: Car,
        color: "text-blue-500",
        bg: "bg-blue-50",
    },
    {
        title: "PAN Card Services",
        description: "New PAN Card application, correction in PAN data, and re-print of lost PAN card. Link PAN with Aadhaar seamlessly.",
        icon: CreditCard,
        color: "text-purple-500",
        bg: "bg-purple-50",
    },
    {
        title: "Education Loan",
        description: "Quick and easy education loan applications for studies in India and abroad. Low interest rates and flexible repayment options.",
        icon: GraduationCap,
        color: "text-pink-500",
        bg: "bg-pink-50",
    },
    {
        title: "Government Jobs",
        description: "Latest government job notifications, admit cards, and result updates. Apply for state and central govt exams directly.",
        icon: Building2,
        color: "text-orange-500",
        bg: "bg-orange-50",
    },
    {
        title: "Passport Seva",
        description: "Apply for a fresh passport, reissue, or Tatkaal passport. Schedule appointments and track application status live.",
        icon: Plane,
        color: "text-sky-500",
        bg: "bg-sky-50",
    },
    {
        title: "Income/Caste Certificate",
        description: "Get your Income, Caste, and Domicile certificates issued digitally without visiting government offices.",
        icon: FileText,
        color: "text-green-500",
        bg: "bg-green-50",
    },
    {
        title: "Housing Schemes",
        description: "Check eligibility and apply for Pradhan Mantri Awas Yojana and other state housing schemes for affordable homes.",
        icon: Home,
        color: "text-indigo-500",
        bg: "bg-indigo-50",
    },
    {
        title: "Insurance Services",
        description: "Apply for life insurance, health insurance, and vehicle insurance. Compare plans and get the best quotes instantly.",
        icon: Shield,
        color: "text-red-500",
        bg: "bg-red-50",
    },
];

export default function ServicesPage() {
    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header */}
            <section className="bg-white py-20 relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-sky-50 to-transparent pointer-events-none" />
                <div className="container mx-auto px-6 relative z-10 text-center">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl md:text-5xl font-black text-slate-900 mb-6"
                    >
                        Our <span className="text-sky-500">Services</span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-lg text-slate-600 max-w-2xl mx-auto"
                    >
                        We offer a comprehensive range of government and digital services to make your life easier.
                        Apply, track, and manage everything from a single dashboard.
                    </motion.p>
                </div>
            </section>

            {/* Services Grid */}
            <section className="container mx-auto px-6 -mt-10 relative z-20">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {services.map((service, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            whileHover={{ y: -5 }}
                            className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100"
                        >
                            <div className={`w-14 h-14 rounded-xl ${service.bg} ${service.color} flex items-center justify-center mb-6`}>
                                <service.icon className="w-7 h-7" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-3">{service.title}</h3>
                            <p className="text-slate-500 text-sm leading-relaxed mb-6">
                                {service.description}
                            </p>
                            <Link href="/login" className="inline-flex items-center text-sm font-bold text-sky-500 hover:text-sky-600 transition-colors">
                                Apply Now <ChevronRight className="w-4 h-4 ml-1" />
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* CTA Section */}
            <section className="container mx-auto px-6 mt-24">
                <div className="bg-gradient-to-r from-sky-500 to-purple-600 rounded-3xl p-12 text-center text-white relative overflow-hidden">
                    <div className="relative z-10">
                        <h2 className="text-3xl font-bold mb-4">Can&apos;t find what you&apos;re looking for?</h2>
                        <p className="text-sky-100 mb-8 max-w-xl mx-auto">
                            Our support team is always ready to help you with custom requirements and queries.
                        </p>
                        <Link href="/contact">
                            <Button className="bg-white text-sky-600 hover:bg-sky-50 font-bold px-8 py-6 rounded-xl text-lg border-0">
                                Contact Support
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}
