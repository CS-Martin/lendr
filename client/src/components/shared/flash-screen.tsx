/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { useEffect, useRef, useState } from "react"
import { gsap } from "gsap"
import { Zap, TrendingUp, Globe, Cpu, Star, Layers, Database, Shield } from "lucide-react"

interface FlashScreenProps {
    onComplete: () => void;
}

export default function FlashScreen({ onComplete }: FlashScreenProps) {
    const containerRef = useRef<HTMLDivElement>(null)
    const logoRef = useRef<HTMLDivElement>(null)
    const textRef = useRef<HTMLDivElement>(null)
    const particlesRef = useRef<HTMLDivElement>(null)
    const iconsRef = useRef<HTMLDivElement>(null)
    const gridRef = useRef<HTMLDivElement>(null)
    const progressRef = useRef<HTMLDivElement>(null)
    const [progress, setProgress] = useState(0)
    const [particlePositions, setParticlePositions] = useState<{ left: string; top: string; delay: string }[]>([])
    const [isFlashCompleteState, setIsFlashCompleteState] = useState(false)

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const positions = Array.from({ length: 20 }).map(() => ({
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                delay: `${Math.random() * 2}s`
            }))
            setParticlePositions(positions)
        }
    }, [])

    useEffect(() => {
        const tl = gsap.timeline({
            onComplete: () => {
                console.log("Animation complete - calling onComplete");
                onComplete();
                // Proper cleanup
                if (containerRef.current) {
                    // Remove the container from the DOM
                    containerRef.current.remove();
                }
                // Kill the timeline
                tl.kill();
            }
        })

        // Set initial states
        gsap.set([logoRef.current, textRef.current], { opacity: 0, scale: 0.5 })
        gsap.set(progressRef.current, { width: "0%" })
        gsap.set(".flash-particle", { opacity: 0, scale: 0 })
        gsap.set(".flash-icon", { opacity: 0, scale: 0 })

        // Logo entrance with elastic effect
        tl.to(
            logoRef.current,
            {
                opacity: 1,
                scale: 1,
                duration: 1.2,
                ease: "elastic.out(1, 0.5)",
            },
            0.3,
        )

        // Text entrance
        tl.to(
            textRef.current,
            {
                opacity: 1,
                scale: 1,
                duration: 0.8,
                ease: "back.out(1.7)",
            },
            1.2,
        )

        // Particles animation
        tl.to(
            ".flash-particle",
            {
                opacity: 1,
                scale: 1,
                duration: 0.6,
                stagger: 0.1,
                ease: "power2.out",
            },
            1.5,
        )

        // Icons animation
        tl.to(
            ".flash-icon",
            {
                opacity: 1,
                scale: 1,
                duration: 0.6,
                stagger: 0.1,
                ease: "power2.out",
            },
            1.5,
        )

        // Progress bar animation
        const progressTween = gsap.to(progressRef.current, {
            width: "100%",
            duration: 3.5,
            ease: "power2.out",
            onUpdate: function () {
                const progress = Math.round(this.progress() * 100)
                setProgress(progress)
            },
        })

        // Final logo pulse before exit
        tl.to(
            logoRef.current,
            {
                scale: 1.1,
                duration: 0.5,
                ease: "power2.inOut",
            },
            5.5,
        )

        // Exit animation
        tl.to(
            [logoRef.current, textRef.current],
            {
                opacity: 0,
                scale: 0.8,
                y: -50,
                duration: 0.8,
                ease: "power2.in",
            },
            6,
        )

        tl.to(
            containerRef.current,
            {
                opacity: 0,
                duration: 0.5,
                ease: "power2.in",
            },
            6.5,
        )

        // Ensure the timeline completes
        tl.to(".flash-particle", {
            opacity: 0,
            scale: 0,
            duration: 0.5,
            ease: "power2.in",
        })

        tl.to(".flash-icon", {
            opacity: 0,
            scale: 0,
            duration: 0.5,
            ease: "power2.in",
        })

        // Call setIsFlashComplete at the end of the timeline
        tl.eventCallback("onComplete", () => {
            onComplete();
            setIsFlashCompleteState(true);
        })

        // Add cleanup to return
        return () => {
            // Cleanup GSAP animations
            if (tl.current) {
                tl.current.kill();
            }
        };
    }, [onComplete])

    return (
        <div
            ref={containerRef}
            className="fixed inset-0 z-[9999] bg-slate-950 flex items-center justify-center overflow-hidden"
        >
            {/* Animated Grid Background */}
            <div className="absolute inset-0 opacity-20">
                <div
                    className="absolute inset-0 bg-gradient-to-br from-lendr-400/10 via-transparent to-cyan-400/10"
                    style={{
                        backgroundImage: `
              linear-gradient(rgba(220, 243, 71, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(220, 243, 71, 0.1) 1px, transparent 1px)
              `,
                        backgroundSize: "50px 50px",
                    }}
                />
            </div>

            {/* Floating Particles */}
            <div ref={particlesRef} className="absolute inset-0 pointer-events-none">
                {particlePositions.map((pos, i) => (
                    <div
                        key={i}
                        className="flash-particle absolute w-2 h-2 bg-lendr-400 rounded-full opacity-0"
                        style={{
                            left: pos.left,
                            top: pos.top,
                            animationDelay: pos.delay,
                        }}
                    />
                ))}
            </div>

            {/* Floating DeFi Icons */}
            <div ref={iconsRef} className="absolute inset-0 pointer-events-none">
                {[{ Icon: TrendingUp, position: "top-20 left-20", color: "text-green-400" },
                { Icon: Shield, position: "top-32 right-24", color: "text-blue-400" },
                { Icon: Layers, position: "bottom-40 left-16", color: "text-purple-400" },
                { Icon: Database, position: "bottom-32 right-20", color: "text-cyan-400" },
                { Icon: Globe, position: "top-1/2 left-12", color: "text-orange-400" },
                { Icon: Cpu, position: "top-1/2 right-16", color: "text-pink-400" },
                { Icon: Star, position: "top-40 left-1/2", color: "text-yellow-400" }].map(({ Icon, position, color }, i) => (
                    <div key={i} className={`flash-icon absolute ${position} w-12 h-12 ${color} opacity-0`}>
                        <Icon className="w-full h-full" />
                    </div>
                ))}
            </div>

            {/* Main Content */}
            <div className="text-center relative z-10">
                {/* Logo */}
                <div ref={logoRef} className="mb-8 opacity-0">
                    <div className="relative">
                        {/* Outer rotating ring */}
                        <div className="absolute inset-0 w-32 h-32 mx-auto">
                            <div className="w-full h-full border-4 border-lendr-400/30 rounded-full animate-spin" />
                        </div>

                        {/* Inner rotating ring */}
                        <div className="absolute inset-4 w-24 h-24 mx-auto">
                            <div
                                className="w-full h-full border-4 border-cyan-400/30 rounded-full animate-spin"
                                style={{ animationDirection: "reverse" }}
                            />
                        </div>

                        {/* Center logo */}
                        <div className="relative w-32 h-32 mx-auto bg-gradient-to-br from-lendr-400 to-lendr-500 rounded-2xl flex items-center justify-center shadow-2xl">
                            <Zap className="w-16 h-16 text-slate-950" />

                            {/* Pulsing glow effect */}
                            <div className="absolute inset-0 bg-lendr-400 rounded-2xl opacity-30 animate-pulse" />
                        </div>
                    </div>
                </div>

                {/* Brand Text */}
                <div ref={textRef} className="mb-12 opacity-0">
                    <h1 className="text-6xl font-bold mb-4">
                        <span className="bg-gradient-to-r from-lendr-400 via-cyan-400 to-lendr-400 bg-clip-text text-transparent animate-pulse">
                            Lendr
                        </span>
                    </h1>
                    <p className="text-xl text-slate-400 mb-2">Decentralized NFT Lending Protocol</p>
                    <p className="text-sm text-slate-500">Powered by Advanced DeFi Infrastructure</p>
                </div>

                {/* Progress Bar */}
                <div className="w-80 mx-auto mb-6">
                    <div className="flex justify-between text-sm text-slate-400 mb-2">
                        <span>Initializing Protocol</span>
                        <span>{progress}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div
                            ref={progressRef}
                            className="h-full bg-gradient-to-r from-lendr-400 to-cyan-400 rounded-full transition-all duration-300"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>

                {/* Loading States */}
                <div className="text-xs text-slate-500 space-y-1">
                    <div className={`transition-opacity duration-300 ${progress > 20 ? "opacity-100" : "opacity-30"}`}>
                        ✓ Smart Contracts Loaded
                    </div>
                    <div className={`transition-opacity duration-300 ${progress > 40 ? "opacity-100" : "opacity-30"}`}>
                        ✓ Blockchain Connection Established
                    </div>
                    <div className={`transition-opacity duration-300 ${progress > 60 ? "opacity-100" : "opacity-30"}`}>
                        ✓ DeFi Protocols Initialized
                    </div>
                    <div className={`transition-opacity duration-300 ${progress > 80 ? "opacity-100" : "opacity-30"}`}>
                        ✓ NFT Marketplace Ready
                    </div>
                    <div className={`transition-opacity duration-300 ${progress > 95 ? "opacity-100" : "opacity-30"}`}>
                        ✓ Welcome to Lendr
                    </div>
                </div>
            </div>

            {/* Corner Decorations */}
            <div className="absolute top-8 left-8 w-16 h-16 border-l-2 border-t-2 border-lendr-400/30" />
            <div className="absolute top-8 right-8 w-16 h-16 border-r-2 border-t-2 border-lendr-400/30" />
            <div className="absolute bottom-8 left-8 w-16 h-16 border-l-2 border-b-2 border-lendr-400/30" />
            <div className="absolute bottom-8 right-8 w-16 h-16 border-r-2 border-b-2 border-lendr-400/30" />

            {/* Scanning Line Effect */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-lendr-400 to-transparent opacity-50 animate-pulse" />
                <div
                    className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-50 animate-pulse"
                    style={{ animationDelay: "1s" }}
                />
            </div>

            {/* Holographic Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-lendr-400/5 via-transparent to-cyan-400/5 pointer-events-none" />
        </div>
    )
}
