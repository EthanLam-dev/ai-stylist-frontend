"use client";
import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import Link from 'next/link';

// 🌟 1. 物品設定區 (座標 pos 和 大小 scale 已經幫你同步放大 6.66 倍)
// 🌟 1. 物品設定區 (座標 pos 和 大小 scale 已經幫你同步放大 6.66 倍)
const ITEMS_CONFIG = [
  // Gameboy：Y 軸設定為 -Math.PI / 6 (大約往左轉 30 度)，讓它微側面向你，展示最帥的螢幕角度！
  { id: 'gameboy', path: '/models/gameboy.glb', defaultName: 'Gameboy SP', pos: [-4.90, 19.33, -5.53], scale: 2, rotation: [0, -Math.PI / 10.5, 0] },
  // 復古電視：X 軸改回 0 讓它站起來！Y 軸設定為 -Math.PI / 4 (往左轉 45 度)，讓螢幕正對著房間中央。
  { id: 'retro_tv', path: '/models/tv.glb', defaultName: '復古電視遊樂器', pos: [-26.89, 11.59, 33.89], scale: 8, rotation: [0, -Math.PI / -0.8, 0] },
   
  { id: 'terrarium', path: '/models/ame.glb', defaultName: 'Ame 盆栽', pos: [-10.84,19.33, -9.79], scale: 5.3, rotation: [0, 0, 0] },
  { id: 'walkman', path: '/models/walkman.glb', defaultName: 'Sony Walkman', pos: [-26.16, 11.59, -2.18], scale: 4, rotation: [0, 0, 0] }
];

// 🌟 2. 巨型房間的空氣牆與相機出生點 (放大 6.66 倍)
const ROOM_LIMITS = {
  minX: -40, maxX: 40,  // 原本是 -6 到 6，現在擴展到 -40 到 40
  minZ: -40, maxZ: 40
};
const INITIAL_CAM_POS = new THREE.Vector3(-10.89, 23.66, 0.82); // 提高出生點，避免卡在地板
const INITIAL_TARGET = new THREE.Vector3(-11.19, 23.20, -7.14);   // 視線也提高

