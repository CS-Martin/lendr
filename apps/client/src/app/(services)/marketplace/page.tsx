'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ViewModeToggle } from '@/app/(services)/marketplace/_components/view-mode-toggle';
import { SearchBar } from '@/app/(services)/marketplace/_components/search-bar';
import { FilterHeader } from '@/app/(services)/marketplace/_components/filter-header';
import { FilterSection } from '@/app/(services)/marketplace/_components/filter-section';
import { EmptyState } from './_components/empty-state';
import { useFindAllRentalPost } from '@/hooks/useRentalPost';
import { RentalPostDetailsModal } from './_components/rental-post-details-modal';
import { ActiveFilters } from './_components/active-filters';
import { RentalPostCard } from '@/components/shared/rental-post/rental-post-card';
import { RentalPostDto } from '@repo/shared-dtos';
import { useSession } from 'next-auth/react';

// Register GSAP plugins
if (typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
}

// Filter options matching the reference image
const statusFilters = [
    { id: 'buy-now', label: 'Buy now', count: 156 },
    { id: 'on-auction', label: 'On auction', count: 87 },
    { id: 'new', label: 'New', count: 23 },
    { id: 'featured', label: 'Featured', count: 12 },
];

const collectionFilters = [
    { id: 'digital-art', label: 'Digital Art', count: 234 },
    { id: 'gaming', label: 'Gaming', count: 189 },
    { id: 'music', label: 'Music', count: 98 },
    { id: 'photography', label: 'Photography', count: 76 },
    { id: 'crypto', label: 'Crypto', count: 123 },
];

const priceFilters = [
    { id: '0-100', label: '$0 - $100', count: 45 },
    { id: '100-200', label: '$100 - $200', count: 67 },
    { id: '200-300', label: '$200 - $300', count: 89 },
    { id: '300-400', label: '$300 - $400', count: 34 },
    { id: '400-500', label: '$400 - $500', count: 23 },
    { id: '500-600', label: '$500 - $600', count: 12 },
    { id: '600-plus', label: 'Over $600', count: 8 },
];

const chainFilters = [
    { id: 'bitcoin', label: 'Bitcoin', count: 45 },
    { id: 'ethereum', label: 'Ethereum', count: 234 },
    { id: 'cardano', label: 'Cardano', count: 67 },
    { id: 'solana', label: 'Solana', count: 89 },
    { id: 'litecoin', label: 'Litecoin', count: 23 },
];

