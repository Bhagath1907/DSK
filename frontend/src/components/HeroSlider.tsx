'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const slides = [
    {
        id: 1,
        image: "/slides/slide1.png",
        alt: "Digital Services Overview"
    },
    {
        id: 2,
        image: "/slides/slide2.png",
        alt: "Service Categories"
    },
    {
        id: 3,
        image: "/slides/slide3.jpg",
        alt: "Application Steps"
    },
    {
        id: 4,
        image: "/slides/slide4.png",
        alt: "Dashboard View"
    },
    {
        id: 5,
        image: "/slides/slide5.jpg",
        alt: "Security Features"
    }
];

export default function HeroSlider() {
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % slides.length);
        }, 3000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="relative w-full h-[400px] lg:h-[500px] rounded-[2rem] overflow-hidden shadow-2xl bg-slate-900/5 backdrop-blur-sm border border-white/20">
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentIndex}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    className="absolute inset-0 w-full h-full flex items-center justify-center overflow-hidden"
                >
                    {/* Blurred background to fill the container */}
                    <img
                        src={slides[currentIndex].image}
                        alt=""
                        className="absolute inset-0 w-full h-full object-cover blur-2xl opacity-40 scale-110"
                        aria-hidden="true"
                    />

                    {/* Full image without cropping */}
                    <img
                        src={slides[currentIndex].image}
                        alt={slides[currentIndex].alt}
                        className="relative z-10 max-w-full max-h-full object-contain"
                    />
                </motion.div>
            </AnimatePresence>

            {/* Indicators */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex space-x-2 z-10">
                {slides.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => setCurrentIndex(index)}
                        className={`w-2.5 h-2.5 rounded-full transition-all duration-300 shadow-sm ${index === currentIndex ? "bg-orange-500 w-8" : "bg-black/20 hover:bg-black/40"
                            }`}
                        aria-label={`Go to slide ${index + 1}`}
                    />
                ))}
            </div>
        </div>
    );
}
