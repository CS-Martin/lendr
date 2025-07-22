"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { motion, AnimatePresence } from "framer-motion"
import { CalendarIcon, Loader2, Clock, DollarSign, Shield, Tag, CalendarDays } from "lucide-react"
import { format } from "date-fns"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { OwnedNft } from "alchemy-sdk"
import LendrButton from "@/components/shared/lendr-btn"


interface ListNFTDrawerProps {
    nft: OwnedNft | null
    isOpen: boolean
    onClose: () => void
}

export const ListNFTDrawer = ({ nft, isOpen, onClose }: ListNFTDrawerProps) => {
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        hourlyRate: "",
        collateral: "",
        category: "",
        isBiddable: false,
        biddingStarttime: undefined as Date | undefined,
        biddingEndtime: undefined as Date | undefined,
    })
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)

        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 2000))

        console.log("Listing NFT:", {
            nft,
            ...formData,
        })

        setIsSubmitting(false)
        onClose()
    }

    const categories = [
        "Gaming",
        "Art",
        "Music",
        "Sports",
        "Collectibles",
        "Virtual Worlds",
        "Photography",
        "Utility",
        "Memes",
        "Other",
    ]

    return (
        <Sheet open={isOpen} onOpenChange={onClose}>
            <SheetContent className="w-full px-5 sm:max-w-2xl bg-gray-900/95 backdrop-blur-xl border-gray-800/50 text-white overflow-y-auto">
                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            initial={{ x: "100%", opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: "100%", opacity: 0 }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                            className="h-full"
                        >
                            <SheetHeader className="mb-3">
                                <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }}>
                                    <SheetTitle className="text-2xl font-bold bg-gradient-to-r from-lendr-400 to-cyan-400 bg-clip-text text-transparent">
                                        List NFT for Rent
                                    </SheetTitle>
                                    <SheetDescription className="text-gray-400 mt-2">
                                        Set up your NFT rental listing with custom terms and pricing
                                    </SheetDescription>
                                </motion.div>
                            </SheetHeader>

                            {nft && (
                                <motion.div
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.2 }}
                                    className="mb-8 p-4 bg-gray-800/50 rounded-xl border border-gray-700/50"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="relative w-16 h-16 rounded-lg overflow-hidden">
                                            <Image
                                                src={nft.image.thumbnailUrl || nft.image.cachedUrl || "/placeholder.svg"}
                                                alt={nft.name}
                                                fill
                                                unoptimized
                                                className="object-cover"
                                            />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-white">{nft.name}</h3>
                                            <p className="text-sm text-gray-400">{nft.collection?.name}</p>
                                            <p className="text-xs text-gray-500">Token #{nft.tokenId}</p>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Basic Information */}
                                <motion.div
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.3 }}
                                    className="space-y-4"
                                >
                                    <div className="flex items-center gap-2 mb-4">
                                        <Tag className="h-5 w-5 text-lendr-400" />
                                        <h3 className="text-lg font-semibold text-white">Basic Information</h3>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="name" className="text-gray-300">
                                            Listing Name
                                        </Label>
                                        <Input
                                            id="name"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            placeholder="Enter a catchy name for your listing"
                                            className="bg-gray-800/50 border-gray-700/50 text-white placeholder-gray-400 focus:border-lendr-400/50"
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="description" className="text-gray-300">
                                            Description
                                        </Label>
                                        <Textarea
                                            id="description"
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            placeholder="Describe your NFT and rental terms..."
                                            className="bg-gray-800/50 border-gray-700/50 text-white placeholder-gray-400 focus:border-lendr-400/50 min-h-[100px]"
                                            rows={4}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="category" className="text-gray-300">
                                            Category
                                        </Label>
                                        <Select
                                            value={formData.category}
                                            onValueChange={(value) => setFormData({ ...formData, category: value })}
                                        >
                                            <SelectTrigger className="bg-gray-800/50 border-gray-700/50 text-white focus:border-lendr-400/50">
                                                <SelectValue placeholder="Select a category" />
                                            </SelectTrigger>
                                            <SelectContent className="bg-gray-800 border-gray-700 text-white">
                                                {categories.map((category) => (
                                                    <SelectItem key={category} value={category.toLowerCase()}>
                                                        {category}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </motion.div>

                                {/* Pricing */}
                                <motion.div
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.4 }}
                                    className="space-y-4"
                                >
                                    <div className="flex items-center gap-2 mb-4">
                                        <DollarSign className="h-5 w-5 text-green-400" />
                                        <h3 className="text-lg font-semibold text-white">Pricing</h3>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="hourlyRate" className="text-gray-300">
                                                Hourly Rate (ETH)
                                            </Label>
                                            <div className="relative">
                                                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                                <Input
                                                    id="hourlyRate"
                                                    type="number"
                                                    step="0.001"
                                                    value={formData.hourlyRate}
                                                    onChange={(e) => setFormData({ ...formData, hourlyRate: e.target.value })}
                                                    placeholder="0.001"
                                                    className="pl-10 bg-gray-800/50 border-gray-700/50 text-white placeholder-gray-400 focus:border-lendr-400/50"
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="collateral" className="text-gray-300">
                                                Collateral (ETH)
                                            </Label>
                                            <div className="relative">
                                                <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                                <Input
                                                    id="collateral"
                                                    type="number"
                                                    step="0.001"
                                                    value={formData.collateral}
                                                    onChange={(e) => setFormData({ ...formData, collateral: e.target.value })}
                                                    placeholder="0.1"
                                                    className="pl-10 bg-gray-800/50 border-gray-700/50 text-white placeholder-gray-400 focus:border-lendr-400/50"
                                                    required
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>

                                {/* Bidding Options */}
                                <motion.div
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.5 }}
                                    className="space-y-4"
                                >
                                    <div className="flex items-center gap-2 mb-4">
                                        <CalendarDays className="h-5 w-5 text-purple-400" />
                                        <h3 className="text-lg font-semibold text-white">Bidding Options</h3>
                                    </div>

                                    <div className="flex items-center justify-between p-4 rounded-lg border border-gray-700/50">
                                        <div>
                                            <Label htmlFor="isBiddable" className="text-gray-300 font-medium">
                                                Enable Bidding
                                            </Label>
                                            <p className="text-sm text-gray-400 mt-1">Allow users to bid on your rental listing</p>
                                        </div>
                                        <Switch
                                            id="isBiddable"
                                            className={`data-[state=checked]:bg-lendr-500 data-[state=unchecked]:bg-neutral-600`}
                                            checked={formData.isBiddable}
                                            onCheckedChange={(checked) => setFormData({ ...formData, isBiddable: checked })}
                                        />
                                    </div>

                                    <AnimatePresence>
                                        {formData.isBiddable && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: "auto", opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.3 }}
                                                className="grid grid-cols-2 gap-4 overflow-hidden"
                                            >
                                                <div className="space-y-2">
                                                    <Label className="text-gray-300">Bidding Start Date</Label>
                                                    <Popover>
                                                        <PopoverTrigger asChild>
                                                            <Button
                                                                variant="outline"
                                                                className={cn(
                                                                    "w-full justify-start text-left font-normal bg-gray-800/50 border-gray-700/50 text-white hover:bg-gray-700/50",
                                                                    !formData.biddingStarttime && "text-gray-400",
                                                                )}
                                                            >
                                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                                {formData.biddingStarttime ? (
                                                                    format(formData.biddingStarttime, "PPP")
                                                                ) : (
                                                                    <span>Pick a date</span>
                                                                )}
                                                            </Button>
                                                        </PopoverTrigger>
                                                        <PopoverContent className="w-auto p-0 bg-gray-800 border-gray-700">
                                                            <Calendar
                                                                mode="single"
                                                                selected={formData.biddingStarttime}
                                                                onSelect={(date) => setFormData({ ...formData, biddingStarttime: date })}
                                                                initialFocus
                                                                className="text-white"
                                                            />
                                                        </PopoverContent>
                                                    </Popover>
                                                </div>

                                                <div className="space-y-2">
                                                    <Label className="text-gray-300">Bidding End Date</Label>
                                                    <Popover>
                                                        <PopoverTrigger asChild>
                                                            <Button
                                                                variant="outline"
                                                                className={cn(
                                                                    "w-full justify-start text-left font-normal bg-gray-800/50 border-gray-700/50 text-white hover:bg-gray-700/50",
                                                                    !formData.biddingEndtime && "text-gray-400",
                                                                )}
                                                            >
                                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                                {formData.biddingEndtime ? (
                                                                    format(formData.biddingEndtime, "PPP")
                                                                ) : (
                                                                    <span>Pick a date</span>
                                                                )}
                                                            </Button>
                                                        </PopoverTrigger>
                                                        <PopoverContent className="w-auto p-0 bg-gray-800 border-gray-700">
                                                            <Calendar
                                                                mode="single"
                                                                selected={formData.biddingEndtime}
                                                                onSelect={(date) => setFormData({ ...formData, biddingEndtime: date })}
                                                                initialFocus
                                                                className="text-white"
                                                            />
                                                        </PopoverContent>
                                                    </Popover>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>

                                {/* Submit Button */}
                                <motion.div
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.6 }}
                                    className="flex flex-col-reverse md:flex-row w-full gap-4 py-3"
                                >
                                    <div className="md:w-1/2">
                                        <LendrButton
                                            type="button"
                                            variant="outline"
                                            onClick={onClose}
                                            className="w-full border-gray-600 rounded-md text-gray-300 hover:bg-gray-700 hover:text-white bg-transparent"
                                            disabled={isSubmitting}
                                        >
                                            Cancel
                                        </LendrButton>
                                    </div>
                                    <div className="md:w-1/2">
                                        <LendrButton
                                            type="submit"
                                            className="w-full bg-gradient-to-r rounded-md from-lendr-400 hover:to-lendr-600 text-slate-950 font-semibold"
                                            disabled={isSubmitting}
                                        >
                                            {isSubmitting ? (
                                                <motion.div className="flex items-center gap-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                    Creating Listing...
                                                </motion.div>
                                            ) : (
                                                "Create Listing"
                                            )}
                                        </LendrButton>
                                    </div>
                                </motion.div>

                            </form>
                        </motion.div>
                    )}
                </AnimatePresence>
            </SheetContent>
        </Sheet>
    )
}