export default function MarketplacePage() {
    const { data: session } = useSession();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedRentalPost, setSelectedRentalPost] = useState<RentalPostDto | null>(null);

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const sidebarRef = useRef<HTMLDivElement>(null);
    const gridRef = useRef<HTMLDivElement>(null);
    const isInView = useInView(gridRef, { once: true, margin: '-100px' });

    const toggleFilter = (filterId: string) => {
        if (selectedFilters.includes(filterId)) {
            setSelectedFilters(selectedFilters.filter((id) => id !== filterId));
        } else {
            setSelectedFilters([...selectedFilters, filterId]);
        }
    };

    const { rentalPosts } = useFindAllRentalPost();

    const clearAllFilters = () => {
        setSelectedFilters([]);
        setSearchTerm('');

        // Animate clear action
        gsap.to('.filter-badge', {
            scale: 0,
            duration: 0.2,
            stagger: 0.02,
            ease: 'power2.in',
            onComplete: () => {
                setSelectedFilters([]);
            },
        });
    };

    const handleViewRentalPost = (post: RentalPostDto) => {
        setSelectedRentalPost(post);
        setIsModalOpen(true);
    };

    const filteredRentalPosts = rentalPosts.filter((post) => {
        const matchesSearch =
            post.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (post.category?.toLowerCase() || '').includes(searchTerm.toLowerCase());

        const matchesFilters =
            selectedFilters.length === 0 ||
            selectedFilters.some((filter) => {
                if (filter === 'buy-now') return !post.isBiddable;
                if (filter === 'on-auction') return post.isBiddable;
                if (filter === 'digital-art') return post.category === 'Digital Art';
                if (filter === 'gaming') return post.category === 'Gaming';
                if (filter === 'music') return post.category === 'Music';
                if (filter === 'photography') return post.category === 'Photography';
                if (filter === 'crypto') return post.category === 'Crypto';

                // New categories from sample
                if (filter === 'collectibles') return post.category === 'Collectibles';
                if (filter === 'virtual-real-estate') return post.category === 'Virtual Real Estate';
                if (filter === 'sports') return post.category === 'Sports';
                if (filter === 'metaverse') return post.category === 'Metaverse';
                if (filter === 'domain-names') return post.category === 'Domain Names';
                if (filter === 'utility') return post.category === 'Utility';

                return false;
            });

        return matchesSearch && matchesFilters;
    });

    return (
        <div className='min-h-screen bg-slate-950 overflow-hidden'>
            <div className='flex mt-20'>
                {/* Left Sidebar - Filters */}
                <AnimatePresence>
                    {sidebarOpen && (
                        <motion.div
                            ref={sidebarRef}
                            className='w-64 p-6 space-y-8 border-r border-slate-800/50 fixed md:relative h-full md:h-auto z-40 overflow-y-auto'
                            initial={{ x: -300, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: -300, opacity: 0 }}
                            transition={{ duration: 0.5 }}>
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
                                title='Status'
                                filters={statusFilters}
                                selectedFilters={selectedFilters}
                                onToggleFilter={toggleFilter}
                            />
                            <FilterSection
                                title='Collection'
                                filters={collectionFilters}
                                selectedFilters={selectedFilters}
                                onToggleFilter={toggleFilter}
                            />
                            <FilterSection
                                title='Filter by price'
                                filters={priceFilters}
                                selectedFilters={selectedFilters}
                                onToggleFilter={toggleFilter}
                            />
                            <FilterSection
                                title='Chains'
                                filters={chainFilters}
                                selectedFilters={selectedFilters}
                                onToggleFilter={toggleFilter}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Main Content */}
                <div className='flex-1 p-6'>
                    {/* Search and Controls */}
                    <div className='mb-8 space-y-4'>
                        <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-4'>
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
                            className='text-slate-400 flex items-center justify-between'
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.4 }}>
                            <span>
                                Showing {filteredRentalPosts.length} of {rentalPosts.length} NFTs
                            </span>
                            <motion.div
                                className='text-xs text-gray-500'
                                animate={{ opacity: [0.5, 1, 0.5] }}
                                transition={{
                                    duration: 2,
                                    repeat: Number.POSITIVE_INFINITY,
                                }}>
                                Live updates
                            </motion.div>
                        </motion.div>
                    </div>

                    {/* NFT Grid */}
                    <motion.div
                        className={`grid gap-4 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5' : 'grid-cols-1 xl:grid-cols-2'}`}
                        layout>
                        <AnimatePresence mode='popLayout'>
                            {filteredRentalPosts.map((post, index) => (
                                <motion.div
                                    key={index}
                                    className='nft-card'
                                    initial={{ opacity: 0, y: 50, scale: 0.9 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: -50, scale: 0.9 }}
                                    transition={{
                                        duration: 0.5,
                                        delay: isInView ? index * 0.1 : 0,
                                    }}
                                    whileHover={{ y: -5 }}>
                                    <RentalPostCard
                                        post={post}
                                        viewMode={viewMode}
                                        onViewRentalPost={() => handleViewRentalPost(post)}
                                    />
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </motion.div>

                    {/* Empty State */}
                    {filteredRentalPosts.length === 0 && <EmptyState onClearFilters={clearAllFilters} />}
                </div>
            </div>

            {/* Rental Post Details Modal */}
            {selectedRentalPost && isModalOpen && (
                <RentalPostDetailsModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    session={session}
                    selectedRentalPost={selectedRentalPost}
                />
            )}
            {/* Mobile Overlay */}
            <AnimatePresence>
                {sidebarOpen && (
                    <motion.div
                        className='fixed inset-0 bg-black/50 z-30 md:hidden'
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setSidebarOpen(false)}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
