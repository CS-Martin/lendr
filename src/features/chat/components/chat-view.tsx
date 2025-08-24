'use client';

import { usePaginatedQuery, useQuery } from 'convex/react';
import { api } from '@convex/_generated/api';
import type { Doc, Id } from '@convex/_generated/dataModel';
import { Message } from './message';
import { MessageInput } from './message-input';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { ArrowLeft, MoreVertical } from 'lucide-react';
import { Fragment, useEffect, useRef, useState } from 'react';
import { useAccount } from 'wagmi';
import { useInView } from 'react-intersection-observer';
import { UserAvatar } from '@/components/shared/user-avatar';
import { MessageSkeleton } from './skeletons';

interface ChatViewProps {
  conversationId: Id<'conversations'>;
  onBack: () => void;
}

const MESSAGES_PER_PAGE = 10;

export function ChatView({ conversationId, onBack }: ChatViewProps) {
  const { address } = useAccount();
  const { ref, inView } = useInView({
    triggerOnce: false,
    rootMargin: '200px 0px',
  });

  const messageContainerRef = useRef<HTMLDivElement>(null);
  const prevMessageCount = useRef(0);

  const {
    results: messages,
    loadMore,
    status,
    isLoading,
  } = usePaginatedQuery(api.messages.listMessagesPaginated, { conversationId }, { initialNumItems: MESSAGES_PER_PAGE });
  const conversation = useQuery(api.conversations.get, address ? { conversationId, address } : 'skip');

  // Load more messages when sentinel comes into view
  useEffect(() => {
    if (inView && status === 'CanLoadMore') {
      loadMore(MESSAGES_PER_PAGE);
    }
  }, [inView, status, loadMore]);

  const currentUser = useQuery(api.user.getUser, { address });
  const onlineUsers = useQuery(api.presence.listOnlineUsers);
  const typingUsers = useQuery(api.presence.getTypingStatus, { conversationId });

  const isOnline = onlineUsers?.includes(conversation?.participant?.address || '');
  const isTyping = conversation?.participant?._id
    ? (typingUsers?.includes(conversation.participant._id) ?? false)
    : false;

  useEffect(() => {
    const container = messageContainerRef.current;
    if (!container) return;

    // First render → always scroll to bottom
    if (prevMessageCount.current === 0) {
      container.scrollTop = container.scrollHeight;
      prevMessageCount.current = messages.length;
      return;
    }

    // Messages count increased
    if (messages.length > prevMessageCount.current) {
      const prevFirstMessageId = messages[0]?._id;
      const prevLastMessageId = messages[messages.length - 1]?._id;

      // --- Case 1: User loaded OLDER messages ---
      // Check if new messages were prepended (older ones)
      if (prevFirstMessageId !== undefined && messages.find((m) => m._id === prevFirstMessageId)) {
        const oldScrollHeight = container.scrollHeight;
        requestAnimationFrame(() => {
          const newScrollHeight = container.scrollHeight;
          container.scrollTop += newScrollHeight - oldScrollHeight; // preserve position
        });
      }
      // --- Case 2: New message arrived at bottom ---
      else {
        const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 100; // px threshold

        if (isNearBottom) {
          container.scrollTop = container.scrollHeight; // only scroll if user is near bottom
        }
      }
    }

    prevMessageCount.current = messages.length;
  }, [messages]);

  return (
    <div className='flex flex-col h-full'>
      {/* Chat Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className='flex items-center justify-between p-4 border-b border-white/10 bg-gradient-to-r from-slate-800/50 to-slate-700/50 backdrop-blur-sm z-10'>
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
              username={conversation?.participant?.username || conversation?.participant?.address}
              isOnline={isOnline}
              size='md'
              className='mr-2'
            />
            <div>
              <h3 className='font-semibold text-white text-sm'>
                {conversation?.participant?.username || 'Anonymous User'}
              </h3>
              <p className='text-xs text-gray-400'>{isTyping ? 'Typing...' : isOnline ? 'Online' : 'Offline'}</p>
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
      <div
        ref={messageContainerRef}
        className='flex-1 p-4 overflow-y-auto flex flex-col bg-gradient-to-b from-transparent to-slate-900/20'>
        {messages.length === 0 && status === 'Exhausted' ? (
          <div className='flex items-center justify-center h-full'>
            <p className='text-gray-400'>No messages yet</p>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className='space-y-4'>
            {/* Top loader + sentinel */}
            {status === 'CanLoadMore' && (
              <div
                ref={ref}
                className='flex justify-center py-2'>
                {isLoading && <MessageSkeleton />}
              </div>
            )}

            {messages
              .slice()
              .sort((a, b) => a._creationTime - b._creationTime)
              .map((message, index) => (
                <Fragment key={message._id}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}>
                    <Message
                      message={message}
                      currentUser={currentUser as Doc<'users'>}
                      otherParticipant={conversation?.participant as Doc<'users'>}
                      isOtherParticipantOnline={isOnline || false}
                    />
                  </motion.div>
                </Fragment>
              ))}
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
