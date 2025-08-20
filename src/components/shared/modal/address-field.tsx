import { truncateText } from "@/lib/utils";
import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Copy, ExternalLink } from "lucide-react";

export const AddressField = ({
    label,
    address,
    showCopy = true,
    showExternalLink = true,
    truncateStart = 10,
    truncateEnd = 8
}: {
    label: string;
    address: string;
    showCopy?: boolean;
    showExternalLink?: boolean;
    truncateStart?: number;
    truncateEnd?: number;
}) => {
    const [copied, setCopied] = useState(false);

    const copyToClipboard = async (text: string) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy: ', err);
        }
    };

    return (
        <div>
            <span className='text-gray-400 block mb-1'>{label}:</span>
            <div className='flex items-center gap-2'>
                <code className='bg-gray-800/50 px-2 py-1 rounded text-sm font-mono text-gray-300'>
                    {truncateText(address, truncateStart, truncateEnd)}
                </code>
                {showCopy && (
                    <Button
                        size='sm'
                        variant='ghost'
                        onClick={() => copyToClipboard(address)}
                        className='h-8 w-8 p-0 text-gray-400 hover:text-white'
                    >
                        <Copy className='h-3 w-3' />
                    </Button>
                )}
                {showExternalLink && (
                    <Button
                        size='sm'
                        variant='ghost'
                        className='h-8 w-8 p-0 text-gray-400 hover:text-white'
                        onClick={() => window.open(`https://etherscan.io/address/${address}`, '_blank')}
                    >
                        <ExternalLink className='h-3 w-3' />
                    </Button>
                )}
            </div>
            {copied && (
                <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className='text-green-400 text-xs mt-1'
                >
                    Address copied to clipboard!
                </motion.p>
            )}
        </div>
    );
};
