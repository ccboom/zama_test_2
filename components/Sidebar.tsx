import React, { useRef, useEffect, useState } from 'react';
import Image from 'next/image';
import { useAccount, useReadContract, useWriteContract, usePublicClient } from 'wagmi';
import { decodeEventLog } from 'viem';
import zamaIcon from '../public/imgs/216226803.svg';
import WalletConnect from './WalletConnect';

const zartcABI = [
  {
    constant: true,
    inputs: [{ name: '_owner', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: 'balance', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'decimals',
    outputs: [{ name: '', type: 'uint8' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: true,
    inputs: [
      { name: '_owner', type: 'address' },
      { name: '_spender', type: 'address' },
    ],
    name: 'allowance',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: false,
    inputs: [
      { name: '_spender', type: 'address' },
      { name: '_value', type: 'uint256' },
    ],
    name: 'approve',
    outputs: [{ name: 'success', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
];

const rouletteGameABI = [
  {
    inputs: [
      { name: 'betType', type: 'uint8' },
      { name: 'number', type: 'uint256' },
      { name: 'amount', type: 'uint256' },
    ],
    name: 'placeBet',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'claimReward',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { name: 'user', type: 'address' },
      { name: 'round', type: 'uint256' },
    ],
    name: 'getUserBets',
    outputs: [
      {
        components: [
          { name: 'player', type: 'address' },
          { name: 'amount', type: 'uint256' },
          { name: 'betType', type: 'uint8' },
          { name: 'number', type: 'uint256' },
        ],
        name: '',
        type: 'tuple[]',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'player', type: 'address' }],
    name: 'pendingRewards',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'round', type: 'uint256' }],
    name: 'roundResults',
    outputs: [
      { name: 'number', type: 'uint256' },
      { name: 'isRed', type: 'bool' },
      { name: 'fulfilled', type: 'bool' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'currentRound',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'round', type: 'uint256' },
      { indexed: false, name: 'number', type: 'uint256' },
      { indexed: false, name: 'isRed', type: 'bool' },
    ],
    name: 'ResultFulfilled',
    type: 'event',
  },
];

interface SidebarProps {
  payout: string;
  onPlaceBet?: (betType: number, number: number, amount: string, setTargetNumber: (num: number | null) => void) => void;
  selectedBet: string;
  setTargetNumber?: (num: number | null) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ payout, onPlaceBet, selectedBet, setTargetNumber }) => {
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient();
  const [betAmount, setBetAmount] = useState('0.02');
  const [isBetting, setIsBetting] = useState(false);
  const [lastResult, setLastResult] = useState<{
    round: number;
    winningNumber: number;
    isRed: boolean;
    userWon: boolean;
  } | null>(null);
  const [userBets, setUserBets] = useState<
    { betType: number; number: number; amount: string; round: number; userWon: boolean }[]
  >([]);
  const [showResult, setShowResult] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const { data: decimals } = useReadContract({
    address: '0x22fA7785bac7b2Df864870a6632f4e25C16De725',
    abi: zartcABI,
    functionName: 'decimals',
    chainId: 11155111,
  });

  const { data: zartcBalance } = useReadContract({
    address: '0x22fA7785bac7b2Df864870a6632f4e25C16De725',
    abi: zartcABI,
    functionName: 'balanceOf',
    args: [address],
    chainId: 11155111,
    query: { enabled: isConnected && !!address },
  });

  const { data: allowance } = useReadContract({
    address: '0x22fA7785bac7b2Df864870a6632f4e25C16De725',
    abi: zartcABI,
    functionName: 'allowance',
    args: [address, '0x26e0aC98F3fcFCB9b17778C3a076Df9701135608'],
    chainId: 11155111,
    query: { enabled: isConnected && !!address },
  });

  const { data: pendingReward } = useReadContract({
    address: '0x26e0aC98F3fcFCB9b17778C3a076Df9701135608',
    abi: rouletteGameABI,
    functionName: 'pendingRewards',
    args: [address],
    chainId: 11155111,
    query: { enabled: isConnected && !!address },
  });

  const { data: currentRound } = useReadContract({
    address: '0x26e0aC98F3fcFCB9b17778C3a076Df9701135608',
    abi: rouletteGameABI,
    functionName: 'currentRound',
    chainId: 11155111,
  });

  const { data: recentBets } = useReadContract({
    address: '0x26e0aC98F3fcFCB9b17778C3a076Df9701135608',
    abi: rouletteGameABI,
    functionName: 'getUserBets',
    args: [address, currentRound ? BigInt(Number(currentRound) - 1) : BigInt(0)],
    chainId: 11155111,
    query: { enabled: isConnected && !!address && !!currentRound },
  });

  const { writeContractAsync: approveZARTC } = useWriteContract();
  const { writeContractAsync: placeBet } = useWriteContract();
  const { writeContractAsync: claimReward } = useWriteContract();

  const BET_TYPE_MAPPING: Record<string, { type: number; number?: number; payout: string; color?: string }> = {
    // 单个数字 (0-36)
    ...Array.from({ length: 37 }, (_, i) => i).reduce(
      (acc, num) => {
        acc[`Number ${num}`] = { type: 0, number: num, payout: 'x35', color: num === 0 ? '绿色' : '' };
        return acc;
      },
      {} as Record<string, { type: number; number: number; payout: string; color?: string }>
    ),
    // 颜色投注
    Yellow: { type: 1, payout: 'x1.1', color: '黄色' },
    Blue: { type: 2, payout: 'x1.1', color: '蓝色' },
    // 奇偶投注
    Odd: { type: 3, payout: 'x1.1', color: '' },
    Even: { type: 4, payout: 'x1.1', color: '' },
    // 高低投注
    '1 to 18': { type: 5, payout: 'x1.1', color: '' },
    '19 to 36': { type: 6, payout: 'x1.1', color: '' },
  };

  const fetchRoundResult = async (round: bigint) => {
    try {
      const result = await publicClient.readContract({
        address: '0x26e0aC98F3fcFCB9b17778C3a076Df9701135608',
        abi: rouletteGameABI,
        functionName: 'roundResults',
        args: [round],
      });
      return result;
    } catch (error) {
      console.error('获取轮次结果失败:', error);
      return null;
    }
  };

  const fetchUserBets = async () => {
    if (!address || !currentRound) return;
    try {
      const bets = await publicClient.readContract({
        address: '0x26e0aC98F3fcFCB9b17778C3a076Df9701135608',
        abi: rouletteGameABI,
        functionName: 'getUserBets',
        args: [address, BigInt(Number(currentRound) - 1)],
      });
      const updatedBets = bets.map((bet: any) => ({
        betType: bet.betType,
        number: Number(bet.number),
        amount: (Number(bet.amount) / 10 ** (decimals || 18)).toString(),
        round: Number(currentRound) - 1,
      }));
      setUserBets(updatedBets);
    } catch (error) {
      console.error('获取用户下注失败:', error);
    }
  };

  useEffect(() => {
    if (!publicClient || !currentRound || currentRound <= 0n) return;

    const unwatch = publicClient.watchContractEvent({
      address: '0x26e0aC98F3fcFCB9b17778C3a076Df9701135608',
      abi: rouletteGameABI,
      eventName: 'ResultFulfilled',
      onLogs: (logs) => {
        const event = logs[0];
        const decoded = decodeEventLog({
          abi: rouletteGameABI,
          data: event.data,
          topics: event.topics,
        });
        const { round, number, isRed } = decoded.args;
        const betConfig = selectedBet ? BET_TYPE_MAPPING[selectedBet] : null;
        const color = number === 0 ? '绿色' : isRed ? '黄色' : '蓝色';
        setLastResult({
          round: Number(round),
          winningNumber: Number(number),
          isRed,
          userWon: betConfig ? checkIfUserWon(betConfig, Number(number), isRed) : false,
        });
        setShowResult(true);
        setTargetNumber?.(Number(number)); // 传递结果给 Roulette
        setTimeout(() => setShowResult(false), 3000);
      },
    });

    return () => unwatch();
  }, [publicClient, currentRound, selectedBet, decimals, setTargetNumber]);

  useEffect(() => {
    if (currentRound && currentRound > 0n) {
      fetchRoundResult(BigInt(Number(currentRound) - 1)).then((result) => {
        if (result && result.fulfilled) {
          const color = result.number === 0 ? '绿色' : result.isRed ? '黄色' : '蓝色';
          const lastBet = userBets.length > 0 ? userBets[userBets.length - 1] : null;
          let userWon = false;
          if (lastBet) {
            const betConfig = BET_TYPE_MAPPING[
              lastBet.betType === 0
                ? `Number ${lastBet.number}`
                : lastBet.betType === 1
                ? 'Yellow'
                : lastBet.betType === 2
                ? 'Blue'
                : lastBet.betType === 3
                ? 'Odd'
                : lastBet.betType === 4
                ? 'Even'
                : lastBet.betType === 5
                ? '1 to 18'
                : '19 to 36'
            ];
            userWon = checkIfUserWon(betConfig, Number(result.number), result.isRed);
          }
          setLastResult({
            round: Number(currentRound) - 1,
            winningNumber: Number(result.number),
            isRed: result.isRed,
            userWon,
          });
          setTargetNumber?.(Number(result.number)); // 初始化时传递最新结果
        }
      });
      fetchUserBets();
    }
  }, [currentRound, address, userBets, setTargetNumber]);

  const handleButtonClick = (type: 'half' | 'double' | 'max') => {
    if (!inputRef.current) return;
    if (type === 'half') {
      inputRef.current.value = '0.05';
      setBetAmount('0.05');
    } else if (type === 'double') {
      inputRef.current.value = '0.2';
      setBetAmount('0.2');
    } else if (type === 'max' && zartcBalance && decimals) {
      const max = (Number(zartcBalance) / Math.pow(10, decimals)).toFixed(3);
      inputRef.current.value = max;
      setBetAmount(max);
    }
  };

  const handleWheel = (e: React.WheelEvent<HTMLInputElement>) => {
    e.preventDefault();
    e.currentTarget.blur();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      e.preventDefault();
    }
  };

  const checkIfUserWon = (betConfig: { type: number; number?: number }, winningNumber: number, isRed: boolean) => {
    if (betConfig.type === 0) return betConfig.number === winningNumber;
    if (betConfig.type === 1) return isRed && winningNumber !== 0;
    if (betConfig.type === 2) return !isRed && winningNumber !== 0;
    if (betConfig.type === 3) return winningNumber % 2 === 1 && winningNumber !== 0;
    if (betConfig.type === 4) return winningNumber % 2 === 0 && winningNumber !== 0;
    if (betConfig.type === 5) return winningNumber >= 1 && winningNumber <= 18;
    if (betConfig.type === 6) return winningNumber >= 19 && winningNumber <= 36;
    return false;
  };

  const handleBet = async () => {
    if (!isConnected || !address) {
      alert('请连接钱包');
      return;
    }
    const amount = Number(betAmount);
    if (isNaN(amount) || amount <= 0) {
      alert('请输入有效下注金额');
      return;
    }
    if (!selectedBet) {
      alert('请在投注区选择一个投注');
      return;
    }

    setIsBetting(true);
    const amountWei = BigInt(amount * Math.pow(10, decimals || 18));
    const betConfig = BET_TYPE_MAPPING[selectedBet];

    try {
      if (!allowance || BigInt(allowance) < amountWei) {
        const maxAllowance = BigInt('0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff');
        await approveZARTC({
          address: '0x22fA7785bac7b2Df864870a6632f4e25C16De725',
          abi: zartcABI,
          functionName: 'approve',
          args: ['0x26e0aC98F3fcFCB9b17778C3a076Df9701135608', maxAllowance],
          chainId: 11155111,
        });
        console.log('ZARTC 授权完成');
      }

      await placeBet({
        address: '0x26e0aC98F3fcFCB9b17778C3a076Df9701135608',
        abi: rouletteGameABI,
        functionName: 'placeBet',
        args: [betConfig.type, betConfig.number ?? 0, amountWei],
        chainId: 11155111,
      });

      const bet = { betType: betConfig.type, number: betConfig.number ?? 0, amount: betAmount, round: Number(currentRound) - 1 };
      setUserBets((prev) => [...prev, bet]);
      if (onPlaceBet) {
        onPlaceBet(bet.betType, bet.number, bet.amount, setTargetNumber!);
      }
      await fetchUserBets();
      alert('下注成功！');
      setTargetNumber?.(null); // 下注后重置 targetNumber，等待结果
    } catch (error) {
      console.error('下注失败:', error);
      alert(`下注失败: ${error instanceof Error ? error.message : '未知错误'}`);
    } finally {
      setIsBetting(false);
    }
  };

  const handleClaimReward = async () => {
    if (!isConnected || !address) {
      alert('请连接钱包');
      return;
    }
    if (!pendingReward || Number(pendingReward) === 0) {
      alert('无待领取奖励');
      return;
    }
    try {
      await claimReward({
        address: '0x26e0aC98F3fcFCB9b17778C3a076Df9701135608',
        abi: rouletteGameABI,
        functionName: 'claimReward',
        chainId: 11155111,
      });
      alert('奖励领取成功');
    } catch (error) {
      console.error('领取奖励失败:', error);
      alert('领取奖励失败');
    }
  };

  const formatAmount = (amount: any) => {
    if (!amount || !decimals) return '0';
    return (Number(amount) / Math.pow(10, decimals)).toFixed(3);
  };

  return (
    <div className="xl:col-span-1">
      <div className="space-y-6">
        <WalletConnect />
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-white text-sm font-medium">下注金额</label>
            <span className="text-white text-sm">余额: {formatAmount(zartcBalance)} ZAMA</span>
          </div>
          <div className="relative">
            <input
              type="number"
              className="w-full bg-yellow-900/50 border border-yellow-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:border-yellow-500"
              step="0.01"
              min="0"
              defaultValue="0.02"
              ref={inputRef}
              onChange={(e) => setBetAmount(e.target.value)}
              onWheel={handleWheel}
              onKeyDown={handleKeyDown}
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
              <Image src={zamaIcon} alt="ZAMA" width={20} height={20} />
              <button
                onClick={() => handleButtonClick('half')}
                className="text-yellow-300 hover:text-white text-sm px-2 py-1 rounded transition-colors"
              >
                1/2
              </button>
              <button
                onClick={() => handleButtonClick('double')}
                className="text-yellow-300 hover:text-white text-sm px-2 py-1 rounded transition-colors"
              >
                2x
              </button>
              <button
                onClick={() => handleButtonClick('max')}
                className="text-yellow-300 hover:text-white text-sm px-2 py-1 rounded transition-colors"
              >
                max
              </button>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-white text-sm font-medium mb-2">赔率</label>
          <div className="w-full bg-yellow-900/30 border border-yellow-700 text-white px-4 py-3 rounded-lg">
            {selectedBet ? BET_TYPE_MAPPING[selectedBet]?.payout || 'x1.1' : '未选择'}
          </div>
        </div>

        <div>
          <label className="block text-white text-sm font-medium mb-2">选中的投注</label>
          <div className="w-full bg-yellow-900/30 border border-yellow-700 text-white px-4 py-3 rounded-lg">
            {selectedBet || '未选择'}
          </div>
        </div>

        <button
          onClick={handleBet}
          className="w-full bg-black hover:bg-gray-900 text-white font-medium py-3 px-4 rounded-lg transition-colors"
          disabled={isBetting || !selectedBet}
        >
          {isBetting ? '下注中...' : '下注'}
        </button>

        <button
          onClick={handleClaimReward}
          className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          disabled={!pendingReward || Number(pendingReward) === 0}
        >
          领取奖励 ({formatAmount(pendingReward)} ZAMA)
        </button>

        <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700 mb-6">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-white font-medium">最新结果</h3>
            {lastResult?.round && <span className="text-gray-400 text-sm">轮次 #{lastResult.round}</span>}
          </div>
          {lastResult ? (
            <div className="flex items-center justify-between">
              <div
                className={`w-12 h-12 flex items-center justify-center rounded-full text-2xl font-bold ${
                  lastResult.winningNumber === 0
                    ? 'bg-green-600'
                    : lastResult.isRed
                    ? 'bg-yellow-600'
                    : 'bg-blue-600'
                }`}
              >
                {lastResult.winningNumber}
              </div>
              <div className="text-right">
                <p className="text-white">
                  {lastResult.winningNumber === 0
                    ? '绿色'
                    : lastResult.isRed
                    ? '黄色'
                    : '蓝色'}
                </p>
                <p className={lastResult.userWon ? 'text-green-400' : 'text-red-400'}>
                  {lastResult.userWon ? '赢了' : '输了'}
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-gray-400">等待第一局结果...</p>
            </div>
          )}
        </div>

        <div className="mb-6">
          <h3 className="text-white text-lg font-medium mb-3">最近游戏</h3>
          {userBets.length > 0 ? (
            <div className="bg-gray-800/50 rounded-lg p-3 space-y-2 max-h-40 overflow-y-auto">
              {userBets.map((bet, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center text-sm py-1 px-2 hover:bg-gray-700/50 rounded"
                >
                  <div className="flex items-center">
                    <span
                      className={`inline-block w-3 h-3 rounded-full mr-2 ${
                        bet.betType === 1
                          ? 'bg-yellow-500'
                          : bet.betType === 2
                          ? 'bg-blue-500'
                          : bet.betType === 0 && bet.number === 0
                          ? 'bg-green-500'
                          : 'bg-gray-400'
                      }`}
                    ></span>
                    <span className="text-gray-300">
                      轮次 #{bet.round},{' '}
                      {bet.betType === 0
                        ? `数字 ${bet.number} (${bet.number === 0 ? '绿色' : bet.betType === 1 ? '黄色' : '蓝色'})`
                        : bet.betType === 1
                        ? '黄色'
                        : bet.betType === 2
                        ? '蓝色'
                        : bet.betType === 3
                        ? '奇数'
                        : bet.betType === 4
                        ? '偶数'
                        : bet.betType === 5
                        ? '1-18'
                        : '19-36'}
                    </span>
                  </div>
                  <span className={bet.userWon ? 'text-green-400' : 'text-red-400'}>
                    {bet.userWon ? '赢了' : '输了'}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-gray-800/50 rounded-lg p-4 text-center text-gray-400">
              暂无游戏记录
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
