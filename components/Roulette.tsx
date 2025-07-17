import React, { useState, useEffect, useRef } from 'react';
import styles from '../styles/roulette.module.css';

interface RouletteProps {
  targetNumber: number | null; // 明确表示可以是null
  onSpinComplete?: () => void;
}

const Roulette: React.FC<RouletteProps> = ({ targetNumber, onSpinComplete }) => {
  const numbers = [0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26];
  const wheelRef = useRef<HTMLDivElement>(null);
  const ballRef = useRef<HTMLDivElement>(null);
  const numbersRef = useRef<HTMLDivElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [isPreparing, setIsPreparing] = useState(false);
  const spinDuration = 5; // 总旋转时间(秒)
  const spinRounds = 8; // 旋转圈数

  useEffect(() => {
    if (targetNumber !== null && !isSpinning && !isPreparing) {
      setIsPreparing(true);
      const timer = setTimeout(() => {
        startSpinTo(targetNumber);
        setIsPreparing(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [targetNumber]);

  const startSpinTo = (targetNum: number) => {
    if (isSpinning || !ballRef.current) return;
    setIsSpinning(true);

    const ball = ballRef.current;
    ball.style.transition = 'none';
    ball.style.transform = `translateX(-50%) rotate(0deg)`;
    ball.classList.add(styles.spinning);
    createParticles();

    const targetIndex = numbers.indexOf(targetNum);
    if (targetIndex === -1) return;

    const sectorAngle = 360 / numbers.length;
    const targetAngle = targetIndex * sectorAngle + sectorAngle / 2 + 0.5;
    const finalStopAngle = 360 * spinRounds + targetAngle;

    const keyframes = [
      { transform: `translateX(-50%) rotate(0deg)`, offset: 0 },
      { transform: `translateX(-50%) rotate(${finalStopAngle * 0.8}deg)`, offset: 0.8 },
      { transform: `translateX(-50%) rotate(${finalStopAngle}deg)`, offset: 1 },
    ];

    const animation = ball.animate(keyframes, {
      duration: spinDuration * 1000,
      easing: 'cubic-bezier(0.2, 0.8, 0.4, 1)',
      fill: 'forwards',
    });

    animation.onfinish = () => {
      ball.style.transform = `translateX(-50%) rotate(${finalStopAngle}deg)`;
      ball.classList.remove(styles.spinning);
      setIsSpinning(false);
      showWinEffect(targetNum);
      onSpinComplete?.();
    };
  };

  useEffect(() => {
    const wheel = wheelRef.current;
    const ball = ballRef.current;
    const rouletteNumbers = numbersRef.current;
    const popup = popupRef.current;

    if (!wheel || !ball || !rouletteNumbers || !popup) return;

    rouletteNumbers.innerHTML = '';

    // 动态生成轮盘数字
    numbers.forEach((num, index) => {
      const angle = (index * 360) / numbers.length + 5;
      const numberDiv = document.createElement('div');
      numberDiv.className = styles.rouletteNumber;
      numberDiv.style.transform = `rotate(${angle}deg)`;
      numberDiv.textContent = num.toString();
      
      // 设置颜色
      if (num === 0) {
        numberDiv.style.color = '#0f0'; // 绿色
      } else if ([1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36].includes(num)) {
        numberDiv.style.color = '#FACC15'; // 黄色
      } else {
        numberDiv.style.color = '#036'; // 蓝色
      }
      
      rouletteNumbers.appendChild(numberDiv);
    });

    const indicator = document.createElement('div');
    indicator.className = styles.spinIndicator;
    wheel.appendChild(indicator);

    popup.innerHTML = `
      <div class="${styles.modalOverlay}"></div>
      <div class="${styles.modalContent}">
        <h2>轮盘结果</h2>
        <p id="resultNumber"></p>
        <button>关闭</button>
      </div>
    `;
    popup.querySelector('button')?.addEventListener('click', () => {
      popup.classList.remove(styles.show);
    });
  }, []);

  const createParticles = () => {
    const wheel = wheelRef.current;
    if (!wheel) return;
    for (let i = 0; i < 30; i++) {
      const particle = document.createElement('div');
      particle.className = styles.particle;
      particle.style.left = `${Math.random() * 100}%`;
      particle.style.top = `${Math.random() * 100}%`;
      wheel.appendChild(particle);
      setTimeout(() => particle.remove(), 1000);
    }
  };

  const showWinEffect = (winNumber: number) => {
    const numbers = document.querySelectorAll(`.${styles.rouletteNumber}`);
    numbers.forEach((num) => {
      const numElement = num as HTMLElement;
      if (parseInt(numElement.textContent || '0') === winNumber) {
        // 仅显示中奖数字，无高亮效果
        numElement.style.transform = numElement.style.transform.replace(/scale\([^)]+\)/, '');
      }
    });

    const resultNumber = popupRef.current?.querySelector('#resultNumber');
    if (resultNumber) {
      resultNumber.textContent = `轮盘停在数字: ${winNumber}`;
      popupRef.current?.classList.add(styles.show);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-8">
      <div className={styles.rouletteWheel} ref={wheelRef}>
        <div className={styles.rouletteBall} ref={ballRef}></div>
        <div ref={numbersRef}></div>
      </div>
      <div className={styles.resultPopup} ref={popupRef}></div>
    </div>
  );
};

export default Roulette;
