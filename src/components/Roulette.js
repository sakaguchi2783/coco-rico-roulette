import React, { useState, useEffect, useRef, useCallback } from 'react';
import './Roulette.css';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '../supabaseClient';

const sectors = [
  { label: '¥500 OFF', color: '#000000', textColor: '#FFFFFF' },
  { label: 'ハズレ', color: '#D3D3D3', textColor: '#000000' },
  { label: '¥1000 OFF', color: '#000000', textColor: '#FFFFFF' },
  { label: 'ハズレ', color: '#FFFFFF', textColor: '#000000' },
  { label: 'ハズレ', color: '#D3D3D3', textColor: '#000000' },
  { label: '¥500 OFF', color: '#000000', textColor: '#FFFFFF' },
  { label: 'ハズレ', color: '#FFFFFF', textColor: '#000000' },
  { label: '¥1000 OFF', color: '#000000', textColor: '#FFFFFF' },
  { label: 'ハズレ', color: '#D3D3D3', textColor: '#000000' },
  { label: 'ハズレ', color: '#FFFFFF', textColor: '#000000' },
  { label: '¥500 OFF', color: '#000000', textColor: '#FFFFFF' },
  { label: 'ハズレ', color: '#D3D3D3', textColor: '#000000' },
  { label: '¥1000 OFF', color: '#000000', textColor: '#FFFFFF' },
  { label: 'ハズレ', color: '#FFFFFF', textColor: '#000000' },
  { label: 'ハズレ', color: '#D3D3D3', textColor: '#000000' },
  { label: '¥500 OFF', color: '#000000', textColor: '#FFFFFF' },
  { label: 'ハズレ', color: '#FFFFFF', textColor: '#000000' },
  { label: '¥1000 OFF', color: '#000000', textColor: '#FFFFFF' },
  { label: 'ハズレ', color: '#D3D3D3', textColor: '#000000' },
  { label: 'ハズレ', color: '#FFFFFF', textColor: '#000000' },
  { label: '¥500 OFF', color: '#000000', textColor: '#FFFFFF' },
  { label: 'ハズレ', color: '#D3D3D3', textColor: '#000000' },
  { label: '¥1000 OFF', color: '#000000', textColor: '#FFFFFF' },
  { label: 'ハズレ', color: '#FFFFFF', textColor: '#000000' },
  { label: 'ハズレ', color: '#D3D3D3', textColor: '#000000' },
  { label: '¥500 OFF', color: '#000000', textColor: '#FFFFFF' },
  { label: 'ハズレ', color: '#FFFFFF', textColor: '#000000' },
  { label: '¥1000 OFF', color: '#000000', textColor: '#FFFFFF' },
  { label: 'ハズレ', color: '#D3D3D3', textColor: '#000000' },
  { label: 'ハズレ', color: '#FFFFFF', textColor: '#000000' }
];

const Roulette = () => {
  const [result, setResult] = useState('');
  const [spinning, setSpinning] = useState(false);
  const [canSpin, setCanSpin] = useState(true);
  const [timeLeft, setTimeLeft] = useState(0);
  const canvasRef = useRef(null);
  const arrowAngleRef = useRef(0);
  const userIdRef = useRef(localStorage.getItem('userId') || uuidv4());
  const spinCountRef = useRef(0);
  const [couponMessage, setCouponMessage] = useState('');

  const drawRoulette = useCallback((angle = 0) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 20;
    const angleStep = (2 * Math.PI) / sectors.length;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    sectors.forEach((sector, index) => {
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

    arrowAngleRef.current = angle;
  }, []);

  useEffect(() => {
    const userId = userIdRef.current;
    localStorage.setItem('userId', userId);

    const fetchUserData = async () => {
      let { data: userData, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching user data:', error);
        return;
      }

      if (!userData) {
        const { data, error: insertError } = await supabase
          .from('users')
          .insert({ id: userId, last_spin: null, spin_count: 0 })
          .single();

        if (insertError) {
          console.error('Error inserting new user:', insertError);
          return;
        }

        userData = data;
      }

      spinCountRef.current = userData.spin_count;

      if (userData.last_spin) {
        const lastSpinDate = new Date(userData.last_spin);
        const now = new Date();
        const hoursSinceLastSpin = Math.floor((now - lastSpinDate) / (1000 * 60 * 60));

        if (hoursSinceLastSpin < 24) {
          setCanSpin(false);
          setTimeLeft(calculateTimeLeftUntilMidnight());
        }
      }
    };

    fetchUserData();
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
    midnight.setHours(24, 0, 0, 0);
    const diff = midnight - now;
    return Math.floor(diff / 1000);
  };

  const isSpecialDate = () => {
    const now = new Date();
    const month = now.getMonth() + 1;
    const date = now.getDate();
    return month === 8 && date === 1;
  };

  const spinRoulette = async () => {
    setSpinning(true);
    const spinAngle = Math.random() * 3600 + 3600;
    const duration = 6000;
    let start = null;

    const step = async (timestamp) => {
      if (!start) start = timestamp;
      const progress = timestamp - start;
      const angle = easeOutCubic(progress, 0, spinAngle, duration);

      drawRoulette(angle);

      if (progress < duration) {
        window.requestAnimationFrame(step);
      } else {
        setSpinning(false);
        const finalAngle = (angle % 360);
        const sectorAngle = 360 / sectors.length;
        const correctedAngle = (360 - finalAngle + (sectorAngle / 2)) % 360;
        let resultIndex = Math.floor(correctedAngle / sectorAngle);

        if (isSpecialDate()) {
          resultIndex = sectors.findIndex(sector => sector.label !== 'ハズレ');
        } else {
          resultIndex = sectors.findIndex(sector => sector.label === 'ハズレ');
        }

        const sector = sectors[resultIndex];
        setResult(sector.label);
        arrowAngleRef.current = finalAngle;
        setCanSpin(false);
        setTimeLeft(calculateTimeLeftUntilMidnight());

        // クーポンコードの設定
        if (sector.label === '¥500 OFF') {
          setCouponMessage('クーポンコード <span class="coupon-code">000000</span><br><span class="coupon-message">このクーポンコードを忘れずに保管してね♥</span>');
        } else if (sector.label === '¥1000 OFF') {
          setCouponMessage('クーポンコード <span class="coupon-code">111111</span><br><span class="coupon-message">このクーポンコードを忘れずに保管してね♥</span>');
        } else {
          setCouponMessage('');
        }

        const { error } = await supabase
          .from('users')
          .update({ last_spin: new Date().toISOString(), spin_count: spinCountRef.current + 1 })
          .eq('id', userIdRef.current);

        if (error) {
          console.error('Error updating user data:', error);
        }

        spinCountRef.current++;
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
        <canvas ref={canvasRef} width={350} height={350}></canvas>
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
      <div style={{ marginBottom: '20px' }}></div>
    </div>
  );
};

export default Roulette;
