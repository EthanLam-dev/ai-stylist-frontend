"use client";
import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Link from 'next/link';

export default function StylistChat() {
  const [messages, setMessages] = useState([
    { 
      role: 'ai', 
      content: '你好！我是你的專屬生物學伴 🌱\n\n有什麼我可以幫助你的嗎？無論是**細胞的微觀世界**、**基因遺傳的奧秘**，還是複雜的**生態系統**，我們都可以一起輕鬆探索！' 
    }
  ]);
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 自動捲動到最新訊息
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!inputText.trim()) return;

    const userMsg = inputText;
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setInputText(''); 

    // 有機質感的等待提示
    setMessages(prev => [...prev, { role: 'ai', content: '✨ _正在翻閱生物資料庫，為你整理最清晰的解答..._' }]);

    try {
      const response = await fetch("http://127.0.0.1:8000/api/chat", {  
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ user_message: userMsg }), 
      });

      // 🔍 【終極除錯雷達】：精準捕捉後端發生了什麼事
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `伺服器回應錯誤 (狀態碼: ${response.status})`);
      }

      const data = await response.json();

      if (data.status === 'success') {
        setMessages(prev => {
          const newMsgs = [...prev];
          newMsgs[newMsgs.length - 1] = { role: 'ai', content: data.reply };
          return newMsgs;
        });
      } else {
        throw new Error("後端未回傳成功狀態，請檢查 API 邏輯。");
      }

    } catch (error: any) {
      // 🚨 將真實錯誤印在畫面上，讓你秒懂 Bug 在哪裡！
      setMessages(prev => {
        const newMsgs = [...prev];
        newMsgs[newMsgs.length - 1] = { 
          role: 'ai', 
          content: `⚠️ **連線中斷或發生錯誤**\n\n系統攔截到的錯誤訊息：\n\`${error.message}\`\n\n**🔍 快速排錯指南：**\n1. **Python 沒開**：請確認右側終端機的 \`python main.py\` 是否還在執行中 (Uvicorn running)。\n2. **API 沒錢或無效**：如果是 500 錯誤，通常是你的 OpenRouter 金鑰過期或額度耗盡。\n3. 請直接查看 VSCode 右側的 Python 終端機，裡面會有紅色的詳細報錯！` 
        };
        return newMsgs;
      });
    }
  };

  return (
    // 🌟 背景改為極簡白，帶有溫暖的學習氛圍
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col items-center justify-center p-4 font-sans text-slate-900 relative overflow-hidden">
      
      {/* 🍃 有機光暈背景 (Organic Glows) */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-emerald-300/20 blur-[120px] rounded-full mix-blend-multiply pointer-events-none animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-cyan-300/20 blur-[120px] rounded-full mix-blend-multiply pointer-events-none animate-pulse" style={{ animationDelay: '2s' }}></div>

      {/* 🚀 返回大廳按鈕 */}
      <div className="absolute top-8 left-8 z-50">
        <Link href="/biology" className="bg-white/80 backdrop-blur-md text-slate-600 hover:text-slate-900 px-6 py-3 rounded-full border border-slate-200 hover:border-slate-300 transition-all shadow-sm flex items-center gap-2 group">
          <span className="group-hover:-translate-x-1 transition-transform">←</span> 
          <span className="font-bold tracking-widest text-sm">返回大廳</span>
        </Link>
      </div>

      {/* 🌟 聊天室主體：像是一本懸浮的毛玻璃筆記本 */}
      <div className="w-full max-w-3xl bg-white/60 backdrop-blur-2xl rounded-[3rem] shadow-[0_20px_60px_rgba(0,0,0,0.05)] overflow-hidden flex flex-col h-[85vh] border border-white mt-8 relative z-10">
        
        {/* 標題列 */}
        <div className="bg-white/80 backdrop-blur-md p-6 text-center z-10 flex-shrink-0 border-b border-slate-100">
          <h1 className="text-3xl font-black text-slate-800 tracking-tight font-serif italic">
            Bio-Companion
          </h1>
          <p className="text-xs text-slate-400 tracking-widest mt-2 uppercase font-bold">
            你的專屬生物學伴
          </p>
        </div>

        {/* 聊天對話區 */}
        <div className="flex-1 p-6 overflow-y-auto flex flex-col space-y-6 custom-scrollbar">
          {messages.map((msg, index) => (
            <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`p-5 max-w-[85%] text-[15px] leading-relaxed ${
                msg.role === 'user' 
                  // 使用者：深灰色紮實泡泡
                  ? 'bg-slate-900 text-white rounded-[2rem] rounded-tr-md shadow-md'  
                  // AI 學伴：乾淨白底泡泡，加上輕微陰影
                  : 'bg-white border border-slate-100 text-slate-700 rounded-[2rem] rounded-tl-md shadow-sm' 
              }`}>
                {msg.role === 'user' ? (
                  msg.content
                ) : (
                  <ReactMarkdown 
                    remarkPlugins={[remarkGfm]}
                    components={{
                      p: ({node, ...props}) => <p className="mb-4 last:mb-0" {...props} />,
                      ul: ({node, ...props}) => <ul className="list-disc pl-6 mb-4 space-y-2 marker:text-emerald-400" {...props} />,
                      ol: ({node, ...props}) => <ol className="list-decimal pl-6 mb-4 space-y-2 marker:text-emerald-400 font-bold" {...props} />,
                      li: ({node, ...props}) => <li className="font-normal" {...props} />,
                      strong: ({node, ...props}) => <strong className="font-black text-slate-900 bg-emerald-50 px-1 rounded" {...props} />,
                      h3: ({node, ...props}) => <h3 className="text-lg font-black mt-6 mb-3 text-slate-900 flex items-center gap-2 before:content-[''] before:w-1.5 before:h-5 before:bg-emerald-400 before:rounded-full" {...props} />,
                      code: ({node, inline, ...props}: any) => 
                        inline ? <code className="bg-slate-100 text-slate-800 px-1.5 py-0.5 rounded text-sm font-mono" {...props} />
                               : <code className="block bg-slate-50 border border-slate-100 p-4 rounded-xl text-sm font-mono overflow-x-auto mb-4" {...props} />
                    }}
                  >
                    {msg.content}
                  </ReactMarkdown>
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* 輸入框區域：流線型懸浮膠囊設計 */}
        <div className="p-6 bg-gradient-to-t from-white/90 to-white/0 flex-shrink-0">
          <div className="flex items-center bg-white rounded-full p-2 border border-slate-200 shadow-sm focus-within:shadow-md focus-within:border-emerald-300 transition-all">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="有什麼生物知識想了解嗎？告訴我吧！"
              className="flex-1 bg-transparent outline-none text-slate-800 placeholder-slate-400 px-4 py-2 font-medium"
            />
            <button 
              onClick={handleSend}
              className="ml-2 bg-slate-900 text-white rounded-full w-10 h-10 flex items-center justify-center hover:bg-emerald-500 hover:scale-105 active:scale-95 transition-all shadow-md group"
            >
              <span className="group-hover:-translate-y-0.5 transition-transform">↑</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}