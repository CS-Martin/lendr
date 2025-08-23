'use client';

import { memo, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText } from 'lucide-react';
import { Session } from 'next-auth';
import { SpamWarning } from '@/components/shared/nft-components/spam-warning';
import { ImageSection } from '@/components/shared/nft-components/image-section';
import { BiddingSection } from '@/components/shared/nft-components/bidding-section';
import { DetailSection } from '@/components/shared/nft-components/detail-section';
import { TokenDetails } from '@/components/shared/nft-components/token-details';
import { ContractInfo } from '@/components/shared/nft-components/contract-info';
import { TimelineInfo } from '@/components/shared/nft-components/timeline-info';
import { UriSection } from '@/components/shared/nft-components/uri-section';
import { AttributesSection } from '@/components/shared/nft-components/attributes-section';
import { Doc } from '@convex/_generated/dataModel';

// Types
interface RentalPostDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedRentalPost: Doc<'rentalposts'> | null;
}

// Main component
export const RentalPostDetailsModal = memo(
  ({ isOpen, onClose, selectedRentalPost }: RentalPostDetailsModalProps) => {

    if (!selectedRentalPost) {
      return null;
    }

    return (
      <Dialog
        open={isOpen}
        onOpenChange={onClose}>
        <DialogContent className='!max-w-[90vw] !p-3 md:!p-6 w-full bg-gray-900/95 backdrop-blur-xl border-gray-800/50 text-white max-h-[90vh] overflow-y-auto rounded-2xl'>
          <AnimatePresence>
            {isOpen && selectedRentalPost && (
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
                      {selectedRentalPost.name || 'Unnamed NFT'}
                    </DialogTitle>
                    <p className='text-gray-400 mt-2'>
                      {selectedRentalPost.nftMetadata.collection?.name || 'No collection name'}
                    </p>
                  </motion.div>
                </DialogHeader>

                {selectedRentalPost.nftMetadata.contract.isSpam && (
                  <SpamWarning nftContract={selectedRentalPost.nftMetadata.contract} />
                )}

                <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
                  <motion.div
                    initial={{ x: 50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className='space-y-6'>
                    <ImageSection nft={selectedRentalPost.nftMetadata} />

                    {selectedRentalPost.nftMetadata.raw?.tokenUri && (
                      <>
                        <Separator className='bg-gray-700/50' />
                        <UriSection
                          title='Raw Metadata URI'
                          uri={selectedRentalPost.nftMetadata.raw.tokenUri}
                        />
                      </>
                    )}
                  </motion.div>

                  <motion.div
                    initial={{ x: 50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className='space-y-6'>
                    <BiddingSection rentalPost={selectedRentalPost} />

                    <div>
                      <DetailSection
                        title='Description'
                        icon={FileText}
                        iconColor='text-cyan-400'>
                        <p className='text-gray-300 leading-relaxed mt-3'>
                          {selectedRentalPost.description || 'No description available'}
                        </p>
                      </DetailSection>
                    </div>

                    <Separator className='bg-gray-700/50' />
                    <TokenDetails nft={selectedRentalPost.nftMetadata} />

                    <Separator className='bg-gray-700/50' />
                    <ContractInfo nft={selectedRentalPost.nftMetadata} />

                    <Separator className='bg-gray-700/50' />
                    <TimelineInfo nft={selectedRentalPost.nftMetadata} />

                    {selectedRentalPost.nftMetadata.raw?.metadata?.attributes &&
                      selectedRentalPost.nftMetadata.raw.metadata.attributes.length > 0 && (
                        <>
                          <Separator className='bg-gray-700/50' />
                          <AttributesSection nftMetadata={selectedRentalPost.nftMetadata.raw.metadata} />
                        </>
                      )}
                  </motion.div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </DialogContent>
      </Dialog>
    );
  },
);

RentalPostDetailsModal.displayName = 'RentalPostDetailsModal';
