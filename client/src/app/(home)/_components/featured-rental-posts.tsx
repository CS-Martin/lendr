import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { Star } from "lucide-react"
import { Card3D } from '../../../components/shared/card-3d';
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { HolographicText } from "../../../components/shared/holographic-text";
import LendrButton from "@/components/shared/lendr-btn";

const featuredNFTs = [
    {
        id: 1,
        title: "Legendary Sword #1337",
        category: "Gaming",
        image: "/placeholder.svg?height=300&width=300",
        pricePerDay: "0.05",
        collateral: "0.2",
        merchant: "0x1234...5678",
        rating: 4.8,
        available: true,
    },
    {
        id: 2,
        title: "CryptoPunk #7890",
        category: "Art",
        image: "/placeholder.svg?height=300&width=300",
        pricePerDay: "0.15",
        collateral: "1.0",
        merchant: "0x9876...5432",
        rating: 4.9,
        available: true,
    },
    {
        id: 3,
        title: "premium.eth",
        category: "Domain",
        image: "/placeholder.svg?height=300&width=300",
        pricePerDay: "0.02",
        collateral: "0.5",
        merchant: "0x5555...7777",
        rating: 4.7,
        available: false,
    },
]

export const FeaturedRentalPosts = () => {
    return (
        <section className="container mx-auto py-32 relative">
            <motion.div
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
                className="text-center mb-20"
            >
                <HolographicText className="text-3xl md:text-5xl font-bold text-white mb-6">Premium Asset Pools</HolographicText>
                <p className="text-slate-400 text-xl max-w-3xl mx-auto font-mono">
                    Discover high-yield NFT assets in our curated liquidity pools with institutional-grade security
                </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {featuredNFTs.map((nft, index) => (
                    <motion.div
                        key={nft.id}
                        initial={{ opacity: 0, y: 50, rotateY: -30 }}
                        whileInView={{ opacity: 1, y: 0, rotateY: 0 }}
                        transition={{ duration: 0.8, delay: index * 0.1 }}
                        viewport={{ once: true }}
                    >
                        <Card3D className="group">
                            <motion.div
                                className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-xl border border-slate-700/50 hover:border-lendr-400/50 rounded-3xl overflow-hidden shadow-2xl hover:shadow-lendr-400/30 transition-all duration-500"
                                whileHover={{
                                    y: -15,
                                    boxShadow: "0 25px 80px rgba(220, 243, 71, 0.25)",
                                }}
                            >
                                <div className="relative overflow-hidden">
                                    <motion.div whileHover={{ scale: 1.1 }} transition={{ duration: 0.5 }}>
                                        <Image
                                            src={nft.image || "/placeholder.svg"}
                                            alt={nft.title}
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

                                    <Badge
                                        className={`absolute top-4 right-4 ${nft.available ? "bg-green-500" : "bg-red-500"} shadow-lg`}
                                    >
                                        {nft.available ? "Available" : "Locked"}
                                    </Badge>
                                    <Badge className="absolute top-4 left-4 bg-lendr-400 text-slate-950 font-semibold shadow-lg">
                                        {nft.category}
                                    </Badge>

                                    {/* Animated yield indicator */}
                                    <motion.div
                                        className="absolute bottom-4 right-4 bg-gradient-to-r from-green-400 to-lendr-400 text-slate-950 px-3 py-1 rounded-full text-sm font-bold shadow-lg"
                                        animate={{
                                            scale: [1, 1.1, 1],
                                            boxShadow: [
                                                "0 0 10px rgba(34, 197, 94, 0.5)",
                                                "0 0 20px rgba(34, 197, 94, 0.8)",
                                                "0 0 10px rgba(34, 197, 94, 0.5)",
                                            ],
                                        }}
                                        transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                                    >
                                        +12.5% APY
                                    </motion.div>
                                </div>

                                <div className="p-6">
                                    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-lendr-400 transition-colors duration-300">
                                        {nft.title}
                                    </h3>

                                    <div className="grid grid-cols-2 gap-4 mb-4">
                                        <div>
                                            <div className="text-sm text-slate-400">Floor Price</div>
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
                                                {nft.pricePerDay} ETH
                                            </motion.div>
                                        </div>
                                        <div>
                                            <div className="text-sm text-slate-400">Collateral</div>
                                            <div className="text-lg font-bold text-cyan-400">{nft.collateral} ETH</div>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between mb-6">
                                        <div className="flex items-center space-x-1">
                                            <Star className="w-4 h-4 text-yellow-400 fill-current" />
                                            <span className="text-sm text-slate-300">{nft.rating}</span>
                                        </div>
                                        <div className="text-sm text-slate-400 font-mono">{nft.merchant}</div>
                                    </div>

                                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                        <Button
                                            className="w-full bg-gradient-to-r from-lendr-400 to-lendr-500 hover:from-lendr-500 hover:to-lendr-600 text-slate-950 border-0 font-bold shadow-lg shadow-lendr-400/30 hover:shadow-lendr-400/50 transition-all duration-300"
                                            disabled={!nft.available}
                                        >
                                            {nft.available ? "Enter Pool" : "Pool Locked"}
                                        </Button>
                                    </motion.div>
                                </div>
                            </motion.div>
                        </Card3D>
                    </motion.div>
                ))}
            </div>

            <motion.div
                className="text-center mt-16"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.8 }}
                viewport={{ once: true }}
            >
                <LendrButton link="/marketplace" variant="outline" size="lg" className="p-6 px-10">Explore Marketplace</LendrButton>
            </motion.div>
        </section>
    )
}