import { FileText } from 'lucide-react';
import { DetailSection } from './detail-section';
import { Button } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';

export const UriSection = ({
  title,
  uri,
  iconColor = 'text-blue-400',
}: {
  title: string;
  uri: string;
  iconColor?: string;
}) => (
  <div>
    <DetailSection
      title={title}
      icon={FileText}
      iconColor={iconColor}>
      <div className='flex items-center gap-2 mt-3'>
        <code className='bg-gray-800/50 px-2 py-1 rounded text-sm font-mono text-gray-300 flex-1 truncate'>{uri}</code>
        <Button
          size='sm'
          variant='ghost'
          className='h-8 w-8 p-0 text-gray-400 hover:text-white'
          onClick={() => window.open(uri, '_blank')}>
          <ExternalLink className='h-3 w-3' />
        </Button>
      </div>
    </DetailSection>
  </div>
);
