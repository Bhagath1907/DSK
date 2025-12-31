'use client';

import { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

// Helper for chat API
const sendChatMessage = async (message: string) => {
    // Determine API URL (default to relative path if not set, or localhost)
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    // Remove trailing slash if present
    const cleanBase = baseUrl.replace(/\/$/, '');

    // Check if /api/v1 is already in the base
    const apiBase = cleanBase.endsWith('/api/v1') ? cleanBase : `${cleanBase}/api/v1`;

    // Add endpoint
    const endpoint = `${apiBase}/chat/`;

    const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            // Add authorization if needed. Assuming dashboard layout handles auth context, 
            // but backend endpoint currently public/dependent on session cookies if any.
            // For now, it's a public endpoint under /api/v1/
        },
        body: JSON.stringify({ message }),
    });

    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || 'Failed to send message');
    }
    return res.json();
};

export default function ChatAssistant() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isOpen, isLoading]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMsg = input.trim();
        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
        setIsLoading(true);

        try {
            const data = await sendChatMessage(userMsg);
            setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
        } catch (error) {
            console.error(error);
            setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I'm having trouble connecting to the server. Please try again later." }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            {/* FAB */}
            <Button
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "fixed bottom-6 right-6 z-50 rounded-full w-14 h-14 shadow-2xl p-0 transition-all duration-300 hover:scale-105",
                    isOpen
                        ? "bg-red-500 hover:bg-red-600 rotate-180"
                        : "bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700"
                )}
            >
                {isOpen ? <X size={24} /> : <MessageCircle size={28} />}
            </Button>

            {/* Chat Window */}
            {isOpen && (
                <div className="fixed bottom-24 right-6 w-96 max-w-[calc(100vw-3rem)] bg-white rounded-2xl shadow-2xl border border-gray-200/50 z-50 flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 fade-in duration-300 h-[550px] font-sans">
                    {/* Header */}
                    <div className="p-4 bg-gradient-to-r from-violet-600 to-indigo-600 text-white flex items-center gap-3 shadow-lg">
                        <div className="p-2 bg-white/20 rounded-full backdrop-blur-sm">
                            <Bot size={20} />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg">Help Assisant</h3>
                            <div className="flex items-center gap-1.5">
                                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                                <p className="text-xs text-indigo-100 font-medium">Online & Ready</p>
                            </div>
                        </div>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50" ref={scrollRef}>
                        {messages.length === 0 && (
                            <div className="text-center text-gray-500 mt-20 px-6">
                                <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-indigo-500">
                                    <MessageCircle size={32} />
                                </div>
                                <p className="font-semibold text-gray-900 mb-1">How can I help?</p>
                                <p className="text-sm">Ask me about available services, categories, or how to apply.</p>
                            </div>
                        )}

                        {messages.map((m, i) => (
                            <div key={i} className={cn("flex gap-3 max-w-[85%] animate-in fade-in slide-in-from-bottom-2 duration-300", m.role === 'user' ? "ml-auto flex-row-reverse" : "mr-auto")}>
                                {m.role === 'assistant' && (
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shrink-0 shadow-sm mt-0.5 text-white">
                                        <Bot size={14} />
                                    </div>
                                )}
                                <div className={cn(
                                    "p-3.5 rounded-2xl text-sm shadow-sm leading-relaxed",
                                    m.role === 'user'
                                        ? "bg-violet-600 text-white rounded-tr-none"
                                        : "bg-white text-gray-700 rounded-tl-none border border-gray-100"
                                )}>
                                    {m.content}
                                </div>
                            </div>
                        ))}

                        {isLoading && (
                            <div className="flex gap-3 max-w-[80%] mr-auto animate-in fade-in duration-300">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shrink-0 shadow-sm text-white">
                                    <Bot size={14} />
                                </div>
                                <div className="bg-white p-4 rounded-2xl rounded-tl-none border border-gray-100 shadow-sm">
                                    <div className="flex gap-1.5 items-center h-full">
                                        <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" />
                                        <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.15s]" />
                                        <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.3s]" />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Input */}
                    <div className="p-3 bg-white border-t border-gray-100 flex gap-2 items-center">
                        <Input
                            placeholder="Type your question..."
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleSend()}
                            className="bg-gray-50 border-gray-200 focus-visible:ring-1 focus-visible:ring-violet-600 rounded-xl"
                        />
                        <Button
                            size="icon"
                            onClick={handleSend}
                            disabled={isLoading || !input.trim()}
                            className={cn(
                                "shrink-0 rounded-xl transition-all duration-200",
                                input.trim()
                                    ? "bg-violet-600 hover:bg-violet-700 shadow-lg shadow-violet-200"
                                    : "bg-gray-100 text-gray-400 hover:bg-gray-200"
                            )}
                        >
                            <Send size={18} />
                        </Button>
                    </div>
                </div>
            )}
        </>
    );
}
