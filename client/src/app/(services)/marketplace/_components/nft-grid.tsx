"use client"

import { motion, AnimatePresence } from "framer-motion"
import { RentalPostCard } from "@/components/shared/rental-post/rental-post-card"

interface NFTGridProps {
    posts: any[]
    viewMode: "grid" | "list"
    isInView: boolean
}

export function NFTGrid({ posts, viewMode, isInView }: NFTGridProps) {
    return (
        <motion.div
            className={`grid gap-6 ${viewMode === "grid" ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-4" : "grid-cols-1"
                }`}
            layout
        >
            <AnimatePresence mode="popLayout">
                {posts.map((post, index) => (
                    <motion.div
                        key={post.rentalPostId}
                        className="nft-card"
                        initial={{ opacity: 0, y: 50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -50, scale: 0.9 }}
                        transition={{
                            duration: 0.5,
                            delay: isInView ? index * 0.1 : 0,
                        }}
                        whileHover={{ y: -5 }}
                    >
                        <RentalPostCard post={post} />
                    </motion.div>
                ))}
            </AnimatePresence>
        </motion.div>
    )
}
