import React, { useState } from 'react';
import { 
  useAccount,
  useChainId,
  useSwitchChain,
  useContractWrite,
  useWaitForTransactionReceipt 
} from 'wagmi';
import { sepolia } from 'wagmi/chains';

const CONTRACT_ADDRESS = '0x22fA7785bac7b2Df864870a6632f4e25C16De725';

const ABI = [
  {
    "inputs": [],
    "name": "mint",
    "outputs": [{"internalType": "bool","name": "","type": "bool"}],
    "stateMutability": "nonpayable",
    "type": "function"
  }
] as const;

const Faucet = () => {
  const [showPendingModal, setShowPendingModal] = useState(false);
  const { address, isConnected, chain } = useAccount();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();

  const { 
    writeContract,
    data: txHash,
    isPending: isWritePending,
    error: writeError,
    reset
  } = useContractWrite();

  // 新增：交易结果监听
  const { 
    isLoading: isConfirming, 
    isSuccess: isConfirmed,
    error: receiptError
  } = useWaitForTransactionReceipt({ 
    hash: txHash 
  });

  const handleMint = async () => {
    reset(); // 重置之前的状态
    setShowPendingModal(true);

    if (!isConnected) {
      alert('请先连接钱包');
      setShowPendingModal(false);
      return;
    }

    const currentChainId = chain?.id || chainId;
    if (currentChainId !== sepolia.id) {
      switchChain?.({ chainId: sepolia.id });
      setShowPendingModal(false);
      return;
    }

    try {
      await writeContract({
        address: CONTRACT_ADDRESS,
        abi: ABI,
        functionName: 'mint',
        args: []
      });
    } catch (err) {
      setShowPendingModal(false);
      console.error('完整错误:', err);
    }
  };

  // 当交易完成或失败时关闭蒙版
  React.useEffect(() => {
    if (isConfirmed || receiptError) {
      setShowPendingModal(false);
    }
  }, [isConfirmed, receiptError]);

  const currentNetworkName = chain?.id === sepolia.id 
    ? 'Sepolia' 
    : `未知网络 (ID: ${chain?.id || chainId})`;

  return (
    <div className="relative max-w-md mx-auto p-4 space-y-4 bg-white rounded-lg shadow-md">
      {/* 蒙版弹窗 */}
      {showPendingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-sm w-full text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <h3 className="text-lg font-medium mb-2">
              {isWritePending ? '等待钱包确认...' : '交易处理中...'}
            </h3>
            <p className="text-gray-600 text-sm">
              {txHash && (
                <a 
                  href={`https://sepolia.etherscan.io/tx/${txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 underline"
                >
                  查看交易详情
                </a>
              )}
            </p>
            {(writeError || receiptError) && (
              <button 
                onClick={() => setShowPendingModal(false)}
                className="mt-4 px-4 py-2 bg-red-500 text-white rounded"
              >
                关闭
              </button>
            )}
          </div>
        </div>
      )}

      {/* 主界面内容 */}
      <h1 className="text-2xl font-bold text-center">ZARTC Faucet</h1>
      
      <div className="p-3 rounded-lg bg-gray-50">
        <p className="font-semibold">
          {chain?.id === sepolia.id ? (
            <span className="text-green-600">✓ 当前网络: {currentNetworkName}</span>
          ) : (
            <span className="text-red-600">⚠ 请切换到 Sepolia 网络</span>
          )}
        </p>
      </div>

      {address && (
        <div className="p-3 rounded-lg bg-gray-50 break-all">
          <p className="font-semibold">钱包地址:</p>
          <p className="text-sm">{address}</p>
        </div>
      )}

      <button
        onClick={handleMint}
        disabled={isWritePending || isConfirming || !isConnected}
        className={`w-full py-3 px-6 rounded-lg font-medium ${
          (isWritePending || isConfirming) ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-500'
        } text-white transition-colors disabled:opacity-50`}
      >
        {isConfirming ? '等待链上确认...' : '铸造100 ZARTC'}
      </button>

      {isConfirmed && txHash && (
        <div className="p-3 rounded-lg bg-green-50">
          <p className="text-green-800">
            ✓ 铸造成功！
            <br/>
            <a 
              href={`https://sepolia.etherscan.io/tx/${txHash}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 underline"
            >
              在Etherscan查看交易
            </a>
          </p>
        </div>
      )}

      {(writeError || receiptError) && (
        <div className="p-3 rounded-lg bg-red-50">
          <p className="text-red-800">
            ✗ 错误: {(writeError || receiptError)?.message.includes('rejected') 
              ? '用户取消了交易' 
              : (writeError || receiptError)?.shortMessage || '交易失败'}
          </p>
        </div>
      )}
    </div>
  );
};

export default Faucet;

