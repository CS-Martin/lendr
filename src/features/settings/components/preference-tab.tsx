import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Palette, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ComingSoon from '@/components/shared/coming-soon';

export const PreferenceTab = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className='space-y-6'>
      <Card className='bg-gray-900/50 backdrop-blur-sm border-gray-800/50'>
        <CardHeader>
          <CardTitle className='flex items-center gap-2 text-white'>
            <Palette className='w-5 h-5 text-lendr-400' />
            Display Preferences
          </CardTitle>
          <CardDescription className='text-gray-400'>Customize your experience</CardDescription>
        </CardHeader>
        <ComingSoon />
        <CardContent className='space-y-6'>
          <div className='space-y-4'>
            <div>
              <Label className='text-white mb-3 block'>Theme</Label>
              <div className='grid grid-cols-3 gap-3'>
                {['Dark', 'Light', 'Auto'].map((theme) => (
                  <motion.button
                    key={theme}
                    className={`p-3 rounded-lg border transition-all ${
                      theme === 'Dark'
                        ? 'border-lendr-400 bg-lendr-400/10 text-lendr-400'
                        : 'border-gray-700/50 text-gray-400 hover:border-gray-600 hover:text-white'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}>
                    {theme}
                  </motion.button>
                ))}
              </div>
            </div>

            <div>
              <Label className='text-white mb-3 block'>Currency Display</Label>
              <select className='w-full bg-gray-800/50 border border-gray-700/50 text-white rounded-lg px-3 py-2 focus:border-lendr-400/50'>
                <option>POL</option>
                <option>USD</option>
                <option>EUR</option>
              </select>
            </div>

            <div>
              <Label className='text-white mb-3 block'>Language</Label>
              <select className='w-full bg-gray-800/50 border border-gray-700/50 text-white rounded-lg px-3 py-2 focus:border-lendr-400/50'>
                <option>English</option>
                <option>Spanish</option>
                <option>French</option>
                <option>German</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className='bg-red-900/20 backdrop-blur-sm border-red-800/50'>
        <CardHeader>
          <CardTitle className='flex items-center gap-2 text-red-400'>
            <Trash2 className='w-5 h-5' />
            Danger Zone
          </CardTitle>
          <CardDescription className='text-red-300/70'>Irreversible and destructive actions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='flex items-center justify-between'>
            <div>
              <h4 className='font-medium text-white'>Delete Account</h4>
              <p className='text-sm text-gray-400'>Permanently delete your account and all data</p>
            </div>
            <Button
              variant='destructive'
              className='bg-red-600 hover:bg-red-700'>
              Delete Account
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
