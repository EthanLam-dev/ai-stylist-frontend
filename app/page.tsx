"use client";
import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';

export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  // 🌟 監聽使用者的滾動深度，用來做高級視差動畫
  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    let animationFrameId: number;
    let particles: any[] = [];
    let mouse = { x: -1000, y: -1000, radius: 100 }; 

    const initParticles = () => {
      particles = [];
      const w = canvas.width;
      const h = canvas.height;

      // ==========================================
      // 1. 生成「Biolearner」文字粒子
      // ==========================================
      const textCanvas = document.createElement('canvas');
      textCanvas.width = w;
      textCanvas.height = h;
      const textCtx = textCanvas.getContext('2d', { willReadFrequently: true });
      
      if (textCtx) {
        const fontSize = Math.min(w * 0.12, 130); 
        textCtx.font = `900 ${fontSize}px "Inter", sans-serif`;
        textCtx.fillStyle = '#0f172a'; 
        textCtx.textAlign = 'center';
        textCtx.textBaseline = 'middle';
        
        // 🌟 修正：把標題固定在畫面高度的 15% 處 (往上拉)
        textCtx.fillText('Biolearner', w / 2, h * 0.15);
        
        const textData = textCtx.getImageData(0, 0, w, h).data;
        const textStep = 3; 
        
        for (let y = 0; y < h; y += textStep) {
          for (let x = 0; x < w; x += textStep) {
            const index = (y * w + x) * 4;
            const alpha = textData[index + 3];
            
            if (alpha > 128) {
              particles.push({
                isText: true,
                origX: x,
                origY: y,
                x: x + (Math.random() - 0.5) * 10,
                y: y + (Math.random() - 0.5) * 10,
                vx: 0, vy: 0,
                color: '#0f172a',
                radius: 1.8,
                spring: 0.15,
                friction: 0.75 
              });
            }
          }
        }
      }

      // ==========================================
      // 2. 生成「DNA」生物光粒子
      // ==========================================
      const img = new Image();
      img.src = '/models/dna-chain.png'; 
      
      img.onload = () => {
        // 🌟 修正：將 DNA 稍微縮小 (0.85)，避免撞到邊緣
        const scale = Math.min(w / img.width, h / img.height) * 0.85;
        const imgW = Math.floor(img.width * scale);
        const imgH = Math.floor(img.height * scale);
        
        const offsetX = Math.floor((w - imgW) / 2);
        // 🌟 修正：將 DNA 在 Y 軸上往下推移畫面高度的 15%，完美錯開標題！
        const offsetY = Math.floor((h - imgH) / 2) + Math.floor(h * 0.15);

        const offCanvas = document.createElement('canvas');
        offCanvas.width = imgW;
        offCanvas.height = imgH;
        const offCtx = offCanvas.getContext('2d');
        
        if (offCtx) {
          offCtx.drawImage(img, 0, 0, imgW, imgH);
          const imgData = offCtx.getImageData(0, 0, imgW, imgH).data;
          const dnaStep = 3; 

          for (let y = 0; y < imgH; y += dnaStep) {
            for (let x = 0; x < imgW; x += dnaStep) {
              const index = (y * imgW + x) * 4;
              const r = imgData[index];
              const g = imgData[index + 1];
              const b = imgData[index + 2];
              const a = imgData[index + 3];

              const isWhiteBackground = r > 240 && g > 240 && b > 240;

              if (a > 50 && !isWhiteBackground) {
                particles.push({
                  isText: false,
                  origX: offsetX + x,
                  origY: offsetY + y,
                  x: offsetX + x, 
                  y: offsetY + y,
                  vx: 0, vy: 0,
                  color: `rgb(${r},${g},${b})`,
                  radius: 1.2,
                  spring: 0.08,
                  friction: 0.82 
                });
              }
            }
          }
        }
        setIsLoaded(true);
      };
    };

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initParticles();
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };

    const handleMouseLeave = () => {
      mouse.x = -1000;
      mouse.y = -1000;
    };

    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);
    
    resize(); 

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const time = Date.now() * 0.001;

      particles.forEach(p => {
        const floatY = p.isText ? 0 : Math.sin(time + p.origX * 0.005) * 6;
        const floatX = p.isText ? 0 : Math.cos(time + p.origY * 0.005) * 3;
        const targetX = p.origX + floatX;
        const targetY = p.origY + floatY;

        const dx = mouse.x - p.x;
        const dy = mouse.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < mouse.radius) {
          const force = (mouse.radius - dist) / mouse.radius;
          const pushForce = p.isText ? 10 : 20; 
          const pushX = (dx / dist) * force * pushForce; 
          const pushY = (dy / dist) * force * pushForce;
          p.vx -= pushX;
          p.vy -= pushY;
        }

        p.vx += (targetX - p.x) * p.spring;
        p.vy += (targetY - p.y) * p.spring;
        p.vx *= p.friction; 
        p.vy *= p.friction;

        p.x += p.vx;
        p.y += p.vy;

        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(animate);
    };
    
    animate();

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="bg-[#FAFAFA] font-sans relative">
      
      {/* 🚀 畫布：加入 Parallax 視差滾動效果 */}
      <canvas 
        ref={canvasRef} 
        className="fixed top-0 left-0 w-full h-full pointer-events-none z-0"
        style={{
          // 當往下滾動時，畫布會逐漸變透明，並且稍微往下沉
          opacity: isLoaded ? Math.max(0, 1 - scrollY / 800) : 0,
          transform: `translateY(${scrollY * 0.4}px)`,
          transition: 'opacity 0.1s ease-out'
        }}
      />

      {/* 第一屏空白，留給畫布展示 */}
      <div className="h-[110vh] w-full pointer-events-none"></div>

      {/* 🌟 Section 2: 頂級 Awwwards 滾動過場設計 */}
      <section className="relative z-10 bg-[#0a0a0a] text-white min-h-[120vh] rounded-t-[3rem] sm:rounded-t-[5rem] shadow-[0_-20px_50px_rgba(0,0,0,0.2)] overflow-hidden">
        
        {/* Lando Norris 風格的巨大錯位排版 */}
        <div className="max-w-7xl mx-auto pt-32 px-6 overflow-hidden pointer-events-none">
          <h2 
            className="text-[12vw] leading-none font-black tracking-tighter uppercase text-slate-100 whitespace-nowrap transition-transform duration-75 ease-out"
            style={{ transform: `translateX(${(scrollY - 500) * -0.2}px)` }} // 隨滾動向左滑
          >
            Explore
          </h2>
          <h2 
            className="text-[12vw] leading-none font-black tracking-tighter uppercase text-cyan-400 whitespace-nowrap text-right transition-transform duration-75 ease-out -mt-4 sm:-mt-8"
            style={{ transform: `translateX(${(scrollY - 500) * 0.2}px)` }} // 隨滾動向右滑
          >
            The Micro.
          </h2>
        </div>

        {/* 內文與按鈕區塊 */}
        <div className="max-w-7xl mx-auto px-6 mt-20 sm:mt-32 pb-32 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          <p className="text-2xl sm:text-4xl text-slate-300 font-serif italic tracking-wide leading-relaxed">
            "A fun little website to help you learn biology:<br className="hidden sm:block" />
            <span className="font-semibold text-cyan-400 not-italic"> cell structure, heart pathology, lung structure.</span>"
          </p>

          <div className="flex flex-col sm:flex-row gap-6 w-full justify-end">
            <Link href="/biology" className="group relative w-full sm:w-auto px-10 py-5 bg-white rounded-full text-slate-900 text-center font-bold tracking-widest hover:text-white transition-all duration-500 shadow-lg overflow-hidden">
              <span className="relative z-10">進入生物小教室</span>
              <div className="absolute inset-0 bg-cyan-500 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out z-0"></div>
            </Link>
            
            <Link href="/collection-room" className="group relative w-full sm:w-auto px-10 py-5 bg-transparent border border-white/30 rounded-full text-white text-center font-bold tracking-widest hover:border-transparent transition-all duration-500 overflow-hidden">
              <span className="relative z-10">大雄的收藏室</span>
              <div className="absolute inset-0 bg-slate-800 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out z-0"></div>
            </Link>
          </div>

        </div>
      </section>
    </div>
  );
}