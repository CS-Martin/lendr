'use client';

import { useQuery } from 'convex/react';
import { api } from '@convex/_generated/api';
import type { Id } from '@convex/_generated/dataModel';
import { Message } from './message';
import { MessageInput } from './message-input';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { ArrowLeft, MoreVertical, Phone, Video } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { useAccount } from 'wagmi';
import { UserAvatar } from '@/components/shared/user-avatar';

interface ChatViewProps {
  conversationId: Id<'conversations'>;
  onBack: () => void;
}

export function ChatView({ conversationId, onBack }: ChatViewProps) {
  const { address } = useAccount();

  const messages = useQuery(api.messages.listMessages, { conversationId });
  const conversation = useQuery(api.conversations.get, {
    conversationId,
    address: address || '',
  });

  const onlineUsers = useQuery(api.presence.listOnlineUsers);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const isOnline = onlineUsers?.includes(conversation?.participant?.address || '');

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  console.log(conversation);

  return (
    <div className='flex flex-col h-full'>
      {/* Chat Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className='flex items-center justify-between p-4 border-b border-white/10 bg-gradient-to-r from-slate-800/50 to-slate-700/50 backdrop-blur-sm'>
        <div className='flex items-center gap-3'>
          <Button
            variant='ghost'
            size='sm'
            onClick={onBack}
            className='text-gray-400 hover:text-white hover:bg-white/10 p-2'>
            <ArrowLeft className='w-4 h-4' />
          </Button>
          <div className='flex items-center gap-3'>
            <UserAvatar
              avatarUrl={conversation?.participant?.avatarUrl || '/avatar-placeholder.png'}
              username={conversation?.participant?.username}
              isOnline={isOnline}
              size='md'
              className='mr-2'
            />
            <div>
              <h3 className='font-semibold text-white text-sm'>
                {conversation?.participant?.username || 'Anonymous User'}
              </h3>
              <p className='text-xs text-gray-400'>{isOnline ? 'Online' : 'Offline'}</p>
            </div>
          </div>
        </div>

        <div className='flex items-center gap-2'>
          <Button
            variant='ghost'
            size='sm'
            className='text-gray-400 hover:text-white hover:bg-white/10 p-2'>
            <MoreVertical className='w-4 h-4' />
          </Button>
        </div>
      </motion.div>

      {/* Messages Area */}
      <div className='flex-1 p-4 overflow-y-auto space-y-4 bg-gradient-to-b from-transparent to-slate-900/20'>
        {messages === undefined ? (
          <div className='flex items-center justify-center h-full'>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: 'linear' }}
              className='w-8 h-8 border-2 border-lendr-yellow border-t-transparent rounded-full'
            />
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className='space-y-4'>
            {messages.map((message, index) => (
              <motion.div
                key={message._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}>
                <Message message={message} />
              </motion.div>
            ))}
            <div ref={messagesEndRef} />
          </motion.div>
        )}
      </div>

      {/* Message Input */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className='p-4 border-t border-white/10 bg-gradient-to-r from-slate-800/50 to-slate-700/50 backdrop-blur-sm'>
        <MessageInput conversationId={conversationId} />
      </motion.div>
    </div>
  );
}
