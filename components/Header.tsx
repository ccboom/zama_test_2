import React from 'react';
import Link from 'next/link'; // 使用 Next.js Link 组件
import WalletConnect from './WalletConnect';

const Header: React.FC = () => {
  return (
    <header className="w-full px-6 py-4 flex items-center justify-between border-b border-yellow-800/30 bg-gradient-to-r from-gray-900 via-gray-800 to-black">
      <div className="flex items-center space-x-8">
        <h1 className="text-2xl font-bold text-white">zama</h1>
        <nav className="hidden md:flex items-center space-x-6">
          <div className="flex items-center space-x-1 text-gray-300 hover:text-white cursor-pointer">
            <span>Games</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-chevron-down w-4 h-4"
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </div>
          <Link href="/faucet" className="text-gray-300 hover:text-white">
            Faucet <span className="text-orange-500">🔥</span>
          </Link>
        </nav>
      </div>
      <div className="flex items-center space-x-4">
        <WalletConnect />
      </div>
    </header>
  );
};

export default Header;
