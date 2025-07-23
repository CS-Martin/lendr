"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { User, Camera, Save, Shield, Bell, Palette, Trash2, X, Copy, ExternalLink } from "lucide-react"
import { toast } from "sonner"
import { useSession } from "next-auth/react"
import { UserDto } from "@repo/shared-dtos"
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { ProfileTab } from "./_components/profile-tab"

export default function SettingsPage() {
    const user: UserDto = useSession().data?.user as UserDto

    const [activeTab, setActiveTab] = useState("profile")
    const fileInputRef = useRef<HTMLInputElement>(null)

    return (
        <div className="min-h-screen bg-black text-white relative overflow-hidden">
            {/* Animated Background */}
            <div className="fixed inset-0 z-0">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-cyan-900/20" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.1),transparent_50%)]" />
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
                <div className="absolute top-1/2 left-0 w-64 h-64 bg-lendr-400/10 rounded-full blur-3xl animate-pulse delay-500" />
            </div>

            <div className="relative z-10 max-w-7xl mt-20 mx-auto px-6 py-8">
                {/* Header */}
                <motion.div
                    className="mb-8"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-lendr-400 to-purple-400 bg-clip-text text-transparent mb-2">
                        Profile Settings
                    </h1>
                    <p className="text-gray-400">Manage your account settings and preferences</p>
                </motion.div>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-4 bg-gray-900/50 backdrop-blur-sm border border-gray-800/50">
                        <TabsTrigger
                            value="profile"
                            className="data-[state=active]:bg-lendr-400/20 data-[state=active]:text-lendr-400 text-white"
                        >
                            <User className="w-4 h-4 mr-2" />
                            Profile
                        </TabsTrigger>
                        <TabsTrigger
                            value="security"
                            className="data-[state=active]:bg-lendr-400/20 data-[state=active]:text-lendr-400 text-white"
                        >
                            <Shield className="w-4 h-4 mr-2" />
                            Security
                        </TabsTrigger>
                        <TabsTrigger
                            value="notifications"
                            className="data-[state=active]:bg-lendr-400/20 data-[state=active]:text-lendr-400 text-white"
                        >
                            <Bell className="w-4 h-4 mr-2" />
                            Notifications
                        </TabsTrigger>
                        <TabsTrigger
                            value="preferences"
                            className="data-[state=active]:bg-lendr-400/20 data-[state=active]:text-lendr-400 text-white"
                        >
                            <Palette className="w-4 h-4 mr-2" />
                            Preferences
                        </TabsTrigger>
                    </TabsList>

                    {/* Profile Tab */}
                    <TabsContent value="profile" className="space-y-6">
                        <ProfileTab user={user} />
                    </TabsContent>

                    {/* Security Tab */}
                    <TabsContent value="security" className="space-y-6">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            className="space-y-6"
                        >
                            <Card className="bg-gray-900/50 backdrop-blur-sm border-gray-800/50">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-white">
                                        <Shield className="w-5 h-5 text-lendr-400" />
                                        Wallet Security
                                    </CardTitle>
                                    <CardDescription>Manage your wallet connections and security settings</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center justify-between p-4 bg-gray-800/30 rounded-lg border border-gray-700/50">
                                        <div>
                                            <h4 className="font-semibold text-white">Connected Wallet</h4>
                                            <p className="text-sm text-gray-400">
                                                MetaMask - {user?.address.slice(0, 6)}...{user?.address.slice(-4)}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                                            <span className="text-sm text-green-400">Connected</span>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h4 className="font-medium text-white">Two-Factor Authentication</h4>
                                                <p className="text-sm text-gray-400">Add an extra layer of security</p>
                                            </div>
                                            <Button
                                                variant="outline"
                                                className="border-lendr-400/50 text-lendr-400 hover:bg-lendr-400/10 bg-transparent"
                                            >
                                                Enable 2FA
                                            </Button>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h4 className="font-medium text-white">Session Management</h4>
                                                <p className="text-sm text-gray-400">View and manage active sessions</p>
                                            </div>
                                            <Button
                                                variant="outline"
                                                className="border-gray-700/50 text-gray-400 hover:text-white bg-transparent"
                                            >
                                                Manage Sessions
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </TabsContent>

                    {/* Notifications Tab */}
                    <TabsContent value="notifications" className="space-y-6">
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                            <Card className="bg-gray-900/50 backdrop-blur-sm border-gray-800/50">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-white">
                                        <Bell className="w-5 h-5 text-lendr-400" />
                                        Notification Preferences
                                    </CardTitle>
                                    <CardDescription>Choose what notifications you want to receive</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    {[
                                        { title: "New Bids", description: "Get notified when someone bids on your NFTs", enabled: true },
                                        { title: "Rental Requests", description: "Notifications for new rental requests", enabled: true },
                                        {
                                            title: "Price Alerts",
                                            description: "Get alerts when NFT prices change significantly",
                                            enabled: false,
                                        },
                                        {
                                            title: "Marketing Updates",
                                            description: "Receive updates about new features and promotions",
                                            enabled: false,
                                        },
                                    ].map((notification, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center justify-between p-4 bg-gray-800/30 rounded-lg border border-gray-700/50"
                                        >
                                            <div>
                                                <h4 className="font-medium text-white">{notification.title}</h4>
                                                <p className="text-sm text-gray-400">{notification.description}</p>
                                            </div>
                                            <motion.button
                                                className={`relative w-12 h-6 rounded-full transition-colors ${notification.enabled ? "bg-lendr-400" : "bg-gray-600"
                                                    }`}
                                                onClick={() => { }}
                                                whileTap={{ scale: 0.95 }}
                                            >
                                                <motion.div
                                                    className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-md"
                                                    animate={{
                                                        x: notification.enabled ? 24 : 4,
                                                    }}
                                                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                                />
                                            </motion.button>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        </motion.div>
                    </TabsContent>

                    {/* Preferences Tab */}
                    <TabsContent value="preferences" className="space-y-6">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            className="space-y-6"
                        >
                            <Card className="bg-gray-900/50 backdrop-blur-sm border-gray-800/50">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-white">
                                        <Palette className="w-5 h-5 text-lendr-400" />
                                        Display Preferences
                                    </CardTitle>
                                    <CardDescription>Customize your experience</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="space-y-4">
                                        <div>
                                            <Label className="text-white mb-3 block">Theme</Label>
                                            <div className="grid grid-cols-3 gap-3">
                                                {["Dark", "Light", "Auto"].map((theme) => (
                                                    <motion.button
                                                        key={theme}
                                                        className={`p-3 rounded-lg border transition-all ${theme === "Dark"
                                                            ? "border-lendr-400 bg-lendr-400/10 text-lendr-400"
                                                            : "border-gray-700/50 text-gray-400 hover:border-gray-600 hover:text-white"
                                                            }`}
                                                        whileHover={{ scale: 1.02 }}
                                                        whileTap={{ scale: 0.98 }}
                                                    >
                                                        {theme}
                                                    </motion.button>
                                                ))}
                                            </div>
                                        </div>

                                        <div>
                                            <Label className="text-white mb-3 block">Currency Display</Label>
                                            <select className="w-full bg-gray-800/50 border border-gray-700/50 text-white rounded-lg px-3 py-2 focus:border-lendr-400/50">
                                                <option>ETH</option>
                                                <option>USD</option>
                                                <option>EUR</option>
                                            </select>
                                        </div>

                                        <div>
                                            <Label className="text-white mb-3 block">Language</Label>
                                            <select className="w-full bg-gray-800/50 border border-gray-700/50 text-white rounded-lg px-3 py-2 focus:border-lendr-400/50">
                                                <option>English</option>
                                                <option>Spanish</option>
                                                <option>French</option>
                                                <option>German</option>
                                            </select>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Danger Zone */}
                            <Card className="bg-red-900/20 backdrop-blur-sm border-red-800/50">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-red-400">
                                        <Trash2 className="w-5 h-5" />
                                        Danger Zone
                                    </CardTitle>
                                    <CardDescription className="text-red-300/70">Irreversible and destructive actions</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h4 className="font-medium text-white">Delete Account</h4>
                                            <p className="text-sm text-gray-400">Permanently delete your account and all data</p>
                                        </div>
                                        <Button variant="destructive" className="bg-red-600 hover:bg-red-700">
                                            Delete Account
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    )
}
