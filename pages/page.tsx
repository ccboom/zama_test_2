import React, { useState, useEffect, useRef } from 'react';
import styles from '../styles/roulette.module.css';
import Header from '../components/Header';
import Roulette from '../components/Roulette';
import BettingArea from '../components/BettingArea';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';

const Home: React.FC = () => {
  const [payout, setPayout] = useState<string>('Select your bets to see potential payout');

  return (
    <div className="antialiased">
      <div className="min-h-screen zama-gradient">
        <Header />
        <main className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-white">zama Roulette</h1>
            <button className="bg-yellow-700 hover:bg-yellow-600 px-4 py-2 rounded-lg text-white text-sm transition-colors">
              📖 Game Rules
            </button>
          </div>
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            <div className="xl:col-span-2 space-y-8">
              <Roulette />
              <BettingArea setPayout={setPayout} />
            </div>
            <Sidebar payout={payout} />
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default Home;
