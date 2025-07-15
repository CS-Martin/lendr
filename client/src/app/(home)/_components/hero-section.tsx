'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { HolographicText } from './holographic-text';

export function HeroSection() {
    return (
        <section className="relative min-h-screen flex items-center justify-center px-4 py-16">
            <div className="max-w-6xl mx-auto text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <HolographicText className="text-6xl md:text-8xl font-bold mb-6 leading-tight">
                        <motion.span
                            className="block bg-gradient-to-r from-white via-lendr-400 to-cyan-400 bg-clip-text text-transparent"
                            animate={{
                                backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                            }}
                            transition={{
                                duration: 3,
                                repeat: Infinity,
                                ease: "linear",
                            }}
                        >
                            <span className="text-white">A </span>Smarter<span className="text-white"> way</span> <br />
                            <span className="text-white">to rent NFTs.</span>
                        </motion.span>
                    </HolographicText>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="mt-8"
                >
                    <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                        Experience the future of NFT rentals with our innovative platform.
                        Rent, lend, and earn with ease.
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                    className="mt-8"
                >
                    <button className="bg-gradient-to-r from-lendr-400 to-cyan-400 text-white px-8 py-4 rounded-full font-semibold hover:opacity-90 transition-opacity">
                        Get Started
                    </button>
                </motion.div>
            </div>
        </section>
    );
}
