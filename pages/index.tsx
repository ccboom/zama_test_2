import React, { useCallback, useState } from 'react';
import Header from '../components/Header';
import Roulette from '../components/Roulette';
import BettingArea from '../components/BettingArea';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';

const Home: React.FC = () => {
  const [payout, setPayout] = useState<string>('Select a number to see potential payout');
  const [betNumber, setBetNumber] = useState<number | null>(null);
  const [selectedBet, setSelectedBet] = useState<string>(''); // Added selectedBet state
  const [targetNumber, setTargetNumber] = useState<number | null>(null);

  const handlePlaceBet = useCallback((betType: number, number: number, amount: string, setTarget: (num: number | null) => void) => {
    console.log(`下注: 类型=${betType}, 数字=${number}, 金额=${amount}`);
    setTarget(null); // 下注后重置 targetNumber，等待结果
  }, []);

  const handleNumberClick = useCallback((number: number) => {
    setBetNumber(number);
    setSelectedBet(`Number ${number}`); // Update selectedBet here as well
    setPayout(`x35`);
  }, []);

  const handleSpinComplete = () => {
    console.log('旋转完成，targetNumber:', targetNumber);
  };

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
              <Roulette targetNumber={targetNumber} onSpinComplete={handleSpinComplete} />
              <BettingArea setPayout={setPayout} setSelectedBet={setSelectedBet} /> {/* Pass setSelectedBet */}
            </div>
            <Sidebar
              payout={payout}
              onPlaceBet={handlePlaceBet}
              selectedBet={selectedBet} // Pass selectedBet to Sidebar
              setTargetNumber={setTargetNumber}
            />
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default Home;
