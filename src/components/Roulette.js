import React, { useState, useRef, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

const supabaseUrl = 'https://your-supabase-url.supabase.co';
const supabaseAnonKey = 'your-anon-key';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const sectors = [
  { label: '¥500 OFF', color: '#000000', textColor: '#FFFFFF' },
  { label: 'ハズレ', color: '#D3D3D3', textColor: '#000000' },
  { label: '¥1000 OFF', color: '#000000', textColor: '#FFFFFF' },
  { label: 'ハズレ', color: '#D3D3D3', textColor: '#000000' },
  { label: '¥500 OFF', color: '#000000', textColor: '#FFFFFF' },
  { label: 'ハズレ', color: '#D3D3D3', textColor: '#000000' },
  { label: '¥1000 OFF', color: '#000000', textColor: '#FFFFFF' },
  { label: 'ハズレ', color: '#D3D3D3', textColor: '#000000' },
  { label: '¥500 OFF', color: '#000000', textColor: '#FFFFFF' },
  { label: 'ハズレ', color: '#D3D3D3', textColor: '#000000' },
  { label: '¥1000 OFF', color: '#000000', textColor: '#FFFFFF' },
  { label: 'ハズレ', color: '#D3D3D3', textColor: '#000000' },
  { label: '¥500 OFF', color: '#000000', textColor: '#FFFFFF' },
  { label: 'ハズレ', color: '#D3D3D3', textColor: '#000000' },
  { label: '¥1000 OFF', color: '#000000', textColor: '#FFFFFF' },
  { label: 'ハズレ', color: '#D3D3D3', textColor: '#000000' },
  { label: '¥500 OFF', color: '#000000', textColor: '#FFFFFF' },
  { label: 'ハズレ', color: '#D3D3D3', textColor: '#000000' },
  { label: '¥1000 OFF', color: '#000000', textColor: '#FFFFFF' },
  { label: 'ハズレ', color: '#D3D3D3', textColor: '#000000' },
  { label: '¥500 OFF', color: '#000000', textColor: '#FFFFFF' },
  { label: 'ハズレ', color: '#D3D3D3', textColor: '#000000' },
  { label: '¥1000 OFF', color: '#000000', textColor: '#FFFFFF' },
  { label: 'ハズレ', color: '#D3D3D3', textColor: '#000000' },
  { label: '¥500 OFF', color: '#000000', textColor: '#FFFFFF' },
  { label: 'ハズレ', color: '#D3D3D3', textColor: '#000000' },
  { label: '¥1000 OFF', color: '#000000', textColor: '#FFFFFF' },
  { label: 'ハズレ', color: '#D3D3D3', textColor: '#000000' },
  { label: '¥500 OFF', color: '#000000', textColor: '#FFFFFF' },
  { label: 'ハズレ', color: '#D3D3D3', textColor: '#000000' },
];

const getSectorFromAngle = (angle) => {
  const sectorAngle = 360 / sectors.length;
  return sectors[Math.floor(angle / sectorAngle) % sectors.length];
};

const getFixedResultIndex = () => {
  const now = new Date();
  const date = now.getDate();

  // 指定日に当たる結果を設定
  switch (date) {
    case 1:
      return 1; // ハズレ
    case 2:
      return 2; // ¥1000 OFF
    case 3:
      return 3; // ハズレ
    case 4:
      return 4; // ¥500 OFF
    case 5:
      return 5; // ハズレ
    default:
      return 0; // デフォルトで1つ目のセクターを設定
  }
};

const calculateTimeLeftUntilMidnight = () => {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);
  return midnight - now;
};

