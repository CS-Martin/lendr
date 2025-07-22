'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ExternalLink,
  Copy,
  Hash,
  FileText,
  ImageIcon,
  Link,
  Clock,
  Loader2,
  AlertTriangle,
} from 'lucide-react';
import Image from 'next/image';
import { format } from 'date-fns';
import { OwnedNft } from 'alchemy-sdk';

interface NFTDetailsModalProps {
  nft: OwnedNft | null;
  isOpen: boolean;
  onClose: () => void;
}

export const NFTDetailsModal = ({
  nft,
  isOpen,
  onClose,
}: NFTDetailsModalProps) => {
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

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'Unknown';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Unknown';
    try {
      return format(new Date(dateString), "MMM dd, yyyy 'at' HH:mm");
    } catch {
      return 'Invalid date';
    }
  };

  console.log(nft);

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
                    {nft.name || 'Unnamed NFT'}
                  </DialogTitle>
                  <p className='text-gray-400 mt-2'>
                    {nft.collection?.name || 'No collection name'}
                  </p>
                </motion.div>
              </DialogHeader>

              {nft.contract.isSpam && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className='mb-6 bg-red-900/30 border border-red-700/50 rounded-lg p-3 flex items-start gap-2'>
                  <AlertTriangle className='h-4 w-4 text-red-400 mt-0.5 flex-shrink-0' />
                  <div>
                    <h4 className='font-medium text-red-300'>
                      Potential Spam NFT
                    </h4>
                    <p className='text-red-400 text-sm mt-1'>
                      This NFT has been flagged as potential spam. Be cautious
                      when interacting with it.
                    </p>
                    {nft.contract.spamClassifications?.length > 0 && (
                      <div className='mt-2'>
                        <span className='text-xs text-red-400'>
                          Classifications:
                        </span>
                        <div className='flex flex-wrap gap-1 mt-1'>
                          {nft.contract.spamClassifications.map(
                            (classification, index) => (
                              <Badge
                                key={index}
                                variant='outline'
                                className='border-red-700/50 text-red-400 text-xs'>
                                {classification}
                              </Badge>
                            ),
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

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
                      src={
                        nft.image.cachedUrl ||
                        nft.image.originalUrl ||
                        nft.image.pngUrl ||
                        nft.contract.openSeaMetadata?.imageUrl ||
                        '/placeholder.svg'
                      }
                      alt={nft.name || 'NFT image'}
                      fill
                      className='object-cover hover:scale-105 transition-all duration-500'
                      onLoad={() => setImageLoading(false)}
                      onError={() => setImageLoading(false)}
                      unoptimized
                    />
                  </div>

                  {/* Media Information */}
                  <div className='bg-gray-800/30 rounded-lg p-4 border border-gray-700/50'>
                    <div className='flex items-center gap-2 mb-3'>
                      <ImageIcon className='h-4 w-4 text-lendr-400' />
                      <span className='font-medium text-white'>
                        Media Information
                      </span>
                    </div>
                    <div className='grid grid-cols-2 gap-4 text-sm'>
                      <div>
                        <span className='text-gray-400'>Type:</span>
                        <span className='ml-2 text-white'>
                          {nft.image.contentType || 'Unknown'}
                        </span>
                      </div>
                      <div>
                        <span className='text-gray-400'>Size:</span>
                        <span className='ml-2 text-white'>
                          {formatFileSize(nft.image.size)}
                        </span>
                      </div>
                      <div>
                        <span className='text-gray-400'>Original URL:</span>
                        <div className='flex items-center gap-1 mt-1'>
                          <code className='text-xs text-gray-300 truncate'>
                            {nft.image.originalUrl?.slice(0, 30)}
                            ...
                            {nft.image.originalUrl?.slice(-10)}
                          </code>
                          {nft.image.originalUrl && (
                            <Button
                              size='sm'
                              variant='ghost'
                              className='h-6 w-6 p-0 text-gray-400 hover:text-white'
                              onClick={() =>
                                window.open(nft.image.originalUrl, '_blank')
                              }>
                              <ExternalLink className='h-3 w-3' />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* OpenSea Metadata */}
                  {nft.contract.openSeaMetadata && (
                    <div className='bg-gray-800/30 rounded-lg p-4 border border-gray-700/50'>
                      <div className='flex items-center gap-2 mb-3'>
                        <ImageIcon className='h-4 w-4 text-purple-400' />
                        <span className='font-medium text-white'>
                          OpenSea Metadata
                        </span>
                      </div>
                      <div className='space-y-2 text-sm'>
                        <div>
                          <span className='text-gray-400'>Collection:</span>
                          <span className='ml-2 text-white'>
                            {nft.contract.openSeaMetadata.collectionName}
                          </span>
                        </div>
                        <div>
                          <span className='text-gray-400'>Slug:</span>
                          <span className='ml-2 text-white'>
                            {nft.contract.openSeaMetadata.collectionSlug}
                          </span>
                        </div>
                        <div>
                          <span className='text-gray-400'>Description:</span>
                          <p className='text-gray-300 mt-1'>
                            {nft.contract.openSeaMetadata.description}
                          </p>
                        </div>
                        {nft.contract.openSeaMetadata.lastIngestedAt && (
                          <div>
                            <span className='text-gray-400'>Last Updated:</span>
                            <span className='ml-2 text-white'>
                              {formatDate(
                                nft.contract.openSeaMetadata.lastIngestedAt,
                              )}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
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
                      <span className='font-medium text-white'>
                        Description
                      </span>
                    </div>
                    <p className='text-gray-300 leading-relaxed'>
                      {nft.description ||
                        nft.contract.openSeaMetadata?.description ||
                        'No description available'}
                    </p>
                  </div>

                  <Separator className='bg-gray-700/50' />

                  {/* Token Details */}
                  <div>
                    <div className='flex items-center gap-2 mb-4'>
                      <Hash className='h-4 w-4 text-purple-400' />
                      <span className='font-medium text-white'>
                        Token Details
                      </span>
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
                      <div className='flex justify-between items-center'>
                        <span className='text-gray-400'>Token Type:</span>
                        <Badge
                          variant='outline'
                          className='border-gray-600 text-gray-300'>
                          {nft.tokenType}
                        </Badge>
                      </div>
                      <div className='flex justify-between items-center'>
                        <span className='text-gray-400'>Balance:</span>
                        <span className='text-white'>{nft.balance || '1'}</span>
                      </div>
                    </div>
                  </div>

                  <Separator className='bg-gray-700/50' />

                  {/* Contract Information */}
                  <div>
                    <div className='flex items-center gap-2 mb-4'>
                      <Link className='h-4 w-4 text-green-400' />
                      <span className='font-medium text-white'>
                        Contract Information
                      </span>
                    </div>
                    <div className='space-y-3'>
                      <div>
                        <span className='text-gray-400 block mb-1'>
                          Contract Address:
                        </span>
                        <div className='flex items-center gap-2'>
                          <code className='bg-gray-800/50 px-2 py-1 rounded text-sm font-mono text-gray-300'>
                            {nft.contract.address.slice(0, 10)}
                            ...
                            {nft.contract.address.slice(-8)}
                          </code>
                          <Button
                            size='sm'
                            variant='ghost'
                            onClick={() =>
                              copyToClipboard(nft.contract.address)
                            }
                            className='h-8 w-8 p-0 text-gray-400 hover:text-white'>
                            <Copy className='h-3 w-3' />
                          </Button>
                          <Button
                            size='sm'
                            variant='ghost'
                            className='h-8 w-8 p-0 text-gray-400 hover:text-white'
                            onClick={() =>
                              window.open(
                                `https://etherscan.io/address/${nft.contract.address}`,
                                '_blank',
                              )
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
                        <span className='text-gray-400'>Contract Name:</span>
                        <span className='text-white'>
                          {nft.contract.name || 'Unnamed contract'}
                        </span>
                      </div>
                      <div className='flex justify-between items-center'>
                        <span className='text-gray-400'>Symbol:</span>
                        <span className='text-white'>
                          {nft.contract.symbol || 'No symbol'}
                        </span>
                      </div>
                      {nft.contract.totalSupply && (
                        <div className='flex justify-between items-center'>
                          <span className='text-gray-400'>Total Supply:</span>
                          <span className='text-white'>
                            {nft.contract.totalSupply}
                          </span>
                        </div>
                      )}
                      <div className='flex justify-between items-center'>
                        <span className='text-gray-400'>Deployer:</span>
                        <div className='flex items-center gap-1'>
                          <code className='text-xs text-gray-300'>
                            {nft.contract.contractDeployer?.slice(0, 6)}
                            ...
                            {nft.contract.contractDeployer?.slice(-4)}
                          </code>
                          {nft.contract.contractDeployer && (
                            <Button
                              size='sm'
                              variant='ghost'
                              className='h-6 w-6 p-0 text-gray-400 hover:text-white'
                              onClick={() =>
                                window.open(
                                  `https://etherscan.io/address/${nft.contract.contractDeployer}`,
                                  '_blank',
                                )
                              }>
                              <ExternalLink className='h-3 w-3' />
                            </Button>
                          )}
                        </div>
                      </div>
                      <div className='flex justify-between items-center'>
                        <span className='text-gray-400'>Deployed Block:</span>
                        <span className='text-white'>
                          {nft.contract.deployedBlockNumber ? (
                            <a
                              href={`https://etherscan.io/block/${nft.contract.deployedBlockNumber}`}
                              target='_blank'
                              rel='noopener noreferrer'
                              className='text-lendr-400 hover:underline'>
                              #{nft.contract.deployedBlockNumber}
                            </a>
                          ) : (
                            'Unknown'
                          )}
                        </span>
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
                        <span className='text-gray-400'>Last Updated:</span>
                        <span className='text-white'>
                          {formatDate(nft.timeLastUpdated)}
                        </span>
                      </div>
                      {/* Not "unknown" */}
                      {nft.acquiredAt && nft.acquiredAt.blockTimestamp && (
                        <div className='flex justify-between items-center'>
                          <span className='text-gray-400'>Acquired:</span>
                          <span className='text-white'>
                            {formatDate(nft.acquiredAt.blockTimestamp)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Metadata URI */}
                  {nft.tokenUri && (
                    <>
                      <Separator className='bg-gray-700/50' />
                      <div>
                        <div className='flex items-center gap-2 mb-3'>
                          <FileText className='h-4 w-4 text-blue-400' />
                          <span className='font-medium text-white'>
                            Token URI
                          </span>
                        </div>
                        <div className='flex items-center gap-2'>
                          <code className='bg-gray-800/50 px-2 py-1 rounded text-sm font-mono text-gray-300 flex-1 truncate'>
                            {nft.tokenUri}
                          </code>
                          <Button
                            size='sm'
                            variant='ghost'
                            className='h-8 w-8 p-0 text-gray-400 hover:text-white'
                            onClick={() => window.open(nft.tokenUri, '_blank')}>
                            <ExternalLink className='h-3 w-3' />
                          </Button>
                        </div>
                      </div>
                    </>
                  )}

                  {/* Raw Metadata URI */}
                  {nft.raw.tokenUri && (
                    <>
                      <Separator className='bg-gray-700/50' />
                      <div>
                        <div className='flex items-center gap-2 mb-3'>
                          <FileText className='h-4 w-4 text-blue-400' />
                          <span className='font-medium text-white'>
                            Raw Metadata URI
                          </span>
                        </div>
                        <div className='flex items-center gap-2'>
                          <code className='bg-gray-800/50 px-2 py-1 rounded text-sm font-mono text-gray-300 flex-1 truncate'>
                            {nft.raw.tokenUri}
                          </code>
                          <Button
                            size='sm'
                            variant='ghost'
                            className='h-8 w-8 p-0 text-gray-400 hover:text-white'
                            onClick={() =>
                              window.open(nft.raw.tokenUri, '_blank')
                            }>
                            <ExternalLink className='h-3 w-3' />
                          </Button>
                        </div>
                      </div>
                    </>
                  )}

                  {/* Attributes */}
                  {nft.raw.metadata?.attributes &&
                    nft.raw.metadata.attributes.length > 0 && (
                      <>
                        <Separator className='bg-gray-700/50' />
                        <div>
                          <div className='flex items-center gap-2 mb-4'>
                            <Hash className='h-4 w-4 text-pink-400' />
                            <span className='font-medium text-white'>
                              Attributes
                            </span>
                          </div>
                          <div className='grid grid-cols-2 gap-3'>
                            {nft.raw.metadata.attributes.map(
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
                                  <div className='text-white font-medium'>
                                    {attr.value}
                                  </div>
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
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
};
