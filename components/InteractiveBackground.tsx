import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Gamepad2, Sparkles, X, Orbit, Eye, EyeOff, RotateCcw, HelpCircle } from 'lucide-react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Define grid properties
const COLS = 32;
const ROWS = 22;
const BLOCK_SPACING = 1.4;

interface MiniCarProps {
  carRef: React.RefObject<THREE.Group | null>;
  headlightsOn: boolean;
  speed: number;
}

// Procedural 3D Mini-Car Component
const MiniCar: React.FC<MiniCarProps> = ({ carRef, headlightsOn, speed }) => {
  const wheelFL = useRef<THREE.Mesh>(null);
  const wheelFR = useRef<THREE.Mesh>(null);
  const wheelRL = useRef<THREE.Mesh>(null);
  const wheelRR = useRef<THREE.Mesh>(null);

  const spotLightRef = useRef<THREE.SpotLight>(null);
  const targetRef = useRef<THREE.Object3D>(null);

  // Spin the wheels based on movement velocity
  useFrame((_state, delta) => {
    const spinSpeed = speed * 35; // Spin speed is proportional to physical car velocity
    if (wheelFL.current) wheelFL.current.rotation.x -= spinSpeed * delta;
    if (wheelFR.current) wheelFR.current.rotation.x -= spinSpeed * delta;
    if (wheelRL.current) wheelRL.current.rotation.x -= spinSpeed * delta;
    if (wheelRR.current) wheelRR.current.rotation.x -= spinSpeed * delta;

    // Direct binding of Spotlight target for robust projection orientation
    if (spotLightRef.current && targetRef.current && spotLightRef.current.target !== targetRef.current) {
      spotLightRef.current.target = targetRef.current;
    }
  });

  return (
    <group ref={carRef}>
      {/* Sleek Cyber Car Body */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[1.2, 0.4, 2.2]} />
        <meshStandardMaterial color="#6366f1" roughness={0.15} metalness={0.8} />
      </mesh>
      
      {/* Cabin / Windshield */}
      <mesh position={[0, 0.35, -0.1]} castShadow>
        <boxGeometry args={[0.9, 0.35, 1.1]} />
        <meshStandardMaterial color="#38bdf8" transparent opacity={0.65} roughness={0.05} metalness={0.95} />
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

      {/* Neon Headlights (Visually reacts to headlightsOn) */}
      <mesh position={[-0.4, 0.08, -1.11]}>
        <boxGeometry args={[0.2, 0.08, 0.03]} />
        <meshBasicMaterial color={headlightsOn ? "#38bdf8" : "#1e293b"} toneMapped={false} />
      </mesh>
      <mesh position={[0.4, 0.08, -1.11]}>
        <boxGeometry args={[0.2, 0.08, 0.03]} />
        <meshBasicMaterial color={headlightsOn ? "#38bdf8" : "#1e293b"} toneMapped={false} />
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

      {/* Spotlight forward targets */}
      <object3D ref={targetRef} position={[0, 0.1, -10]} />

      {/* Active Headlight Glow Source projecting cones onto grid */}
      {headlightsOn && (
        <spotLight 
          ref={spotLightRef}
          position={[0, 0.2, -1.12]} 
          angle={0.55} 
          penumbra={0.6} 
          intensity={8.0} 
          distance={22} 
          color="#38bdf8"
          castShadow
          shadow-bias={-0.0001}
        />
      )}

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

interface ReactiveSceneProps {
  isManual: boolean;
  setIsManual: (val: boolean) => void;
  headlightsOn: boolean;
  setHeadlightsOn: React.Dispatch<React.SetStateAction<boolean>>;
  setCarSpeed: (val: number) => void;
  resetTriggerRef: React.MutableRefObject<boolean>;
}

// 3D Scene Controller
const ReactiveScene: React.FC<ReactiveSceneProps> = ({
  isManual,
  setIsManual,
  headlightsOn,
  setHeadlightsOn,
  setCarSpeed,
  resetTriggerRef,
}) => {
  const instancedMeshRef = useRef<THREE.InstancedMesh>(null);
  const carRef = useRef<THREE.Group>(null);
  
  // Spring heights and velocities for all blocks
  const count = COLS * ROWS;
  const heightsRef = useRef(new Float32Array(count));
  const velocitiesRef = useRef(new Float32Array(count));

  // Key tracking state
  const keysRef = useRef({
    forward: false,
    backward: false,
    left: false,
    right: false,
    handbrake: false,
  });

  // Physical car coordinates
  const carPhysics = useRef({
    x: 0,
    z: 0,
    angle: Math.PI, // Face initially toward viewer
    speed: 0,
  });

  const lastInputTime = useRef(Date.now());

  // Listen to keyboard commands for immediate interactive takeover
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      let keyMatched = false;

      if (e.code === 'ArrowUp' || e.code === 'KeyW') { keysRef.current.forward = true; keyMatched = true; }
      if (e.code === 'ArrowDown' || e.code === 'KeyS') { keysRef.current.backward = true; keyMatched = true; }
      if (e.code === 'ArrowLeft' || e.code === 'KeyA') { keysRef.current.left = true; keyMatched = true; }
      if (e.code === 'ArrowRight' || e.code === 'KeyD') { keysRef.current.right = true; keyMatched = true; }
      if (e.code === 'Space') { keysRef.current.handbrake = true; keyMatched = true; }

      // Hotkey to toggle headlights directly
      if (e.code === 'KeyL') {
        setHeadlightsOn(prev => !prev);
      }

      // Transition to manual override immediately
      if (keyMatched && !isManual) {
        setIsManual(true);
        lastInputTime.current = Date.now();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'ArrowUp' || e.code === 'KeyW') keysRef.current.forward = false;
      if (e.code === 'ArrowDown' || e.code === 'KeyS') keysRef.current.backward = false;
      if (e.code === 'ArrowLeft' || e.code === 'KeyA') keysRef.current.left = false;
      if (e.code === 'ArrowRight' || e.code === 'KeyD') keysRef.current.right = false;
      if (e.code === 'Space') keysRef.current.handbrake = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isManual, setIsManual, setHeadlightsOn]);

  // Temporary math variables to safeguard GC performance
  const tempObject = useRef(new THREE.Object3D());
  const tempColor = useRef(new THREE.Color());
  const planeY = useRef(new THREE.Plane(new THREE.Vector3(0, 1, 0), 0));
  const intersectionPoint = useRef(new THREE.Vector3());
  const lastStateUpdate = useRef(0);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    const phys = carPhysics.current;

    // 1. Manual / Automatic Reset Trigger Handler
    if (resetTriggerRef.current) {
      phys.x = 0;
      phys.z = 0;
      phys.angle = Math.PI;
      phys.speed = 0;
      resetTriggerRef.current = false;
    }

    // 2. Physics & Navigation Engine
    if (isManual) {
      // Manual Driving Physics
      let accel = 0;
      if (keysRef.current.forward) accel += 0.009;
      if (keysRef.current.backward) accel -= 0.006;

      // Friction / Handbrake
      if (keysRef.current.handbrake) {
        phys.speed *= 0.82; // Extreme sliding friction
      } else if (accel === 0) {
        phys.speed *= 0.95; // Gentle rolling friction
      }

      phys.speed += accel;

      // Speed Clamping limits
      const maxSpeed = 0.32;
      const maxReverse = -0.14;
      if (phys.speed > maxSpeed) phys.speed = maxSpeed;
      if (phys.speed < maxReverse) phys.speed = maxReverse;

      // Adaptive Steering based on current velocity (cannot steer while fully stopped)
      if (Math.abs(phys.speed) > 0.001) {
        const steerDir = phys.speed > 0 ? 1 : -1;
        // Steer factor scales beautifully with speed to simulate realistic momentum turn radius
        const steerFactor = 0.075 * Math.min(Math.abs(phys.speed) * 4.5, 1.0);
        
        if (keysRef.current.left) phys.angle += steerFactor * steerDir;
        if (keysRef.current.right) phys.angle -= steerFactor * steerDir;
      }

      // Drive coordinates translation
      // Standard mathematical forward coordinates (car models point in -z forward by standard)
      phys.x -= Math.sin(phys.angle) * phys.speed;
      phys.z -= Math.cos(phys.angle) * phys.speed;

      // Dynamic Boundary Bouncing
      const boundX = (COLS / 2) * BLOCK_SPACING - 1.2;
      const boundZ = (ROWS / 2) * BLOCK_SPACING - 1.2;

      if (phys.x > boundX) { phys.x = boundX; phys.speed *= -0.45; }
      if (phys.x < -boundX) { phys.x = -boundX; phys.speed *= -0.45; }
      if (phys.z > boundZ) { phys.z = boundZ; phys.speed *= -0.45; }
      if (phys.z < -boundZ) { phys.z = -boundZ; phys.speed *= -0.45; }

      // Idle verification (returns to autopilot if keyboard is untouched for 18 seconds)
      const isAnyKeyPressed = keysRef.current.forward || keysRef.current.backward || keysRef.current.left || keysRef.current.right;
      if (isAnyKeyPressed) {
        lastInputTime.current = Date.now();
      } else if (Date.now() - lastInputTime.current > 18000) {
        setIsManual(false);
      }
    } else {
      // Auto pilot: Smooth Lissajous Wave Curve Path
      const speedMultiplier = 0.32;
      const pathTime = time * speedMultiplier;

      const autoX = Math.sin(pathTime * 1.4) * 15;
      const autoZ = Math.cos(pathTime * 0.85) * 9;

      const dt = 0.03;
      const nextPathTime = pathTime + dt;
      const nextX = Math.sin(nextPathTime * 1.4) * 15;
      const nextZ = Math.cos(nextPathTime * 0.85) * 9;

      const dx = nextX - autoX;
      const dz = nextZ - autoZ;
      const heading = Math.atan2(dx, dz); // Rotation heading

      // Smoothly interpolate physical coordinates to avoid snappy snapping when taking over
      const blend = 0.08;
      phys.x += (autoX - phys.x) * blend;
      phys.z += (autoZ - phys.z) * blend;

      let angleDiff = heading - phys.angle;
      while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
      while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
      phys.angle += angleDiff * blend;

      phys.speed = 0.12; // Steady cruising speed
    }

    // Apply translation directly to car ref
    if (carRef.current) {
      carRef.current.position.set(phys.x, 0.22, phys.z);
      // Align 3D model orientation
      carRef.current.rotation.y = phys.angle;
    }

    // Throttled HUD speedometer dispatch (10 FPS update avoids browser layout thrashing)
    if (time * 1000 - lastStateUpdate.current > 100) {
      setCarSpeed(Math.abs(phys.speed) * 180); // Scaled for impressive cyberpunk dials
      lastStateUpdate.current = time * 1000;
    }

    // 3. 3D Raycasting to get mouse coordinates on Grid plane
    const { raycaster } = state;
    raycaster.ray.intersectPlane(planeY.current, intersectionPoint.current);
    const mouse3D = intersectionPoint.current;

    // 4. Mesh Block Lattice update logic
    const mesh = instancedMeshRef.current;
    if (!mesh) return;

    const heights = heightsRef.current;
    const velocities = velocitiesRef.current;
    
    const springK = 0.06;
    const damping = 0.83;

    for (let i = 0; i < count; i++) {
      const col = i % COLS;
      const row = Math.floor(i / COLS);

      const gridX = (col - COLS / 2) * BLOCK_SPACING;
      const gridZ = (row - ROWS / 2) * BLOCK_SPACING;

      // Interactive distance triggers
      const distToCar = Math.sqrt((gridX - phys.x) ** 2 + (gridZ - phys.z) ** 2);
      const distToMouse = Math.sqrt((gridX - mouse3D.x) ** 2 + (gridZ - mouse3D.z) ** 2);

      // Ambient ripple ocean wave base
      let targetY = Math.sin(gridX * 0.16 + gridZ * 0.1 + time * 1.3) * 0.14;

      // Car displacement weight (pushes block lattices downwards + creates trail ripple wake)
      const carInfluenceRadius = 4.4;
      if (distToCar < carInfluenceRadius) {
        const factor = 1 - distToCar / carInfluenceRadius;
        targetY += -1.8 * (factor * factor); // Recesses blocks heavily under weight
        targetY += Math.sin(distToCar * 2.5 - time * 8.5) * 0.25 * factor; // Dynamic trailing ripple
      }

      // Mouse displacement weight (indents block grids under hover coordinates)
      const mouseInfluenceRadius = 5.6;
      if (distToMouse < mouseInfluenceRadius) {
        const factor = 1 - distToMouse / mouseInfluenceRadius;
        targetY += -2.2 * (factor * factor);
      }

      // Spring-Euler dynamics integration
      const force = (targetY - heights[i]) * springK;
      velocities[i] = (velocities[i] + force) * damping;
      heights[i] += velocities[i];

      // Update instanced matrix transforms
      const obj = tempObject.current;
      obj.position.set(gridX, heights[i], gridZ);

      // Height expansion styling
      const heightY = 1.0 + Math.abs(heights[i]) * 0.14;
      obj.scale.set(1.0, heightY, 1.0);
      obj.updateMatrix();
      mesh.setMatrixAt(i, obj.matrix);

      // 5. Grid Lighting Trails (Reactive colors based on proximity)
      const carGlow = Math.exp(-distToCar / 2.2);
      const mouseGlow = Math.exp(-distToMouse / 2.8);

      const color = tempColor.current;
      color.set('#0b0f19'); // Deep slate canvas color

      if (carGlow > 0.01) {
        // Neon Indigo cyber car trail
        color.lerp(new THREE.Color('#6366f1'), carGlow * 0.85);
      }
      if (mouseGlow > 0.01) {
        // Cyber cyan mouse hover highlight
        color.lerp(new THREE.Color('#38bdf8'), mouseGlow * 0.9);
      }

      mesh.setColorAt(i, color);
    }

    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) {
      mesh.instanceColor.needsUpdate = true;
    }

    // Auto-Orbit cinematic background camera
    state.camera.position.x = Math.sin(time * 0.06) * 4.5;
    state.camera.position.z = 18.5 + Math.cos(time * 0.04) * 2.0;
    state.camera.lookAt(0, -1, 0);
  });

  return (
    <>
      <instancedMesh ref={instancedMeshRef} args={[null as any, null as any, count]} castShadow receiveShadow>
        <boxGeometry args={[1.1, 1.1, 1.1]} />
        <meshStandardMaterial roughness={0.3} metalness={0.15} />
      </instancedMesh>

      <MiniCar carRef={carRef} headlightsOn={headlightsOn} speed={carPhysics.current.speed} />
    </>
  );
};

