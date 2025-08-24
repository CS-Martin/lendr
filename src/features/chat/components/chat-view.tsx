'use client';

import { useQuery } from 'convex/react';
import { api } from '@convex/_generated/api';
import type { Doc, Id } from '@convex/_generated/dataModel';
import { Message, MessageSkeleton } from './message';
import { MessageInput } from './message-input';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { ArrowLeft, MoreVertical } from 'lucide-react';
import { Fragment, useEffect, useRef, useState } from 'react';
import { useAccount } from 'wagmi';
import { useInView } from 'react-intersection-observer';
import { UserAvatar } from '@/components/shared/user-avatar';

interface ChatViewProps {
  conversationId: Id<'conversations'>;
  onBack: () => void;
}

const MESSAGES_PER_PAGE = 10;

export function ChatView({ conversationId, onBack }: ChatViewProps) {
  const { address } = useAccount();
  const { ref, inView } = useInView();
  const messageContainerRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<Doc<'messages'>[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const paginatedMessages = useQuery(api.messages.listMessagesPaginated, {
    conversationId,
    paginationOpts: { numItems: MESSAGES_PER_PAGE, cursor },
  });

  const latestMessages = useQuery(api.messages.listMessages, { conversationId });

  const conversation = useQuery(
    api.conversations.get,
    address ? { conversationId, address } : 'skip'
  );

  const currentUser = useQuery(api.user.getUser, { address });

  const onlineUsers = useQuery(api.presence.listOnlineUsers);
  const typingUsers = useQuery(api.presence.getTypingStatus, { conversationId });

  const isOnline = onlineUsers?.includes(conversation?.participant?.address || '');
  const isTyping = conversation?.participant?._id
    ? (typingUsers?.includes(conversation.participant._id) ?? false)
    : false;

  useEffect(() => {
    if (paginatedMessages) {
      setMessages((prev) => [...paginatedMessages.page, ...prev]);
      setCursor(paginatedMessages.continueCursor);
      setHasNextPage(!paginatedMessages.isDone);
    }
  }, [paginatedMessages]);

  useEffect(() => {
    if (latestMessages) {
      setMessages((prev) => {
        const newMessages = latestMessages.filter(
          (msg) => !prev.some((m) => m._id === msg._id)
        );
        return [...prev, ...newMessages];
      });
    }
  }, [latestMessages]);

  useEffect(() => {
    if (inView && hasNextPage && !isLoading) {
      setIsLoading(true);
    }
  }, [inView, hasNextPage, isLoading]);

  useEffect(() => {
    if (isLoading) {
      setIsLoading(false);
    }
  }, [isLoading]);

  useEffect(() => {
    if (messageContainerRef.current) {
      messageContainerRef.current.scrollTop = messageContainerRef.current.scrollHeight;
    }
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
        className='flex-1 p-4 overflow-y-auto flex flex-col-reverse bg-gradient-to-b from-transparent to-slate-900/20'>
        {messages.length === 0 && !hasNextPage ? (
          <div className='flex items-center justify-center h-full'>
            <p className='text-gray-400'>No messages yet</p>
          </div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className='space-y-4'>
            {messages
              .slice()
              .sort((a, b) => a._creationTime - b._creationTime)
              .map((message, index) => (
                <Fragment key={index}>
                  {index === messages.length - 1 && hasNextPage && <div ref={ref} />}
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
            {isLoading && <MessageSkeleton />}
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