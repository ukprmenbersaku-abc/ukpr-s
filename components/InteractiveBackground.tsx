import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Gamepad2, Sparkles, X, Orbit } from 'lucide-react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Define grid properties
const COLS = 32;
const ROWS = 22;
const BLOCK_SPACING = 1.4;

// Procedural 3D Mini-Car Component
const MiniCar: React.FC<{ carRef: React.RefObject<THREE.Group | null> }> = ({ carRef }) => {
  const wheelFL = useRef<THREE.Mesh>(null);
  const wheelFR = useRef<THREE.Mesh>(null);
  const wheelRL = useRef<THREE.Mesh>(null);
  const wheelRR = useRef<THREE.Mesh>(null);

  // Spin the wheels based on movement
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    const spinSpeed = 8;
    if (wheelFL.current) wheelFL.current.rotation.x = t * spinSpeed;
    if (wheelFR.current) wheelFR.current.rotation.x = t * spinSpeed;
    if (wheelRL.current) wheelRL.current.rotation.x = t * spinSpeed;
    if (wheelRR.current) wheelRR.current.rotation.x = t * spinSpeed;
  });

  return (
    <group ref={carRef}>
      {/* Sleek Cyber Car Body */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[1.2, 0.4, 2.2]} />
        <meshStandardMaterial color="#6366f1" roughness={0.1} metalness={0.8} />
      </mesh>
      
      {/* Cabin / Windshield */}
      <mesh position={[0, 0.35, -0.1]} castShadow>
        <boxGeometry args={[0.9, 0.35, 1.1]} />
        <meshStandardMaterial color="#38bdf8" transparent opacity={0.6} roughness={0.1} metalness={0.9} />
      </mesh>

      {/* Futuristic Spoiler */}
      <mesh position={[0, 0.4, 0.9]} castShadow>
        <boxGeometry args={[1.4, 0.08, 0.3]} />
        <meshStandardMaterial color="#818cf8" roughness={0.2} metalness={0.5} />
      </mesh>
      {/* Spoiler Supports */}
      <mesh position={[-0.5, 0.2, 0.9]} castShadow>
        <boxGeometry args={[0.08, 0.3, 0.08]} />
        <meshStandardMaterial color="#312e81" />
      </mesh>
      <mesh position={[0.5, 0.2, 0.9]} castShadow>
        <boxGeometry args={[0.08, 0.3, 0.08]} />
        <meshStandardMaterial color="#312e81" />
      </mesh>

      {/* Cyberpunk Emissive Underglow */}
      <mesh position={[0, -0.19, 0]}>
        <boxGeometry args={[1.0, 0.02, 1.8]} />
        <meshBasicMaterial color="#38bdf8" toneMapped={false} />
      </mesh>

      {/* Neon Cyan Headlights */}
      <mesh position={[-0.4, 0.08, -1.11]}>
        <boxGeometry args={[0.2, 0.08, 0.03]} />
        <meshBasicMaterial color="#38bdf8" toneMapped={false} />
      </mesh>
      <mesh position={[0.4, 0.08, -1.11]}>
        <boxGeometry args={[0.2, 0.08, 0.03]} />
        <meshBasicMaterial color="#38bdf8" toneMapped={false} />
      </mesh>

      {/* Hot Red Taillights */}
      <mesh position={[-0.4, 0.08, 1.11]}>
        <boxGeometry args={[0.25, 0.06, 0.03]} />
        <meshBasicMaterial color="#ef4444" toneMapped={false} />
      </mesh>
      <mesh position={[0.4, 0.08, 1.11]}>
        <boxGeometry args={[0.25, 0.06, 0.03]} />
        <meshBasicMaterial color="#ef4444" toneMapped={false} />
      </mesh>

      {/* Active Headlight Glow Source */}
      <spotLight 
        position={[0, 0.2, -1.2]} 
        angle={0.6} 
        penumbra={0.5} 
        intensity={3.0} 
        distance={15} 
        color="#38bdf8"
        castShadow
      />

      {/* Wheels */}
      {/* Front Left */}
      <mesh ref={wheelFL} position={[-0.66, -0.12, -0.65]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.32, 0.32, 0.22, 16]} />
        <meshStandardMaterial color="#090d16" roughness={0.9} />
      </mesh>
      {/* Front Right */}
      <mesh ref={wheelFR} position={[0.66, -0.12, -0.65]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.32, 0.32, 0.22, 16]} />
        <meshStandardMaterial color="#090d16" roughness={0.9} />
      </mesh>
      {/* Rear Left */}
      <mesh ref={wheelRL} position={[-0.66, -0.12, 0.65]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.35, 0.35, 0.25, 16]} />
        <meshStandardMaterial color="#090d16" roughness={0.9} />
      </mesh>
      {/* Rear Right */}
      <mesh ref={wheelRR} position={[0.66, -0.12, 0.65]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.35, 0.35, 0.25, 16]} />
        <meshStandardMaterial color="#090d16" roughness={0.9} />
      </mesh>
    </group>
  );
};

