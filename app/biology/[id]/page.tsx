"use client";
import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { BIOLOGY_DATABASE, BioModelKey } from '../data';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';

// ==========================================
// 🧬 1. 3D 核心畫布 (加入粒子與修復 Clock)
// ==========================================
function BioCanvas({ 
  modelConfig, 
  isPlaying, 
  currentView,
  viewTrigger, 
  hoveredLabel,
  setHoveredLabel,
  isAutoRotating,
  showAxes,
  isDarkMode // 🌟 接收明暗主題狀態
}: { 
  modelConfig: (typeof BIOLOGY_DATABASE)[BioModelKey], 
  isPlaying: boolean,
  currentView: { name: string, camPos: number[], target: number[] },
  viewTrigger: number, 
  hoveredLabel: string | null,
  setHoveredLabel: (id: string | null) => void,
  isAutoRotating: boolean,
  showAxes: boolean,
  isDarkMode: boolean
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const mixersRef = useRef<THREE.AnimationMixer[]>([]);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  
  const isAutoRotatingRef = useRef(isAutoRotating);
  useEffect(() => { isAutoRotatingRef.current = isAutoRotating; }, [isAutoRotating]);

  const showAxesRef = useRef(showAxes);
  useEffect(() => { showAxesRef.current = showAxes; }, [showAxes]);

  const isTransitioningRef = useRef(false);
  const targetViewRef = useRef(currentView);

  useEffect(() => {
    mixersRef.current.forEach(mixer => { mixer.timeScale = isPlaying ? 1 : 0; });
  }, [isPlaying]);

  useEffect(() => {
    targetViewRef.current = currentView;
    if (cameraRef.current && controlsRef.current && currentView) {
      if (currentView.name === 'micro-warp') {
        isTransitioningRef.current = true; 
      } else {
        isTransitioningRef.current = false;
        cameraRef.current.position.set(currentView.camPos[0], currentView.camPos[1], currentView.camPos[2]);
        controlsRef.current.target.set(currentView.target[0], currentView.target[1], currentView.target[2]);
        controlsRef.current.update();
      }
    }
  }, [currentView, viewTrigger]); 

  useEffect(() => {
    let isMounted = true;
    let animationId: number;
    mixersRef.current = [];

    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const scene = new THREE.Scene();
    scene.background = null; 

    const axesHelper = new THREE.AxesHelper(5);
    scene.add(axesHelper);

    const camera = new THREE.PerspectiveCamera(60, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.set(0, 0, 20);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controlsRef.current = controls;

    scene.add(new THREE.AmbientLight(0xffffff, 1.2));
    const dirLight = new THREE.DirectionalLight(0xddf0ff, 2);
    dirLight.position.set(5, 10, 5);
    scene.add(dirLight);

    // 🌟 核心升級：加入 3D 空間的浮游粒子
    const particleCount = 150;
    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(particleCount * 3);
    for(let i = 0; i < particleCount * 3; i++) {
       pPos[i] = (Math.random() - 0.5) * 40; 
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    const pMat = new THREE.PointsMaterial({
       color: 0x0ea5e9, // 淺藍色粒子，日夜模式通用
       size: 0.15,
       transparent: true,
       opacity: 0.6,
       blending: THREE.AdditiveBlending
    });
    const particleSystem = new THREE.Points(pGeo, pMat);
    scene.add(particleSystem);

    const loader = new GLTFLoader();
    let currentModel: THREE.Group | null = null;

    loader.load(modelConfig.url, (gltf) => {
      if (!isMounted) return;
      const model = gltf.scene;
      currentModel = model;
      model.scale.set(modelConfig.scale, modelConfig.scale, modelConfig.scale);
      const box = new THREE.Box3().setFromObject(model);
      const center = box.getCenter(new THREE.Vector3());
      model.position.set(-center.x, -center.y + modelConfig.offsetY, -center.z);
      scene.add(model);

      if (gltf.animations.length > 0) {
        const mixer = new THREE.AnimationMixer(model);
        gltf.animations.forEach((clip) => mixer.clipAction(clip).play());
        mixer.timeScale = isPlaying ? 1 : 0;
        mixersRef.current.push(mixer);
      }
    });

    const keys = { w: false, a: false, s: false, d: false };
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (keys.hasOwnProperty(key)) keys[key as keyof typeof keys] = true;
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (keys.hasOwnProperty(key)) keys[key as keyof typeof keys] = false;
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // 🌟 修復卡頓元凶：用 performance.now 替換掉 THREE.Clock
    let lastTime = performance.now();
    
    const animate = () => {
      if (!isMounted) return;
      animationId = requestAnimationFrame(animate);
      
      const time = performance.now();
      const delta = (time - lastTime) / 1000;
      lastTime = time;

      mixersRef.current.forEach(mixer => mixer.update(delta));
      
      // 🌟 讓粒子緩慢旋轉
      particleSystem.rotation.y += 0.001;
      particleSystem.rotation.x += 0.0005;
      
      if (isTransitioningRef.current && targetViewRef.current) {
        controls.enabled = false;
        const targetCam = new THREE.Vector3(...targetViewRef.current.camPos);
        const targetLook = new THREE.Vector3(...targetViewRef.current.target);
        camera.position.lerp(targetCam, 0.04);
        controls.target.lerp(targetLook, 0.04);
      } else {
        controls.enabled = true;
      }

      if (keys.w || keys.a || keys.s || keys.d) {
        const panSpeed = modelConfig.moveSpeed || 0.15; 
        const offset = new THREE.Vector3();
        const right = new THREE.Vector3();
        const up = new THREE.Vector3();
        const forward = new THREE.Vector3();

        camera.getWorldDirection(forward);
        right.crossVectors(forward, camera.up).normalize();
        up.crossVectors(right, forward).normalize();

        if (keys.w) offset.addScaledVector(up, panSpeed);
        if (keys.s) offset.addScaledVector(up, -panSpeed);
        if (keys.a) offset.addScaledVector(right, -panSpeed);
        if (keys.d) offset.addScaledVector(right, panSpeed);

        controls.target.add(offset);
        camera.position.add(offset);
      }

      controls.autoRotate = isAutoRotatingRef.current;
      controls.autoRotateSpeed = 1.5; 
      axesHelper.visible = showAxesRef.current;

      controls.update();
      renderer.render(scene, camera);

      if (!isTransitioningRef.current) {
        modelConfig.labels.forEach((label, index) => {
          const vec = new THREE.Vector3(label.pos[0], label.pos[1], label.pos[2]);
          if (currentModel) {
              vec.multiplyScalar(modelConfig.scale);
              vec.applyMatrix4(currentModel.matrixWorld);
          }
          
          vec.project(camera);
          const x = (vec.x * 0.5 + 0.5) * container.clientWidth;
          const y = (-(vec.y * 0.5) + 0.5) * container.clientHeight;
          const labelElement = document.getElementById(`label-${modelConfig.id}-${index}`);
          if (labelElement) {
            if (vec.z > 1) {
              labelElement.style.display = 'none';
            } else {
              labelElement.style.display = 'block';
              labelElement.style.transform = `translate(-50%, -50%) translate(${x}px, ${y}px)`;
            }
          }
        });
      }
    };
    animate();

    const handleResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      isMounted = false;
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      renderer.dispose();
    };
  }, [modelConfig]);

  return (
    <div ref={containerRef} className="relative w-full h-full pointer-events-auto outline-none" tabIndex={0}>
      <canvas ref={canvasRef} className="w-full h-full outline-none block" />
      
      {modelConfig.labels.map((label, index) => {
        const isHovered = hoveredLabel === label.id;
        const isFaded = hoveredLabel !== null && !isHovered;

        // 🌟 標籤的日夜模式樣式
        const labelBg = isDarkMode 
          ? (isHovered ? 'bg-black/90 border-cyan-300 shadow-[0_0_30px_rgba(34,211,238,0.5)]' : 'bg-black/70 border-cyan-500/30')
          : (isHovered ? 'bg-white/95 border-cyan-600 shadow-[0_5px_20px_rgba(8,145,178,0.2)]' : 'bg-white/80 border-slate-300 shadow-sm');
          
        const labelText = isDarkMode ? 'text-cyan-300' : 'text-slate-800';
        const descText = isDarkMode ? 'text-gray-300' : 'text-slate-600';

        return (
          <div 
            key={`label-${modelConfig.id}-${index}`}
            id={`label-${modelConfig.id}-${index}`}
            className={`absolute top-0 left-0 transition-all duration-300 ease-out ${
              isFaded ? 'opacity-10 scale-90 pointer-events-none z-0' : 'opacity-100 scale-100 z-50'
            }`}
          >
            <div className="absolute w-2.5 h-2.5 bg-cyan-400 rounded-full -translate-x-1/2 -translate-y-1/2 shadow-[0_0_12px_#22d3ee] animate-pulse pointer-events-none"></div>
            <div className="absolute w-[60px] h-px bg-cyan-400/80 origin-left -rotate-45 pointer-events-none" style={{ top: 0, left: 0 }}></div>
            <div className="absolute w-[30px] h-px bg-cyan-400/80 pointer-events-none" style={{ top: '-42px', left: '42px' }}></div>
            
            <div 
              className={`absolute backdrop-blur-md border px-4 py-2.5 rounded-xl cursor-pointer transition-all duration-300 overflow-hidden ${labelBg}`}
              style={{ 
                top: '-60px', 
                left: '72px', 
                width: isHovered ? '260px' : 'auto', 
                whiteSpace: isHovered ? 'normal' : 'nowrap'
              }}
              onPointerEnter={() => setHoveredLabel(label.id)}
              onPointerLeave={() => setHoveredLabel(null)}
            >
               <div className={`flex items-center gap-2 font-bold text-sm ${labelText}`}>
                 <div className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee]"></div>
                 {label.title}
               </div>

               {isHovered && (
                 <div className={`mt-3 pt-3 border-t border-slate-200/20 text-xs font-normal leading-relaxed animate-fade-in ${descText}`}>
                   {label.desc}
                 </div>
               )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ==========================================
// 🧬 2. 獨立動態介面 (主架構)
// ==========================================
export default function BiologyInterface() {
  const params = useParams();
  const router = useRouter(); 
  
  const modelId = (params?.id as string)?.toLowerCase() as BioModelKey | undefined;
  const activeModel = modelId ? BIOLOGY_DATABASE[modelId] : undefined;

  const [isPlaying, setIsPlaying] = useState(true);
  const [currentView, setCurrentView] = useState(activeModel?.views[0]);
  const [hoveredLabel, setHoveredLabel] = useState<string | null>(null);
  const [viewTrigger, setViewTrigger] = useState(0); 
  const [isAutoRotating, setIsAutoRotating] = useState(false); 
  const [showAxes, setShowAxes] = useState(false); 
  const [isWarping, setIsWarping] = useState(false);
  const [points, setPoints] = useState<number>(0);

  // 🌟 預設極簡白底模式
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const savedPoints = typeof window !== 'undefined' ? localStorage.getItem('bio_points') : null;
    if (savedPoints) setPoints(parseInt(savedPoints));
  }, []);

  const UNLOCK_THRESHOLD = 30;

  useEffect(() => {
    if (activeModel) {
      setCurrentView(activeModel.views[0]);
      setIsWarping(false); 
    }
  }, [activeModel]);

  const handleMicroWarp = (portal: any) => {
    setCurrentView({ name: 'micro-warp', camPos: portal.zoomCamPos, target: portal.zoomTarget });
    setViewTrigger(prev => prev + 1); 
    setTimeout(() => setIsWarping(true), 800);
    setTimeout(() => {
      router.push(`/biology/${portal.targetId}`);
    }, 1800);
  };

  if (!activeModel) return <div className="text-white p-10 flex h-screen items-center justify-center text-2xl">載入中...</div>;

  const microPortal = (activeModel as any).microPortal;

  // 🌟 日夜模式佈景主題變數
  const theme = {
    bg: isDarkMode ? 'bg-[#02050A]' : 'bg-[#FAFAFA]',
    textPrimary: isDarkMode ? 'text-white' : 'text-slate-900',
    textSecondary: isDarkMode ? 'text-gray-400' : 'text-slate-500',
    panelBg: isDarkMode ? 'bg-gray-900/80 border-cyan-500/20' : 'bg-white/90 border-slate-200 shadow-xl',
    title: isDarkMode ? 'text-cyan-400' : 'text-slate-900',
    guideBg: isDarkMode ? 'bg-cyan-900/20 border-cyan-500/30' : 'bg-slate-100 border-slate-200',
    btnNormal: isDarkMode ? 'bg-white/5 text-gray-400 hover:bg-white/10' : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200 shadow-sm',
    btnActive: isDarkMode ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-[0_0_15px_rgba(34,211,238,0.3)]' : 'bg-slate-900 text-white border border-slate-900 shadow-md',
  };

  return (
    <div className={`fixed inset-0 z-50 flex overflow-hidden transition-colors duration-500 ${theme.bg} ${theme.textPrimary}`}>
      
      <div 
        className={`absolute inset-0 bg-white z-[100] pointer-events-none transition-opacity duration-1000 ease-in ${
          isWarping ? 'opacity-100' : 'opacity-0'
        }`}
      ></div>

      {/* 🌟 日夜模式切換按鈕 (右下角) */}
      <button 
        onClick={() => setIsDarkMode(!isDarkMode)}
        className={`fixed bottom-8 right-8 z-[60] px-6 py-3 rounded-full font-bold shadow-lg hover:scale-105 transition-all duration-300 ${
          isDarkMode 
            ? 'bg-white text-slate-900 hover:shadow-white/20' 
            : 'bg-slate-900 text-white hover:shadow-slate-900/30'
        }`}
      >
        {isDarkMode ? '☀️ 切換至極簡模式' : '🌙 保留深色實驗室'}
      </button>

      <div className="absolute top-10 right-10 flex flex-col items-end z-30">
        <div className={`backdrop-blur-md px-6 py-3 rounded-2xl flex items-center gap-3 mb-4 ${
          isDarkMode ? 'bg-gray-900/80 border border-yellow-500/30 shadow-[0_0_20px_rgba(234,179,8,0.15)]' : 'bg-white border border-slate-200 shadow-md'
        }`}>
          <span className="text-2xl">💰</span>
          <div>
            <div className={`text-xs font-bold uppercase tracking-widest ${isDarkMode ? 'text-yellow-500/70' : 'text-slate-400'}`}>目前積分</div>
            <div className={`text-2xl font-black ${isDarkMode ? 'text-yellow-400' : 'text-slate-800'}`}>{points} PTS</div>
          </div>
        </div>

        {points >= UNLOCK_THRESHOLD ? (
          <Link href="/biology/gacha">
            <button className="relative group overflow-hidden bg-gradient-to-r from-pink-500 to-purple-500 px-6 py-3 rounded-xl font-black shadow-[0_0_20px_rgba(236,72,153,0.5)] hover:scale-105 transition-transform w-full text-center text-white">
              <span className="relative z-10 flex items-center justify-center gap-2">🎰 可以進行抽獎按這裏</span>
            </button>
          </Link>
        ) : (
          <button disabled className={`px-6 py-3 rounded-xl font-bold text-center cursor-not-allowed w-full ${
            isDarkMode ? 'bg-black/40 border border-white/5 text-gray-500' : 'bg-slate-100 border border-slate-200 text-slate-400'
          }`}>
            🔒 收集 {UNLOCK_THRESHOLD} 積分以解鎖扭蛋機<br/>
            <span className="text-rose-400 text-sm">(還差 {UNLOCK_THRESHOLD - points} 分)</span>
          </button>
        )}
      </div>

      {/* 📁 左側控制台 */}
      <div className={`w-80 backdrop-blur-xl border-r p-6 flex flex-col z-20 transition-colors duration-500 relative ${theme.panelBg}`}>
        <Link href="/biology" className={`text-sm mb-6 flex items-center gap-2 transition-colors ${theme.textSecondary} hover:${theme.textPrimary}`}>
          ← 回大廳
        </Link>
        <h1 className={`text-2xl font-black mb-2 ${theme.title}`}>{activeModel.name}</h1>
        
        <p className={`text-xs mb-6 leading-relaxed p-3 rounded-lg border ${theme.guideBg} ${theme.textSecondary}`}>
          <b className={isDarkMode ? 'text-cyan-300' : 'text-slate-800'}>🎮 操控指南：</b><br/>
          滑鼠拖曳：環繞旋轉<br/>
          滾輪滑動：拉近縮遠<br/>
          鍵盤 WASD：平移視角<br/>
          <span className="text-pink-400 font-bold mt-1 inline-block">📸 按下 P 鍵：抓取當前視角座標</span>
        </p>

        <div className={`text-xs font-bold uppercase tracking-widest mb-3 border-b pb-2 ${isDarkMode ? 'text-cyan-500/50 border-white/10' : 'text-slate-400 border-slate-200'}`}>
          最佳觀察視角 (Fixed Spots)
        </div>
        
        <div className="flex flex-col gap-2 mb-6">
          {activeModel.views.map((view, idx) => (
            <button 
              key={idx}
              onClick={() => {
                setCurrentView(view);
                setViewTrigger(prev => prev + 1);
              }}
              className={`text-left px-4 py-3 rounded-lg text-sm font-bold transition-all flex items-center justify-between ${
                currentView?.name === view.name ? theme.btnActive : theme.btnNormal
              }`}
            >
              <span>🎥 {view.name}</span>
            </button>
          ))}
          
          {microPortal && (
            <div className={`mt-2 pt-2 border-t ${isDarkMode ? 'border-pink-500/30' : 'border-slate-200'}`}>
              <button
                onClick={() => handleMicroWarp(microPortal)}
                className="w-full relative group overflow-hidden rounded-lg p-3 text-sm font-black text-white bg-gradient-to-r from-pink-600 to-purple-600 hover:scale-[1.02] transition-all shadow-[0_0_20px_rgba(236,72,153,0.3)] hover:shadow-[0_0_30px_rgba(236,72,153,0.6)]"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {microPortal.btnText} ⚡
                </span>
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
              </button>
            </div>
          )}

          <div className={`mt-4 pt-4 border-t ${isDarkMode ? 'border-cyan-500/30' : 'border-slate-200'}`}>
            <Link href={`/biology/${activeModel.id}/quiz`}>
              <button className={`w-full relative group overflow-hidden rounded-lg p-3 text-sm font-black transition-all ${
                isDarkMode 
                  ? 'text-[#050914] bg-cyan-400 hover:bg-cyan-300 shadow-[0_0_15px_rgba(34,211,238,0.4)]' 
                  : 'text-white bg-slate-900 hover:bg-slate-800 shadow-md hover:shadow-xl'
              }`}>
                📝 挑戰測驗 (賺取積分)
              </button>
            </Link>
          </div>
        </div>

        <div className={`mb-6 border-t pt-4 ${isDarkMode ? 'border-white/10' : 'border-slate-200'}`}>
          <div className="text-xs text-gray-500 font-bold uppercase tracking-widest mb-3">
            ⚙️ 系統控制
          </div>
          
          <button 
            onClick={() => setIsAutoRotating(!isAutoRotating)}
            className={`w-full text-left px-4 py-3 rounded-lg text-sm font-bold transition-all mb-2 ${
              isAutoRotating 
              ? (isDarkMode ? 'bg-green-500/20 text-green-400 border border-green-500/50' : 'bg-green-50 text-green-700 border border-green-200')
              : theme.btnNormal
            }`}
          >
            {isAutoRotating ? '✅ 自動旋轉中 (點擊停止)' : '⏹ 旋轉已停止 (點擊啟動)'}
          </button>

          <button 
            onClick={() => setShowAxes(!showAxes)}
            className={`w-full text-left px-4 py-3 rounded-lg text-sm font-bold transition-all ${
              showAxes 
              ? (isDarkMode ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/50' : 'bg-yellow-50 text-yellow-700 border border-yellow-200')
              : theme.btnNormal
            }`}
          >
            {showAxes ? '📍 隱藏 XYZ 座標軸' : '📍 顯示 XYZ 座標軸'}
          </button>
        </div>

        {/* 動態定義面板 */}
        <div className={`flex-1 rounded-xl border p-5 relative overflow-hidden flex flex-col ${
          isDarkMode ? 'bg-black/50 border-white/5' : 'bg-slate-50 border-slate-200'
        }`}>
          <div className={`text-xs font-bold uppercase tracking-widest mb-3 shrink-0 ${isDarkMode ? 'text-cyan-500/50' : 'text-slate-400'}`}>器官定義分析</div>
          {hoveredLabel ? (
             <div className="animate-fade-in flex-1 overflow-y-auto pr-2">
                <h3 className={`text-lg font-bold mb-2 ${theme.title}`}>{activeModel.labels.find(l => l.id === hoveredLabel)?.title}</h3>
                <p className={`text-sm leading-relaxed ${theme.textSecondary}`}>{activeModel.labels.find(l => l.id === hoveredLabel)?.desc}</p>
             </div>
          ) : (
             <div className="absolute inset-0 flex items-center justify-center text-gray-500 text-sm text-center px-4 pointer-events-none">
                請將滑鼠移至 3D 標籤上<br/>解說將自動顯示
             </div>
          )}
        </div>
      </div>

      {/* 🔬 右側 3D 畫面區 */}
      <div className={`flex-1 relative ${isDarkMode ? 'bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.08)_0%,transparent_70%)]' : ''}`}>
        <BioCanvas 
          modelConfig={activeModel} 
          isPlaying={isPlaying} 
          currentView={currentView!} 
          viewTrigger={viewTrigger}
          hoveredLabel={hoveredLabel} 
          setHoveredLabel={setHoveredLabel}
          isAutoRotating={isAutoRotating} 
          showAxes={showAxes} 
          isDarkMode={isDarkMode}
        />
      </div>
    </div>
  );
}