const InteractiveBackground: React.FC = () => {
  const [gameState, setGameState] = useState<'idle' | 'showing-popup' | 'active'>('showing-popup');
  const [timeLeft, setTimeLeft] = useState<number>(3);
  const [isManual, setIsManual] = useState<boolean>(false);
  const [headlightsOn, setHeadlightsOn] = useState<boolean>(true);
  const [carSpeed, setCarSpeed] = useState<number>(0);
  const [showControlsHelp, setShowControlsHelp] = useState<boolean>(true);

  const containerRef = useRef<HTMLDivElement>(null);
  const resetTriggerRef = useRef<boolean>(false);

  // Auto-start popup countdown
  useEffect(() => {
    if (gameState !== 'showing-popup') return;

    const start = Date.now();
    const duration = 3000;

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

  const triggerReset = () => {
    resetTriggerRef.current = true;
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
            camera={{ position: [0, 16, 20], fov: 42 }}
            style={{ pointerEvents: 'auto' }}
          >
            <ambientLight intensity={0.2} />
            
            <directionalLight 
              position={[12, 22, 12]} 
              intensity={0.9} 
              color="#312e81"
              castShadow
              shadow-mapSize-width={1024}
              shadow-mapSize-height={1024}
            />

            <pointLight position={[-16, 10, -10]} intensity={1.5} color="#0ea5e9" distance={45} />
            <pointLight position={[16, 10, 10]} intensity={1.5} color="#ec4899" distance={45} />

            <ReactiveScene 
              isManual={isManual}
              setIsManual={setIsManual}
              headlightsOn={headlightsOn}
              setHeadlightsOn={setHeadlightsOn}
              setCarSpeed={setCarSpeed}
              resetTriggerRef={resetTriggerRef}
            />
          </Canvas>
        )}
      </div>

      {/* Cyberpunk HUD / Cockpit Dashboard overlays */}
      <AnimatePresence>
        {gameState === 'active' && (
          <div className="fixed inset-0 pointer-events-none z-20 flex flex-col justify-between p-6">
            
            {/* TOP BAR: Dashboard Stats */}
            <div className="flex justify-between items-start w-full">
              {/* Speedometer widget */}
              <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="pointer-events-auto flex items-center gap-4 px-5 py-3 rounded-2xl bg-slate-950/85 backdrop-blur-xl border border-slate-800/80 shadow-lg text-slate-100"
              >
                <div className="flex flex-col">
                  <span className="text-[9px] font-mono tracking-widest text-slate-500 uppercase">VELOCITY</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black font-mono tracking-tight text-white glow-cyan">
                      {Math.round(carSpeed)}
                    </span>
                    <span className="text-[10px] font-bold text-brand-400">KM/H</span>
                  </div>
                </div>
                
                <div className="h-8 w-[1px] bg-slate-800" />

                {/* Simulated Gear indicator */}
                <div className="flex flex-col items-center">
                  <span className="text-[9px] font-mono text-slate-500">GEAR</span>
                  <span className="text-xl font-black font-mono text-indigo-400">
                    {carSpeed < 1 ? 'N' : carSpeed > 50 ? 'D4' : 'D3'}
                  </span>
                </div>
              </motion.div>

              {/* Status Pill Overlays */}
              <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="flex gap-2"
              >
                {/* Auto/Manual Pilot Tag */}
                <div className="px-4 py-2 rounded-xl bg-slate-950/85 backdrop-blur-xl border border-slate-800/80 flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${isManual ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500 animate-pulse'}`} />
                  <span className="text-xs font-black font-mono tracking-wider text-slate-200">
                    {isManual ? 'MANUAL DRIVING' : 'AUTO AUTOPILOT'}
                  </span>
                </div>

                {/* Headlights Pill Tag */}
                <button
                  onClick={() => setHeadlightsOn(p => !p)}
                  className="pointer-events-auto px-4 py-2 rounded-xl bg-slate-950/85 hover:bg-slate-900/90 backdrop-blur-xl border border-slate-800/80 flex items-center gap-2 hover:border-indigo-500/50 transition-all duration-300 active:scale-95"
                  title="Toggle Headlights (L)"
                >
                  {headlightsOn ? (
                    <>
                      <Eye size={14} className="text-brand-400" />
                      <span className="text-xs font-mono font-bold text-slate-200">LIGHTS: ON</span>
                    </>
                  ) : (
                    <>
                      <EyeOff size={14} className="text-slate-500" />
                      <span className="text-xs font-mono font-bold text-slate-400">LIGHTS: OFF</span>
                    </>
                  )}
                </button>
              </motion.div>
            </div>

            {/* LOWER BAR: Driving Commands Cockpit Controls */}
            <div className="flex justify-between items-end w-full">
              {/* Reset Controls & Auto/Manual button */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="pointer-events-auto flex gap-2"
              >
                {/* Manual Takeover button */}
                <button
                  onClick={() => setIsManual(!isManual)}
                  className={`px-5 py-3 rounded-2xl font-black text-xs font-mono tracking-wider shadow-lg flex items-center gap-2 transition-all duration-300 active:scale-95 border ${
                    isManual 
                      ? 'bg-amber-600/20 border-amber-500 text-amber-200 hover:bg-amber-600/30 shadow-amber-500/10'
                      : 'bg-indigo-950/80 border-indigo-500/30 text-indigo-300 hover:bg-indigo-900/50'
                  }`}
                >
                  <Gamepad2 size={15} />
                  {isManual ? 'SWITCH TO AUTO' : 'START MANUAL DRIVE'}
                </button>

                {/* Position Reset Button */}
                <button
                  onClick={triggerReset}
                  className="px-4 py-3 rounded-2xl bg-slate-950/80 hover:bg-slate-900/90 border border-slate-800/80 hover:border-slate-700 text-slate-300 flex items-center gap-2 transition-all duration-300 active:scale-95"
                  title="Reset Position (R)"
                >
                  <RotateCcw size={15} />
                  <span className="text-xs font-bold font-mono">RESET CAR</span>
                </button>

                {/* Show/Hide Controls helper panel */}
                <button
                  onClick={() => setShowControlsHelp(p => !p)}
                  className={`p-3 rounded-2xl border transition-all duration-300 active:scale-95 ${
                    showControlsHelp 
                      ? 'bg-brand-500/10 border-brand-500 text-brand-300' 
                      : 'bg-slate-950/80 border-slate-800/80 text-slate-400 hover:text-slate-200'
                  }`}
                  title="Help Panel"
                >
                  <HelpCircle size={16} />
                </button>
              </motion.div>

              {/* CONTROLS GUIDE PANEL: Interactive Overlay */}
              <AnimatePresence>
                {showControlsHelp && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, x: 20 }}
                    animate={{ opacity: 1, scale: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.95, x: 20 }}
                    className="pointer-events-auto max-w-xs p-4 rounded-2xl bg-slate-950/90 backdrop-blur-xl border border-slate-800/80 shadow-2xl text-left"
                  >
                    <div className="flex justify-between items-center mb-2 pb-1.5 border-b border-slate-800/80">
                      <span className="text-[10px] font-black font-mono tracking-widest text-indigo-400">COCKPIT INSTRUCTIONS</span>
                      <button 
                        onClick={() => setShowControlsHelp(false)}
                        className="text-slate-500 hover:text-slate-300 transition-colors"
                      >
                        <X size={12} />
                      </button>
                    </div>

                    <div className="space-y-1.5 text-[11px] font-mono text-slate-300">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Drive forward</span>
                        <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-100 border border-slate-700 font-sans font-bold">W</kbd>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Reverse / Brake</span>
                        <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-100 border border-slate-700 font-sans font-bold">S</kbd>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Turn Left / Right</span>
                        <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-100 border border-slate-700 font-sans font-bold">A</kbd>
                        <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-100 border border-slate-700 font-sans font-bold">D</kbd>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Handbrake Slide</span>
                        <kbd className="px-2.5 py-0.5 rounded bg-slate-800 text-slate-100 border border-slate-700 font-sans font-bold text-[9px]">SPACE</kbd>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Toggle Headlights</span>
                        <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-100 border border-slate-700 font-sans font-bold">L</kbd>
                      </div>
                    </div>

                    <div className="mt-3 text-[9px] text-slate-500 italic">
                      💡 Pressing any key will instantly hand over driving controls to you!
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

          </div>
        )}
      </AnimatePresence>

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
