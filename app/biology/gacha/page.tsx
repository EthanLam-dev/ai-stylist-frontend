"use client";
import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import Link from 'next/link';

// 🌟 1. 物品設定區 (與房間保持一致，包含 rotation 和 scale)
export const ITEMS_CONFIG = [
  { id: 'gameboy', path: '/models/gameboy.glb', uiName: '🎮 Gameboy SP', pos: [2.5, 1.2, -3.1], scale: 1.5, rotation: [0, Math.PI / 2, 0] },
  { id: 'retro_tv', path: '/models/tv.glb', uiName: '📺 復古電視遊樂器', pos: [1.5, 0.5, 2.0], scale: 1.2, rotation: [0, -Math.PI / 4, 0] },
  { id: 'terrarium', path: '/models/ame.glb', uiName: '🌱 Ame 盆栽', pos: [-2.0, 0.5, 1.0], scale: 0.8, rotation: [0, Math.PI / 2, 0] },
  { id: 'walkman', path: '/models/walkman.glb', uiName: '📼 Sony Walkman', pos: [0, 0.5, -2], scale: 1.8, rotation: [0, 0, 0] }
];

export default function GachaLab() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [isLoading, setIsLoading] = useState(true);
  const [points, setPoints] = useState(0);
  const [gachaStage, setGachaStage] = useState<'idle' | 'rolling' | 'crystal' | 'item'>('idle');
  const [isFlashing, setIsFlashing] = useState(false);
  
  const mixersRef = useRef<THREE.AnimationMixer[]>([]);
  const modelsRef = useRef<Record<string, THREE.Group>>({});
  const [itemAnimations, setItemAnimations] = useState<THREE.AnimationClip[]>([]);
  const activeActionRef = useRef<THREE.AnimationAction | null>(null);
  
  const [activeItemKey, setActiveItemKey] = useState<string>("");
  const [activeItemUI, setActiveItemUI] = useState<string>("");

  useEffect(() => {
    const savedPoints = localStorage.getItem('bio_points');
    if (savedPoints) setPoints(parseInt(savedPoints));
  }, []);

  useEffect(() => {
    let isMounted = true;
    let animationId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const width = window.innerWidth;
    const height = window.innerHeight;

    const scene = new THREE.Scene();
    scene.background = null; 

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    camera.position.set(0, 0, 8);

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.target.set(0, 0, 0);

    const ambientLight = new THREE.AmbientLight(0xffffff, 2.0);
    scene.add(ambientLight);
    const dirLight = new THREE.DirectionalLight(0xffffff, 3.0);
    dirLight.position.set(5, 10, 5);
    scene.add(dirLight);

    const loader = new GLTFLoader();
    const clock = new THREE.Clock();

    let loadedCount = 0;
    const totalToLoad = 2 + ITEMS_CONFIG.length; 
    const checkAllLoaded = () => {
      loadedCount++;
      if (loadedCount === totalToLoad && isMounted) setIsLoading(false);
    };

    const createCenteredWrapper = (gltfScene: THREE.Group, targetSize: number) => {
      const wrapper = new THREE.Group();
      const box = new THREE.Box3().setFromObject(gltfScene);
      const size = box.getSize(new THREE.Vector3());
      const center = box.getCenter(new THREE.Vector3());
      const maxDim = Math.max(size.x, size.y, size.z);
      if(maxDim > 0) {
        const scale = targetSize / maxDim;
        gltfScene.scale.set(scale, scale, scale);
        gltfScene.position.set(-center.x * scale, -center.y * scale, -center.z * scale);
      }
      wrapper.add(gltfScene);
      return wrapper;
    };

    // 1. 載入扭蛋機
    loader.load('/models/gumball_machine_free_download.glb', (gltf) => {
      if (!isMounted) return;
      const gachaWrapper = createCenteredWrapper(gltf.scene, 6);
      gachaWrapper.position.y = -0.5;
      modelsRef.current['gacha'] = gachaWrapper;
      scene.add(gachaWrapper);
      
      if(gltf.animations.length) {
        const mixer = new THREE.AnimationMixer(gltf.scene);
        mixer.clipAction(gltf.animations[0]).play();
        mixer.timeScale = 0;
        mixersRef.current.push(mixer);
        modelsRef.current['gachaMixer'] = mixer as any;
      }
      checkAllLoaded();
    });

    // 2. 載入水晶球
    loader.load('/models/crystal_ball.glb', (gltf) => {
      if (!isMounted) return;
      const crystalWrapper = createCenteredWrapper(gltf.scene, 4.5);
      crystalWrapper.visible = false;
      modelsRef.current['crystal'] = crystalWrapper;
      scene.add(crystalWrapper);
      checkAllLoaded();
    });

    // 3. 載入獨立收藏品
    const itemsRoot = new THREE.Group();
    itemsRoot.visible = false;
    scene.add(itemsRoot);
    modelsRef.current['itemsRoot'] = itemsRoot;

    ITEMS_CONFIG.forEach(config => {
      loader.load(config.path, (gltf) => {
        if (!isMounted) return;
        const item = gltf.scene;
        item.userData = { id: config.id };
        item.visible = false; 
        itemsRoot.add(item);

        if (gltf.animations.length > 0) {
          const mixer = new THREE.AnimationMixer(item);
          modelsRef.current[`mixer_${config.id}`] = mixer as any;
          mixersRef.current.push(mixer);
          
          const namedAnims = gltf.animations.map(a => {
            const newAnim = a.clone();
            newAnim.name = `${config.id}_${a.name}`;
            return newAnim;
          });
          setItemAnimations(prev => [...prev, ...namedAnims]);
        }
        checkAllLoaded();
      });
    });

    const animate = () => {
      if (!isMounted) return;
      animationId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      mixersRef.current.forEach(m => m.update(delta));
      if (modelsRef.current['crystal']?.visible) {
        modelsRef.current['crystal'].rotation.y += 0.02; 
      }
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => { 
      isMounted = false; 
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose(); 
    };
  }, []);

  const handleDraw = () => {
    if (points < 30) return;
  
    // 🌟 1. 抓取已經解鎖的紀錄
    const currentStorage = localStorage.getItem('unlocked_items');
    let unlockedArray = currentStorage ? JSON.parse(currentStorage) : [];
    
    // 🌟 2. 篩選出「還沒抽到」的物品
    const availableItems = ITEMS_CONFIG.filter(item => !unlockedArray.includes(item.id));
    
    if (availableItems.length === 0) {
        alert("🎉 恭喜！你已經解鎖了扭蛋宇宙中所有的物品！");
        return;
    }
    
    // 扣除積分
    setPoints(prev => prev - 30);
    localStorage.setItem('bio_points', (points - 30).toString());
    setGachaStage('rolling');
    
    // 啟動扭蛋機動畫
    const gachaMixer = modelsRef.current['gachaMixer'] as any;
    if (gachaMixer) gachaMixer.timeScale = 1;

    setTimeout(() => {
      setIsFlashing(true);
      setTimeout(() => {
        modelsRef.current['gacha'].visible = false;
        modelsRef.current['crystal'].visible = true;
        setGachaStage('crystal');
        setIsFlashing(false);

        setTimeout(() => {
          setIsFlashing(true);
          setTimeout(() => {
            modelsRef.current['crystal'].visible = false;
            
            const itemsRoot = modelsRef.current['itemsRoot'];
            if (itemsRoot) {
              itemsRoot.visible = true; 
              itemsRoot.children.forEach(child => child.visible = false);
              
              // 🌟 3. 從「剩下的未解鎖物品」中隨機抽一個！
              const randomIdx = Math.floor(Math.random() * availableItems.length);
              const winningConfig = availableItems[randomIdx];
              const activeItem = itemsRoot.children.find(child => child.userData.id === winningConfig.id);
              
              if(activeItem) {
                activeItem.visible = true; 
                
                // 清除舊的縮放與位置
                itemsRoot.scale.set(1, 1, 1);
                itemsRoot.position.set(0, 0, 0);
                itemsRoot.rotation.set(0, 0, 0);
                activeItem.position.set(0, 0, 0);

                // 套用設定的旋轉角度
                if (winningConfig.rotation) {
                  activeItem.rotation.set(
                    winningConfig.rotation[0], 
                    winningConfig.rotation[1], 
                    winningConfig.rotation[2]
                  );
                }
                
                // 動態計算完美比例
                activeItem.updateMatrixWorld(true);
                const box = new THREE.Box3().setFromObject(activeItem);
                const size = box.getSize(new THREE.Vector3());
                const maxDim = Math.max(size.x, size.y, size.z);
                
                if (maxDim > 0) {
                  const baseScale = 4 / maxDim; 
                  const finalScale = baseScale * (winningConfig.scale || 1);
                  itemsRoot.scale.set(finalScale, finalScale, finalScale);
                  itemsRoot.updateMatrixWorld(true);

                  // 完美置中
                  const newBox = new THREE.Box3().setFromObject(activeItem);
                  const newCenter = newBox.getCenter(new THREE.Vector3());
                  itemsRoot.position.set(-newCenter.x, -newBox.min.y - 1.5, -newCenter.z);
                }

                setActiveItemKey(winningConfig.id);
                setActiveItemUI(winningConfig.uiName);
                
                // 🌟 4. 把剛剛抽到的物品存入 localStorage
                if (!unlockedArray.includes(winningConfig.id)) {
                    unlockedArray.push(winningConfig.id);
                    localStorage.setItem('unlocked_items', JSON.stringify(unlockedArray));
                }
              }
            }
            
            setGachaStage('item');
            setIsFlashing(false);
          }, 500);
        }, 2500);
      }, 500);
    }, 2000);
  };

  const playItemAnim = (clipName: string) => {
    const mixer = modelsRef.current[`mixer_${activeItemKey}`] as any;
    const clip = itemAnimations.find(a => a.name === clipName);
    if (mixer && clip) {
      if (activeActionRef.current) activeActionRef.current.fadeOut(0.2);
      activeActionRef.current = mixer.clipAction(clip).reset().fadeIn(0.2).play();
    }
  };

  const displayAnims = itemAnimations.filter(a => a.name.startsWith(activeItemKey));

  return (
    <div className="fixed inset-0 bg-[#02050A] flex flex-col items-center justify-center text-white overflow-hidden">
      {isLoading && (
        <div className="absolute inset-0 z-[200] bg-[#02050A] flex flex-col items-center justify-center">
          <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mb-6 shadow-[0_0_15px_#22d3ee]"></div>
          <h2 className="text-2xl font-black text-cyan-400 tracking-widest animate-pulse">正在準備扭蛋宇宙...</h2>
        </div>
      )}

      <div className={`absolute inset-0 bg-white z-[100] pointer-events-none transition-opacity duration-500 ease-in-out ${isFlashing ? 'opacity-100' : 'opacity-0'}`}></div>
      
      <div ref={containerRef} className="absolute inset-0 z-0 pointer-events-auto">
        <canvas ref={canvasRef} className="w-full h-full outline-none block" />
      </div>

      {!isLoading && (
        <>
          <div className="absolute top-10 left-10 z-20 pointer-events-auto">
            <Link href="/biology" className="text-white bg-white/10 hover:bg-white/20 border border-white/20 px-6 py-2 rounded-full font-bold transition-all backdrop-blur-md">
              ← 返回大廳
            </Link>
          </div>

          <div className="absolute top-10 right-10 z-20 pointer-events-auto">
            <div className="bg-gray-900/80 backdrop-blur-md border border-yellow-500/30 px-6 py-3 rounded-2xl shadow-[0_0_20px_rgba(234,179,8,0.15)] flex items-center gap-3">
              <span className="text-2xl">💰</span>
              <div>
                <div className="text-xs text-yellow-500/70 font-bold uppercase tracking-widest">剩餘積分</div>
                <div className="text-2xl font-black text-yellow-400">{points} PTS</div>
              </div>
            </div>
          </div>

          <div className="absolute bottom-10 z-20 flex flex-col items-center gap-4 pointer-events-auto w-full px-6">
            {gachaStage === 'idle' && (
              <button onClick={handleDraw} disabled={points < 30} className={`px-10 py-5 rounded-full font-black text-2xl tracking-widest transition-all ${points >= 30 ? 'bg-gradient-to-r from-pink-500 to-purple-500 hover:scale-105 shadow-[0_0_40px_rgba(236,72,153,0.6)] cursor-pointer' : 'bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-700'}`}>
                {points >= 30 ? '🎲 消耗 30 積分抽獎' : '積分不足 30 分'}
              </button>
            )}
            
            {gachaStage === 'item' && (
              <div className="bg-black/60 backdrop-blur-xl border border-white/20 p-6 rounded-3xl flex flex-col items-center gap-4 w-full max-w-2xl shadow-[0_0_50px_rgba(34,211,238,0.2)]">
                <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 text-center">
                  🎉 恭喜獲得：{activeItemUI}
                </h2>
                
                {displayAnims.length > 0 && (
                  <div className="flex flex-wrap gap-3 justify-center max-h-40 overflow-y-auto w-full p-2 custom-scrollbar">
                    {displayAnims.map(a => {
                      const cleanName = a.name.replace(`${activeItemKey}_`, '').replace(/_/g, ' ');
                      return (
                        <button key={a.name} onClick={() => playItemAnim(a.name)} className="bg-white/10 hover:bg-cyan-500/30 border border-white/20 hover:border-cyan-400 text-cyan-300 px-4 py-2 rounded-lg text-sm font-bold transition-all shadow-md active:scale-95">
                          ▶ {cleanName}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}