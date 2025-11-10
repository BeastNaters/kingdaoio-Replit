import { createConfig, http } from 'wagmi';
import { mainnet } from 'wagmi/chains';

export const config = createConfig({
  chains: [mainnet],
  transports: {
    [mainnet.id]: http(import.meta.env.VITE_ETHEREUM_RPC_URL || 'https://eth.llamarpc.com'),
  },
});
