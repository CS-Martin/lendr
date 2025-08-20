'use client';

import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { useParams } from "next/navigation";
import { Id } from "../../../../../convex/_generated/dataModel";
import Image from "next/image";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Check, Copy, ExternalLink, Hash, Star, Timer } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function RentalPostDetailPage() {
    const { rentalPostId } = useParams<{ rentalPostId: string }>();

    const [copied, setCopied] = useState(false)

    const getRentalPost = useQuery(api.rentalpost.getOneRentalPost, { 
        id: rentalPostId as Id<"rentalposts"> 
    });

    console.log(getRentalPost);

    const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

    return (
        <div className="container px-4 min-h-screen">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
               {/* Left Column - Image and Gallery */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}>
            <div className="relative">
              <Image
                src={getRentalPost?.nftMetadata.image.cachedUrl || "/placeholder.svg"}
                alt={getRentalPost?.name || ""}
                width={500}
                height={500}
                unoptimized
                className="w-full rounded-2xl border border-slate-800"
              />
              <Badge className={`absolute top-4 right-4 ${getRentalPost?.isActive ? "bg-green-500" : "bg-red-500"}`}>
                {getRentalPost?.isActive ? "Available" : "Rented"}
              </Badge>
              <Badge className="absolute top-4 left-4 bg-purple-500">{getRentalPost?.category}</Badge>
              {getRentalPost?.isBiddable && (
                <Badge className="absolute bottom-4 right-4 bg-orange-500 flex items-center space-x-1">
                  <Timer className="w-3 h-3" />
                  <span>Bidding Active</span>
                </Badge>
              )}
            </div>

            {/* Metadata Card */}
            <Card className="mt-6 bg-slate-900/50 border-slate-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center space-x-2">
                  <span>Metadata</span>
                  <ExternalLink className="w-4 h-4" />
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-slate-400">Token ID</div>
                    <div className="text-white font-mono">{getRentalPost?.nftMetadata.tokenId}</div>
                  </div>
                  <div>
                    <div className="text-slate-400">Blockchain</div>
                    <div className="text-white">{getRentalPost?.nftMetadata.blockchain}</div>
                  </div>
                  <div>
                    <div className="text-slate-400">Standard</div>
                    <div className="text-white">{getRentalPost?.nftMetadata.standard}</div>
                  </div>
                  <div>
                    <div className="text-slate-400">Rarity</div>
                    <div className="text-purple-400 font-semibold">{getRentalPost?.nftMetadata.rarity}</div>
                  </div>
                </div>

                <Separator className="bg-slate-800" />

                <div>
                  <div className="text-slate-400 mb-2">Contract Address</div>
                  <div className="flex items-center space-x-2">
                    <code className="text-xs text-white bg-slate-800 px-2 py-1 rounded font-mono">
                      {getRentalPost?.nftMetadata.contractAddress}
                    </code>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copyToClipboard(getRentalPost?.nftMetadata.contractAddress)}
                      className="text-slate-400 hover:text-white"
                    >
                      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>

               {/* Attributes */}
                  {getRentalPost?.nftMetadata.raw?.metadata?.attributes &&
                    getRentalPost?.nftMetadata.raw?.metadata.attributes.length > 0 && (
                      <>
                        <Separator className='bg-gray-700/50' />
                        <div>
                          <div className='flex items-center gap-2 mb-4'>
                            <Hash className='h-4 w-4 text-pink-400' />
                            <span className='font-medium text-white'>Attributes</span>
                          </div>
                          <div className='grid grid-cols-2 gap-3'>
                            {getRentalPost?.nftMetadata.raw.metadata?.attributes.map((attr: any, index: number) => (
                              <motion.div
                                key={index}
                                initial={{
                                  opacity: 0,
                                  y: 10,
                                }}
                                animate={{
                                  opacity: 1,
                                  y: 0,
                                }}
                                transition={{
                                  delay: 0.1 * index,
                                }}
                                className='bg-gray-800/30 rounded-lg p-3 border border-gray-700/50'>
                                <div className='text-xs text-gray-400 uppercase tracking-wider mb-1'>
                                  {attr.trait_type}
                                </div>
                                <div className='text-white font-medium'>{attr.value}</div>
                              </motion.div>
                            ))}
                          </div>
                        </div>
                      </>
                    )} 
              </CardContent>
            </Card>
          </motion.div> 

          {/* Right Column - Details and Bidding */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-6"
          >
            {/* Title and Basic Info */}
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">{getRentalPost?.name}</h1>
              <p className="text-slate-400 text-lg leading-relaxed">{getRentalPost?.description}</p>
            </div>

            {/* Merchant Info */}
            <Card className="bg-slate-900/50 border-slate-800">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="text-slate-400 text-sm">Owned by</div>
                    <div className="text-white font-mono">{getRentalPost?.posterAddress}</div>
                  </div>
                  {/* <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="text-white font-semibold">{getRentalPost?.merchant.rating}</span>
                    <span className="text-slate-400 text-sm">({getRentalPost?.merchant.totalRentals} rentals)</span>
                  </div> */}
                </div>
                {/* <div className="text-slate-400 text-sm">Member since {nftData.merchant.joinedDate}</div> */}
              </CardContent>
            </Card>
            </motion.div>
            </div>
        </div>
    );
}