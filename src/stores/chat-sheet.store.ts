import { create } from 'zustand';
import { Id } from '@convex/_generated/dataModel';

interface ChatSheetState {
  isOpen: boolean;
  selectedConversationId: Id<'conversations'> | null;
  openChatSheet: (conversationId?: Id<'conversations'>) => void;
  closeChatSheet: () => void;
  setSelectedConversationId: (conversationId: Id<'conversations'> | null) => void;
}

export const useChatSheetStore = create<ChatSheetState>((set) => ({
  isOpen: false,
  selectedConversationId: null,
  openChatSheet: (conversationId) => set({ isOpen: true, selectedConversationId: conversationId || null }),
  closeChatSheet: () => set({ isOpen: false, selectedConversationId: null }),
  setSelectedConversationId: (conversationId) => set({ selectedConversationId: conversationId }),
}));
