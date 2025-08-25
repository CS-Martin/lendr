"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { ArrowLeft, Clock, Shield, CheckCircle, AlertCircle, ExternalLink, Copy, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import Image from "next/image"
import Link from "next/link"

// Mock escrow data based on new schema
const escrowData = {
    id: "escrow_123",
    nft: {
        id: 1,
        title: "Legendary Sword #1337",
        category: "Gaming",
        image: "/placeholder.svg?height=300&width=300",
        tokenId: "1337",
        contractAddress: "0xabcdef1234567890abcdef1234567890abcdef12",
    },
    rentalPost: {
        id: "rental_456",
        ownerAddress: "0x1234...5678",
        duration: 7, // days
        rentalFee: 0.35,
        collateral: 0.2,
        platformFee: 0.00875,
    },
    escrowContract: {
        rentalPostRenterAddress: "0x9876...5432",
        rentalPostOwnerAddress: "0x1234...5678",
        rentalFee: 0.35,
        collateral: 0.2,
        status: "ACTIVE", // ACTIVE, CANCELLED, DEFAULTED, COMPLETED
        step2ExpiresAt: Date.now() + 12 * 60 * 60 * 1000, // 12 hours from now
        step4ExpiresAt: Date.now() + 10 * 24 * 60 * 60 * 1000, // 10 days from now
    },
    steps: [
        {
            stepNumber: 1,
            title: "Renter Pays",
            description: "Renter deposits rental fee + collateral into escrow",
            status: "COMPLETED",
            txHash: "0xabc123def456789abc123def456789abc123def456789abc123def456789abc123",
            timestamp: Date.now() - 2 * 24 * 60 * 60 * 1000, // 2 days ago
            details: "Payment of rental fee + collateral successfully deposited",
        },
        {
            stepNumber: 2,
            title: "Lender Sends NFT",
            description: "Lender must send NFT within 1 day",
            status: "ACTIVE",
            txHash: null,
            timestamp: 0,
            details: "Waiting for lender to transfer NFT to escrow contract",
            deadline: Date.now() + 12 * 60 * 60 * 1000, // 12 hours remaining
            warning: "If not sent within deadline → Escrow CANCELLED (funds returned to renter)",
        },
        {
            stepNumber: 3,
            title: "Rental Duration",
            description: "Rental officially begins once NFT is received",
            status: "PENDING",
            txHash: null,
            timestamp: 0,
            details: "Smart contract enforces the agreed rental period",
        },
        {
            stepNumber: 4,
            title: "Renter Returns NFT",
            description: "Renter must return NFT directly to lender within 3 days after rental ends",
            status: "PENDING",
            txHash: null,
            timestamp: 0,
            details: "Return NFT to lender's address before deadline",
            warning: "If not returned → Escrow status DEFAULTED (collateral goes to lender)",
        },
        {
            stepNumber: 5,
            title: "Settlement / Payout",
            description: "Collateral refunded to renter, rental fee paid to lender",
            status: "PENDING",
            txHash: null,
            timestamp: 0,
            details: "Automatic payout distribution upon successful NFT return",
        },
    ],
}

