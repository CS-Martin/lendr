"use client"

import { motion } from "framer-motion"
import { Coins, Zap, TrendingUp } from "lucide-react"

export default function Loading() {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="text-center">
        {/* Logo Animation */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="mb-8"
        >
          <div className="relative">
            {/* Outer Ring */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
              className="w-24 h-24 mx-auto border-4 border-lendr-400/30 rounded-full"
            />

            {/* Inner Ring */}
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
              className="absolute inset-2 border-4 border-lendr-300/30 rounded-full"
            />

            {/* Center Logo */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-12 h-12 bg-lendr-400 rounded-xl flex items-center justify-center">
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
                >
                  <Coins className="w-6 h-6 text-slate-950" />
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Brand Name */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mb-6"
        >
          <h1 className="text-4xl font-bold text-lendr-400">Lendr</h1>
          <p className="text-slate-400 mt-2">Decentralized NFT Lending</p>
        </motion.div>

        {/* Loading Animation */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="space-y-4"
        >
          {/* Progress Bar */}
          <div className="w-64 mx-auto">
            <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
                className="h-full bg-lendr-400 rounded-full"
              />
            </div>
          </div>

          {/* Loading Text */}
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
            className="text-slate-400"
          >
            Loading your lending experience...
          </motion.div>
        </motion.div>

        {/* Floating Icons */}
        <div className="absolute inset-0 pointer-events-none">
          <motion.div
            animate={{
              y: [0, -20, 0],
              x: [0, 10, 0],
            }}
            transition={{
              duration: 4,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
            className="absolute top-1/4 left-1/4"
          >
            <div className="w-8 h-8 bg-lendr-400/20 rounded-lg flex items-center justify-center">
              <Zap className="w-4 h-4 text-lendr-400" />
            </div>
          </motion.div>

          <motion.div
            animate={{
              y: [0, 15, 0],
              x: [0, -15, 0],
            }}
            transition={{
              duration: 3.5,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
              delay: 1,
            }}
            className="absolute top-1/3 right-1/4"
          >
            <div className="w-8 h-8 bg-lendr-400/20 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-lendr-400" />
            </div>
          </motion.div>

          <motion.div
            animate={{
              y: [0, -10, 0],
              x: [0, 20, 0],
            }}
            transition={{
              duration: 4.5,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
              delay: 0.5,
            }}
            className="absolute bottom-1/3 left-1/3"
          >
            <div className="w-6 h-6 bg-lendr-400/20 rounded-full" />
          </motion.div>
        </div>

        {/* Pulse Effect */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.1, 0.3],
          }}
          transition={{
            duration: 2,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
          className="absolute inset-0 bg-lendr-400/10 rounded-full blur-3xl"
        />
      </div>
    </div>
  )
}
