import React from 'react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { ConnectKitButton } from 'connectkit';

const WalletConnect: React.FC = () => {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();

  return (
    <ConnectKitButton.Custom>
      {({ isConnected, show, truncatedAddress }) => (
        <button
          onClick={isConnected ? () => disconnect() : show}
          className="w-full bg-black hover:bg-gray-900 text-white font-medium py-3 px-4 rounded-lg transition-colors"
        >
          {isConnected ? `Disconnect (${truncatedAddress})` : 'Connect Wallet'}
        </button>
      )}
    </ConnectKitButton.Custom>
  );
};

export default WalletConnect;
