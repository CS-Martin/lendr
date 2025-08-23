"use client"

import { useState } from "react"
import { useMutation } from "convex/react"
import { api } from "@convex/_generated/api"
import type { Id } from "@convex/_generated/dataModel"
import { useAccount } from "wagmi"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { motion, AnimatePresence } from "framer-motion"
import { MoreHorizontal, Edit3, Trash2, Check, X } from "lucide-react"

interface MessageProps {
  message: {
    _id: Id<"messages">
    body: string
    authorId: Id<"users">
    updatedAt?: number
  }
}

export function Message({ message }: MessageProps) {
  const { address } = useAccount()
  const [isEditing, setIsEditing] = useState(false)
  const [editedBody, setEditedBody] = useState(message.body)

  const updateMessage = useMutation(api.messages.updateMessage)
  const deleteMessage = useMutation(api.messages.deleteMessage)

  const handleUpdate = async () => {
    if (!address) return
    await updateMessage({
      messageId: message._id,
      body: editedBody,
      authorAddress: address,
    })
    setIsEditing(false)
  }

  const handleDelete = async () => {
    if (!address) return
    await deleteMessage({ messageId: message._id, authorAddress: address })
  }

  // A real app would look up the author's address and compare it to the current user's address.
  // For now, we'll assume a simplified check.
  const isAuthor = true // Replace with actual author check

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      className={`flex items-start gap-3 group ${isAuthor ? "justify-end" : "justify-start"}`}
    >
      {!isAuthor && (
        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-lendr-yellow/20 to-lendr-green/20 flex items-center justify-center flex-shrink-0">
          <div className="w-3 h-3 bg-lendr-green rounded-full" />
        </div>
      )}

      <div className={`max-w-[70%] ${isAuthor ? "order-1" : ""}`}>
        <AnimatePresence mode="wait">
          {isEditing ? (
            <motion.div
              key="editing"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-slate-800/80 backdrop-blur-sm border border-white/10 rounded-2xl p-4 space-y-3"
            >
              <Input
                value={editedBody}
                onChange={(e) => setEditedBody(e.target.value)}
                className="bg-slate-700/50 border-white/10 text-white placeholder:text-gray-400 focus:border-lendr-yellow/50"
                placeholder="Edit your message..."
              />
              <div className="flex items-center gap-2 justify-end">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setIsEditing(false)}
                  className="text-gray-400 hover:text-white hover:bg-white/10"
                >
                  <X className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  onClick={handleUpdate}
                  className="bg-gradient-to-r from-lendr-yellow to-lendr-green text-black hover:opacity-90"
                >
                  <Check className="w-4 h-4" />
                </Button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="message"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className={`relative rounded-2xl p-4 backdrop-blur-sm border ${isAuthor
                  ? "bg-gradient-to-r from-lendr-yellow/20 to-lendr-green/20 border-lendr-yellow/30 text-white"
                  : "bg-slate-800/80 border-white/10 text-white"
                }`}
            >
              {/* Message glow effect */}
              <div
                className={`absolute inset-0 rounded-2xl blur-xl opacity-20 ${isAuthor ? "bg-gradient-to-r from-lendr-yellow to-lendr-green" : "bg-slate-600"
                  }`}
              />

              <div className="relative z-10">
                <p className="text-sm leading-relaxed">{message.body}</p>
                {message.updatedAt && (
                  <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                    <Edit3 className="w-3 h-3" />
                    Edited
                  </p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {isAuthor && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className={`opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-gray-400 hover:text-white hover:bg-white/10 p-2 ${isAuthor ? "order-2" : ""}`}
            >
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-slate-800 border-white/10 text-white">
            <DropdownMenuItem onClick={() => setIsEditing(true)} className="hover:bg-white/10 focus:bg-white/10">
              <Edit3 className="w-4 h-4 mr-2" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleDelete} className="hover:bg-red-500/20 focus:bg-red-500/20 text-red-400">
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      {isAuthor && (
        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-lendr-yellow/20 to-lendr-green/20 flex items-center justify-center flex-shrink-0 order-3">
          <div className="w-3 h-3 bg-lendr-yellow rounded-full" />
        </div>
      )}
    </motion.div>
  )
}
