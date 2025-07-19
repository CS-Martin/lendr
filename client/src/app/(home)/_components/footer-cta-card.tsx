import LendrButton from '@/components/shared/lendr-btn';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

export const FooterCTACard = () => {
    return (
        <section className='container mx-auto py-20 relative'>
            <motion.div
                className='relative overflow-hidden rounded-3xl bg-gradient-to-r from-lendr-400 to-lendr-500 px-12'
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}>
                {/* Background Pattern */}
                <div className='absolute inset-0 opacity-10'>
                    <div
                        className='absolute inset-0'
                        style={{
                            backgroundImage: `
                  linear-gradient(rgba(0, 0, 0, 0.1) 1px, transparent 1px),
                  linear-gradient(90deg, rgba(0, 0, 0, 0.1) 1px, transparent 1px)
                `,
                            backgroundSize: '20px 20px',
                        }}
                    />
                </div>

                <div className='grid grid-cols-1 lg:grid-cols-2 gap-12 items-center pt-10 relative z-10'>
                    {/* Left Side - Content */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        viewport={{ once: true }}>
                        <h2 className='text-3xl md:text-4xl font-bold text-slate-950 mb-6 leading-tight'>
                            Discover, rent and lend your own NFT
                        </h2>

                        <div className='flex flex-col sm:flex-row gap-4'>
                            <LendrButton
                                size='lg'
                                icon={<ArrowRight className='ml-2 w-5 h-5' />}
                                className='bg-slate-950 hover:bg-slate-800 text-lendr-400 border-0 p-3 md:p-6.5 font-bold shadow-lg hover:shadow-xl transition-all duration-300 w-full'>
                                Explore Now
                            </LendrButton>
                            <LendrButton
                                size='lg'
                                className='bg-slate-950 hover:bg-slate-800 text-lendr-400 border-0 p-3 md:p-6.5 font-bold shadow-lg hover:shadow-xl transition-all duration-300 w-full'>
                                List your first NFT
                            </LendrButton>
                        </div>
                    </motion.div>

                    {/* Right Side - Mobile Mockups */}
                    <motion.div
                        className='relative'
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                        viewport={{ once: true }}>
                        <div className='relative hidden w-full h-80 md:flex items-center justify-center'>
                            {/* Phone Mockup 1 */}
                            <motion.div
                                className='absolute w-48 h-80 bg-slate-950 rounded-3xl p-2 shadow-2xl transform -rotate-12 z-10'
                                animate={{
                                    y: [0, -10, 0],
                                    rotateZ: [-12, -8, -12],
                                }}
                                transition={{
                                    duration: 4,
                                    repeat: Number.POSITIVE_INFINITY,
                                    ease: 'easeInOut',
                                }}>
                                <div className='w-full h-full bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl overflow-hidden'>
                                    <div className='p-4'>
                                        <div className='w-full h-32 bg-gradient-to-br from-lendr-400/20 to-cyan-400/20 rounded-xl mb-3 flex items-center justify-center'>
                                            <div className='w-16 h-16 bg-lendr-400 rounded-lg flex items-center justify-center'>
                                                <svg
                                                    className='w-8 h-8 text-slate-950'
                                                    fill='currentColor'
                                                    viewBox='0 0 24 24'>
                                                    <path d='M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z' />
                                                </svg>
                                            </div>
                                        </div>
                                        <div className='h-3 bg-slate-700 rounded mb-2'></div>
                                        <div className='h-2 bg-slate-600 rounded w-3/4'></div>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Phone Mockup 2 */}
                            <motion.div
                                className='absolute w-48 h-80 bg-slate-950 rounded-3xl p-2 shadow-2xl transform rotate-6 z-20'
                                animate={{
                                    y: [0, 10, 0],
                                    rotateZ: [6, 10, 6],
                                }}
                                transition={{
                                    duration: 4,
                                    repeat: Number.POSITIVE_INFINITY,
                                    ease: 'easeInOut',
                                    delay: 1,
                                }}>
                                <div className='w-full h-full bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl overflow-hidden'>
                                    <div className='p-4'>
                                        <div className='w-full h-32 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-xl mb-3 flex items-center justify-center'>
                                            <div className='w-16 h-16 bg-purple-400 rounded-lg flex items-center justify-center'>
                                                <svg
                                                    className='w-8 h-8 text-slate-950'
                                                    fill='currentColor'
                                                    viewBox='0 0 24 24'>
                                                    <path d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z' />
                                                </svg>
                                            </div>
                                        </div>
                                        <div className='h-3 bg-slate-700 rounded mb-2'></div>
                                        <div className='h-2 bg-slate-600 rounded w-2/3'></div>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Phone Mockup 3 */}
                            <motion.div
                                className='absolute w-48 h-80 bg-slate-950 rounded-3xl p-2 shadow-2xl transform rotate-12 z-30 right-0'
                                animate={{
                                    y: [0, -5, 0],
                                    rotateZ: [12, 16, 12],
                                }}
                                transition={{
                                    duration: 4,
                                    repeat: Number.POSITIVE_INFINITY,
                                    ease: 'easeInOut',
                                    delay: 2,
                                }}>
                                <div className='w-full h-full bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl overflow-hidden'>
                                    <div className='p-4'>
                                        <div className='w-full h-32 bg-gradient-to-br from-cyan-400/20 to-blue-400/20 rounded-xl mb-3 flex items-center justify-center'>
                                            <div className='w-16 h-16 bg-cyan-400 rounded-lg flex items-center justify-center'>
                                                <svg
                                                    className='w-8 h-8 text-slate-950'
                                                    fill='currentColor'
                                                    viewBox='0 0 24 24'>
                                                    <path d='M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z' />
                                                </svg>
                                            </div>
                                        </div>
                                        <div className='h-3 bg-slate-700 rounded mb-2'></div>
                                        <div className='h-2 bg-slate-600 rounded w-4/5'></div>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </motion.div>
                </div>
            </motion.div>
        </section>
    );
};
