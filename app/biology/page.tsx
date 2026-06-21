"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { BIOLOGY_DATABASE } from './data'; 

export default function BiologyHub() {
  const models = Object.values(BIOLOGY_DATABASE);
  const [points, setPoints] = useState(0);
  const [isMounted, setIsMounted] = useState(false); // 🌟 控制進場動畫的狀態

  useEffect(() => {
    // 進入大廳時，抓取積分，並觸發進場動畫
    const savedPoints = localStorage.getItem('bio_points');
    if (savedPoints) setPoints(parseInt(savedPoints));
    
    // 延遲一點點觸發，讓動畫更明顯、更絲滑
    setTimeout(() => setIsMounted(true), 50);
  }, []);

  const UNLOCK_THRESHOLD = 30; 

  return (
    // 🌟 背景改為純淨的極簡白底，文字改為深色
    <div className="min-h-screen bg-[#FAFAFA] text-slate-900 p-6 sm:p-10 font-sans relative overflow-hidden">
      
      {/* 背景極簡裝飾 (微微的灰色網格或光暈) */}
      <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] bg-slate-200/50 blur-[120px] rounded-full pointer-events-none"></div>
      
      {/* 🌟 右上角控制區：改為高級感的白底黑字卡片 */}
      <div className={`absolute top-6 sm:top-10 right-6 sm:right-10 flex flex-col items-end gap-3 z-20 transition-all duration-1000 delay-300 transform ${isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-10'}`}>
        
        {/* 積分顯示 */}
        <div className="bg-white border border-slate-200 px-6 py-3 rounded-2xl shadow-sm flex items-center gap-3">
          <span className="text-2xl">💰</span>
          <div>
            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">目前積分</div>
            <div className="text-xl font-black text-slate-800">{points} PTS</div>
          </div>
        </div>

        {/* 扭蛋解鎖邏輯 */}
        {points >= UNLOCK_THRESHOLD ? (
          <Link href="/biology/gacha" className="w-full">
            <button className="w-full relative group overflow-hidden bg-slate-900 px-6 py-4 rounded-2xl font-bold shadow-lg hover:shadow-2xl transition-all hover:-translate-y-1">
              <div className="absolute inset-0 bg-cyan-600 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out z-0"></div>
              <span className="relative z-10 flex items-center justify-center gap-2 text-white">🎰 進行抽獎</span>
            </button>
          </Link>
        ) : (
          <div className="w-full text-xs text-slate-500 font-bold text-center bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            🔒 收集 <span className="text-cyan-600">{UNLOCK_THRESHOLD}</span> 積分以解鎖扭蛋機<br/>
            (還差 <span className="text-rose-500">{UNLOCK_THRESHOLD - points}</span> 分)
          </div>
        )}

        {/* 探望寵物按鈕 */}
        <Link href="/biology/collection-room">
          <button className="bg-white border border-slate-200 hover:border-slate-400 text-slate-800 px-8 py-4 rounded-2xl font-bold transition-all shadow-sm hover:shadow-md hover:-translate-y-1 group">
            🚪 進入大雄的房間
            <span className="inline-block ml-2 group-hover:translate-x-1 transition-transform">→</span>
          </button>
        </Link>
      </div>
{/* 🌟 新增：AI 生物學伴入口 (極簡有機風格) */}
        <Link href="/stylist">
          <button className="w-full bg-emerald-50 border border-emerald-200 hover:border-emerald-400 text-emerald-800 px-8 py-4 rounded-2xl font-bold transition-all shadow-sm hover:shadow-md hover:-translate-y-1 group flex items-center justify-center gap-2 mt-1">
            <span className="text-xl">🌱</span> 專屬生物學伴
            <span className="inline-block ml-1 group-hover:translate-x-1 transition-transform">→</span>
          </button>
        </Link>
      {/* 🌟 主要內容區：套用進場動畫 (由下往上浮現) */}
      <div className={`max-w-7xl mx-auto relative z-10 pt-32 sm:pt-20 transition-all duration-1000 transform ${isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-16'}`}>
        
        <Link href="/" className="inline-block mb-12 text-sm font-bold text-slate-400 hover:text-slate-800 transition-colors">
          ← 返回首頁
        </Link>

        {/* 標題區 */}
        <div className="mb-16">
          <h1 className="text-6xl sm:text-7xl font-black text-slate-900 tracking-tighter mb-4">
            BIO-DECK.
          </h1>
          <p className="text-slate-500 text-xl font-serif italic tracking-wide">
            立體生物結構與醫學解剖檔案庫
          </p>
        </div>

        {/* 🌟 模型卡片網格：乾淨的白色卡片與文字滑動特效 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {models.map((model, idx) => (
            <Link 
              href={`/biology/${model.id}`} 
              key={model.id}
              // 給每個卡片一點延遲，創造骨牌般的浮現效果
              style={{ transitionDelay: `${idx * 100}ms` }}
              className={`group relative block bg-white border border-slate-200 rounded-[2.5rem] p-8 transition-all duration-700 hover:shadow-[0_20px_40px_rgba(0,0,0,0.06)] hover:-translate-y-2 overflow-hidden transform ${isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
            >
              <div className="relative z-10 flex flex-col h-full">
                
                <div className="flex justify-between items-start mb-12">
                  {/* 🌟 專屬的文字滑動特效 (group-hover:translate-x-3) */}
                  <h2 className="text-2xl font-black text-slate-900 group-hover:translate-x-3 transition-transform duration-500 ease-out">
                    {model.name}
                  </h2>
                  {/* 右上角箭頭飛出特效 */}
                  <span className="text-slate-300 group-hover:text-slate-900 group-hover:translate-x-2 group-hover:-translate-y-2 transition-all duration-500 ease-out text-xl">↗</span>
                </div>
                
                <div className="mt-auto">
                  <p className="text-sm text-slate-500 line-clamp-2 mb-8 font-medium leading-relaxed group-hover:text-slate-700 transition-colors duration-500">
                    點擊進入 3D 全息解剖台。目前已標記 {model.labels?.length || 0} 個關鍵結構，並提供 {model.views?.length || 0} 種專業觀察視角。
                  </p>
                  
                  {/* 底部小標籤 */}
                  <div className="flex gap-2">
                    <span className="text-[10px] px-3 py-1.5 rounded-full bg-slate-100 text-slate-600 font-bold uppercase tracking-widest group-hover:bg-cyan-50 transition-colors">
                      Interactive 3D
                    </span>
                    <span className="text-[10px] px-3 py-1.5 rounded-full bg-slate-100 text-slate-600 font-bold uppercase tracking-widest">
                      Data Driven
                    </span>
                  </div>
                </div>

              </div>
            </Link>
          ))}
        </div>

        {/* 防呆機制：如果資料庫是空的 */}
        {models.length === 0 && (
          <div className="text-center py-32 text-slate-400 border border-dashed border-slate-300 rounded-[3rem] bg-white/50 mt-10">
            目前資料庫中沒有模型。<br/>請至 <code className="text-slate-800 font-bold">data.ts</code> 新增您的 3D 模型設定！
          </div>
        )}

      </div>
    </div>
  );
}