// 3D Scene Controller
const ReactiveScene: React.FC = () => {
  const instancedMeshRef = useRef<THREE.InstancedMesh>(null);
  const carRef = useRef<THREE.Group>(null);
  
  // Spring heights and velocities for all blocks
  const count = COLS * ROWS;
  const heightsRef = useRef(new Float32Array(count));
  const velocitiesRef = useRef(new Float32Array(count));

  // Temporary variables for super high-performance math (avoids GC allocations)
  const tempObject = useRef(new THREE.Object3D());
  const tempColor = useRef(new THREE.Color());
  const planeY = useRef(new THREE.Plane(new THREE.Vector3(0, 1, 0), 0));
  const intersectionPoint = useRef(new THREE.Vector3());

  useFrame((state) => {
    const time = state.clock.getElapsedTime();

    // 1. Sleek Lissajous Path for the car
    const speedMultiplier = 0.35;
    const pathTime = time * speedMultiplier;
    
    // Smooth bounds fitting our grid nicely
    const carX = Math.sin(pathTime * 1.4) * 16;
    const carZ = Math.cos(pathTime * 0.85) * 10;
    const carY = 0.22; // Keep car slightly riding on top

    // Next point on path to calculate heading vector
    const dt = 0.03;
    const nextPathTime = pathTime + dt;
    const nextX = Math.sin(nextPathTime * 1.4) * 16;
    const nextZ = Math.cos(nextPathTime * 0.85) * 10;

    const dx = nextX - carX;
    const dz = nextZ - carZ;
    const heading = Math.atan2(dx, dz);

    // Apply movement & rotation to procedural car
    if (carRef.current) {
      carRef.current.position.set(carX, carY, carZ);
      
      // Smooth interpolation for heading rotation to avoid snappy frames
      const currentRotY = carRef.current.rotation.y;
      // Handle modular wrapping
      let diff = heading - currentRotY;
      while (diff < -Math.PI) diff += Math.PI * 2;
      while (diff > Math.PI) diff -= Math.PI * 2;
      carRef.current.rotation.y += diff * 0.15;
    }

    // 2. 3D Raycasting to get mouse intersection coordinates on the y=0 grid plane
    const { raycaster } = state;
    raycaster.ray.intersectPlane(planeY.current, intersectionPoint.current);
    const mouse3D = intersectionPoint.current;

    // 3. Update all block heights via optimized physics
    const mesh = instancedMeshRef.current;
    if (!mesh) return;

    const heights = heightsRef.current;
    const velocities = velocitiesRef.current;
    
    const springK = 0.06;
    const damping = 0.82;

    for (let i = 0; i < count; i++) {
      const col = i % COLS;
      const row = Math.floor(i / COLS);

      // Map col/row indices to 3D grid space
      const gridX = (col - COLS / 2) * BLOCK_SPACING;
      const gridZ = (row - ROWS / 2) * BLOCK_SPACING;

      // Distance calculations
      const distToCar = Math.sqrt((gridX - carX) ** 2 + (gridZ - carZ) ** 2);
      const distToMouse = Math.sqrt((gridX - mouse3D.x) ** 2 + (gridZ - mouse3D.z) ** 2);

      // Base Wave Motion (ambient ocean of blocks)
      let targetY = Math.sin(gridX * 0.18 + gridZ * 0.12 + time * 1.2) * 0.15;

      // Car Compression (Car deforms the blocks underneath it)
      const carInfluenceRadius = 4.2;
      if (distToCar < carInfluenceRadius) {
        const factor = 1 - distToCar / carInfluenceRadius;
        // High compression immediately under car
        targetY += -1.6 * (factor * factor);
        // Ripple wake trailing behind
        targetY += Math.sin(distToCar * 2.2 - time * 8) * 0.25 * factor;
      }

      // Mouse Proximity Interaction (Indent blocks under user's cursor)
      const mouseInfluenceRadius = 5.5;
      if (distToMouse < mouseInfluenceRadius) {
        const factor = 1 - distToMouse / mouseInfluenceRadius;
        // Beautiful soft dent effect
        targetY += -2.0 * (factor * factor);
      }

      // Euler-Spring Physics Integration
      const force = (targetY - heights[i]) * springK;
      velocities[i] = (velocities[i] + force) * damping;
      heights[i] += velocities[i];

      // Update transform matrix
      const obj = tempObject.current;
      obj.position.set(gridX, heights[i], gridZ);
      
      // Block scales slightly based on height deflection
      const currentScaleY = 1.0 + Math.abs(heights[i]) * 0.12;
      obj.scale.set(1.0, currentScaleY, 1.0);
      obj.updateMatrix();
      mesh.setMatrixAt(i, obj.matrix);

      // 4. Reactive Grid Coloring (Trails)
      // Transition from dark blue grid to glowing neon lines on excitation
      const carGlow = Math.exp(-distToCar / 2.0);
      const mouseGlow = Math.exp(-distToMouse / 2.5);

      const color = tempColor.current;
      // Default slate-950 matched deep color
      color.set('#0b0f19');

      if (carGlow > 0.01) {
        // Blend in cyber-indigo trail
        color.lerp(new THREE.Color('#6366f1'), carGlow * 0.8);
      }
      if (mouseGlow > 0.01) {
        // Blend in bright electric blue cursor trail
        color.lerp(new THREE.Color('#38bdf8'), mouseGlow * 0.85);
      }

      mesh.setColorAt(i, color);
    }

    // Flag changes to WebGL for redrawing
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) {
      mesh.instanceColor.needsUpdate = true;
    }

    // Gentle Auto-Orbiting Cinematic Camera to emphasize 3D depth
    state.camera.position.x = Math.sin(time * 0.08) * 4;
    state.camera.position.z = 19 + Math.cos(time * 0.05) * 2.5;
    state.camera.lookAt(0, -1, 0);
  });

  return (
    <>
      {/* Instanced Mesh representing our block grid (amazing GPU rendering performance) */}
      <instancedMesh ref={instancedMeshRef} args={[null as any, null as any, count]} castShadow receiveShadow>
        <boxGeometry args={[1.1, 1.1, 1.1]} />
        <meshStandardMaterial roughness={0.3} metalness={0.15} />
      </instancedMesh>

      {/* Procedurally styled car */}
      <MiniCar carRef={carRef} />
    </>
  );
};

