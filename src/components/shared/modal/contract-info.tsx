import { DetailSection } from './detail-section';
import { ExternalLink, Link } from 'lucide-react';
import { NftContractForNft } from 'alchemy-sdk';
import { Button } from '@/components/ui/button';
import { truncateText } from '@/lib/utils';
import { AddressField } from './address-field';

export const ContractInfo = ({ nftContract }: { nftContract: NftContractForNft }) => (
  <div>
    <DetailSection
      title='Contract Information'
      icon={Link}
      iconColor='text-green-400'>
      <div className='space-y-3 mt-4'>
        <AddressField
          label='Contract Address'
          address={nftContract.address}
        />
        <div className='flex justify-between items-center'>
          <span className='text-gray-400'>Contract Name:</span>
          <span className='text-white'>{nftContract.name || 'Unnamed contract'}</span>
        </div>
        <div className='flex justify-between items-center'>
          <span className='text-gray-400'>Symbol:</span>
          <span className='text-white'>{nftContract.symbol || 'No symbol'}</span>
        </div>
        {nftContract.totalSupply && (
          <div className='flex justify-between items-center'>
            <span className='text-gray-400'>Total Supply:</span>
            <span className='text-white'>{nftContract.totalSupply}</span>
          </div>
        )}
        {nftContract.contractDeployer && (
          <div className='flex justify-between items-center'>
            <span className='text-gray-400'>Deployer:</span>
            <div className='flex items-center gap-1'>
              <code className='text-xs text-gray-300'>{truncateText(nftContract.contractDeployer, 6, 4)}</code>
              <Button
                size='sm'
                variant='ghost'
                className='h-6 w-6 p-0 text-gray-400 hover:text-white'
                onClick={() =>
                  window.open(`https://etherscan.io/address/${nftContract.contractDeployer}`, '_blank')
                }>
                <ExternalLink className='h-3 w-3' />
              </Button>
            </div>
          </div>
        )}
        {nftContract.deployedBlockNumber && (
          <div className='flex justify-between items-center'>
            <span className='text-gray-400'>Deployed Block:</span>
            <span className='text-white'>
              <a
                href={`https://etherscan.io/block/${nftContract.deployedBlockNumber}`}
                target='_blank'
                rel='noopener noreferrer'
                className='text-lendr-400 hover:underline'>
                #{nftContract.deployedBlockNumber}
              </a>
            </span>
          </div>
        )}
      </div>
    </DetailSection>
  </div>
);
