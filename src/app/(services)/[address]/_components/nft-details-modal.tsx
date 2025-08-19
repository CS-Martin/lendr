'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { motion, AnimatePresence } from 'framer-motion';
import { ExternalLink, Copy, Hash, FileText, ImageIcon, Link, Clock, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { formatDate } from '@/lib/utils';
import { Session } from 'next-auth';
import { Doc } from '../../../../../convex/_generated/dataModel';

interface NFTDetailsModalProps {
  nft: Doc<"nft"> | null;
  isOpen: boolean;
  onClose: () => void;
  session: Session | null;
  profileAddress: string;
}

export const NFTDetailsModal = ({ nft, isOpen, onClose, session, profileAddress }: NFTDetailsModalProps) => {
  const [imageLoading, setImageLoading] = useState(true);
  const [copiedAddress, setCopiedAddress] = useState(false);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedAddress(true);
      setTimeout(() => setCopiedAddress(false), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={onClose}>
      <DialogContent className='max-w-6xl w-full bg-gray-900/95 backdrop-blur-xl border-gray-800/50 text-white max-h-[90vh] overflow-y-auto rounded-2xl'>
        <AnimatePresence>
          {isOpen && nft && (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}>
              <DialogHeader className='mb-6'>
                <motion.div
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.1 }}>
                  <DialogTitle className='text-2xl font-bold bg-gradient-to-r from-lendr-400 to-cyan-400 bg-clip-text text-transparent'>
                    {nft.title || 'Unnamed NFT'}
                  </DialogTitle>
                  <p className='text-gray-400 mt-2'>{nft.collectionName || 'No collection name'}</p>
                </motion.div>
              </DialogHeader>

              <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
                {/* Image Section */}
                <motion.div
                  initial={{ x: -50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className='space-y-4'>
                  <div className='relative aspect-square rounded-xl overflow-hidden bg-gray-800/50'>
                    {imageLoading && (
                      <div className='absolute inset-0 flex items-center justify-center'>
                        <Loader2 className='h-8 w-8 animate-spin text-lendr-400' />
                      </div>
                    )}
                    <Image
                      src={nft.imageUrl || '/placeholder.svg'}
                      alt={nft.title || 'NFT image'}
                      fill
                      className='object-cover hover:scale-105 transition-all duration-500'
                      onLoad={() => setImageLoading(false)}
                      onError={() => setImageLoading(false)}
                      unoptimized
                    />
                  </div>
                </motion.div>

                {/* Details Section */}
                <motion.div
                  initial={{ x: 50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className='space-y-6'>
                  {/* Description */}
                  <div>
                    <div className='flex items-center gap-2 mb-3'>
                      <FileText className='h-4 w-4 text-cyan-400' />
                      <span className='font-medium text-white'>Description</span>
                    </div>
                    <p className='text-gray-300 leading-relaxed'>
                      {nft.description || 'No description available'}
                    </p>
                  </div>

                  <Separator className='bg-gray-700/50' />

                  {/* Token Details */}
                  <div>
                    <div className='flex items-center gap-2 mb-4'>
                      <Hash className='h-4 w-4 text-purple-400' />
                      <span className='font-medium text-white'>Token Details</span>
                    </div>
                    <div className='space-y-3'>
                      <div className='flex justify-between items-center'>
                        <span className='text-gray-400'>Token ID:</span>
                        <Badge
                          variant='outline'
                          className='border-gray-600 text-gray-300'>
                          #{nft.tokenId}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <Separator className='bg-gray-700/50' />

                  {/* Contract Information */}
                  <div>
                    <div className='flex items-center gap-2 mb-4'>
                      <Link className='h-4 w-4 text-green-400' />
                      <span className='font-medium text-white'>Contract Information</span>
                    </div>
                    <div className='space-y-3'>
                      <div>
                        <span className='text-gray-400 block mb-1'>Contract Address:</span>
                        <div className='flex items-center gap-2'>
                          <code className='bg-gray-800/50 px-2 py-1 rounded text-sm font-mono text-gray-300'>
                            {nft.contractAddress.slice(0, 10)}
                            ...
                            {nft.contractAddress.slice(-8)}
                          </code>
                          <Button
                            size='sm'
                            variant='ghost'
                            onClick={() => copyToClipboard(nft.contractAddress)}
                            className='h-8 w-8 p-0 text-gray-400 hover:text-white'>
                            <Copy className='h-3 w-3' />
                          </Button>
                          <Button
                            size='sm'
                            variant='ghost'
                            className='h-8 w-8 p-0 text-gray-400 hover:text-white'
                            onClick={() =>
                              window.open(`https://etherscan.io/address/${nft.contractAddress}`, '_blank')
                            }>
                            <ExternalLink className='h-3 w-3' />
                          </Button>
                        </div>
                        {copiedAddress && (
                          <motion.p
                            initial={{
                              opacity: 0,
                              y: -10,
                            }}
                            animate={{
                              opacity: 1,
                              y: 0,
                            }}
                            exit={{
                              opacity: 0,
                              y: -10,
                            }}
                            className='text-green-400 text-xs mt-1'>
                            Address copied to clipboard!
                          </motion.p>
                        )}
                      </div>
                      <div className='flex justify-between items-center'>
                        <span className='text-gray-400'>Collection Name:</span>
                        <span className='text-white'>{nft.collectionName || 'Unnamed contract'}</span>
                      </div>
                    </div>
                  </div>

                  <Separator className='bg-gray-700/50' />

                  {/* Timeline */}
                  <div>
                    <div className='flex items-center gap-2 mb-4'>
                      <Clock className='h-4 w-4 text-yellow-400' />
                      <span className='font-medium text-white'>Timeline</span>
                    </div>
                    <div className='space-y-3'>
                      <div className='flex justify-between items-center'>
                        <span className='text-gray-400'>Created:</span>
                        {/* /* <span className='text-white'>{formatDate(nft._creationTime)}</span> */}
                      </div>
                    </div>
                  </div>

                  {/* Attributes */}
                  {nft.metadata?.attributes && nft.metadata.attributes.length > 0 && (
                    <>
                      <Separator className='bg-gray-700/50' />
                      <div>
                        <div className='flex items-center gap-2 mb-4'>
                          <Hash className='h-4 w-4 text-pink-400' />
                          <span className='font-medium text-white'>Attributes</span>
                        </div>
                        <div className='grid grid-cols-2 gap-3'>
                          {nft.metadata.attributes.map(
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            (attr: any, index: number) => (
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
                            ),
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </motion.div>
              </div>

              {/* Action Buttons */}
              {session?.user?.address === profileAddress && (
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className='flex gap-4 mt-8 pt-6 border-t border-gray-700/50'>
                  <Button
                    variant='outline'
                    onClick={onClose}
                    className='flex-1 border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white bg-transparent'>
                    Close
                  </Button>
                  <Button
                    className='flex-1 bg-gradient-to-r from-lendr-400 to-lendr-500 hover:from-lendr-500 hover:to-lendr-600 text-slate-950 font-semibold'
                    onClick={() => {
                      // Handle list NFT action
                      onClose();
                    }}>
                    List for Rent
                  </Button>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
};
