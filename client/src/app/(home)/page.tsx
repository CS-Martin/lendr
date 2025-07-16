'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { FloatingElement } from '../../components/shared/floating-element';
import { GridBackground } from '@/components/shared/grid-background';
import { StepsToRentAndList } from './_components/steps-to-rent-and-list';
import FlashScreen from '@/components/shared/flash-screen';
import { HeroSection } from './_components/hero-section';
import { TopUsersCarousel } from './_components/top-users';
import { FeaturedRentalPosts } from './_components/featured-rental-posts';
import { FooterCTACard } from './_components/footer-cta-card';

export default function HomePage() {
    const [showFlashScreen, setShowFlashScreen] = useState(true);

    return (
        <main className='min-h-screen bg-slate-950 relative overflow-hidden'>
            {/* Flash screen */}
            {showFlashScreen && (
                <div className='fixed inset-0 z-[9999] flex items-center justify-center'>
                    <FlashScreen
                        onComplete={() => {
                            console.log(
                                'FlashScreen completed - removing from DOM',
                            );
                            setShowFlashScreen(false);
                        }}
                    />
                </div>
            )}

            {/* Main content */}
            <div className='relative px-4 md:px-0'>
                <GridBackground />

                <div className='max-w-7xl mx-auto'>
                    <HomeFloatingElements />
                    <HeroSection />
                    <StepsToRentAndList />
                    <TopUsersCarousel />
                    <FeaturedRentalPosts />
                    <FooterCTACard />
                </div>
            </div>
        </main>
    );
}

