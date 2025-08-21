'use client';

import AnalyticsSection from './_components/analytics-section';
import MyListingsSection from './_components/my-listings-section';
import MyBorrowsSection from './_components/my-borrows-section';

const DashboardPage = () => {
  return (
    <div className='min-h-screen bg-slate-950 overflow-hidden'>
      <div className='container max-w-7xl mx-auto'>
        <div className='flex justify-between items-center my-8'>
          <div>
            <h1 className='text-3xl font-bold text-white'>Dashboard</h1>
            <p className='text-gray-400'>Manage your NFT lending and earnings</p>
          </div>
        </div>
        <AnalyticsSection />

        <div className='mt-12'>
          <MyListingsSection />
        </div>

        <div className='mt-12'>
          <MyBorrowsSection />
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
