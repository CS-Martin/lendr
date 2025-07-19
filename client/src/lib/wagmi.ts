import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import {
    mainnet,
    polygon,
    optimism,
    arbitrum,
    base,
    sepolia,
} from 'viem/chains';

export const projectId = '3b91fcfc4c2e58e0700f26cfff36ffac';

let _config: ReturnType<typeof getDefaultConfig> | null = null;

export function getWagmiConfig(): ReturnType<typeof getDefaultConfig> {
    if (_config) return _config;

    if (!projectId) {
        throw new Error('Project ID is not defined');
    }

    _config = getDefaultConfig({
        appName: 'Lendr',
        projectId,
        chains: [
            mainnet,
            polygon,
            optimism,
            arbitrum,
            base,
            ...(process.env.NEXT_PUBLIC_ENABLE_TESTNETS === 'true'
                ? [sepolia]
                : []),
        ],
        ssr: true,
    });

    return _config;
}