export default function CollectionRoom() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const currentPosRef = useRef<HTMLSpanElement>(null);
  const clickedPosRef = useRef<HTMLSpanElement>(null);
  const keys = useRef({ w: false, a: false, s: false, d: false });

  const [isLoading, setIsLoading] = useState(true);
  const [unlockedItems, setUnlockedItems] = useState<string[]>([]);
  const [customNames, setCustomNames] = useState<Record<string, string>>({});
  
  const [focusedItemConfig, setFocusedItemConfig] = useState<typeof ITEMS_CONFIG[0] | null>(null);
  const [editNameInput, setEditNameInput] = useState("");

  const modelsRef = useRef<THREE.Group[]>([]);
  const mixersRef = useRef<THREE.AnimationMixer[]>([]);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const boxHelperRef = useRef<THREE.BoxHelper | null>(null);

  useEffect(() => {
    const savedItems = localStorage.getItem('unlocked_items');
    if (savedItems) setUnlockedItems(JSON.parse(savedItems));
    
    const legacyPet = localStorage.getItem('unlocked_pet');
    if (legacyPet && !savedItems) setUnlockedItems([legacyPet]);

    const savedNames = localStorage.getItem('custom_item_names');
    if (savedNames) setCustomNames(JSON.parse(savedNames));
  }, []);

  useEffect(() => {
    let isMounted = true;
    let animationId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const width = window.innerWidth;
    const height = window.innerHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#050914');

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    camera.position.copy(INITIAL_CAM_POS); 
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.target.copy(INITIAL_TARGET); 
    
    controls.minDistance = 2;       
    controls.maxDistance = 80;      // 🌟 視角最遠距離拉長到 80
    controls.maxPolarAngle = Math.PI / 2 - 0.05; 
    controlsRef.current = controls;

    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 1.5);
    scene.add(hemiLight);
    const dirLight = new THREE.DirectionalLight(0xffffff, 1.0);
    dirLight.position.set(5, 10, 5);
    scene.add(dirLight);

    const loader = new GLTFLoader();
    const clock = new THREE.Clock(); 

    const selectionBox = new THREE.BoxHelper(new THREE.Mesh(), 0xffffff);
    selectionBox.visible = false;
    scene.add(selectionBox);
    boxHelperRef.current = selectionBox;

    let loadedCount = 0;
    const totalModels = 1 + ITEMS_CONFIG.length;

    const checkAllLoaded = () => {
      loadedCount++;
      if (loadedCount === totalModels && isMounted) setIsLoading(false);
    };

    loader.load('/models/nobitas_roomdoraemon_3d_model.glb', (gltf) => {
      if (!isMounted) return;
      const room = gltf.scene;
      
      const box = new THREE.Box3().setFromObject(room);
      const size = box.getSize(new THREE.Vector3());
      const maxDim = Math.max(size.x, size.y, size.z);
      
      // 🌟 3. 房間放大為 100！
      const scale = 100 / maxDim; 
      room.scale.set(scale, scale, scale);
      
      const center = box.getCenter(new THREE.Vector3());
      room.position.set(-center.x * scale, -box.min.y * scale - 2, -center.z * scale);
      
      scene.add(room);
      checkAllLoaded();
    });

    ITEMS_CONFIG.forEach(config => {
      loader.load(config.path, (gltf) => {
        if (!isMounted) return;
        const item = gltf.scene;
        
        const isUnlocked = unlockedItems.includes(config.id);
        
        const box = new THREE.Box3().setFromObject(item);
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        
        const roomScale = config.scale / maxDim;
        item.scale.set(roomScale, roomScale, roomScale);
        
        // 🌟 4. 飛到相機前的目標大小也跟著放大 6.66 倍 (原本是 2.5)
        const focusScale = 2.5 / maxDim;

        const center = box.getCenter(new THREE.Vector3());
        item.position.set(
          config.pos[0] - (center.x * roomScale), 
          config.pos[1] - (box.min.y * roomScale), 
          config.pos[2] - (center.z * roomScale)
        );

        if (config.rotation) {
          item.rotation.set(config.rotation[0], config.rotation[1], config.rotation[2]);
        }

        if (!isUnlocked) {
          item.traverse((child) => {
            if ((child as THREE.Mesh).isMesh) {
              const mesh = child as THREE.Mesh;
              mesh.material = new THREE.MeshStandardMaterial({
                color: 0x06b6d4, wireframe: true, transparent: true, opacity: 0.3
              });
            }
          });
        }

        item.userData = { 
          id: config.id, 
          isUnlocked: isUnlocked,
          isFocused: false, 
          origPos: item.position.clone(),
          origQuat: item.quaternion.clone(),
          origScale: item.scale.clone(), 
          targetFocusScale: new THREE.Vector3(focusScale, focusScale, focusScale),
          targetFocusPos: new THREE.Vector3(),  
          targetFocusQuat: new THREE.Quaternion(), 
          action: null
        };

        if (gltf.animations.length > 0) {
          const mixer = new THREE.AnimationMixer(item);
          mixersRef.current.push(mixer);
          item.userData.action = mixer.clipAction(gltf.animations[0]);
        }

        modelsRef.current.push(item);
        scene.add(item);
        checkAllLoaded();
      });
    });

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onMouseMove = (event: MouseEvent) => {
      if (modelsRef.current.some(m => m.userData.isFocused)) {
        document.body.style.cursor = 'default';
        if (boxHelperRef.current) boxHelperRef.current.visible = false;
        return;
      }

      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
      
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(modelsRef.current, true);

      if (intersects.length > 0) {
        let object = intersects[0].object;
        while (object.parent && !object.userData.id) { object = object.parent; }
        
        if (object.userData.isUnlocked && boxHelperRef.current) {
          document.body.style.cursor = 'pointer';
          boxHelperRef.current.setFromObject(object);
          boxHelperRef.current.update();
          boxHelperRef.current.visible = true;
          return;
        }
      }
      
      document.body.style.cursor = 'default';
      if (boxHelperRef.current) boxHelperRef.current.visible = false;
    };

    const handleCloseFocusInstance = () => {
      setFocusedItemConfig(null);
      modelsRef.current.forEach(m => {
        if (m.userData.isFocused) {
          m.userData.isFocused = false;
          if (m.userData.action) m.userData.action.fadeOut(0.5);
        }
      });
    };

    const onClick = (event: MouseEvent) => {
      if (modelsRef.current.some(m => m.userData.isFocused)) {
        handleCloseFocusInstance();
        return; 
      }

      raycaster.setFromCamera(mouse, camera);

      const allIntersects = raycaster.intersectObjects(scene.children, true);
      if (allIntersects.length > 0) {
        const pt = allIntersects[0].point;
        console.log(`🎯 [點擊座標] X: ${pt.x.toFixed(2)}, Y: ${pt.y.toFixed(2)}, Z: ${pt.z.toFixed(2)}`);
        if (clickedPosRef.current) {
          clickedPosRef.current.innerText = `${pt.x.toFixed(2)}, ${pt.y.toFixed(2)}, ${pt.z.toFixed(2)}`;
        }
      }

      const itemIntersects = raycaster.intersectObjects(modelsRef.current, true);
      if (itemIntersects.length > 0) {
        let object = itemIntersects[0].object;
        while (object.parent && !object.userData.id) { object = object.parent; }

        if (object.userData.isUnlocked) {
          if (boxHelperRef.current) boxHelperRef.current.visible = false;
          object.userData.isFocused = true;
          if (object.userData.action) object.userData.action.reset().fadeIn(0.5).play();

          const clickedConfig = ITEMS_CONFIG.find(i => i.id === object.userData.id);
          if (clickedConfig) {
            
            // 🌟 5. 飛到相機前的距離也等比例拉遠，避免穿透鏡頭 (原本是 -3.5，現在拉遠到 -23)
            const focusPos = new THREE.Vector3(0, -0.2, -3); 
            focusPos.applyMatrix4(camera.matrixWorld);
            object.userData.targetFocusPos.copy(focusPos);

            const dummy = new THREE.Object3D();
            dummy.position.copy(focusPos);
            dummy.lookAt(camera.position); 
            
            if (clickedConfig.rotation) {
                dummy.rotateX(clickedConfig.rotation[0]);
                dummy.rotateY(clickedConfig.rotation[1]);
                dummy.rotateZ(clickedConfig.rotation[2]);
            }
            object.userData.targetFocusQuat.copy(dummy.quaternion);

            setFocusedItemConfig(clickedConfig);
            setEditNameInput(customNames[clickedConfig.id] || clickedConfig.defaultName);
          }
        }
      }
    };

    const onKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (keys.current.hasOwnProperty(key)) {
        keys.current[key as keyof typeof keys.current] = true;
        if (modelsRef.current.some(m => m.userData.isFocused)) {
          handleCloseFocusInstance(); 
        }
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (keys.current.hasOwnProperty(key)) keys.current[key as keyof typeof keys.current] = false;
    };

    canvas.addEventListener('mousemove', onMouseMove);
    canvas.addEventListener('click', onClick);
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    const animate = () => {
      if (!isMounted) return;
      animationId = requestAnimationFrame(animate);
      
      const delta = clock.getDelta();
      mixersRef.current.forEach(m => m.update(delta));

      const isAnyFocused = modelsRef.current.some(m => m.userData.isFocused);

      if (!isAnyFocused) {
        // 🌟 6. 走路速度也變快！不然房間變大會覺得走不動
        const moveSpeed = 0.5; 
        const forward = new THREE.Vector3();
        camera.getWorldDirection(forward);
        forward.y = 0;
        forward.normalize();
        const right = new THREE.Vector3();
        right.crossVectors(forward, camera.up).normalize();

        if (keys.current.w) { camera.position.addScaledVector(forward, moveSpeed); controls.target.addScaledVector(forward, moveSpeed); }
        if (keys.current.s) { camera.position.addScaledVector(forward, -moveSpeed); controls.target.addScaledVector(forward, -moveSpeed); }
        if (keys.current.a) { camera.position.addScaledVector(right, -moveSpeed); controls.target.addScaledVector(right, -moveSpeed); }
        if (keys.current.d) { camera.position.addScaledVector(right, moveSpeed); controls.target.addScaledVector(right, moveSpeed); }

        camera.position.x = THREE.MathUtils.clamp(camera.position.x, ROOM_LIMITS.minX, ROOM_LIMITS.maxX);
        camera.position.z = THREE.MathUtils.clamp(camera.position.z, ROOM_LIMITS.minZ, ROOM_LIMITS.maxZ);
        controls.target.x = THREE.MathUtils.clamp(controls.target.x, ROOM_LIMITS.minX, ROOM_LIMITS.maxX);
        controls.target.z = THREE.MathUtils.clamp(controls.target.z, ROOM_LIMITS.minZ, ROOM_LIMITS.maxZ);

        if (currentPosRef.current) currentPosRef.current.innerText = `${camera.position.x.toFixed(2)}, ${camera.position.y.toFixed(2)}, ${camera.position.z.toFixed(2)}`;
      }

      modelsRef.current.forEach(m => {
        if (!m.userData.origPos) return;

        if (m.userData.isFocused) {
          m.position.lerp(m.userData.targetFocusPos, 0.05);
          m.quaternion.slerp(m.userData.targetFocusQuat, 0.05);
          m.scale.lerp(m.userData.targetFocusScale, 0.05);
        } else {
          m.position.lerp(m.userData.origPos, 0.05);
          m.quaternion.slerp(m.userData.origQuat, 0.05);
          m.scale.lerp(m.userData.origScale, 0.05);
        }
      });

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
      canvas.removeEventListener('mousemove', onMouseMove);
      canvas.removeEventListener('click', onClick);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('resize', handleResize);
      renderer.dispose(); 
    };
  }, [unlockedItems]); 

  const saveCustomName = () => {
    if (!focusedItemConfig) return;
    const newNames = { ...customNames, [focusedItemConfig.id]: editNameInput };
    setCustomNames(newNames);
    localStorage.setItem('custom_item_names', JSON.stringify(newNames));
    alert("✅ 命名已儲存！");
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#050914] overflow-hidden flex font-sans text-white">
      
      {isLoading && (
        <div className="absolute inset-0 z-[200] bg-[#02050A] flex flex-col items-center justify-center">
          <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mb-6 shadow-[0_0_15px_#06b6d4]"></div>
          <h2 className="text-2xl font-black text-cyan-400 tracking-widest animate-pulse">正在佈置大雄的收藏室...</h2>
        </div>
      )}

      <div ref={containerRef} className="absolute inset-0 z-0 pointer-events-auto outline-none" tabIndex={0}>
        <canvas ref={canvasRef} className="w-full h-full outline-none block" />
      </div>

      {!isLoading && !focusedItemConfig && (
        <>
          <div className="absolute top-8 left-8 z-20 pointer-events-auto">
            <Link href="/biology">
              <button className="bg-black/50 backdrop-blur-md text-white px-6 py-3 rounded-full border border-white/20 hover:bg-white/20 transition-all shadow-lg font-bold tracking-widest">
                ← 返回大廳
              </button>
            </Link>
          </div>

          <div className="absolute top-8 right-8 z-20 bg-gray-900/80 backdrop-blur-md border border-cyan-500/30 p-4 rounded-xl shadow-[0_0_15px_rgba(6,182,212,0.2)] flex flex-col gap-2 pointer-events-none">
            <h3 className="text-cyan-400 text-xs font-black tracking-widest uppercase border-b border-white/10 pb-2 mb-1">🎮 開發者儀表板</h3>
            <div className="text-sm font-mono flex justify-between gap-4">
              <span className="text-gray-400">當前視角:</span>
              <span ref={currentPosRef} className="text-green-400">0.00, 0.00, 0.00</span>
            </div>
            <div className="text-sm font-mono flex justify-between gap-4">
              <span className="text-gray-400">點擊座標:</span>
              <span ref={clickedPosRef} className="text-pink-400">尚未點擊</span>
            </div>
            <div className="text-xs text-gray-500 mt-2 text-center">WASD 移動，點擊畫面取得精準座標</div>
          </div>
        </>
      )}

      {focusedItemConfig && (
        <div className="absolute inset-0 z-[100] flex flex-col items-center justify-between pointer-events-none transition-all">
          <div className="mt-12 flex flex-col items-center bg-black/50 px-12 py-4 rounded-3xl backdrop-blur-md border border-white/20 pointer-events-auto shadow-xl">
             <h2 className="text-4xl font-black text-cyan-400 mb-2 tracking-widest drop-shadow-[0_0_10px_rgba(6,182,212,0.8)]">
               {customNames[focusedItemConfig.id] || focusedItemConfig.defaultName}
             </h2>
             <p className="text-gray-300 text-sm tracking-widest">按下 WASD 走動 或 點擊 3D 背景退出檢視</p>
          </div>

          <div className="flex-1 w-full pointer-events-auto cursor-pointer"></div>

          <div className="mb-12 bg-gray-900/80 backdrop-blur-md border border-white/20 rounded-2xl p-6 w-[400px] shadow-[0_0_30px_rgba(0,0,0,0.5)] flex flex-col items-center pointer-events-auto" onClick={e => e.stopPropagation()}>
            <div className="w-full">
              <label className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-2 block">自訂專屬名稱</label>
              <div className="flex gap-3">
                <input 
                  type="text" 
                  value={editNameInput}
                  onChange={(e) => setEditNameInput(e.target.value)}
                  className="flex-1 bg-black/50 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-400 transition-colors text-lg"
                  placeholder="給它取個名字..."
                />
                <button 
                  onClick={saveCustomName}
                  className="bg-cyan-600 hover:bg-cyan-500 text-white px-6 py-3 rounded-lg font-bold transition-all shadow-md active:scale-95"
                >
                  儲存
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}