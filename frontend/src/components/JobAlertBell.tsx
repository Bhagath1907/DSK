'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Bell, BellRing, X, Briefcase, CheckCircle2, Clock, Zap, AlertCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

// Request browser notification permission
async function requestNotificationPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
        console.log('This browser does not support notifications');
        return false;
    }

    if (Notification.permission === 'granted') {
        return true;
    }

    if (Notification.permission !== 'denied') {
        const permission = await Notification.requestPermission();
        return permission === 'granted';
    }

    return false;
}

// Show a browser notification
function showBrowserNotification(title: string, body: string, icon?: string) {
    if (Notification.permission === 'granted') {
        new Notification(title, {
            body,
            icon: icon || '/favicon.ico',
            badge: '/favicon.ico',
            tag: 'job-alert',
            requireInteraction: false,
        });
    }
}

function JobAlertModal({ isEnabled, notificationPermission, onToggle, onClose }: {
    isEnabled: boolean;
    notificationPermission: NotificationPermission | 'unsupported';
    onToggle: () => void;
    onClose: () => void;
}) {
    return createPortal(
        <div
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={onClose}
            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
        >
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 30 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header with gradient */}
                <div className="bg-gradient-to-br from-amber-500 via-orange-500 to-red-500 p-6 pb-16 relative overflow-hidden">
                    {/* Decorative circles */}
                    <div className="absolute top-4 right-4 w-20 h-20 bg-white/10 rounded-full blur-xl" />
                    <div className="absolute bottom-0 left-8 w-16 h-16 bg-white/10 rounded-full blur-lg" />

                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 text-white/80 hover:text-white hover:bg-white/20 p-2 rounded-full transition-colors z-10"
                    >
                        <X size={20} />
                    </button>

                    {/* Header Text */}
                    <div className="relative z-10">
                        <h3 className="text-2xl font-bold text-white">Job Alerts</h3>
                        <p className="text-white/80 text-sm mt-1">Get notified on your device</p>
                    </div>
                </div>

                {/* Main Icon - Overlapping header */}
                <div className="flex justify-center -mt-10 relative z-20">
                    <div className="w-20 h-20 bg-white rounded-2xl shadow-xl flex items-center justify-center border-4 border-white transform rotate-3 hover:rotate-0 transition-transform">
                        <Briefcase size={40} className="text-amber-500" />
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 pt-4">
                    {/* Browser Permission Status */}
                    {notificationPermission === 'denied' && (
                        <div className="mb-4 p-3 bg-red-50 rounded-xl border border-red-200 flex items-start gap-3">
                            <AlertCircle size={20} className="text-red-500 shrink-0 mt-0.5" />
                            <div>
                                <p className="font-semibold text-red-700 text-sm">Notifications Blocked</p>
                                <p className="text-xs text-red-600">Please enable notifications in your browser settings to receive job alerts.</p>
                            </div>
                        </div>
                    )}

                    {/* Features List */}
                    <div className="space-y-3 mb-6">
                        <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-xl border border-amber-100">
                            <div className="p-2 bg-amber-100 rounded-lg text-amber-600 shrink-0">
                                <Zap size={18} />
                            </div>
                            <div>
                                <p className="font-semibold text-gray-900 text-sm">Browser Notifications</p>
                                <p className="text-xs text-gray-500">Receive alerts directly on your device</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3 p-3 bg-green-50 rounded-xl border border-green-100">
                            <div className="p-2 bg-green-100 rounded-lg text-green-600 shrink-0">
                                <Clock size={18} />
                            </div>
                            <div>
                                <p className="font-semibold text-gray-900 text-sm">Never Miss Deadlines</p>
                                <p className="text-xs text-gray-500">Apply early and increase your chances</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-xl border border-blue-100">
                            <div className="p-2 bg-blue-100 rounded-lg text-blue-600 shrink-0">
                                <Briefcase size={18} />
                            </div>
                            <div>
                                <p className="font-semibold text-gray-900 text-sm">Job Applications Category</p>
                                <p className="text-xs text-gray-500">All government & private job alerts</p>
                            </div>
                        </div>
                    </div>

                    {/* Toggle Section */}
                    <div className={`p-4 rounded-2xl border-2 transition-all ${isEnabled
                        ? 'bg-green-50 border-green-300 shadow-green-100 shadow-lg'
                        : 'bg-gray-50 border-gray-200'}`}
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                {isEnabled ? (
                                    <CheckCircle2 size={24} className="text-green-600" />
                                ) : (
                                    <Bell size={24} className="text-gray-400" />
                                )}
                                <div>
                                    <p className={`font-bold ${isEnabled ? 'text-green-700' : 'text-gray-700'}`}>
                                        {isEnabled ? 'Alerts Enabled' : 'Enable Alerts'}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        {isEnabled ? 'You will receive browser notifications' : 'Turn on to get job updates'}
                                    </p>
                                </div>
                            </div>

                            {/* Custom Toggle Switch */}
                            <button
                                onClick={onToggle}
                                disabled={notificationPermission === 'denied'}
                                className={`relative w-14 h-7 rounded-full transition-all duration-300 ${notificationPermission === 'denied'
                                    ? 'bg-gray-200 cursor-not-allowed'
                                    : isEnabled
                                        ? 'bg-green-500 shadow-lg shadow-green-200'
                                        : 'bg-gray-300'
                                    }`}
                            >
                                <span
                                    className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow-md transition-all duration-300 flex items-center justify-center ${isEnabled ? 'translate-x-8' : 'translate-x-1'
                                        }`}
                                >
                                    {isEnabled && <CheckCircle2 size={12} className="text-green-500" />}
                                </span>
                            </button>
                        </div>
                    </div>

                    {/* Action Button */}
                    <button
                        onClick={onClose}
                        className="w-full mt-6 py-3.5 px-4 bg-gradient-to-r from-gray-900 to-gray-800 text-white rounded-xl font-bold hover:from-gray-800 hover:to-gray-700 transition-all shadow-lg shadow-gray-200 active:scale-[0.98]"
                    >
                        Got it!
                    </button>
                </div>
            </motion.div>
        </div>,
        document.body
    );
}

export default function JobAlertBell() {
    const [isEnabled, setIsEnabled] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const [mounted, setMounted] = useState(false);
    const [notificationPermission, setNotificationPermission] = useState<NotificationPermission | 'unsupported'>('default');
    const supabase = createClient();

    useEffect(() => {
        setMounted(true);
        fetchPreference();

        // Check browser notification permission
        if ('Notification' in window) {
            setNotificationPermission(Notification.permission);
        } else {
            setNotificationPermission('unsupported');
        }

        // Listen for new job services
        const channel = supabase
            .channel('public:services')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'services'
                },
                async (payload) => {
                    console.log('New service event:', payload);

                    // Check if this service belongs to Job Applications category
                    // We need to fetch the category name or check against known ID
                    // For now, we'll fetch the category details to be sure
                    const { data: categoryData } = await supabase
                        .from('categories')
                        .select('name')
                        .eq('id', payload.new.category_id)
                        .single();

                    if (categoryData && categoryData.name.toLowerCase().includes('job')) {
                        // It's a job! Show notification if enabled.
                        if (isEnabled && Notification.permission === 'granted') {
                            showBrowserNotification(
                                `New Job: ${payload.new.name}`,
                                payload.new.description || 'Check out this new job opportunity!',
                                '/favicon.ico'
                            );
                        }
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [isEnabled, supabase]);

    const fetchPreference = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            setLoading(false);
            return;
        }

        try {
            const res = await fetch(`${API_URL}/notifications/preference`, {
                headers: { 'Authorization': `Bearer ${session.access_token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setIsEnabled(data.enabled);
            }
        } catch (error) {
            console.error('Failed to fetch notification preference:', error);
        } finally {
            setLoading(false);
        }
    };

    const togglePreference = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        const newState = !isEnabled;

        // If enabling, request browser permission first
        if (newState) {
            const granted = await requestNotificationPermission();
            setNotificationPermission(Notification.permission);

            if (!granted) {
                // Permission denied, don't enable
                return;
            }

            // Show a test notification
            showBrowserNotification(
                '🎉 Job Alerts Enabled!',
                'You will now receive notifications for new job opportunities on DSK Portal.'
            );
        }

        try {
            const res = await fetch(`${API_URL}/notifications/preference`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${session.access_token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ enabled: newState })
            });

            if (res.ok) {
                setIsEnabled(newState);
            }
        } catch (error) {
            console.error('Failed to toggle notification preference:', error);
        }
    };

    if (loading) return null;

    return (
        <>
            {/* Blinking Bell Button */}
            <button
                onClick={() => setShowModal(true)}
                className={`relative p-2.5 rounded-full transition-all duration-300 shadow-sm ${isEnabled
                    ? 'bg-green-100 text-green-600 hover:bg-green-200 border border-green-200'
                    : 'bg-gradient-to-r from-amber-100 to-orange-100 text-amber-600 hover:from-amber-200 hover:to-orange-200 border border-amber-200'
                    }`}
                title={isEnabled ? "Job Alerts Enabled" : "Enable Job Alerts"}
            >
                {isEnabled ? (
                    <Bell size={20} />
                ) : (
                    <>
                        <BellRing size={20} className="animate-wiggle" />
                        {/* Blinking dot */}
                        <span className="absolute -top-1 -right-1 flex h-4 w-4">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 text-white text-[8px] font-bold items-center justify-center">!</span>
                        </span>
                    </>
                )}
            </button>

            {/* Modal - Using Portal to render at document.body level */}
            <AnimatePresence>
                {showModal && mounted && (
                    <JobAlertModal
                        isEnabled={isEnabled}
                        notificationPermission={notificationPermission}
                        onToggle={togglePreference}
                        onClose={() => setShowModal(false)}
                    />
                )}
            </AnimatePresence>
        </>
    );
}

// Export function to trigger notifications from other components
export function sendJobNotification(jobTitle: string, jobDescription?: string) {
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
        showBrowserNotification(
            `📢 New Job: ${jobTitle}`,
            jobDescription || 'A new job opportunity is available on DSK Portal!',
            '/favicon.ico'
        );
    }
}
