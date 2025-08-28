import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EscrowSmartContract } from "./types";
import Link from "next/link";

interface EscrowNavigationProps {
  escrowData: EscrowSmartContract;
}

export function EscrowNavigation({ escrowData }: EscrowNavigationProps) {
  return (
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
  );
}