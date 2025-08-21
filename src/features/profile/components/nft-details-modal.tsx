'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { motion, AnimatePresence } from 'framer-motion';
import { ExternalLink, Copy, Hash, FileText, ImageIcon, Link, Clock, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { Session } from 'next-auth';
import { OwnedNft } from 'alchemy-sdk';
import { ImageSection } from '@/components/shared/nft-components/image-section';
import { UriSection } from '@/components/shared/nft-components/uri-section';
import { DetailSection } from '@/components/shared/nft-components/detail-section';
import { TokenDetails } from '@/components/shared/nft-components/token-details';
import { ContractInfo } from '@/components/shared/nft-components/contract-info';
import { TimelineInfo } from '@/components/shared/nft-components/timeline-info';
import { AttributesSection } from '@/components/shared/nft-components/attributes-section';

interface NFTDetailsModalProps {
  nft: OwnedNft;
  isOpen: boolean;
  onClose: () => void;
  session: Session | null;
  profileAddress: string;
}

// TODO: Refactor this component using shared components in @/components/shared/modal
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
      <DialogContent className='!max-w-[90vw] !p-3 md:!p-6 w-full bg-gray-900/95 backdrop-blur-xl border-gray-800/50 text-white max-h-[90vh] overflow-y-auto rounded-2xl'>
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
                    {nft.name || 'Unnamed NFT'}
                  </DialogTitle>
                  <p className='text-gray-400 mt-2'>{nft.collection?.name || 'No collection name'}</p>
                </motion.div>
              </DialogHeader>

              <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
                {/* Image Section */}
                <motion.div
                  initial={{ x: -50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className='space-y-4'>
                  <ImageSection nftMetadata={nft} />

                  {nft.raw?.tokenUri && (
                    <>
                      <Separator className='bg-gray-700/50' />
                      <UriSection
                        title='Raw Metadata URI'
                        uri={nft.raw.tokenUri}
                      />
                    </>
                  )}
                </motion.div>

                {/* Details Section */}
                <motion.div
                  initial={{ x: 50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className='space-y-6'>
                  <div>
                    <DetailSection
                      title='Description'
                      icon={FileText}
                      iconColor='text-cyan-400'>
                      <p className='text-gray-300 leading-relaxed mt-3'>
                        {nft.description || 'No description available'}
                      </p>
                    </DetailSection>
                  </div>

                  <Separator className='bg-gray-700/50' />
                  <TokenDetails nftMetadata={nft} />

                  <Separator className='bg-gray-700/50' />
                  <ContractInfo nftMetadata={nft} />

                  <Separator className='bg-gray-700/50' />
                  <TimelineInfo nftMetadata={nft} />

                  {nft.raw?.metadata?.attributes && nft.raw.metadata.attributes.length > 0 && (
                    <>
                      <Separator className='bg-gray-700/50' />
                      <AttributesSection attributes={nft.raw.metadata.attributes} />
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
