"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence, useInView } from "framer-motion"
import { Checkbox } from "@/components/ui/checkbox"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { NFTGrid } from "@/app/(services)/marketplace/_components/nft-grid"
import { ViewModeToggle } from "@/app/(services)/marketplace/_components/view-mode-toggle"
import { SearchBar } from "@/app/(services)/marketplace/_components/search-bar"
import { ActiveFilters } from "@/app/(services)/marketplace/_components/ActiveFilters"
import { FilterHeader } from "@/app/(services)/marketplace/_components/filter-header"
import { FilterSection } from "@/app/(services)/marketplace/_components/filter-section"
import { EmptyState } from "./_components/empty-state"

// Register GSAP plugins
if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger)
}

// Updated to match Prisma schema with more diverse data
const rentalPosts = [
    {
        rentalPostId: 1,
        posterAddress: "0x1234567890abcdef1234567890abcdef12345678",
        name: "Legendary Sword #1337",
        description: "Rare legendary sword from popular RPG game with fire enchantment",
        hourlyRate: 0.002,
        collateral: 0.2,
        isBiddable: true,
        biddingStarttime: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        biddingEndtime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        isActive: true,
        statusCode: "AVAILABLE",
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(),
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
        category: "Digital Art",
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
        category: "Crypto",
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
        category: "Gaming",
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
    {
        rentalPostId: 7,
        posterAddress: "0x7777999977779999777799997777999977779999",
        name: "Digital Photography #42",
        description: "Award-winning digital photography NFT with exclusive rights",
        hourlyRate: 0.0015,
        collateral: 0.25,
        isBiddable: true,
        biddingStarttime: new Date(Date.now() - 8 * 60 * 60 * 1000),
        biddingEndtime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        isActive: true,
        statusCode: "FEATURED",
        createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(),
        image: "/placeholder.svg?height=300&width=300",
        category: "Photography",
        rating: 4.7,
        currentBids: 7,
        highestBid: 0.0022,
        duration: "1-21 days",
    },
    {
        rentalPostId: 8,
        posterAddress: "0x8888aaaa8888aaaa8888aaaa8888aaaa8888aaaa",
        name: "Typography Art #256",
        description: "Modern typography art piece with commercial licensing",
        hourlyRate: 0.0009,
        collateral: 0.12,
        isBiddable: false,
        biddingStarttime: null,
        biddingEndtime: null,
        isActive: true,
        statusCode: "NEW",
        createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
        updatedAt: new Date(),
        image: "/placeholder.svg?height=300&width=300",
        category: "Typo",
        rating: 4.4,
        currentBids: 0,
        highestBid: null,
        duration: "1-60 days",
    },
    {
        rentalPostId: 9,
        posterAddress: "0x9999bbbb9999bbbb9999bbbb9999bbbb9999bbbb",
        name: "Metaverse Avatar #1024",
        description: "Customizable metaverse avatar with rare traits and accessories",
        hourlyRate: 0.0045,
        collateral: 0.6,
        isBiddable: true,
        biddingStarttime: new Date(Date.now() - 3 * 60 * 60 * 1000),
        biddingEndtime: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
        isActive: true,
        statusCode: "AVAILABLE",
        createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(),
        image: "/placeholder.svg?height=300&width=300",
        category: "Gaming",
        rating: 4.9,
        currentBids: 23,
        highestBid: 0.0052,
        duration: "1-14 days",
    },
]

// Filter options matching the reference image
const statusFilters = [
    { id: "buy-now", label: "Buy now", count: 156 },
    { id: "on-auction", label: "On auction", count: 87 },
    { id: "new", label: "New", count: 23 },
    { id: "featured", label: "Featured", count: 12 },
]

const collectionFilters = [
    { id: "digital-art", label: "Digital Art", count: 234 },
    { id: "gaming", label: "Gaming", count: 189 },
    { id: "gaming-2", label: "Gaming", count: 156 },
    { id: "music", label: "Music", count: 98 },
    { id: "photography", label: "Photography", count: 76 },
    { id: "typo", label: "Typo", count: 45 },
    { id: "crypto", label: "Crypto", count: 123 },
]

const priceFilters = [
    { id: "0-100", label: "$0 - $100", count: 45 },
    { id: "100-200", label: "$100 - $200", count: 67 },
    { id: "200-300", label: "$200 - $300", count: 89 },
    { id: "300-400", label: "$300 - $400", count: 34 },
    { id: "400-500", label: "$400 - $500", count: 23 },
    { id: "500-600", label: "$500 - $600", count: 12 },
    { id: "600-plus", label: "Over $600", count: 8 },
]

const chainFilters = [
    { id: "bitcoin", label: "Bitcoin", count: 45 },
    { id: "ethereum", label: "Ethereum", count: 234 },
    { id: "cardano", label: "Cardano", count: 67 },
    { id: "solana", label: "Solana", count: 89 },
    { id: "litecoin", label: "Litecoin", count: 23 },
]

export default function MarketplacePage() {
    const [searchTerm, setSearchTerm] = useState("")
    const [selectedFilters, setSelectedFilters] = useState<string[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
    const [sidebarOpen, setSidebarOpen] = useState(true)
    const sidebarRef = useRef<HTMLDivElement>(null)
    const gridRef = useRef<HTMLDivElement>(null)
    const headerRef = useRef<HTMLDivElement>(null)
    const isInView = useInView(gridRef, { once: true, margin: "-100px" })


    const toggleFilter = (filterId: string) => {
        if (selectedFilters.includes(filterId)) {
            setSelectedFilters(selectedFilters.filter((id) => id !== filterId))
        } else {
            setSelectedFilters([...selectedFilters, filterId])
        }
    }

    const clearAllFilters = () => {
        setSelectedFilters([])
        setSearchTerm("")

        // Animate clear action
        gsap.to(".filter-badge", {
            scale: 0,
            duration: 0.2,
            stagger: 0.02,
            ease: "power2.in",
            onComplete: () => {
                setSelectedFilters([])
            },
        })
    }

    const filteredRentalPosts = rentalPosts.filter((post) => {
        const matchesSearch =
            post.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            post.category.toLowerCase().includes(searchTerm.toLowerCase())

        const matchesFilters =
            selectedFilters.length === 0 ||
            selectedFilters.some((filter) => {
                if (filter === "buy-now") return !post.isBiddable
                if (filter === "on-auction") return post.isBiddable
                if (filter === "new") return post.statusCode === "NEW"
                if (filter === "featured") return post.statusCode === "FEATURED"
                if (filter === "digital-art") return post.category === "Digital Art"
                if (filter === "gaming" || filter === "gaming-2") return post.category === "Gaming"
                if (filter === "music") return post.category === "Music"
                if (filter === "photography") return post.category === "Photography"
                if (filter === "typo") return post.category === "Typo"
                if (filter === "crypto") return post.category === "Crypto"
                return false
            })

        return matchesSearch && matchesFilters
    })

    return (
        <div className="min-h-screen bg-slate-950 overflow-hidden">
            <div className="flex mt-20">
                {/* Left Sidebar - Filters */}
                <AnimatePresence>
                    {sidebarOpen && (
                        <motion.div
                            ref={sidebarRef}
                            className="w-64 p-6 space-y-8 border-r border-slate-800/50 fixed md:relative h-full md:h-auto z-40 overflow-y-auto"
                            initial={{ x: -300, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: -300, opacity: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            <FilterHeader
                                onToggleSidebar={() => setSidebarOpen(false)}
                                isMobile={true}
                            />

                            <ActiveFilters
                                selectedFilters={selectedFilters}
                                onClearAll={clearAllFilters}
                                onRemoveFilter={toggleFilter}
                            />

                            {/* Filter Sections */}
                            <FilterSection
                                title="Status"
                                filters={statusFilters}
                                selectedFilters={selectedFilters}
                                onToggleFilter={toggleFilter}
                            />
                            <FilterSection
                                title="Collection"
                                filters={collectionFilters}
                                selectedFilters={selectedFilters}
                                onToggleFilter={toggleFilter}
                            />
                            <FilterSection
                                title="Filter by price"
                                filters={priceFilters}
                                selectedFilters={selectedFilters}
                                onToggleFilter={toggleFilter}
                            />
                            <FilterSection
                                title="Chains"
                                filters={chainFilters}
                                selectedFilters={selectedFilters}
                                onToggleFilter={toggleFilter}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Main Content */}
                <div className="flex-1 p-6">
                    {/* Search and Controls */}
                    <div className="mb-8 space-y-4">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                            <SearchBar
                                searchTerm={searchTerm}
                                setSearchTerm={setSearchTerm}
                            />
                            <ViewModeToggle
                                viewMode={viewMode}
                                setViewMode={setViewMode}
                            />
                        </div>

                        {/* Results Count */}
                        <motion.div
                            className="text-slate-400 flex items-center justify-between"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.4 }}
                        >
                            <span>
                                Showing {filteredRentalPosts.length} of {rentalPosts.length} NFTs
                            </span>
                            <motion.div
                                className="text-xs text-gray-500"
                                animate={{ opacity: [0.5, 1, 0.5] }}
                                transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                            >
                                Live updates
                            </motion.div>
                        </motion.div>
                    </div>

                    {/* NFT Grid */}
                    <NFTGrid
                        posts={filteredRentalPosts}
                        viewMode={viewMode}
                        isInView={isInView}
                    />

                    {/* Empty State */}
                    {filteredRentalPosts.length === 0 && (
                        <EmptyState
                            onClearFilters={clearAllFilters}
                        />
                    )}
                </div>
            </div>

            {/* Mobile Overlay */}
            <AnimatePresence>
                {sidebarOpen && (
                    <motion.div
                        className="fixed inset-0 bg-black/50 z-30 md:hidden"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setSidebarOpen(false)}
                    />
                )}
            </AnimatePresence>
        </div>
    )

}
