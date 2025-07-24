import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Bell } from 'lucide-react';

export const NotificationTab = () => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}>
            <Card className='bg-gray-900/50 backdrop-blur-sm border-gray-800/50'>
                <CardHeader>
                    <CardTitle className='flex items-center gap-2 text-white'>
                        <Bell className='w-5 h-5 text-lendr-400' />
                        Notification Preferences
                    </CardTitle>
                    <CardDescription>Choose what notifications you want to receive</CardDescription>
                </CardHeader>
                <CardContent className='space-y-6'>
                    {[
                        { title: 'New Bids', description: 'Get notified when someone bids on your NFTs', enabled: true },
                        { title: 'Rental Requests', description: 'Notifications for new rental requests', enabled: true },
                        {
                            title: 'Price Alerts',
                            description: 'Get alerts when NFT prices change significantly',
                            enabled: false,
                        },
                        {
                            title: 'Marketing Updates',
                            description: 'Receive updates about new features and promotions',
                            enabled: false,
                        },
                    ].map((notification, index) => (
                        <div
                            key={index}
                            className='flex items-center justify-between p-4 bg-gray-800/30 rounded-lg border border-gray-700/50'>
                            <div>
                                <h4 className='font-medium text-white'>{notification.title}</h4>
                                <p className='text-sm text-gray-400'>{notification.description}</p>
                            </div>
                            <motion.button
                                className={`relative w-12 h-6 rounded-full transition-colors ${notification.enabled ? 'bg-lendr-400' : 'bg-gray-600'
                                    }`}
                                onClick={() => { }}
                                whileTap={{ scale: 0.95 }}>
                                <motion.div
                                    className='absolute top-1 w-4 h-4 bg-white rounded-full shadow-md'
                                    animate={{
                                        x: notification.enabled ? 24 : 4,
                                    }}
                                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                                />
                            </motion.button>
                        </div>
                    ))}
                </CardContent>
            </Card>
        </motion.div>
    )
}