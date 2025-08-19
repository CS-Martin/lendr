'use client';

import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { UserDto } from '@repo/shared-dtos';
import ComingSoon from '@/components/shared/coming-soon';

interface SecurityTabProps {
  user: UserDto;
}

export const SecurityTab = ({ user }: SecurityTabProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className='space-y-6'>
      <Card className='bg-gray-900/50 backdrop-blur-sm border-gray-800/50'>
        <CardHeader>
          <CardTitle className='flex items-center gap-2 text-white'>
            <Shield className='w-5 h-5 text-lendr-400' />
            Wallet Security
          </CardTitle>
          <CardDescription className='text-gray-400'>
            Manage your wallet connections and security settings
          </CardDescription>
          <ComingSoon />
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='flex items-center justify-between p-4 bg-gray-800/30 rounded-lg border border-gray-700/50'>
            <div>
              <h4 className='font-semibold text-white'>Connected Wallet</h4>
              <p className='text-sm text-gray-400'>
                MetaMask - {user?.address.slice(0, 6)}...{user?.address.slice(-4)}
              </p>
            </div>
            <div className='flex items-center gap-2'>
              <div className='w-2 h-2 bg-green-400 rounded-full animate-pulse' />
              <span className='text-sm text-green-400'>Connected</span>
            </div>
          </div>

          <div className='space-y-3'>
            <div className='flex items-center justify-between'>
              <div>
                <h4 className='font-medium text-white'>Two-Factor Authentication</h4>
                <p className='text-sm text-gray-400'>Add an extra layer of security</p>
              </div>
              <Button
                variant='outline'
                className='border-lendr-400/50 text-lendr-400 hover:bg-lendr-400/10 bg-transparent'>
                Enable 2FA
              </Button>
            </div>

            <div className='flex items-center justify-between'>
              <div>
                <h4 className='font-medium text-white'>Session Management</h4>
                <p className='text-sm text-gray-400'>View and manage active sessions</p>
              </div>
              <Button
                variant='outline'
                className='border-gray-700/50 text-gray-400 hover:text-white bg-transparent'>
                Manage Sessions
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
