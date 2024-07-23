import React, { useState, useEffect, useRef, useCallback } from 'react';
import './Roulette.css';
import { v4 as uuidv4 } from 'uuid';

// sectors 配列を最初に宣言
const sectors = [
  ...Array(5).fill({ label: '¥500 OFF', color: '#000000', textColor: '#FFFFFF' }),
  ...Array(5).fill({ label: '¥1000 OFF', color: '#000000', textColor: '#FFFFFF' }),
  ...Array(20).fill().map((_, i) => ({
    label: 'ハズレ',
    color: i % 3 === 0 ? '#D3D3D3' : (i % 3 === 1 ? '#FFFFFF' : '#D3D3D3'),
    textColor: '#000000'
  }))
];

const shuffleArray = (array) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

const shuffledSectors = shuffleArray(sectors);

const Roulette = () => {
  const [result, setResult] = useState('');
  const [spinning, setSpinning] = useState(false);
  const [canSpin, setCanSpin] = useState(true);
  const [timeLeft, setTimeLeft] = useState(0);
  const canvasRef = useRef(null);
  const arrowAngleRef = useRef(0);
  const spinCountRef = useRef(0); // 回転数を追跡するためのRef
  const consecutiveDaysRef = useRef(0); // 連続回転数を追跡するためのRef
  const [couponMessage, setCouponMessage] = useState(''); // クーポンメッセージ用のステート

  const drawRoulette = useCallback((angle = 0) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 20; // 半径を小さくして外枠を広げる
    const angleStep = (2 * Math.PI) / shuffledSectors.length;

    // キャンバスをクリア
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // ルーレットを描画
    shuffledSectors.forEach((sector, index) => {
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, index * angleStep, (index + 1) * angleStep);
      ctx.fillStyle = sector.color;
      ctx.fill();
      ctx.stroke();

      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(index * angleStep + angleStep / 2);
      ctx.textAlign = 'right';
      ctx.fillStyle = sector.textColor;
      ctx.font = '14px Arial';
      ctx.fillText(sector.label, radius - 10, 5);
      ctx.restore();
    });

    // ルーレットの指針を描画
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate((angle * Math.PI) / 180);
    ctx.translate(-centerX, -centerY);
    ctx.beginPath();
    ctx.moveTo(centerX, centerY - radius);
    ctx.lineTo(centerX - 10, centerY - radius - 20);
    ctx.lineTo(centerX + 10, centerY - radius - 20);
    ctx.closePath();
    ctx.fillStyle = 'red';
    ctx.fill();
    ctx.restore();

    // 最後の赤い矢印の角度を保存
    arrowAngleRef.current = angle;
  }, []);

  useEffect(() => {
    let userId = localStorage.getItem('userId');
    if (!userId) {
      userId = uuidv4();
      localStorage.setItem('userId', userId);
    }

    let spinCount = localStorage.getItem('spinCount');
    if (!spinCount) {
      spinCount = 0;
      localStorage.setItem('spinCount', spinCount);
    } else {
      spinCountRef.current = parseInt(spinCount, 10);
    }

    let consecutiveDays = localStorage.getItem('consecutiveDays');
    if (!consecutiveDays) {
      consecutiveDays = 0;
      localStorage.setItem('consecutiveDays', consecutiveDays);
    } else {
      consecutiveDaysRef.current = parseInt(consecutiveDays, 10);
    }

    const lastSpinTime = localStorage.getItem('lastSpinTime');
    if (lastSpinTime) {
      const now = new Date();
      const lastSpinDate = new Date(lastSpinTime);
      const diff = now - lastSpinDate;
      const hoursSinceLastSpin = Math.floor(diff / (1000 * 60 * 60));

      if (hoursSinceLastSpin < 24) {
        setCanSpin(false);
        setTimeLeft(calculateTimeLeftUntilMidnight());
      } else if (hoursSinceLastSpin >= 48) {
        // 2日以上空いている場合は連続回転数をリセット
        consecutiveDaysRef.current = 0;
        localStorage.setItem('consecutiveDays', consecutiveDaysRef.current);
      }
    }

    drawRoulette(arrowAngleRef.current);
    const interval = setInterval(() => {
      if (!canSpin) {
        setTimeLeft(calculateTimeLeftUntilMidnight());
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [canSpin, drawRoulette]);

  const calculateTimeLeftUntilMidnight = () => {
    const now = new Date();
    const midnight = new Date();
    midnight.setHours(24, 0, 0, 0); // 日本時間の0時に設定

    const diff = midnight - now;
    return Math.floor(diff / 1000);
  };

  const spinRoulette = async () => {
    setSpinning(true);
    const spinAngle = Math.random() * 3600 + 3600; // 10回転以上
    const duration = 6000; // 6秒
    let start = null;

    const step = (timestamp) => {
      if (!start) start = timestamp;
      const progress = timestamp - start;
      const angle = easeOutCubic(progress, 0, spinAngle, duration);

      drawRoulette(angle);

      if (progress < duration) {
        window.requestAnimationFrame(step);
      } else {
        setSpinning(false);
        const finalAngle = (angle % 360);
        let resultIndex = Math.floor(((finalAngle / 360) * shuffledSectors.length));

        // 50回転目には必ず当たりを出す
        if (consecutiveDaysRef.current + 1 === 50) {
          resultIndex = shuffledSectors.findIndex(sector => sector.label !== 'ハズレ');
          setCouponMessage('クーポンコード <span class="coupon-code">000000</span><br><span class="coupon-message">このクーポンコードを忘れずに保管してね♥</span>');
        } else {
          setCouponMessage('');
        }

        const sector = shuffledSectors[resultIndex]; // ルーレットの結果を正しく取得
        setResult(sector.label);
        arrowAngleRef.current = finalAngle;
        setCanSpin(false);
        setTimeLeft(calculateTimeLeftUntilMidnight());
        localStorage.setItem('lastSpinTime', new Date().toISOString());
        spinCountRef.current++;
        consecutiveDaysRef.current++;
        localStorage.setItem('spinCount', spinCountRef.current);
        localStorage.setItem('consecutiveDays', consecutiveDaysRef.current);
      }
    };

    window.requestAnimationFrame(step);
  };

  const easeOutCubic = (t, b, c, d) => {
    t /= d;
    t--;
    return c * (t * t * t + 1) + b;
  };

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs}時間${mins}分${secs}秒`;
  };

  return (
    <div className="roulette-container">
      <h1>クーポンGETのチャンス</h1>
      <p>１日１回ルーレットを回してみよう</p>
      <div className="roulette-image-container">
        <canvas ref={canvasRef} width={350} height={350}></canvas> {/* キャンバスのサイズを大きくする */}
      </div>
      {canSpin ? (
        <button onClick={spinRoulette} disabled={spinning}>
          {spinning ? '回転中...' : 'ルーレットを回す'}
        </button>
      ) : (
        <p className="message-box">残りあと、{formatTime(timeLeft)}後にチャレンジできるよ❣</p>
      )}
      {result && (
        <div className="message-box">
          <p>{result}</p>
          {couponMessage && (
            <div className="coupon-box" dangerouslySetInnerHTML={{ __html: couponMessage }}></div>
          )}
        </div>
      )}
      <div style={{ marginBottom: '20px' }}></div> {/* 余白を追加 */}
    </div>
  );
};

export default Roulette;
