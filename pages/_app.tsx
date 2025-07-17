import type { AppProps } from 'next/app';
import { WagmiProvider, createConfig, http } from 'wagmi';
import { mainnet, sepolia } from 'wagmi/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ConnectKitProvider, getDefaultConfig } from 'connectkit';
import '../styles/roulette.module.css';
import '../styles/22adfa0232ac4945.css';


const config = createConfig(
  getDefaultConfig({
    appName: 'Zama Roulette',
    chains: [sepolia],
    transports: {
    [sepolia.id]:  http('https://api.zan.top/node/v1/eth/sepolia/1eced0bf012d458aa4e24dff6914fd50'),
  }})
);

const queryClient = new QueryClient();



function MyApp({ Component, pageProps }) {
    return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <ConnectKitProvider>
          <Component {...pageProps} />
        </ConnectKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export default MyApp;
