'use client';

import { useQuery } from 'convex/react';
import { api } from '@convex/_generated/api';
import { useAccount } from 'wagmi';
import type { Id } from '@convex/_generated/dataModel';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { motion } from 'framer-motion';
import { MessageCircle, Clock, User } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { UserAvatar } from '@/components/shared/user-avatar';

interface ConversationListViewProps {
  onConversationSelect: (conversationId: Id<'conversations'>) => void;
}

export function ConversationListView({ onConversationSelect }: ConversationListViewProps) {
  const { data: session } = useSession();
  const address = session?.user?.address;

  // Get user's conversation
  const conversations = useQuery(
    api.conversations.list,
    address ? { address } : 'skip',
  );

  console.log(conversations)

  // Get online users
  const onlineUsers = useQuery(api.presence.listOnlineUsers);

  if (address === undefined) {
    return (
      <div className='flex flex-col items-center justify-center h-full p-8 text-center'>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, ease: 'backOut' }}
          className='p-6 rounded-full bg-slate-700/50 backdrop-blur-sm mb-4'>
          <MessageCircle className='w-12 h-12 text-slate-500' />
        </motion.div>
        <h3 className='text-xl font-semibold text-white mb-2'>Please sign in</h3>
        <p className='text-gray-400 text-sm'>Please sign in to see your conversations</p>
      </div>
    );
  }

  if (conversations === undefined) {
    return (
      <div className='flex items-center justify-center h-full'>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: 'linear' }}
          className='w-8 h-8 border-2 border-lendr-yellow border-t-transparent rounded-full'
        />
      </div>
    );
  }

  if (conversations === null || conversations.length === 0) {
    return (
      <div className='flex flex-col items-center justify-center h-full p-8 text-center'>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, ease: 'backOut' }}
          className='p-6 rounded-full bg-slate-700/50 backdrop-blur-sm mb-4'>
          <MessageCircle className='w-12 h-12 text-slate-500' />
        </motion.div>
        <h3 className='text-xl font-semibold text-white mb-2'>No conversations yet</h3>
        <p className='text-gray-400 text-sm'>Start chatting with other users to see your conversations here</p>
      </div>
    );
  }

  return (
    <div className='p-4 space-y-2 h-full overflow-y-auto'>
      {conversations.map((conversation, index) => {
        const isOnline = onlineUsers?.includes(conversation?.participant?.address || '');
        return (
          <motion.div
            key={conversation?._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className='group relative'>
            <div
              className='flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-all duration-300 hover:bg-white/5 hover:backdrop-blur-sm border border-transparent hover:border-white/10 relative overflow-hidden'
              onClick={() => onConversationSelect(conversation?._id as Id<'conversations'>)}>
              {/* Hover glow effect */}
              <div className='absolute inset-0 bg-gradient-to-r from-lendr-yellow/5 to-lendr-green/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300' />

              <div className='relative z-10 flex items-center gap-4 w-full'>
                <div className='relative'>
                  <UserAvatar
                    avatarUrl={conversation?.participant?.avatarUrl || '/avatar-placeholder.png'}
                    username={conversation?.participant?.username}
                    isOnline={isOnline}
                    size='md'
                    className='mr-2'
                  />
                </div>

                <div className='flex-1 min-w-0'>
                  <div className='flex items-center justify-between mb-1'>
                    <h4 className='font-semibold text-white truncate'>
                      {conversation?.participant?.username || 'Anonymous User'}
                    </h4>
                    <div className='flex items-center gap-1 text-xs text-gray-400'>
                      <Clock className='w-3 h-3' />
                      <span>2h</span>
                    </div>
                  </div>
                  <p className='text-sm text-gray-400 truncate'>Last message preview...</p>
                </div>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
