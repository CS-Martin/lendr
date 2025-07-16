'use client';

import { Card3D } from "@/components/shared/card-3d";
import { GridBackground } from "@/components/shared/grid-background";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { motion } from "framer-motion";
import { Filter, Grid, List, Search, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

const rentalPosts = [
    {
        rentalPostId: 1,
        posterAddress: "0x1234567890abcdef1234567890abcdef12345678",
        name: "Legendary Sword #1337",
        description: "Rare legendary sword from popular RPG game with fire enchantment",
        hourlyRate: 0.002,
        collateral: 0.2,
        isBiddable: true,
        biddingStarttime: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        biddingEndtime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
        isActive: true,
        statusCode: "AVAILABLE",
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(),
        // Additional display data
        image: "/placeholder.svg?height=300&width=300",
        category: "Gaming",
        rating: 4.8,
        currentBids: 12,
        highestBid: 0.0035,
        duration: "1-30 days",
    },
    {
        rentalPostId: 2,
        posterAddress: "0x9876543210fedcba9876543210fedcba98765432",
        name: "CryptoPunk #7890",
        description: "Classic CryptoPunk with rare attributes and sunglasses",
        hourlyRate: 0.006,
        collateral: 1.0,
        isBiddable: true,
        biddingStarttime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        biddingEndtime: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
        isActive: true,
        statusCode: "AVAILABLE",
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(),
        image: "/placeholder.svg?height=300&width=300",
        category: "Art",
        rating: 4.9,
        currentBids: 8,
        highestBid: 0.0075,
        duration: "1-7 days",
    },
    {
        rentalPostId: 3,
        posterAddress: "0x5555777755557777555577775555777755557777",
        name: "premium.eth",
        description: "Premium ENS domain name perfect for branding",
        hourlyRate: 0.0008,
        collateral: 0.5,
        isBiddable: false,
        biddingStarttime: null,
        biddingEndtime: null,
        isActive: true,
        statusCode: "RENTED",
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(),
        image: "/placeholder.svg?height=300&width=300",
        category: "Domain",
        rating: 4.7,
        currentBids: 0,
        highestBid: null,
        duration: "7-365 days",
    },
    {
        rentalPostId: 4,
        posterAddress: "0x1111222211112222111122221111222211112222",
        name: "Music Rights #001",
        description: "Commercial music licensing rights for popular track",
        hourlyRate: 0.0033,
        collateral: 0.3,
        isBiddable: true,
        biddingStarttime: new Date(Date.now() - 12 * 60 * 60 * 1000),
        biddingEndtime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        isActive: true,
        statusCode: "AVAILABLE",
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(),
        image: "/placeholder.svg?height=300&width=300",
        category: "Music",
        rating: 4.6,
        currentBids: 5,
        highestBid: 0.0038,
        duration: "1-90 days",
    },
    {
        rentalPostId: 5,
        posterAddress: "0x3333444433334444333344443333444433334444",
        name: "Virtual Land Plot",
        description: "Prime virtual real estate in popular metaverse world",
        hourlyRate: 0.005,
        collateral: 0.8,
        isBiddable: false,
        biddingStarttime: null,
        biddingEndtime: null,
        isActive: true,
        statusCode: "AVAILABLE",
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(),
        image: "/placeholder.svg?height=300&width=300",
        category: "Metaverse",
        rating: 4.8,
        currentBids: 0,
        highestBid: null,
        duration: "1-30 days",
    },
    {
        rentalPostId: 6,
        posterAddress: "0x6666888866668888666688886666888866668888",
        name: "Rare Trading Card",
        description: "Ultra-rare trading card for competitive play tournaments",
        hourlyRate: 0.00125,
        collateral: 0.15,
        isBiddable: true,
        biddingStarttime: new Date(Date.now() - 6 * 60 * 60 * 1000),
        biddingEndtime: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
        isActive: true,
        statusCode: "AVAILABLE",
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(),
        image: "/placeholder.svg?height=300&width=300",
        category: "Gaming",
        rating: 4.5,
        currentBids: 15,
        highestBid: 0.00188,
        duration: "1-14 days",
    },
]

const categories = ["All", "Gaming", "Art", "Domain", "Music", "Metaverse"]

export default function MarketplacePage() {
    const [searchTerm, setSearchTerm] = useState("")
    const [selectedCategory, setSelectedCategory] = useState("All")
    const [priceRange, setPriceRange] = useState([0, 0.01])
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
    const [showFilters, setShowFilters] = useState(false)
    const [availableOnly, setAvailableOnly] = useState(false)

    const filteredRentalPosts = rentalPosts.filter((post) => {
        const matchesSearch =
            post.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            post.category.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesCategory = selectedCategory === "All" || post.category === selectedCategory
        const matchesPrice = post.hourlyRate >= priceRange[0] && post.hourlyRate <= priceRange[1]
        const matchesAvailability = !availableOnly || post.statusCode === "AVAILABLE"

        return matchesSearch && matchesCategory && matchesPrice && matchesAvailability
    })

    return (
        <div className="min-h-screen bg-slate-950 overflow-hidden">

            <div className="relative px-4 md:px-0 mt-30">
                <GridBackground />

                <div className="max-w-[90rem] mx-auto">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-4xl font-bold text-white mb-2">NFT Lending Marketplace</h1>
                        <p className="text-slate-400">Discover and lend premium NFT assets</p>
                    </div>

                    {/* Search and Filters */}
                    <div className="mb-8 space-y-4">
                        <div className="flex flex-col lg:flex-row gap-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                                <Input
                                    placeholder="Search NFTs, categories, or merchants..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10 bg-slate-900/50 border-slate-700 text-white placeholder-slate-400"
                                />
                            </div>

                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    onClick={() => setShowFilters(!showFilters)}
                                    className="border-slate-700 text-slate-300 hover:bg-slate-800"
                                >
                                    <Filter className="w-4 h-4 mr-2" />
                                    Filters
                                </Button>

                                <div className="flex border border-slate-700 rounded-md">
                                    <Button
                                        variant={viewMode === "grid" ? "default" : "ghost"}
                                        size="sm"
                                        onClick={() => setViewMode("grid")}
                                        className={viewMode === "grid" ? "bg-purple-600 text-white" : "text-slate-400 hover:text-white"}
                                    >
                                        <Grid className="w-4 h-4" />
                                    </Button>
                                    <Button
                                        variant={viewMode === "list" ? "default" : "ghost"}
                                        size="sm"
                                        onClick={() => setViewMode("list")}
                                        className={viewMode === "list" ? "bg-purple-600 text-white" : "text-slate-400 hover:text-white"}
                                    >
                                        <List className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* Filter Panel */}
                        {showFilters && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className="bg-slate-900/50 border border-slate-800 rounded-lg p-6"
                            >
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                    <div>
                                        <label className="text-sm font-medium text-white mb-2 block">Category</label>
                                        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                                            <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="bg-slate-800 border-slate-700">
                                                {categories.map((category) => (
                                                    <SelectItem key={category} value={category} className="text-white">
                                                        {category}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div>
                                        <label className="text-sm font-medium text-white mb-2 block">
                                            Price Range (ETH/hour): {priceRange[0]} - {priceRange[1]}
                                        </label>
                                        <Slider
                                            value={priceRange}
                                            onValueChange={setPriceRange}
                                            max={0.01}
                                            min={0}
                                            step={0.0001}
                                            className="mt-2"
                                        />
                                    </div>

                                    <div>
                                        <label className="text-sm font-medium text-white mb-2 block">Sort By</label>
                                        <Select defaultValue="price-low">
                                            <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="bg-slate-800 border-slate-700">
                                                <SelectItem value="price-low" className="text-white">
                                                    Price: Low to High
                                                </SelectItem>
                                                <SelectItem value="price-high" className="text-white">
                                                    Price: High to Low
                                                </SelectItem>
                                                <SelectItem value="rating" className="text-white">
                                                    Highest Rated
                                                </SelectItem>
                                                <SelectItem value="newest" className="text-white">
                                                    Newest First
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        <Checkbox id="available" checked={availableOnly} onCheckedChange={setAvailableOnly} />
                                        <label htmlFor="available" className="text-sm text-white">
                                            Available only
                                        </label>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </div>

                    {/* Results Count */}
                    <div className="mb-6 text-slate-400">
                        Showing {filteredRentalPosts.length} of {rentalPosts.length} NFTs
                    </div>

                    {/* NFT Grid/List */}
                    <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 pb-30" : "space-y-4"}>
                        {filteredRentalPosts.map((post, index) => (
                            <motion.div
                                key={post.rentalPostId}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                            >
                                {viewMode === "grid" ? (
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

                                                <Badge
                                                    className={`absolute top-4 right-4 ${post.isActive ? "bg-green-500" : "bg-red-500"} shadow-lg`}
                                                >
                                                    {post.isActive ? "Available" : "Locked"}
                                                </Badge>
                                                <Badge className="absolute top-4 left-4 bg-lendr-400 text-slate-950 font-semibold shadow-lg">
                                                    {post.category}
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
                                                    {post.name}
                                                </h3>

                                                <div className="grid grid-cols-2 gap-4 mb-4">
                                                    <div>
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
                                                    </div>
                                                    <div>
                                                        <div className="text-sm text-slate-400">Collateral</div>
                                                        <div className="text-lg font-bold text-cyan-400">{post.collateral} ETH</div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-between mb-6">
                                                    <div className="flex items-center space-x-1">
                                                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                                                        <span className="text-sm text-slate-300">{post.rating}</span>
                                                    </div>
                                                    <div className="text-sm text-slate-400 font-mono">{post.posterAddress}</div>
                                                </div>

                                                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                                    <Button
                                                        className="w-full bg-gradient-to-r from-lendr-400 to-lendr-500 hover:from-lendr-500 hover:to-lendr-600 text-slate-950 border-0 font-bold shadow-lg shadow-lendr-400/30 hover:shadow-lendr-400/50 transition-all duration-300"
                                                        disabled={!post.isActive}
                                                    >
                                                        {post.isActive ? "Enter Pool" : "Pool Locked"}
                                                    </Button>
                                                </motion.div>
                                            </div>
                                        </motion.div>
                                    </Card3D>
                                ) : (
                                    <>
                                        div
                                    </>
                                    // <Card className="bg-slate-900/50 border-slate-800 hover:border-purple-500/50 transition-all duration-300">
                                    //     <CardContent className="p-6">
                                    //         <div className="flex items-center space-x-6">
                                    //             <div className="relative">
                                    //                 <Image
                                    //                     src={post.image || "/placeholder.svg"}
                                    //                     alt={post.name}
                                    //                     width={120}
                                    //                     height={120}
                                    //                     className="w-24 h-24 object-cover rounded-lg"
                                    //                 />
                                    //                 <Badge
                                    //                     className={`absolute -top-2 -right-2 ${post.statusCode === "AVAILABLE" ? "bg-green-500" : "bg-red-500"}`}
                                    //                 >
                                    //                     {post.statusCode === "AVAILABLE" ? "Available" : "Rented"}
                                    //                 </Badge>
                                    //                 {post.isBiddable && (
                                    //                     <Badge className="absolute -bottom-2 -right-2 bg-orange-500 text-xs">Bidding</Badge>
                                    //                 )}
                                    //             </div>

                                    //             <div className="flex-1">
                                    //                 <div className="flex items-center space-x-2 mb-2">
                                    //                     <h3 className="text-lg font-semibold text-white">{post.name}</h3>
                                    //                     <Badge className="bg-purple-500">{post.category}</Badge>
                                    //                 </div>
                                    //                 <p className="text-sm text-slate-400 mb-3">{post.description}</p>

                                    //                 <div className="flex items-center space-x-6 text-sm">
                                    //                     <div className="flex items-center space-x-1">
                                    //                         <Star className="w-4 h-4 text-yellow-400 fill-current" />
                                    //                         <span className="text-slate-300">{post.rating}</span>
                                    //                     </div>
                                    //                     <div className="flex items-center space-x-1 text-slate-400">
                                    //                         <Clock className="w-4 h-4" />
                                    //                         <span>{post.duration}</span>
                                    //                     </div>
                                    //                     {post.isBiddable && (
                                    //                         <div className="flex items-center space-x-1 text-orange-400">
                                    //                             <Users className="w-4 h-4" />
                                    //                             <span>{post.currentBids} bids</span>
                                    //                         </div>
                                    //                     )}
                                    //                     <div className="flex items-center space-x-1 text-slate-400">
                                    //                         <Shield className="w-4 h-4" />
                                    //                         <span>{post.collateral} ETH collateral</span>
                                    //                     </div>
                                    //                 </div>
                                    //             </div>

                                    //             <div className="text-right">
                                    //                 {post.isBiddable ? (
                                    //                     <div>
                                    //                         <div className="text-sm text-slate-400 mb-1">Highest Bid</div>
                                    //                         <div className="text-2xl font-bold text-green-400 mb-1">{post.highestBid} ETH/hr</div>
                                    //                         <div className="text-xs text-orange-400 mb-4">
                                    //                             {Math.ceil((post.biddingEndtime?.getTime() - Date.now()) / (1000 * 60 * 60 * 24))} days
                                    //                             left
                                    //                         </div>
                                    //                     </div>
                                    //                 ) : (
                                    //                     <div>
                                    //                         <div className="text-2xl font-bold text-purple-400 mb-1">{post.hourlyRate} ETH</div>
                                    //                         <div className="text-sm text-slate-400 mb-4">per hour</div>
                                    //                     </div>
                                    //                 )}
                                    //                 <Link href={`/nft/${post.rentalPostId}`}>
                                    //                     <Button
                                    //                         className={`border-0 ${post.isBiddable
                                    //                             ? "bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700"
                                    //                             : "bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700"
                                    //                             } text-white`}
                                    //                         disabled={post.statusCode !== "AVAILABLE"}
                                    //                     >
                                    //                         {post.statusCode === "AVAILABLE"
                                    //                             ? post.isBiddable
                                    //                                 ? "Place Bid"
                                    //                                 : "Lend Now"
                                    //                             : "Currently Rented"}
                                    //                     </Button>
                                    //                 </Link>
                                    //             </div>
                                    //         </div>
                                    //     </CardContent>
                                    // </Card>
                                )}
                            </motion.div>
                        ))}
                    </div>

                    {filteredRentalPosts.length === 0 && (
                        <div className="text-center py-12">
                            <div className="text-slate-400 text-lg mb-4">No NFTs found matching your criteria</div>
                            <Button
                                onClick={() => {
                                    setSearchTerm("")
                                    setSelectedCategory("All")
                                    setPriceRange([0, 0.01])
                                    setAvailableOnly(false)
                                }}
                                variant="outline"
                                className="border-slate-700 text-slate-300 hover:bg-slate-800"
                            >
                                Clear Filters
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