export default function EscrowPage() {
    const [timeRemaining, setTimeRemaining] = useState({
        step2: { days: 0, hours: 0, minutes: 0, seconds: 0 },
        step4: { days: 0, hours: 0, minutes: 0, seconds: 0 },
    })

    useEffect(() => {
        const timer = setInterval(() => {
            const now = Date.now()

            // Step 2 countdown (Lender sends NFT)
            const step2Diff = escrowData.escrowContract.step2ExpiresAt - now
            if (step2Diff > 0) {
                setTimeRemaining((prev) => ({
                    ...prev,
                    step2: {
                        days: Math.floor(step2Diff / (1000 * 60 * 60 * 24)),
                        hours: Math.floor((step2Diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                        minutes: Math.floor((step2Diff % (1000 * 60 * 60)) / (1000 * 60)),
                        seconds: Math.floor((step2Diff % (1000 * 60)) / 1000),
                    },
                }))
            }

            // Step 4 countdown (Renter returns NFT)
            const step4Diff = escrowData.escrowContract.step4ExpiresAt - now
            if (step4Diff > 0) {
                setTimeRemaining((prev) => ({
                    ...prev,
                    step4: {
                        days: Math.floor(step4Diff / (1000 * 60 * 60 * 24)),
                        hours: Math.floor((step4Diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                        minutes: Math.floor((step4Diff % (1000 * 60 * 60)) / (1000 * 60)),
                        seconds: Math.floor((step4Diff % (1000 * 60)) / 1000),
                    },
                }))
            }
        }, 1000)

        return () => clearInterval(timer)
    }, [])

    const getStepIcon = (status: string) => {
        switch (status) {
            case "COMPLETED":
                return <CheckCircle className="w-6 h-6 text-green-400" />
            case "ACTIVE":
                return <Clock className="w-6 h-6 text-blue-400" />
            case "PENDING":
                return <AlertCircle className="w-6 h-6 text-slate-400" />
            default:
                return <AlertCircle className="w-6 h-6 text-slate-400" />
        }
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "ACTIVE":
                return <Badge className="bg-blue-500 text-white px-4 py-2">Escrow Active</Badge>
            case "CANCELLED":
                return <Badge className="bg-red-500 text-white px-4 py-2">Escrow Cancelled</Badge>
            case "DEFAULTED":
                return <Badge className="bg-orange-500 text-white px-4 py-2">Escrow Defaulted</Badge>
            case "COMPLETED":
                return <Badge className="bg-green-500 text-white px-4 py-2">Escrow Completed</Badge>
            default:
                return <Badge className="bg-slate-500 text-white px-4 py-2">Unknown Status</Badge>
        }
    }

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text)
    }

    const currentStep = escrowData.steps.find((step) => step.status === "ACTIVE") || escrowData.steps[0]
    const completedSteps = escrowData.steps.filter((step) => step.status === "COMPLETED").length
    const progress = (completedSteps / escrowData.steps.length) * 100

    return (
        <div className="min-h-screen bg-slate-950">
            {/* Navigation */}
            <nav className="border-b border-slate-800/50 backdrop-blur-xl bg-slate-950/80 sticky top-0 z-50">
                <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                    <Link
                        href="/marketplace"
                        className="flex items-center space-x-2 text-slate-300 hover:text-white transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        <span>Back to Marketplace</span>
                    </Link>

                    <Link href="/" className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-sm">L</span>
                        </div>
                        <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                            Lendr
                        </span>
                    </Link>

                    <Button className="bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 text-white border-0">
                        {escrowData.escrowContract.rentalPostRenterAddress}
                    </Button>
                </div>
            </nav>

            <div className="container mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left Panel - NFT & Contract Data */}
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}>
                        <Card className="bg-slate-900/50 border-slate-800 sticky top-24">
                            <CardHeader>
                                <CardTitle className="text-white flex items-center space-x-2">
                                    <Shield className="w-5 h-5 text-purple-400" />
                                    <span>Smart Contract Escrow</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* NFT Preview */}
                                <div className="text-center">
                                    <Image
                                        src={escrowData.nft.image || "/placeholder.svg"}
                                        alt={escrowData.nft.title}
                                        width={200}
                                        height={200}
                                        className="w-48 h-48 mx-auto rounded-lg border border-slate-700"
                                    />
                                    <h3 className="text-lg font-semibold text-white mt-4">{escrowData.nft.title}</h3>
                                    <Badge className="mt-2 bg-purple-500">{escrowData.nft.category}</Badge>
                                </div>

                                <Separator className="bg-slate-800" />

                                {/* Contract Participants */}
                                <div className="space-y-3 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-slate-400">Lender (Owner)</span>
                                        <span className="text-white font-mono">{escrowData.escrowContract.rentalPostOwnerAddress}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-400">Renter (Borrower)</span>
                                        <span className="text-white font-mono">{escrowData.escrowContract.rentalPostRenterAddress}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-400">Token ID</span>
                                        <span className="text-white font-mono">{escrowData.nft.tokenId}</span>
                                    </div>
                                </div>

                                <Separator className="bg-slate-800" />

                                {/* Financial Details */}
                                <div className="bg-slate-800 rounded-lg p-4 space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-400">Rental Fee</span>
                                        <span className="text-white">{escrowData.escrowContract.rentalFee} ETH</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-400">Collateral</span>
                                        <span className="text-cyan-400">{escrowData.escrowContract.collateral} ETH</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-400">Platform Fee</span>
                                        <span className="text-slate-400">{escrowData.rentalPost.platformFee} ETH</span>
                                    </div>
                                    <Separator className="bg-slate-700" />
                                    <div className="flex justify-between text-sm font-semibold">
                                        <span className="text-white">Total Locked</span>
                                        <span className="text-purple-400">
                                            {(escrowData.escrowContract.rentalFee + escrowData.escrowContract.collateral).toFixed(5)} ETH
                                        </span>
                                    </div>
                                </div>

                                {/* Contract Address */}
                                <div>
                                    <div className="text-slate-400 text-sm mb-2">Smart Contract</div>
                                    <div className="flex items-center space-x-2">
                                        <code className="text-xs text-white bg-slate-800 px-2 py-1 rounded font-mono flex-1">
                                            {escrowData.nft.contractAddress}
                                        </code>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => copyToClipboard(escrowData.nft.contractAddress)}
                                            className="text-slate-400 hover:text-white"
                                        >
                                            <Copy className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>

                                {/* Status Badge */}
                                <div className="text-center">{getStatusBadge(escrowData.escrowContract.status)}</div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Right Panel - Escrow Flow */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                        className="space-y-6"
                    >
                        {/* Progress Header */}
                        <Card className="bg-slate-900/50 border-slate-800">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-2xl font-bold text-white">Escrow Lifecycle</h2>
                                    <span className="text-slate-400">Step {currentStep.stepNumber}/5</span>
                                </div>
                                <Progress value={progress} className="h-2" />
                                <div className="mt-2 text-sm text-slate-400">
                                    {completedSteps} of {escrowData.steps.length} steps completed
                                </div>
                            </CardContent>
                        </Card>

                        {/* Active Step Countdown */}
                        {currentStep.stepNumber === 2 && (
                            <Card className="bg-gradient-to-r from-orange-900/50 to-red-900/50 border-orange-800">
                                <CardContent className="p-6 text-center">
                                    <h3 className="text-xl font-semibold text-white mb-2">⚠️ Deadline Approaching</h3>
                                    <p className="text-orange-200 mb-4">Lender must send NFT within:</p>
                                    <div className="grid grid-cols-4 gap-4 mb-4">
                                        <div>
                                            <div className="text-3xl font-bold text-orange-400">{timeRemaining.step2.days}</div>
                                            <div className="text-sm text-slate-400">Days</div>
                                        </div>
                                        <div>
                                            <div className="text-3xl font-bold text-orange-400">{timeRemaining.step2.hours}</div>
                                            <div className="text-sm text-slate-400">Hours</div>
                                        </div>
                                        <div>
                                            <div className="text-3xl font-bold text-orange-400">{timeRemaining.step2.minutes}</div>
                                            <div className="text-sm text-slate-400">Minutes</div>
                                        </div>
                                        <div>
                                            <div className="text-3xl font-bold text-orange-400">{timeRemaining.step2.seconds}</div>
                                            <div className="text-sm text-slate-400">Seconds</div>
                                        </div>
                                    </div>
                                    <div className="text-sm text-red-300">
                                        If deadline passes → Escrow will be CANCELLED and funds returned to renter
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Escrow Steps */}
                        <div className="space-y-4">
                            {escrowData.steps.map((step, index) => (
                                <motion.div
                                    key={step.stepNumber}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5, delay: index * 0.1 }}
                                >
                                    <Card
                                        className={`border-slate-800 ${step.status === "COMPLETED"
                                            ? "bg-green-900/20 border-green-800"
                                            : step.status === "ACTIVE"
                                                ? "bg-blue-900/20 border-blue-800"
                                                : "bg-slate-900/50"
                                            }`}
                                    >
                                        <CardContent className="p-6">
                                            <div className="flex items-start space-x-4">
                                                <div className="flex-shrink-0 mt-1">{getStepIcon(step.status)}</div>

                                                <div className="flex-1">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <h3 className="text-lg font-semibold text-white">
                                                            Step {step.stepNumber}: {step.title}
                                                        </h3>
                                                        <Badge
                                                            className={
                                                                step.status === "COMPLETED"
                                                                    ? "bg-green-500"
                                                                    : step.status === "ACTIVE"
                                                                        ? "bg-blue-500"
                                                                        : "bg-slate-600"
                                                            }
                                                        >
                                                            {step.status}
                                                        </Badge>
                                                    </div>

                                                    <p className="text-slate-400 mb-3">{step.description}</p>
                                                    <p className="text-slate-300 text-sm mb-4">{step.details}</p>

                                                    {/* Step-specific content */}
                                                    {step.stepNumber === 1 && step.status === "COMPLETED" && (
                                                        <div className="bg-green-900/20 border border-green-800 rounded-lg p-4">
                                                            <div className="flex items-center space-x-2 text-green-400 mb-2">
                                                                <CheckCircle className="w-4 h-4" />
                                                                <span className="font-semibold">Payment Successful</span>
                                                            </div>
                                                            <div className="text-sm text-slate-300">
                                                                Total deposited:{" "}
                                                                {(escrowData.escrowContract.rentalFee + escrowData.escrowContract.collateral).toFixed(
                                                                    5,
                                                                )}{" "}
                                                                ETH
                                                            </div>
                                                        </div>
                                                    )}

                                                    {step.stepNumber === 2 && step.status === "ACTIVE" && (
                                                        <div className="space-y-3">
                                                            <div className="bg-blue-900/20 border border-blue-800 rounded-lg p-4">
                                                                <div className="flex items-center space-x-2 text-blue-400 mb-2">
                                                                    <Clock className="w-4 h-4" />
                                                                    <span className="font-semibold">Waiting for Lender</span>
                                                                </div>
                                                                <div className="text-sm text-slate-300 mb-2">
                                                                    Lender must transfer NFT to escrow contract within 1 day
                                                                </div>
                                                                <div className="text-xs text-orange-300">⚠️ {step.warning}</div>
                                                            </div>
                                                            <Button className="w-full bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 text-white border-0">
                                                                Send NFT to Escrow (Lender Action)
                                                            </Button>
                                                        </div>
                                                    )}

                                                    {step.stepNumber === 3 && step.status === "PENDING" && (
                                                        <div className="bg-slate-800 rounded-lg p-4">
                                                            <div className="flex items-center space-x-2 text-slate-400 mb-2">
                                                                <AlertCircle className="w-4 h-4" />
                                                                <span className="font-semibold">Awaiting Step 2 Completion</span>
                                                            </div>
                                                            <div className="text-sm text-slate-400">
                                                                Rental period will begin once NFT is received in escrow
                                                            </div>
                                                        </div>
                                                    )}

                                                    {step.stepNumber === 4 && step.status === "PENDING" && (
                                                        <div className="bg-slate-800 rounded-lg p-4">
                                                            <div className="flex items-center space-x-2 text-slate-400 mb-2">
                                                                <AlertCircle className="w-4 h-4" />
                                                                <span className="font-semibold">Return Required</span>
                                                            </div>
                                                            <div className="text-sm text-slate-400 mb-2">
                                                                NFT must be returned directly to lender within 3 days after rental ends
                                                            </div>
                                                            <div className="text-xs text-orange-300">⚠️ {step.warning}</div>
                                                        </div>
                                                    )}

                                                    {step.stepNumber === 5 && step.status === "PENDING" && (
                                                        <div className="bg-slate-800 rounded-lg p-4">
                                                            <div className="text-sm text-slate-400 mb-3">
                                                                Automatic settlement upon successful NFT return:
                                                            </div>
                                                            <div className="space-y-1 text-xs">
                                                                <div className="flex justify-between">
                                                                    <span className="text-slate-400">→ Collateral to Renter:</span>
                                                                    <span className="text-cyan-400">{escrowData.escrowContract.collateral} ETH</span>
                                                                </div>
                                                                <div className="flex justify-between">
                                                                    <span className="text-slate-400">→ Rental Fee to Lender:</span>
                                                                    <span className="text-green-400">{escrowData.escrowContract.rentalFee} ETH</span>
                                                                </div>
                                                                <div className="flex justify-between">
                                                                    <span className="text-slate-400">→ Platform Fee:</span>
                                                                    <span className="text-purple-400">{escrowData.rentalPost.platformFee} ETH</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Transaction Hash */}
                                                    {step.txHash && (
                                                        <div className="mt-4 pt-4 border-t border-slate-700">
                                                            <div className="flex items-center justify-between">
                                                                <span className="text-xs text-slate-400">Transaction Hash</span>
                                                                <div className="flex items-center space-x-2">
                                                                    <code className="text-xs text-slate-300 font-mono">
                                                                        {step.txHash.substring(0, 10)}...{step.txHash.substring(step.txHash.length - 8)}
                                                                    </code>
                                                                    <Button
                                                                        size="sm"
                                                                        variant="ghost"
                                                                        onClick={() => copyToClipboard(step.txHash!)}
                                                                        className="text-slate-400 hover:text-white p-1"
                                                                    >
                                                                        <Copy className="w-3 h-3" />
                                                                    </Button>
                                                                    <Button size="sm" variant="ghost" className="text-slate-400 hover:text-white p-1">
                                                                        <ExternalLink className="w-3 h-3" />
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                            {step.timestamp > 0 && (
                                                                <div className="text-xs text-slate-500 mt-1">
                                                                    {new Date(step.timestamp).toLocaleDateString()} at{" "}
                                                                    {new Date(step.timestamp).toLocaleTimeString()}
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}

                                                    {/* Warning messages */}
                                                    {step.warning && step.status !== "COMPLETED" && (
                                                        <div className="mt-4 p-3 bg-orange-900/20 border border-orange-800 rounded-lg">
                                                            <div className="flex items-center space-x-2 text-orange-400">
                                                                <XCircle className="w-4 h-4" />
                                                                <span className="text-sm font-medium">Risk Warning</span>
                                                            </div>
                                                            <p className="text-xs text-orange-300 mt-1">{step.warning}</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            ))}
                        </div>

                        {/* Help Section */}
                        <Card className="bg-slate-900/50 border-slate-800">
                            <CardContent className="p-6">
                                <h3 className="text-lg font-semibold text-white mb-4">Smart Contract Protection</h3>
                                <div className="space-y-2 text-sm text-slate-400">
                                    <p>
                                        • <strong>Step 1:</strong> Renter payment is held in escrow until completion
                                    </p>
                                    <p>
                                        • <strong>Step 2:</strong> 1-day deadline for lender to send NFT (auto-cancel if missed)
                                    </p>
                                    <p>
                                        • <strong>Step 3:</strong> Rental period enforced by smart contract
                                    </p>
                                    <p>
                                        • <strong>Step 4:</strong> 3-day return window (collateral forfeited if missed)
                                    </p>
                                    <p>
                                        • <strong>Step 5:</strong> Automatic payout distribution upon successful return
                                    </p>
                                </div>
                                <div className="mt-4 p-3 bg-purple-900/20 border border-purple-800 rounded-lg">
                                    <div className="text-sm text-purple-300">
                                        <strong>Current Status:</strong> {escrowData.escrowContract.status}
                                    </div>
                                </div>
                                <Button
                                    variant="outline"
                                    className="mt-4 border-slate-700 text-slate-300 hover:bg-slate-800 bg-transparent"
                                >
                                    Contact Support
                                </Button>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>
            </div>
        </div>
    )
}
