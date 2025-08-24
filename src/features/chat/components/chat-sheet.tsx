'use client';

import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { ConversationListView } from './conversation-list-view';
import { ChatView } from './chat-view';
import { MessageCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useChatSheetStore } from '@/stores/chat-sheet.store';

export function ChatSheet() {
  const { isOpen, closeChatSheet, selectedConversationId, setSelectedConversationId } = useChatSheetStore();

  return (
    <Sheet
      open={isOpen}
      onOpenChange={closeChatSheet}>
      <SheetContent className='w-[400px] sm:w-[540px] p-0 border-0 bg-transparent'>
        <motion.div
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 100 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className='h-full bg-gradient-to-br from-slate-900/95 via-slate-800/95 to-slate-900/95 backdrop-blur-xl border-l border-slate-700 relative overflow-hidden'>
          {/* Animated background */}
          <div className='absolute inset-0 bg-gradient-to-br from-lendr-yellow/5 via-transparent to-lendr-green/5' />
          <div className='absolute top-0 right-0 w-32 h-32 bg-lendr-yellow/10 rounded-full blur-3xl animate-pulse' />
          <div className='absolute bottom-0 left-0 w-24 h-24 bg-lendr-green/10 rounded-full blur-2xl animate-pulse delay-1000' />

          <div className='relative z-10 h-full flex flex-col'>
            <SheetHeader className='p-0 border-b border-white/10'>
              <SheetTitle className='text-white p-6 flex items-center justify-between'>
                <div className='flex items-center gap-3'>
                  <div className='rounded-lg bg-gradient-to-r from-lendr-yellow/20 to-lendr-green/20 backdrop-blur-sm'>
                    <MessageCircle className='w-5 h-5 text-lendr-yellow' />
                  </div>
                  <span className='text-lg font-semibold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent'>
                    {selectedConversationId ? 'Messages' : 'Your Messages'}
                  </span>
                </div>
                <button
                  onClick={closeChatSheet}
                  className='p-2 rounded-lg hover:bg-white/10 transition-colors duration-200'>
                  <X className='w-5 h-5 text-gray-400' />
                </button>
              </SheetTitle>
            </SheetHeader>

            <div className='flex-1 overflow-hidden'>
              <AnimatePresence mode='wait'>
                {selectedConversationId ? (
                  <motion.div
                    key='chat-view'
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                    className='h-full'>
                    <ChatView
                      conversationId={selectedConversationId}
                      onBack={() => setSelectedConversationId(null)}
                    />
                  </motion.div>
                ) : (
                  <motion.div
                    key='conversation-list'
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.2 }}
                    className='h-full'>
                    <ConversationListView onConversationSelect={setSelectedConversationId} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </SheetContent>
    </Sheet>
  );
}
