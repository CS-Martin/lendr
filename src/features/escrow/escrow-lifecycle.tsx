import { motion } from "framer-motion";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  Clock,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  Copy,
  XCircle,
} from "lucide-react";
import { MockData, StepStatus } from "./types";
import { useMemo } from "react";
import { getStepIcon } from "./components";
import { Badge } from "@/components/ui/badge";

interface EscrowLifecycleProps {
  escrowData: MockData;
  timeRemaining: {
    step2: { days: number; hours: number; minutes: number; seconds: number };
    step4: { days: number; hours: number; minutes: number; seconds: number };
  };
}

const copyToClipboard = (text: string) => {
  navigator.clipboard.writeText(text);
};

export function EscrowLifecycle({ escrowData, timeRemaining }: EscrowLifecycleProps) {
  const currentStep = useMemo(
    () =>
      escrowData.steps.find((step) => step.status === "ACTIVE") ||
      escrowData.steps[0],
    [escrowData.steps]
  );
  const completedSteps = useMemo(
    () => escrowData.steps.filter((step) => step.status === "COMPLETED").length,
    [escrowData.steps]
  );
  const progress = (completedSteps / escrowData.steps.length) * 100;

  return (
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
            <span className="text-slate-400">
              Step {currentStep.stepNumber}/5
            </span>
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
            <h3 className="text-xl font-semibold text-white mb-2">
              ⚠️ Deadline Approaching
            </h3>
            <p className="text-orange-200 mb-4">
              Lender must send NFT within:
            </p>
            <div className="grid grid-cols-4 gap-4 mb-4">
              <div>
                <div className="text-3xl font-bold text-orange-400">
                  {timeRemaining.step2.days}
                </div>
                <div className="text-sm text-slate-400">Days</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-orange-400">
                  {timeRemaining.step2.hours}
                </div>
                <div className="text-sm text-slate-400">Hours</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-orange-400">
                  {timeRemaining.step2.minutes}
                </div>
                <div className="text-sm text-slate-400">Minutes</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-orange-400">
                  {timeRemaining.step2.seconds}
                </div>
                <div className="text-sm text-slate-400">Seconds</div>
              </div>
            </div>
            <div className="text-sm text-red-300">
              If deadline passes → Escrow will be CANCELLED and funds returned
              to renter
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
                  <div className="flex-shrink-0 mt-1">
                    {getStepIcon(step.status as StepStatus)}
                  </div>

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
                          {(
                            escrowData.escrowContract.rentalFee +
                            escrowData.escrowContract.collateral
                          ).toFixed(5)}{" "}
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
                            Lender must transfer NFT to escrow contract within 1
                            day
                          </div>
                          <div className="text-xs text-orange-300">
                            ⚠️ {step.warning}
                          </div>
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
                          <span className="font-semibold">
                            Awaiting Step 2 Completion
                          </span>
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
                          NFT must be returned directly to lender within 3 days
                          after rental ends
                        </div>
                        <div className="text-xs text-orange-300">
                          ⚠️ {step.warning}
                        </div>
                      </div>
                    )}

                    {step.stepNumber === 5 && step.status === "PENDING" && (
                      <div className="bg-slate-800 rounded-lg p-4">
                        <div className="text-sm text-slate-400 mb-3">
                          Automatic settlement upon successful NFT return:
                        </div>
                        <div className="space-y-1 text-xs">
                          <div className="flex justify-between">
                            <span className="text-slate-400">
                              → Collateral to Renter:
                            </span>
                            <span className="text-cyan-400">
                              {escrowData.escrowContract.collateral} ETH
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">
                              → Rental Fee to Lender:
                            </span>
                            <span className="text-green-400">
                              {escrowData.escrowContract.rentalFee} ETH
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">→ Platform Fee:</span>
                            <span className="text-purple-400">
                              0.05
                              {" "}
                              ETH
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Transaction Hash */}
                    {step.txHash && (
                      <div className="mt-4 pt-4 border-t border-slate-700">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-slate-400">
                            Transaction Hash
                          </span>
                          <div className="flex items-center space-x-2">
                            <code className="text-xs text-slate-300 font-mono">
                              {step.txHash.substring(0, 10)}...
                              {step.txHash.substring(step.txHash.length - 8)}
                            </code>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => copyToClipboard(step.txHash!)}
                              className="text-slate-400 hover:text-white p-1"
                            >
                              <Copy className="w-3 h-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-slate-400 hover:text-white p-1"
                            >
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
                        <p className="text-xs text-orange-300 mt-1">
                          {step.warning}
                        </p>
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
          <h3 className="text-lg font-semibold text-white mb-4">
            Smart Contract Protection
          </h3>
          <div className="space-y-2 text-sm text-slate-400">
            <p>
              • <strong>Step 1:</strong> Renter payment is held in escrow until
              completion
            </p>
            <p>
              • <strong>Step 2:</strong> 1-day deadline for lender to send NFT
              (auto-cancel if missed)
            </p>
            <p>
              • <strong>Step 3:</strong> Rental period enforced by smart
              contract
            </p>
            <p>
              • <strong>Step 4:</strong> 3-day return window (collateral
              forfeited if missed)
            </p>
            <p>
              • <strong>Step 5:</strong> Automatic payout distribution upon
              successful return
            </p>
          </div>
          <div className="mt-4 p-3 bg-purple-900/20 border border-purple-800 rounded-lg">
            <div className="text-sm text-purple-300">
              <strong>Current Status:</strong>{" "}
              {escrowData.escrowContract.status}
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
  );
}