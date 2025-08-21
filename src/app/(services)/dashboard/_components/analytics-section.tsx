'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useSession } from 'next-auth/react';
import { useQuery } from 'convex/react';
import { DollarSign, List, Clock, Star } from 'lucide-react';
import { api } from '../../../../../convex/_generated/api';

const AnalyticsSection = () => {
  const { data: session } = useSession();
  const address = session?.user?.address || '';
  const analytics = useQuery(api.user.getDashboardAnalytics, { address });

  const stats = [
    { title: 'Total Earnings', value: `${analytics?.totalEarnings.toLocaleString() || 0}`, icon: DollarSign },
    { title: 'Active Listings', value: analytics?.activeRentalPosts || 0, icon: List },
    { title: 'Total Rentals', value: analytics?.totalRents || 0, icon: Clock },
    { title: 'Reputation', value: analytics?.reputation || 0, icon: Star },
  ];

  return (
    <div className='grid grid-cols-1 md:grid-cols-4 gap-8'>
      {stats.map((stat, index) => (
        <Card
          key={index}
          className='bg-gray-800 border-gray-700 p-6'>
          <CardHeader className='flex flex-row items-center justify-between pb-2'>
            <CardTitle className='text-sm font-medium text-gray-400'>{stat.title}</CardTitle>
            <stat.icon className='w-4 h-4 text-gray-400' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-white'>{stat.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default AnalyticsSection;
