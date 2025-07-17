import React, { useState } from 'react';
import styles from '../styles/roulette.module.css';

interface BettingAreaProps {
  setPayout: React.Dispatch<React.SetStateAction<string>>;
  setSelectedBet: React.Dispatch<React.SetStateAction<string>>;
}

const BET_TYPE_MAPPING: Record<string, { type: number; number?: number; payout: string }> = {
  // 单个数字 (0-36)
  ...Array.from({ length: 37 }, (_, i) => i).reduce((acc, num) => {
    acc[`Number ${num}`] = { type: 0, number: num, payout: 'x35' };
    return acc;
  }, {} as Record<string, { type: number; number: number; payout: string }>),
  
  // 颜色投注
  'Yellow': { type: 1, payout: 'x1.1' },
  'Blue': { type: 2, payout: 'x1.1' },
  
  // 奇偶投注
  'Odd': { type: 3, payout: 'x1.1' },
  'Even': { type: 4, payout: 'x1.1' },
  
  // 高低投注
  '1 to 18': { type: 5, payout: 'x1.1' },
  '19 to 36': { type: 6, payout: 'x1.1' },
};

const BettingArea: React.FC<BettingAreaProps> = ({ setPayout, setSelectedBet }) => {
  const handleNumberClick = (num: number) => {
    const betText = `Number ${num}`;
    setPayout(BET_TYPE_MAPPING[betText]?.payout || 'x35');
    setSelectedBet(betText);
  };

  const handleGridClick = (label: string) => {
    const betText = label; // 直接使用 label 作为键
    setPayout(BET_TYPE_MAPPING[betText]?.payout || 'x1.1');
    setSelectedBet(betText);
  };

  return (
    <div className="bg-green-800 p-4 rounded-lg">
      <div className="flex">
        <div className="mr-4">
          <button
            className="w-12 h-36 roulette-green text-white font-bold text-lg border-2 border-green-600 hover:border-yellow-400 transition-colors"
            onClick={() => handleNumberClick(0)}
          >
            0
          </button>
        </div>
        <div className="flex-1">
          <div className="grid grid-cols-12 gap-1 mb-2">
            {[
              3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36,
              2, 5, 8, 11, 14, 17, 20, 23, 26, 29, 32, 35,
              1, 4, 7, 10, 13, 16, 19, 22, 25, 28, 31, 34,
            ].map((num) => (
              <button
                key={num}
                className={`w-12 h-12 ${[1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36].includes(num) ? 'roulette-yellow' : 'roulette-blue'} text-white font-bold border border-gray-600 hover:border-yellow-400 transition-colors`}
                onClick={() => handleNumberClick(num)}
              >
                {num}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-6 gap-1">
            {['Yellow', 'Blue'].map((label) => (
              <button
                key={label}
                className={`h-12 ${label === 'Yellow' ? 'roulette-yellow' : label === 'Blue' ? 'roulette-blue' : 'bg-gray-700'} text-white font-medium border border-gray-600 hover:border-yellow-400 transition-colors`}
                onClick={() => handleGridClick(label)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BettingArea;
