'use client';

import { useState, useEffect } from 'react';
import { X, Clock, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function NoticeBoard() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Check if we've already shown it this session
        const hasSeenNotice = sessionStorage.getItem('hasSeenServiceNotice');
        if (!hasSeenNotice) {
            // Small delay for smooth entrance after page load
            const timer = setTimeout(() => setIsVisible(true), 500);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleClose = () => {
        setIsVisible(false);
        sessionStorage.setItem('hasSeenServiceNotice', 'true');
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-white/20"
                    >
                        {/* Background decoration */}
                        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-br from-violet-600 to-indigo-600" />

                        <div className="relative p-6 pt-8">
                            {/* Close Button */}
                            <button
                                onClick={handleClose}
                                className="absolute top-4 right-4 text-white/80 hover:text-white hover:bg-white/20 p-1.5 rounded-full transition-colors"
                            >
                                <X size={20} />
                            </button>

                            {/* Icon */}
                            <div className="mx-auto w-20 h-20 bg-white rounded-2xl shadow-lg flex items-center justify-center mb-6 transform -rotate-3 border-4 border-indigo-50">
                                <Clock size={40} className="text-violet-600" />
                            </div>

                            {/* Content */}
                            <div className="text-center space-y-3">
                                <h3 className="text-2xl font-bold text-gray-900">Service Hours</h3>

                                <div className="bg-indigo-50 rounded-xl p-4 border border-indigo-100">
                                    <p className="text-indigo-900 font-medium flex items-center justify-center gap-2">
                                        <Info size={18} />
                                        Operating Timings
                                    </p>
                                    <p className="text-3xl font-bold text-indigo-600 mt-2 tracking-tight">
                                        10:00 AM <span className="text-indigo-300 mx-1">-</span> 06:00 PM
                                    </p>
                                </div>

                                <p className="text-gray-500 text-sm leading-relaxed px-4">
                                    Please note that services offered on the DSK Portal are actively processed during these hours.
                                </p>
                            </div>

                            {/* Action */}
                            <div className="mt-8">
                                <button
                                    onClick={handleClose}
                                    className="w-full py-3 px-4 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition-colors shadow-lg shadow-gray-200"
                                >
                                    Understood
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
