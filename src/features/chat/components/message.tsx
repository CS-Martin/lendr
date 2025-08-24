'use client';

import { useState } from 'react';
import { useMutation } from 'convex/react';
import { api } from '@convex/_generated/api';
import type { Doc } from '@convex/_generated/dataModel';
import { useAccount } from 'wagmi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { motion, AnimatePresence } from 'framer-motion';
import { MoreHorizontal, Edit3, Trash2, Check, X } from 'lucide-react';
import { UserAvatar } from '@/components/shared/user-avatar';
import { Skeleton } from '@/components/ui/skeleton';

interface MessageProps {
  message: Doc<'messages'>;
  currentUser: Doc<'users'> | null;
  otherParticipant: Doc<'users'> | null;
  isOtherParticipantOnline: boolean;
}

export function Message({ message, currentUser, otherParticipant, isOtherParticipantOnline }: MessageProps) {
  const { address } = useAccount();
  const [isEditing, setIsEditing] = useState(false);
  const [editedBody, setEditedBody] = useState(message.body);

  const updateMessage = useMutation(api.messages.updateMessage);
  const deleteMessage = useMutation(api.messages.deleteMessage);

  const handleUpdate = async () => {
    if (!address) return;
    await updateMessage({
      messageId: message._id,
      body: editedBody,
      authorAddress: address,
    });
    setIsEditing(false);
  };

  const handleDelete = async () => {
    if (!address) return;
    await deleteMessage({ messageId: message._id, authorAddress: address });
  };

  const isAuthor = message.authorId === currentUser?._id;

  const author = isAuthor ? currentUser : otherParticipant;

  const messageDate = new Date(message._creationTime);
  const timeString = messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      className={`flex items-start gap-3 group ${isAuthor ? 'justify-end' : 'justify-start'}`}>
      {!isAuthor && (
        <UserAvatar
          avatarUrl={author?.avatarUrl || '/avatar-placeholder.png'}
          username={author?.username || author?.address}
          isOnline={isOtherParticipantOnline}
          size='sm'
          className='mt-1'
        />
      )}

      {/* Edit button */}
      {isAuthor && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant='ghost'
              size='sm'
              className={
                'opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-gray-400 hover:text-white hover:bg-white/10 p-2'
              }>
              <MoreHorizontal className='w-4 h-4' />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className='bg-slate-800 border-white/10 text-white'>
            <DropdownMenuItem
              onClick={() => setIsEditing(true)}
              className='hover:bg-white/10 focus:bg-white/10'>
              <Edit3 className='w-4 h-4 mr-2' />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={handleDelete}
              className='hover:bg-red-500/20 focus:bg-red-500/20 text-red-400'>
              <Trash2 className='w-4 h-4 mr-2' />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      <div className={`max-w-[70%] flex flex-col ${isAuthor ? 'items-end' : 'items-start'}`}>
        <AnimatePresence mode='wait'>
          {isEditing ? (
            <motion.div
              key='editing'
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className='bg-slate-800/80 backdrop-blur-sm border border-white/10 rounded-2xl p-4 space-y-3 w-full'>
              <Input
                value={editedBody}
                onChange={(e) => setEditedBody(e.target.value)}
                className='bg-slate-700/50 border-white/10 text-white placeholder:text-gray-400 focus:border-lendr-yellow/50'
                placeholder='Edit your message...'
              />
              <div className='flex items-center gap-2 justify-end'>
                <Button
                  size='sm'
                  variant='ghost'
                  onClick={() => setIsEditing(false)}
                  className='text-gray-400 hover:text-white hover:bg-white/10'>
                  <X className='w-4 h-4' />
                </Button>
                <Button
                  size='sm'
                  onClick={handleUpdate}
                  className='bg-gradient-to-r from-lendr-yellow to-lendr-green text-black hover:opacity-90'>
                  <Check className='w-4 h-4' />
                </Button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key='message'
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className={`relative rounded-2xl p-3 backdrop-blur-sm border ${
                isAuthor
                  ? 'bg-gradient-to-r from-lendr-yellow/20 to-lendr-green/20 border-lendr-yellow/30 text-white'
                  : 'bg-slate-800/80 border-white/10 text-white'
              }`}>
              <div className='relative z-10'>
                <p className='text-sm leading-relaxed'>{message.body}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div className='text-xs text-gray-400 mt-1 px-2'>
          {timeString}
          {message.updatedAt && !isEditing && <span className='text-gray-500 italic'> (edited)</span>}
        </div>
      </div>
    </motion.div>
  );
}