const InteractiveBackground: React.FC = () => {
  const [gameState, setGameState] = useState<'idle' | 'showing-popup' | 'active'>('showing-popup');
  const [timeLeft, setTimeLeft] = useState<number>(3);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-start popup and timer
  useEffect(() => {
    if (gameState !== 'showing-popup') return;

    const start = Date.now();
    const duration = 3000; // 3 seconds

    const interval = setInterval(() => {
      const elapsed = Date.now() - start;
      const remaining = Math.max(0, (duration - elapsed) / 1000);
      setTimeLeft(remaining);

      if (remaining <= 0) {
        clearInterval(interval);
        setGameState('idle');
      }
    }, 30);

    return () => clearInterval(interval);
  }, [gameState]);

  const handlePlayGame = () => {
    setGameState('active');
  };

  return (
    <>
      {/* Background 3D Canvas wrapper */}
      <div
        ref={containerRef}
        className={`fixed inset-0 w-full h-full pointer-events-none transition-all duration-1000 ${
          gameState === 'active' ? 'z-0 bg-slate-950 opacity-100' : '-z-10 opacity-25'
        }`}
      >
        {gameState === 'active' && (
          <Canvas 
            shadows 
            dpr={[1, 1.5]} 
            camera={{ position: [0, 16, 20], fov: 45 }}
            style={{ pointerEvents: 'auto' }} // Permit raycasting on plane
          >
            {/* Ambient deep base lighting */}
            <ambientLight intensity={0.25} />
            
            {/* Soft global key directional light */}
            <directionalLight 
              position={[10, 20, 10]} 
              intensity={1.0} 
              color="#312e81"
              castShadow
              shadow-mapSize-width={1024}
              shadow-mapSize-height={1024}
            />

            {/* Glowing cyan rim light */}
            <pointLight position={[-15, 8, -10]} intensity={1.5} color="#0ea5e9" distance={40} />

            {/* Glowing pink rim light */}
            <pointLight position={[15, 8, 10]} intensity={1.5} color="#ec4899" distance={40} />

            {/* Reactive elements */}
            <ReactiveScene />
          </Canvas>
        )}
      </div>

      {/* Persistent floating indicator button to activate 3D Mode at any time if they missed it */}
      <AnimatePresence>
        {gameState === 'idle' && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="fixed bottom-6 right-6 z-50 pointer-events-auto"
          >
            <button
              onClick={() => setGameState('active')}
              className="flex items-center gap-2 py-3 px-5 bg-indigo-900/80 hover:bg-indigo-600 backdrop-blur-md border border-indigo-500/40 text-white font-bold rounded-full shadow-lg hover:shadow-indigo-500/35 transition-all duration-300"
              title="Activate 3D Cyber Car Mode"
            >
              <Orbit size={18} className="animate-spin-slow text-brand-400" />
              <span>3D Grid Mode</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Game Activation Popup */}
      <AnimatePresence>
        {gameState === 'showing-popup' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none px-4">
            <motion.div
              id="game-popup"
              initial={{ scale: 0, rotate: -15, y: 100, opacity: 0 }}
              animate={{ 
                scale: 1, 
                rotate: 0, 
                y: 0, 
                opacity: 1,
                transition: { 
                  type: 'spring', 
                  stiffness: 260, 
                  damping: 15 
                } 
              }}
              exit={{ 
                scale: 0, 
                rotate: 15, 
                y: -100, 
                opacity: 0,
                transition: { duration: 0.3 }
              }}
              className="relative w-full max-w-sm bg-gradient-to-br from-indigo-950/90 via-slate-900/95 to-slate-950/90 backdrop-blur-xl border-2 border-indigo-500/50 rounded-3xl p-6 shadow-2xl shadow-indigo-500/20 text-center pointer-events-auto overflow-hidden group"
            >
              {/* Pulsing glow background */}
              <div className="absolute inset-0 bg-gradient-to-tr from-brand-500/10 to-indigo-500/10 opacity-100 blur-xl -z-10 animate-pulse" />

              {/* Close Button */}
              <button 
                onClick={() => setGameState('idle')}
                className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-800/60 hover:bg-slate-700/80 text-slate-400 hover:text-white transition-colors duration-200"
              >
                <X size={16} />
              </button>

              {/* Icon */}
              <div className="mx-auto w-16 h-16 bg-gradient-to-tr from-indigo-500 to-brand-400 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-indigo-500/30 group-hover:scale-115 transition-transform duration-500 animate-bounce">
                <Gamepad2 size={32} className="text-white" />
              </div>

              {/* Title / Description */}
              <h3 className="text-2xl font-black text-white flex items-center justify-center gap-2 mb-1 tracking-tight">
                <Sparkles size={18} className="text-brand-400" />
                Play Game!
                <Sparkles size={18} className="text-brand-400" />
              </h3>
              <p className="text-indigo-200 text-xs font-semibold mb-6 uppercase tracking-wider">
                Click to activate 3D Grid & Car!
              </p>

              {/* Action Button */}
              <button
                onClick={handlePlayGame}
                className="relative w-full py-3 px-6 bg-gradient-to-r from-brand-500 to-indigo-600 hover:from-brand-400 hover:to-indigo-500 text-white font-extrabold rounded-2xl shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 overflow-hidden"
              >
                {/* Elastic flash highlight */}
                <div className="absolute inset-0 w-1/2 h-full bg-white/20 skew-x-12 -translate-x-full group-hover:animate-shine" />
                <span className="relative z-10 flex items-center justify-center gap-2">
                  <Gamepad2 size={18} />
                  ACTIVATE 3D WORLD
                </span>
              </button>

              {/* Countdown Progress Bar */}
              <div className="mt-4 w-full bg-slate-800/80 h-1.5 rounded-full overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-brand-400 to-indigo-500 h-full transition-all duration-75"
                  style={{ width: `${(timeLeft / 3) * 100}%` }}
                />
              </div>
              <div className="mt-1 text-[10px] font-mono text-slate-500 text-right">
                Disappearing in {timeLeft.toFixed(1)}s
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default InteractiveBackground;