const HomeFloatingElements = () => {
    return (
        <>
            {/* Floating geometric shapes */}
            <FloatingElement
                delay={0}
                className='top-20 left-10 w-20 h-20'>
                <div className='w-full h-full bg-gradient-to-br from-lendr-400/30 to-cyan-400/30 rounded-lg backdrop-blur-sm border border-lendr-400/20 shadow-lg shadow-lendr-400/20 flex items-center justify-center'>
                    <motion.div
                        animate={{ rotateY: [0, 360] }}
                        transition={{
                            duration: 3,
                            repeat: Number.POSITIVE_INFINITY,
                            ease: 'linear',
                        }}>
                        <svg
                            className='w-10 h-10 text-lendr-400'
                            fill='currentColor'
                            viewBox='0 0 24 24'>
                            <path d='M12 1.75l-6.25 10.5L12 16l6.25-3.75L12 1.75zM5.75 13.5L12 22.25l6.25-8.75L12 17.25l-6.25-3.75z' />
                        </svg>
                    </motion.div>
                </div>
            </FloatingElement>

            <FloatingElement
                delay={1}
                duration={6}
                className='top-40 right-20 w-16 h-16'>
                <div className='w-full h-full bg-gradient-to-br from-orange-400/30 to-yellow-400/30 rounded-full backdrop-blur-sm border border-orange-400/20 shadow-lg shadow-orange-400/20 flex items-center justify-center'>
                    <motion.div
                        animate={{ rotate: [0, 360] }}
                        transition={{
                            duration: 4,
                            repeat: Number.POSITIVE_INFINITY,
                            ease: 'linear',
                        }}>
                        <svg
                            className='w-8 h-8 text-orange-400'
                            fill='currentColor'
                            viewBox='0 0 24 24'>
                            <path d='M23.638 14.904c-1.602 6.43-8.113 10.34-14.542 8.736C2.67 22.05-1.244 15.525.362 9.105 1.962 2.67 8.475-1.243 14.9.358c6.43 1.605 10.342 8.115 8.738 14.546z' />
                            <path d='M17.58 11.187c.264-1.767-.108-2.773-.73-3.415-.622-.643-1.572-.24-2.296.13-.725.37-1.264 1.123-1.264 1.123s.54-.753 1.264-1.123c.725-.37 1.674-.773 2.296-.13.622.642.994 1.648.73 3.415z' />
                        </svg>
                    </motion.div>
                </div>
            </FloatingElement>

            <FloatingElement
                delay={2}
                duration={5}
                className='bottom-40 left-20 w-12 h-12'>
                <div className='w-full h-full bg-gradient-to-br from-purple-400/30 to-pink-400/30 rotate-45 backdrop-blur-sm border border-purple-400/20 shadow-lg shadow-purple-400/20 flex items-center justify-center'>
                    <motion.div
                        className='-rotate-45'
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{
                            duration: 2,
                            repeat: Number.POSITIVE_INFINITY,
                            ease: 'easeInOut',
                        }}>
                        <svg
                            className='w-6 h-6 text-purple-400'
                            fill='currentColor'
                            viewBox='0 0 24 24'>
                            <path d='M12 2L2 7v10c0 5.55 3.84 9.74 9 11 5.16-1.26 9-5.45 9-11V7l-10-5z' />
                            <path d='M10 17l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z' />
                        </svg>
                    </motion.div>
                </div>
            </FloatingElement>

            <FloatingElement
                delay={0.5}
                duration={7}
                className='top-60 left-1/3 w-8 h-8'>
                <div className='w-full h-full bg-gradient-to-br from-green-400/40 to-emerald-400/40 rounded-full backdrop-blur-sm border border-green-400/30 shadow-lg shadow-green-400/30 flex items-center justify-center'>
                    <motion.div
                        animate={{ rotateZ: [0, 360] }}
                        transition={{
                            duration: 5,
                            repeat: Number.POSITIVE_INFINITY,
                            ease: 'linear',
                        }}>
                        <svg
                            className='w-4 h-4 text-green-400'
                            fill='currentColor'
                            viewBox='0 0 24 24'>
                            <path d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z' />
                        </svg>
                    </motion.div>
                </div>
            </FloatingElement>

            <FloatingElement
                delay={1.8}
                duration={6}
                className='top-80 right-1/4 w-14 h-14'>
                <div className='w-full h-full bg-gradient-to-br from-blue-400/30 to-indigo-400/30 rounded-xl backdrop-blur-sm border border-blue-400/20 shadow-lg shadow-blue-400/20 flex items-center justify-center'>
                    <motion.div
                        animate={{ rotateX: [0, 360] }}
                        transition={{
                            duration: 4,
                            repeat: Number.POSITIVE_INFINITY,
                            ease: 'linear',
                        }}>
                        <svg
                            className='w-7 h-7 text-blue-400'
                            fill='currentColor'
                            viewBox='0 0 24 24'>
                            <path d='M6 2l3 6 5.5-3-2.5 5.5 6.5 1.5-6.5 1.5 2.5 5.5L9 14l-3 6-3-6L.5 9.5 7 8 4.5 2.5 10 5.5 6 2z' />
                        </svg>
                    </motion.div>
                </div>
            </FloatingElement>

            <FloatingElement
                delay={3}
                duration={8}
                className='bottom-60 right-10 w-10 h-10'>
                <div className='w-full h-full bg-gradient-to-br from-red-400/30 to-pink-400/30 rounded-lg backdrop-blur-sm border border-red-400/20 shadow-lg shadow-red-400/20 flex items-center justify-center'>
                    <motion.div
                        animate={{ rotateY: [0, -360] }}
                        transition={{
                            duration: 6,
                            repeat: Number.POSITIVE_INFINITY,
                            ease: 'linear',
                        }}>
                        <svg
                            className='w-6 h-6 text-red-400'
                            fill='currentColor'
                            viewBox='0 0 24 24'>
                            <path d='M12 2L1 21h22L12 2zm0 3.99L19.53 19H4.47L12 5.99zM11 16h2v2h-2v-2zm0-6h2v4h-2v-4z' />
                        </svg>
                    </motion.div>
                </div>
            </FloatingElement>
        </>
    );
};