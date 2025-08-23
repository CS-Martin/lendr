import { ReactNode, ComponentType, SVGProps } from 'react';

export const DetailSection = ({
  title,
  icon: Icon,
  iconColor = 'text-white',
  children,
}: {
  title: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  iconColor?: string;
  children: ReactNode;
}) => (
  <>
    <div className='flex items-center gap-2 mb-3'>
      <Icon className={`h-4 w-4 ${iconColor}`} />
      <span className='font-medium text-white'>{title}</span>
    </div>
    {children}
  </>
);
