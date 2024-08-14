import React, { useEffect, useState, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import './SlotMachine.css';
import cocoRicoImage from './images/cocoRico.jpeg'; // 新しく追加した画像パス

// Supabaseのクライアントを作成するためのURLとキー
const supabaseUrl = 'https://cwmpzcqnjlbfmximqkkq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN3bXB6Y3FuamxiZm14aW1xa2txIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjAxNTI4OTYsImV4cCI6MjAzNTcyODg5Nn0.XqvAcTHBN0AeKUkS7q0VNYlcASKy02nBJJV7kcdDYmc';
const supabase = createClient(supabaseUrl, supabaseKey);

// リールのアイテム
const reelItems = [
  '¥500 OFF', '¥1000 OFF', 'ハズレ', 'もう1回',
  'ハズレ', '¥500 OFF', 'ハズレ', 'もう1回',
  'ハズレ', 'ハズレ', 'ハズレ', 'もう1回',
  'ハズレ', '¥500 OFF', 'ハズレ', 'もう1回',
  'ハズレ', 'もう1回', 'ハズレ', 'ハズレ',
  'ハズレ', 'もう1回', 'ハズレ', '¥1000 OFF',
  'ハズレ', '¥500 OFF', 'ハズレ', 'もう1回',
  'ハズレ', 'もう1回', 'ハズレ', 'もう1回',
  'ハズレ', '¥500 OFF', 'ハズレ', 'ハズレ',
  'ハズレ', 'ハズレ', 'ハズレ', 'もう1回',
  'ハズレ', 'もう1回', 'ハズレ', '¥1000 OFF',
  'ハズレ', '¥500 OFF', 'ハズレ', 'もう1回',
  'ハズレ', 'もう1回', 'ハズレ', 'ハズレ',
  'ハズレ', '¥500 OFF', 'ハズレ', 'もう1回',
  'ハズレ', 'もう1回', 'ハズレ', 'もう1回',
  'ハズレ', 'ハズレ', 'ハズレ', 'もう1回',
  'ハズレ', 'ハズレ', 'ハズレ', 'もう1回',
  'ハズレ', 'もう1回', 'ハズレ', '¥1000 OFF',
  'ハズレ', '¥500 OFF', 'ハズレ', 'もう1回',
  'ハズレ', 'もう1回', 'ハズレ', 'もう1回',
  'ハズレ', '¥500 OFF', 'ハズレ', 'もう1回',
  'ハズレ', 'もう1回', 'ハズレ', 'もう1回',
  'ハズレ', 'ハズレ', 'ハズレ','ハズレ', 
  'ハズレ', 'ハズレ', 'もう1回',
];

const SlotMachine = () => {
  const [result, setResult] = useState(''); // スロットの結果
  const [isRolling, setIsRolling] = useState(false); // 回転中かどうか
  const [canSpin, setCanSpin] = useState(true); // スピン可能かどうか
  const [timeRemaining, setTimeRemaining] = useState(''); // 次にスピン可能な時間までのカウントダウン
  const reelRef = useRef(null); // リールの参照
  const [userId, setUserId] = useState(''); // ユーザーID

  useEffect(() => {
    const storedUserId = localStorage.getItem('userId') || `user-${Math.random().toString(36).substring(2, 15)}`;
    localStorage.setItem('userId', storedUserId);
    setUserId(storedUserId);

    // users テーブルにユーザーを挿入
    const insertUser = async () => {
      try {
        const { data, error } = await supabase.from('users').select('user_id').eq('user_id', storedUserId);
        if (error) throw error;

        if (data.length === 0) {
          const { error: insertError } = await supabase.from('users').insert([{ user_id: storedUserId }]);
          if (insertError) throw insertError;
        }
      } catch (error) {
        console.error('Error inserting user:', error.message);
      }
    };

    insertUser();
  }, [userId]);

  useEffect(() => {
    // カウントダウンの設定
    if (!canSpin) {
      const intervalId = setInterval(() => {
        const now = new Date();
        const nextSpinTime = new Date();
        nextSpinTime.setHours(24, 0, 0, 0);
        const timeDiff = nextSpinTime - now;

        if (timeDiff <= 0) {
          setCanSpin(true);
          setTimeRemaining('');
          clearInterval(intervalId);
        } else {
          const hours = Math.floor(timeDiff / 1000 / 60 / 60);
          const minutes = Math.floor((timeDiff / 1000 / 60) % 60);
          const seconds = Math.floor((timeDiff / 1000) % 60);
          setTimeRemaining(`残り${hours}時間${minutes}分${seconds}秒後にチャレンジできます！`);
        }
      }, 1000);
      return () => clearInterval(intervalId);
    }
  }, [canSpin]);

  const spinReel = async () => {
    if (isRolling || !canSpin) return;

    setIsRolling(true);
    setResult('');

    // 回転時間を固定 (3秒)
    const spinDuration = 3000;

    // 固定の停止位置を設定（例: 常に最後の「ハズレ」）
    const targetIndex = 23; // 例: 常に reelItems[15] の位置に止まる
    const itemHeight = reelRef.current.firstChild.clientHeight;
    const stopPosition = targetIndex * -itemHeight;

    // リールのスタイルを変更して回転開始
    reelRef.current.style.transition = `transform ${spinDuration}ms cubic-bezier(0.2, 0.1, 0.5, 1)`;
    reelRef.current.style.transform = `translateY(${stopPosition}px)`;

    // 回転が終わった後に結果を決定
    setTimeout(async () => {
      const finalResult = reelItems[targetIndex];
      setResult(finalResult);

      // データベースへの結果の保存
      try {
        const { error } = await supabase.from('spin_results').insert([
          { user_id: userId, result: finalResult }
        ]);
        if (error) throw error;
      } catch (error) {
        console.error('Error inserting spin result:', error.message);
      }

      // スロットの結果に応じた処理
      if (finalResult === 'もう1回') {
        setCanSpin(true); // もう一回スピン可能に
      } else if (finalResult === '¥500 OFF' || finalResult === '¥1000 OFF') {
        alert(`おめでとうございます！クーポンコード: ${finalResult === '¥500 OFF' ? '000000' : '111111'}をお使いください。`);
        setCanSpin(false); // 1日1回のみ
      } else {
        setCanSpin(false); // ハズレの場合
        const now = new Date();
        const nextSpinTime = new Date();
        nextSpinTime.setHours(24, 0, 0, 0);
        const timeDiff = nextSpinTime - now;
        const hours = Math.floor(timeDiff / 1000 / 60 / 60);
        const minutes = Math.floor((timeDiff / 1000 / 60) % 60);
        const seconds = Math.floor((timeDiff / 1000) % 60);
        setTimeRemaining(`${hours}時間${minutes}分${seconds}秒後にチャレンジできます！`);
      }

      setIsRolling(false);
    }, spinDuration);
  };

  return (
    <div className="slot-machine">
      <div className="image-container">
        <img src={cocoRicoImage} alt="Coco Rico" />
      </div>
      <div className="reel-container">
        <div className="top"></div>
        <div className="middle"></div>
        <div className="bottom"></div>
        <div className="reel" ref={reelRef}>
          {reelItems.map((item, index) => (
            <div key={index} className="reel-item">{item}</div>
          ))}
        </div>
      </div>
      <button onClick={spinReel} disabled={isRolling || !canSpin}>スロットスタート</button>
      <div className="result">
        {result && (
          <div>
            {result === '¥500 OFF' && (
              <div>
                <p>おめでとうございます</p>
                <p>クーポンコード <span style={{ color: 'red' }}>000000</span></p>
              </div>
            )}
            {result === '¥1000 OFF' && (
              <div>
                <p>おめでとうございます</p>
                <p>クーポンコード <span style={{ color: 'red' }}>111111</span></p>
              </div>
            )}
            {result === 'ハズレ' && <p>残念！また明日チャレンジしてね</p>}
          </div>
        )}
      </div>
      <div className="time-remaining">
        {timeRemaining && <p>{timeRemaining}</p>}
      </div>
    </div>
  );
};

export default SlotMachine;
