"use client";
import React, { useState } from 'react';
import { useParams } from 'next/navigation';
// 🌟 關鍵：往上兩層尋找 data.ts
import { BIOLOGY_DATABASE, BioModelKey } from '../../data';
import Link from 'next/link';

export default function QuizPage() {
  const params = useParams();
  const modelId = (params?.id as string)?.toLowerCase() as BioModelKey;
  const activeModel = BIOLOGY_DATABASE[modelId];

  const [currentQ, setCurrentQ] = useState(0);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [selectedOpt, setSelectedOpt] = useState<number | null>(null);

  if (!activeModel || !activeModel.quiz) {
    return (
      <div className="min-h-screen bg-[#050914] text-white flex flex-col items-center justify-center">
        <h1 className="text-2xl mb-4">找不到此模型的測驗資料 😅</h1>
        <Link href="/biology"><button className="px-4 py-2 bg-cyan-500 rounded text-black font-bold">回大廳</button></Link>
      </div>
    );
  }

  const questions = activeModel.quiz;
const handleAnswer = (idx: number) => {
    setSelectedOpt(idx);
    
    setTimeout(() => {
      // 🌟 1. 同步判斷這題是否答對
      const isCorrect = (idx === questions[currentQ].answer);
      
      // 🌟 2. 如果答對了，更新 React 的畫面分數
      if (isCorrect) {
        setScore(prev => prev + 10);
      }
      
      if (currentQ < questions.length - 1) {
        // 如果還有下一題，前往下一題
        setCurrentQ(prev => prev + 1);
        setSelectedOpt(null);
      } else {
        // 🌟 3. 這是最後一題！在這裡計算「真正的最終分數」並存入 LocalStorage
        setIsFinished(true);
        
        // 確保把剛剛這題的分數算進去
        const finalScore = score + (isCorrect ? 10 : 0);
        
        const currentPoints = parseInt(localStorage.getItem('bio_points') || '0');
        localStorage.setItem('bio_points', (currentPoints + finalScore).toString());
      }
    }, 800);
  };

  const finishQuiz = () => {
    setIsFinished(true);
    const earnedPoints = score + (selectedOpt === questions[currentQ].answer ? 10 : 0);
    const currentPoints = parseInt(localStorage.getItem('bio_points') || '0');
    localStorage.setItem('bio_points', (currentPoints + earnedPoints).toString());
  };

  return (
    <div className="min-h-screen bg-[#02050A] text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] bg-cyan-600/10 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="max-w-2xl w-full bg-gray-900/80 backdrop-blur-xl border border-cyan-500/20 rounded-2xl p-8 shadow-[0_0_40px_rgba(34,211,238,0.1)] relative z-10">
        
        {!isFinished ? (
          <>
            <div className="text-cyan-400 text-sm font-bold tracking-widest mb-2">CHAPTER QUIZ</div>
            <h1 className="text-2xl font-black mb-8">{activeModel.name} - 測驗 {currentQ + 1}/{questions.length}</h1>
            
            <p className="text-xl mb-8 leading-relaxed text-gray-200">{questions[currentQ].question}</p>
            
            <div className="flex flex-col gap-3">
              {questions[currentQ].options.map((opt: string, idx: number) => {
                let btnStyle = "bg-white/5 border-white/10 hover:bg-cyan-900/30 hover:border-cyan-500/50";
                if (selectedOpt !== null) {
                  if (idx === questions[currentQ].answer) btnStyle = "bg-green-500/20 border-green-500 text-green-300"; 
                  else if (idx === selectedOpt) btnStyle = "bg-red-500/20 border-red-500 text-red-300"; 
                }

                return (
                  <button 
                    key={idx}
                    disabled={selectedOpt !== null}
                    onClick={() => handleAnswer(idx)}
                    className={`text-left p-4 rounded-xl border transition-all duration-300 ${btnStyle}`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          </>
        ) : (
          <div className="text-center py-10">
            <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-green-400 mb-4">測驗完成！</h1>
            <p className="text-gray-400 text-lg mb-8">你獲得了 <span className="text-yellow-400 font-bold text-2xl">{score}</span> 點積分 💰</p>
            
            <div className="flex gap-4 justify-center">
              <Link href={`/biology/${modelId}`}>
                <button className="px-6 py-3 rounded-lg border border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10 transition-all font-bold">
                  返回模型
                </button>
              </Link>
              <Link href="/biology">
                <button className="px-6 py-3 rounded-lg bg-cyan-500 text-[#050914] hover:bg-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.5)] transition-all font-bold">
                  回大廳查看積分
                </button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}