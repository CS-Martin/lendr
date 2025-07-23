"use client"

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Home, Search, ArrowLeft, Zap, Coins, Gem } from "lucide-react"
import { GridBackground } from "@/components/shared/grid-background"
import LendrButton from "@/components/shared/lendr-btn"

export default function NotFound() {
    const router = useRouter()
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
    const [isHovering, setIsHovering] = useState(false)
    const [windowSize, setWindowSize] = useState({ width: 1200, height: 800 })
    const [mounted, setMounted] = useState(false)

    const mouseX = useMotionValue(0)
    const mouseY = useMotionValue(0)

    const springX = useSpring(mouseX, { stiffness: 100, damping: 10 })
    const springY = useSpring(mouseY, { stiffness: 100, damping: 10 })

    const rotateX = useTransform(springY, [-300, 300], [10, -10])
    const rotateY = useTransform(springX, [-300, 300], [-10, 10])

    useEffect(() => {
        setMounted(true)

        const updateWindowSize = () => {
            setWindowSize({ width: window.innerWidth, height: window.innerHeight })
        }

        updateWindowSize()
        window.addEventListener('resize', updateWindowSize)

        const handleMouseMove = (e: MouseEvent) => {
            const { clientX, clientY } = e
            const { innerWidth, innerHeight } = window

            const x = clientX - innerWidth / 2
            const y = clientY - innerHeight / 2

            setMousePosition({ x: clientX, y: clientY })
            mouseX.set(x)
            mouseY.set(y)
        }

        window.addEventListener("mousemove", handleMouseMove)

        return () => {
            window.removeEventListener("mousemove", handleMouseMove)
            window.removeEventListener('resize', updateWindowSize)
        }
    }, [mouseX, mouseY])

    const floatingIcons = [
        { Icon: Zap, delay: 0, duration: 3 },
        { Icon: Coins, delay: 0.5, duration: 4 },
        { Icon: Gem, delay: 1, duration: 3.5 },
    ]

    // Don't render animations until mounted to avoid SSR issues
    if (!mounted) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 overflow-hidden relative">
                <GridBackground />
                <div className="relative z-10 flex items-center justify-center min-h-screen mt-20">
                    <div className="text-center max-w-4xl mx-auto">
                        <div className="relative mb-8">
                            <h1 className="text-9xl md:text-[12rem] font-black text-transparent bg-clip-text bg-gradient-to-r from-lendr-400 via-purple-400 to-pink-400 relative">
                                404
                            </h1>
                        </div>
                        <div className="mb-12">
                            <h2 className="text-2xl md:text-4xl font-bold text-white mb-4">NFT Not Found</h2>
                            <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
                                Looks like this digital asset has been transferred to another dimension. Don&apos;t worry, there are plenty
                                more NFTs to discover in our marketplace!
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 overflow-hidden relative">
            {/* Animated Background Grid */}
            <GridBackground />

            {/* Floating Particles */}
            <div className="absolute inset-0">
                {Array.from({ length: 20 }).map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute w-2 h-2 bg-lendr-400 rounded-full opacity-60"
                        initial={{
                            x: Math.random() * windowSize.width,
                            y: Math.random() * windowSize.height,
                        }}
                        animate={{
                            x: Math.random() * windowSize.width,
                            y: Math.random() * windowSize.height,
                        }}
                        transition={{
                            duration: Math.random() * 10 + 10,
                            repeat: Number.POSITIVE_INFINITY,
                            repeatType: "reverse",
                            ease: "linear",
                        }}
                    />
                ))}
            </div>

            {/* Floating NFT Icons */}
            {floatingIcons.map(({ Icon, delay, duration }, index) => (
                <motion.div
                    key={index}
                    className="absolute text-lendr-400/30"
                    initial={{
                        x: Math.random() * windowSize.width,
                        y: Math.random() * windowSize.height,
                        rotate: 0,
                        scale: 0.5,
                    }}
                    animate={{
                        y: [null, -20, 20, -20],
                        rotate: [0, 180, 360],
                        scale: [0.5, 0.8, 0.5],
                    }}
                    transition={{
                        duration,
                        delay,
                        repeat: Number.POSITIVE_INFINITY,
                        ease: "easeInOut",
                    }}
                >
                    <Icon size={40} />
                </motion.div>
            ))}

            {/* Main Content */}
            <div className="relative z-10 flex items-center justify-center min-h-screen mt-20">
                <motion.div
                    className="text-center max-w-4xl mx-auto"
                    style={{
                        rotateX,
                        rotateY,
                        transformStyle: "preserve-3d",
                    }}
                >
                    {/* Glitch 404 Text */}
                    <motion.div
                        className="relative mb-8"
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <motion.h1
                            className="text-9xl md:text-[12rem] font-black text-transparent bg-clip-text bg-gradient-to-r from-lendr-400 via-purple-400 to-pink-400 relative"
                            animate={{
                                textShadow: [
                                    "0 0 20px rgba(220, 243, 71, 0.5)",
                                    "0 0 40px rgba(220, 243, 71, 0.8)",
                                    "0 0 20px rgba(220, 243, 71, 0.5)",
                                ],
                            }}
                            transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                        >
                            404
                            {/* Glitch Effect Layers */}
                            <motion.span
                                className="absolute inset-0 text-red-500 opacity-70"
                                animate={{
                                    x: [-2, 2, -2],
                                    opacity: [0, 0.7, 0],
                                }}
                                transition={{ duration: 0.2, repeat: Number.POSITIVE_INFINITY, repeatDelay: 2 }}
                            >
                                404
                            </motion.span>
                            <motion.span
                                className="absolute inset-0 text-cyan-400 opacity-70"
                                animate={{
                                    x: [2, -2, 2],
                                    opacity: [0, 0.7, 0],
                                }}
                                transition={{ duration: 0.2, repeat: Number.POSITIVE_INFINITY, repeatDelay: 2.1 }}
                            >
                                404
                            </motion.span>
                        </motion.h1>
                    </motion.div>

                    {/* Subtitle with Typewriter Effect */}
                    <motion.div
                        className="mb-12"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5, duration: 0.8 }}
                    >
                        <h2 className="text-2xl md:text-4xl font-bold text-white mb-4">NFT Not Found</h2>
                        <motion.p
                            className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.8, duration: 0.6 }}
                        >
                            Looks like this digital asset has been transferred to another dimension. Don&apos;t worry, there are plenty
                            more NFTs to discover in our marketplace!
                        </motion.p>
                    </motion.div>

                    {/* Action Buttons */}
                    <motion.div
                        className="flex flex-col sm:flex-row gap-4 justify-center items-center"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1.2, duration: 0.6 }}
                    >
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <LendrButton
                                onClick={() => router.push("/")}
                                className="p-6.5"
                            >
                                <Home className="mr-2" size={20} />
                                Back to Home
                            </LendrButton>
                        </motion.div>

                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <LendrButton
                                onClick={() => router.push("/marketplace")}
                                variant="outline"
                                className="p-6.5"
                            >
                                <Search className="mr-2" size={20} />
                                Explore NFTs
                            </LendrButton>
                        </motion.div>

                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <LendrButton
                                onClick={() => router.back()}
                                variant="ghost"
                                className="p-6.5"
                            >
                                <ArrowLeft className="mr-2" size={20} />
                                Go Back
                            </LendrButton>
                        </motion.div>
                    </motion.div>

                    {/* Fun Stats */}
                    <motion.div
                        className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl mx-auto"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1.5, duration: 0.8 }}
                    >
                        {[
                            { label: "NFTs Found", value: "0", icon: Gem },
                            { label: "Dimensions Searched", value: "∞", icon: Search },
                            { label: "Portals Opened", value: "404", icon: Zap },
                        ].map((stat, index) => (
                            <motion.div
                                key={index}
                                className="text-center p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10"
                                whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.1)" }}
                                transition={{ duration: 0.2 }}
                            >
                                <stat.icon className="mx-auto mb-2 text-lendr-400" size={24} />
                                <div className="text-2xl font-bold text-white">{stat.value}</div>
                                <div className="text-sm text-gray-400">{stat.label}</div>
                            </motion.div>
                        ))}
                    </motion.div>
                </motion.div>
            </div>

            {/* Mouse Follower */}
            <motion.div
                className="fixed pointer-events-none z-50 w-6 h-6 rounded-full bg-lendr-400/30 blur-sm"
                animate={{
                    x: mousePosition.x - 12,
                    y: mousePosition.y - 12,
                }}
                transition={{ type: "spring", stiffness: 500, damping: 28 }}
            />

            <motion.div
                className="fixed pointer-events-none z-50 w-12 h-12 rounded-full border border-lendr-400/20"
                animate={{
                    x: mousePosition.x - 24,
                    y: mousePosition.y - 24,
                }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
            />
        </div>
    )
}