const Roulette = () => {
  const [result, setResult] = useState('');
  const [couponMessage, setCouponMessage] = useState('');
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeftUntilMidnight());
  const [canSpin, setCanSpin] = useState(true);
  const [spinning, setSpinning] = useState(false);
  const canvasRef = useRef(null);
  const arrowAngleRef = useRef(0);
  const userIdRef = useRef(null);

  useEffect(() => {
    // 新しいユーザーIDを生成し、設定
    const userId = uuidv4();
    userIdRef.current = userId;

    // Supabaseにユーザー情報を保存
    const saveUserData = async () => {
      const { data, error } = await supabase
        .from('users')
        .insert([{ id: userId, last_spin: null, spin_count: 0 }]);

      if (error) {
        console.error('Error inserting user data:', error);
      }
    };

    saveUserData();
    drawRoulette();
  }, []);

  const drawRoulette = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY);

    // 背景色をクリア
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    sectors.forEach((sector, index) => {
      const startAngle = (index * 2 * Math.PI) / sectors.length;
      const endAngle = ((index + 1) * 2 * Math.PI) / sectors.length;

      // セクターを描画
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, startAngle, endAngle);
      ctx.closePath();
      ctx.fillStyle = sector.color;
      ctx.fill();

      // セクターのテキストを描画
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(startAngle + (endAngle - startAngle) / 2);
      ctx.textAlign = 'right';
      ctx.fillStyle = sector.textColor;
      ctx.font = 'bold 12px Arial';
      ctx.fillText(sector.label, radius - 10, 5);
      ctx.restore();
    });

    // 矢印を描画
    ctx.fillStyle = 'red';
    ctx.beginPath();
    ctx.moveTo(centerX - 10, 10);
    ctx.lineTo(centerX + 10, 10);
    ctx.lineTo(centerX, 30);
    ctx.closePath();
    ctx.fill();
  };

  const spinRoulette = async () => {
    if (!canSpin || spinning) return;

    setSpinning(true);
    let start = null;
    const duration = 4000; // アニメーションの時間（ミリ秒）
    const maxAngle = 360 * 4; // 最大回転角度
    const finalAngle = maxAngle + Math.random() * 360; // 最終的な回転角度

    const step = async (timestamp) => {
      if (!start) start = timestamp;
      const elapsed = timestamp - start;
      const progress = Math.min(elapsed / duration, 1); // 進行率（0から1）

      const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);
      const angle = easeOutCubic(progress) * finalAngle;
      arrowAngleRef.current = angle;
      drawRoulette();

      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        setSpinning(false);

        // 指定日に基づく結果インデックスの取得
        const resultIndex = getFixedResultIndex();

        const sector = sectors[resultIndex];
        setResult(sector.label);
        arrowAngleRef.current = finalAngle % 360;

        // クーポンメッセージの設定
        if (sector.label === '¥500 OFF') {
          setCouponMessage('クーポンコード 000000\nこのクーポンコードを忘れずに保管してね♥');
        } else if (sector.label === '¥1000 OFF') {
          setCouponMessage('クーポンコード 111111\nこのクーポンコードを忘れずに保管してね♥');
        } else {
          setCouponMessage('');
        }

        // Supabaseに結果を保存
        const { error } = await supabase
          .from('users')
          .update({ last_spin: new Date().toISOString(), spin_count: 1 })
          .eq('id', userIdRef.current);

        if (error) {
          console.error('Error updating user data:', error);
        }
      }
    };

    window.requestAnimationFrame(step);

    // 次のスピンまでの時間設定
    setTimeLeft(calculateTimeLeftUntilMidnight());
    setCanSpin(false);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setTimeLeft(calculateTimeLeftUntilMidnight());
    }, 1000);

    return () => clearTimeout(timer);
  }, [timeLeft]);

  return (
    <div>
      <h1>クーポンGETのチャンス</h1>
      <p>1日1回ルーレットを回してみよう</p>
      <canvas ref={canvasRef} width="300" height="300" />
      <button onClick={spinRoulette} disabled={!canSpin}>ルーレットを回す</button>
      <div style={{ marginTop: '20px' }}>
        <div style={{ border: '1px solid black', borderRadius: '10px', padding: '10px', marginBottom: '10px' }}>
          {timeLeft > 0
            ? `残りあと、${Math.floor(timeLeft / 1000 / 60 / 60)}時間${Math.floor((timeLeft / 1000 / 60) % 60)}分${Math.floor((timeLeft / 1000) % 60)}秒後にチャレンジできるよ❣`
            : 'ルーレットを回せます'}
        </div>
        <div style={{ border: '1px solid black', borderRadius: '10px', padding: '10px', marginBottom: '10px' }}>
          {result}
        </div>
        {couponMessage && (
          <div style={{ border: '1px solid black', borderRadius: '10px', padding: '10px' }}>
            {couponMessage}
          </div>
        )}
      </div>
    </div>
  );
};

export default Roulette;
