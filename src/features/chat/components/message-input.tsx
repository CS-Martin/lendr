'use client';

import type React from 'react';
import { useEffect, useState } from 'react';
import { useMutation } from 'convex/react';
import { api } from '@convex/_generated/api';
import type { Id } from '@convex/_generated/dataModel';
import { useAccount } from 'wagmi';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Send, Mic } from 'lucide-react';

interface MessageInputProps {
  conversationId: Id<'conversations'>;
}

export function MessageInput({ conversationId }: MessageInputProps) {
  const [body, setBody] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { address } = useAccount();
  const sendMessage = useMutation(api.messages.sendMessage);
  const updateTypingStatus = useMutation(api.presence.updateTypingStatus);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address || !body.trim()) return;

    setIsLoading(true);
    try {
      await sendMessage({
        conversationId,
        body: body.trim(),
        authorAddress: address,
      });
      setBody('');
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!address) return;
    let typingTimer: NodeJS.Timeout;
    if (body.length > 0) {
      updateTypingStatus({ conversationId, address });
      typingTimer = setTimeout(() => {
        // This is a bit of a hack to signal that the user has stopped typing.
        // In a real app, you might want a more robust solution.
      }, 2000);
    }
    return () => clearTimeout(typingTimer);
  }, [body, conversationId, address, updateTypingStatus]);

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit}
      className='relative'>
      <div className='flex items-center gap-3 p-3 bg-slate-800/80 backdrop-blur-sm border border-white/10 rounded-2xl focus-within:border-lendr-yellow/50 transition-colors duration-200'>
        <div className='flex-1 relative'>
          <Input
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder='Type a message...'
            className='bg-transparent border-0 text-white placeholder:text-gray-400 focus-visible:ring-0 focus-visible:ring-offset-0 px-0'
            disabled={isLoading}
          />
        </div>

        <div className='flex items-center gap-2'>
          {body.trim() ? (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}>
              <Button
                type='submit'
                size='sm'
                disabled={isLoading}
                className='bg-lendr-500 text-white hover:opacity-90 p-2 rounded-lg'>
                {isLoading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: 'linear' }}
                    className='w-4 h-4 border-2 border-black border-t-transparent rounded-full'
                  />
                ) : (
                  <Send className='w-4 h-4' />
                )}
              </Button>
            </motion.div>
          ) : (
            <Button
              type='button'
              variant='ghost'
              size='sm'
              className='text-gray-400 hover:text-white hover:bg-white/10 p-2'>
              <Mic className='w-4 h-4' />
            </Button>
          )}
        </div>
      </div>
    </motion.form>
  );
}
