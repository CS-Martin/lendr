import { ConnectButton } from '@rainbow-me/rainbowkit';
import { motion } from 'framer-motion';
import { Wallet } from 'lucide-react';

export const WalletConnectButton = () => {
  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openChainModal,
        openConnectModal,
        openAccountModal,
        mounted,
      }) => {
        const ready = mounted;
        const connected = ready && account && chain;

        return (
          <motion.button
            style={{ zIndex: 1000, pointerEvents: 'auto' }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className='flex items-center text-sm space-x-2 px-4 py-3 cursor-pointer rounded-xl font-semibold transition-all duration-300 bg-gradient-to-r from-lendr-400 to-lendr-500 hover:from-lendr-500 hover:to-lendr-600 text-slate-950 shadow-xl shadow-lendr-400/40'
            onClick={
              !connected
                ? openConnectModal
                : !chain?.unsupported
                  ? openAccountModal
                  : openChainModal
            }
            disabled={!ready}>
            <Wallet className='w-4 h-4 mr-2' />
            {!connected && <span>Connect Wallet</span>}
            {connected && (
              <>
                <span>
                  {account.displayName}
                  {account.displayBalance ? ` (${account.displayBalance})` : ''}
                </span>
              </>
            )}
          </motion.button>
        );
      }}
    </ConnectButton.Custom>
  );
};
