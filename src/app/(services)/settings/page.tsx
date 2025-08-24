'use client';

import type React from 'react';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, Shield, Bell, Palette } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { ProfileTab } from '@/features/settings/components/profile-tab';
import { SecurityTab } from '@/features/settings/components/security-tab';
import { NotificationTab } from '@/features/settings/components/notification-tab';
import { PreferenceTab } from '@/features/settings/components/preference-tab';
import NotFound from '@/app/not-found';

export default function SettingsPage() {
  const { data: session } = useSession();
  const user = session?.user;

  const [activeTab, setActiveTab] = useState('profile');
  //   const fileInputRef = useRef<HTMLInputElement>(null);

  if (user === null) {
    return <NotFound />;
  }

  return (
    <div className='min-h-screen bg-black text-white relative overflow-hidden'>
      {/* Animated Background */}
      <div className='fixed inset-0 z-0'>
        <div className='absolute inset-0 bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-cyan-900/20' />
        <div className='absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.1),transparent_50%)]' />
        <div className='absolute top-0 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse' />
        <div className='absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse delay-1000' />
        <div className='absolute top-1/2 left-0 w-64 h-64 bg-lendr-400/10 rounded-full blur-3xl animate-pulse delay-500' />
      </div>

      <div className='relative z-10 max-w-7xl mt-10 md:mt-20 mx-auto px-2 lg:px-0'>
        {/* Header */}
        <motion.div
          className='mb-8'
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}>
          <h1 className='text-2xl md:text-4xl font-bold bg-gradient-to-r from-lendr-400 to-purple-400 bg-clip-text text-transparent mb-2'>
            Profile Settings
          </h1>
          <p className='text-gray-400'>Manage your account settings and preferences</p>
        </motion.div>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className='w-full'>
          <TabsList className='flex w-full overflow-x-auto no-scrollbar bg-gray-900/50 backdrop-blur-sm border border-gray-800/50 h-11'>
            <TabsTrigger
              value='profile'
              className='flex-shrink-0 data-[state=active]:bg-lendr-400/20 data-[state=active]:text-lendr-400 text-white px-4 py-2'>
              <User className='w-4 h-4 mr-2' />
              Profile
            </TabsTrigger>
            <TabsTrigger
              value='security'
              className='flex-shrink-0 data-[state=active]:bg-lendr-400/20 data-[state=active]:text-lendr-400 text-white px-4 py-2'>
              <Shield className='w-4 h-4 mr-2' />
              Security
            </TabsTrigger>
            <TabsTrigger
              value='notifications'
              className='flex-shrink-0 data-[state=active]:bg-lendr-400/20 data-[state=active]:text-lendr-400 text-white px-4 py-2'>
              <Bell className='w-4 h-4 mr-2' />
              Notifications
            </TabsTrigger>
            <TabsTrigger
              value='preferences'
              className='flex-shrink-0 data-[state=active]:bg-lendr-400/20 data-[state=active]:text-lendr-400 text-white px-4 py-2'>
              <Palette className='w-4 h-4 mr-2' />
              Preferences
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent
            value='profile'
            className='space-y-6'>
            <ProfileTab address={user?.address} />
          </TabsContent>

          {/* Security Tab */}
          <TabsContent
            value='security'
            className='space-y-6'>
            <SecurityTab user={user} />
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent
            value='notifications'
            className='space-y-6'>
            <NotificationTab />
          </TabsContent>

          {/* Preferences Tab */}
          <TabsContent
            value='preferences'
            className='space-y-6'>
            <PreferenceTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
