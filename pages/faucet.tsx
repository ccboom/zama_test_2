import dynamic from 'next/dynamic';
import Header from '../components/Header';
import Footer from '../components/Footer';
import styles from './FaucetPage.module.css'; // 创建同名CSS文件

const FaucetComponent = dynamic(() => import('../components/Faucet'), {
  ssr: false,
});

const FaucetPage = () => {
  return (
    <div className="antialiased min-h-screen flex flex-col m-0 p-0 bg-gray-50">
      <Header />
      
      {/* 主内容 - 强制撑满剩余空间 */}
      <main className="flex-grow w-full flex items-center justify-center p-4">
        <FaucetComponent />
      </main>

      {/* Footer - 自动贴底 */}
      <Footer className="w-full" />
    </div>
  );
};

export default FaucetPage;
