'use client';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { motion } from 'framer-motion';
import { RocketIcon } from 'lucide-react';

export default function ComingSoon() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className='flex items-center justify-center w-full'>
      <Alert className='w-full max-w-lg bg-gray-900/50 backdrop-blur-sm border border-gray-800/50'>
        <motion.div
          initial={{ scale: 0.8, rotate: -10 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.2, type: 'spring' }}>
          <RocketIcon className='h-6 w-6 text-lendr-400' />
        </motion.div>

        <div className='ml-4'>
          <AlertTitle className='text-xl font-bold text-white flex items-center gap-2'>
            <motion.span
              initial={{ x: -10 }}
              animate={{ x: 0 }}
              transition={{ delay: 0.1 }}>
              Coming Soon!
            </motion.span>
          </AlertTitle>
          <AlertDescription className='mt-2 text-gray-300'>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}>
              We&apos;re working hard to bring you this exciting new feature.
            </motion.p>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className='mt-2 text-gray-400'>
              Stay tuned for updates!
            </motion.p>
          </AlertDescription>
        </div>

        <motion.div
          className='absolute -bottom-4 -right-4'
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, type: 'spring' }}>
          <div className='relative'>
            <div className='absolute inset-0 bg-lendr-400 rounded-full blur-md opacity-20'></div>
            <div className='relative px-3 py-1 text-xs font-medium rounded-full bg-gradient-to-r from-lendr-400/20 to-lendr-500/20 text-lendr-400 border border-lendr-400/30'>
              Under Development
            </div>
          </div>
        </motion.div>
      </Alert>
    </motion.div>
  );
}
