"use client"

import Image from "next/image"
import { motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Star, Heart, Share2 } from "lucide-react"
import { useState, useRef, useEffect } from "react"
import { gsap } from "gsap"
import { Card3D } from "../card-3d"

interface RentalPostProps {
    post: {
        rentalPostId: number
        posterAddress: string
        name: string
        description: string
        hourlyRate: number
        collateral: number
        isBiddable: boolean
        biddingStarttime: Date | null
        biddingEndtime: Date | null
        isActive: boolean
        statusCode: string
        createdAt: Date
        updatedAt: Date
        image: string
        category: string
        rating: number
        currentBids: number
        highestBid: number | null
        duration: string
    }
}

export const RentalPostCard = ({ post }: RentalPostProps) => {
    const [isLiked, setIsLiked] = useState(false)
    const cardRef = useRef<HTMLDivElement>(null)
    const imageRef = useRef<HTMLDivElement>(null)
    const apyRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (typeof window === "undefined") return

        // Floating animation for APY badge
        if (apyRef.current) {
            gsap.to(apyRef.current, {
                y: -5,
                duration: 2,
                ease: "power2.inOut",
                yoyo: true,
                repeat: -1,
            })
        }

        // Subtle glow animation
        const tl = gsap.timeline({ repeat: -1, yoyo: true })
        tl.to(cardRef.current, {
            boxShadow: "0 0 30px rgba(220, 243, 71, 0.1)",
            duration: 3,
            ease: "power2.inOut",
        })

        return () => {
            tl.kill()
        }
    }, [])

    const handleLike = () => {
        setIsLiked(!isLiked)

        // Animate heart
        if (typeof window !== "undefined") {
            gsap.fromTo(
                ".heart-icon",
                { scale: 1 },
                {
                    scale: 1.3,
                    duration: 0.2,
                    ease: "power2.out",
                    yoyo: true,
                    repeat: 1,
                },
            )
        }
    }

    return (
        <Card3D className="group">
            <motion.div
                ref={cardRef}
                className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-xl border border-slate-700/50 hover:border-lendr-400/50 rounded-3xl overflow-hidden shadow-2xl hover:shadow-lendr-400/30 transition-all duration-500"
                whileHover={{
                    y: -15,
                    boxShadow: "0 25px 80px rgba(220, 243, 71, 0.25)",
                }}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
                <div className="relative overflow-hidden">
                    <motion.div ref={imageRef} whileHover={{ scale: 1.1 }} transition={{ duration: 0.5 }}>
                        <Image
                            src={post.image || "/placeholder.svg"}
                            alt={post.name}
                            width={400}
                            height={300}
                            className="w-full h-64 object-cover"
                        />
                    </motion.div>

                    {/* Holographic overlay */}
                    <motion.div
                        className="absolute inset-0 bg-gradient-to-br from-lendr-400/20 via-transparent to-cyan-400/20 opacity-0 group-hover:opacity-100"
                        transition={{ duration: 0.3 }}
                    />

                    {/* Interactive overlay buttons */}
                    <div className="absolute top-4 right-4 flex flex-col space-y-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <motion.button
                            onClick={handleLike}
                            className="p-2 bg-black/50 backdrop-blur-sm rounded-full hover:bg-black/70 transition-colors"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <Heart
                                className={`heart-icon w-4 h-4 transition-colors ${isLiked ? "text-red-500 fill-current" : "text-white"}`}
                            />
                        </motion.button>
                        <motion.button
                            className="p-2 bg-black/50 backdrop-blur-sm rounded-full hover:bg-black/70 transition-colors"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <Share2 className="w-4 h-4 text-white" />
                        </motion.button>
                    </div>

                    {/* Status and Category Badges */}
                    <div className="absolute top-4 left-4 flex flex-col space-y-2">
                        <motion.div initial={{ x: -50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
                            <Badge className={`${post.isActive ? "bg-green-500" : "bg-red-500"} shadow-lg`}>
                                {post.isActive ? "Available" : "Locked"}
                            </Badge>
                        </motion.div>
                        <motion.div initial={{ x: -50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.3 }}>
                            <Badge className="bg-lendr-400 text-slate-950 font-semibold shadow-lg">{post.category}</Badge>
                        </motion.div>
                    </div>


                </div>

                <div className="p-6">
                    <motion.h3
                        className="text-xl font-bold text-white mb-2 group-hover:text-lendr-400 transition-colors duration-300"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                    >
                        {post.name}
                    </motion.h3>

                    <motion.p
                        className="text-sm text-slate-400 mb-4 line-clamp-2"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                    >
                        {post.description}
                    </motion.p>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 }}>
                            <div className="text-sm text-slate-400">Hourly Rate</div>
                            <motion.div
                                className="text-lg font-bold text-lendr-400"
                                animate={{
                                    textShadow: [
                                        "0 0 5px rgba(220, 243, 71, 0.5)",
                                        "0 0 10px rgba(220, 243, 71, 0.8)",
                                        "0 0 5px rgba(220, 243, 71, 0.5)",
                                    ],
                                }}
                                transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                            >
                                {post.hourlyRate} ETH
                            </motion.div>
                        </motion.div>
                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.7 }}>
                            <div className="text-sm text-slate-400">Collateral</div>
                            <div className="text-lg font-bold text-cyan-400">{post.collateral} ETH</div>
                        </motion.div>
                    </div>

                    <motion.div
                        className="flex items-center justify-between mb-6"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.8 }}
                    >
                        <div className="flex items-center space-x-1">
                            <Star className="w-4 h-4 text-yellow-400 fill-current" />
                            <span className="text-sm text-slate-300">{post.rating}</span>
                            <span className="text-xs text-slate-500">({post.currentBids} bids)</span>
                        </div>
                        <div className="text-xs text-slate-400 font-mono">
                            {post.posterAddress.slice(0, 6)}...{post.posterAddress.slice(-4)}
                        </div>
                    </motion.div>

                    <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.9 }}
                    >
                        <Button
                            className="w-full bg-gradient-to-r from-lendr-400 to-lendr-500 hover:from-lendr-500 hover:to-lendr-600 text-slate-950 border-0 font-bold shadow-lg shadow-lendr-400/30 hover:shadow-lendr-400/50 transition-all duration-300 relative overflow-hidden"
                            disabled={!post.isActive}
                        >
                            <motion.div
                                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                                initial={{ x: "-100%" }}
                                whileHover={{ x: "100%" }}
                                transition={{ duration: 0.6 }}
                            />
                            <span className="relative z-10">{post.isActive ? "Enter Pool" : "Pool Locked"}</span>
                        </Button>
                    </motion.div>
                </div>
            </motion.div>
        </Card3D>
    )
}
