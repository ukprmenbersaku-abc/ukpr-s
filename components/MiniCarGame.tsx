import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Line, Stars } from '@react-three/drei';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Trophy, 
  RotateCcw, 
  ArrowLeft, 
  Volume2, 
  VolumeX, 
  Flame, 
  Zap, 
  Navigation,
  Eye,
  Sparkles,
  Gamepad2
} from 'lucide-react';

// --- GAME CONFIG & TUNING ---
const TRACK_WIDTH = 22.0; // Widened to ~3 times (original was 8.0)
const BARRIER_HEIGHT = 0.55;
const CAR_RADIUS = 0.6;

// Checkpoint nodes (t parameter positions along the curve)
const CHECKPOINT_T = [0.25, 0.5, 0.75]; 

// 8 wide, smooth points defining an ultra-smooth speedway circuit with fewer, gentler curves
const TRACK_POINTS = [
  new THREE.Vector3(0, 0, -70),     // Start / Finish Line on a massive straightaway
  new THREE.Vector3(70, 0, -60),    // Super gentle corner 1 sweep to the right
  new THREE.Vector3(100, 0.5, 0),   // Gentle high speed crest
  new THREE.Vector3(70, 1.0, 60),    // Corner 2 sweep
  new THREE.Vector3(0, 0.8, 70),     // Back straightaway with elegant elevation flow
  new THREE.Vector3(-70, 0, 60),    // Gentle corner 3 sweep
  new THREE.Vector3(-100, 0.5, 0),  // Midpoint crest
  new THREE.Vector3(-70, 0, -60),   // Final corner turn-in towards home
];

// Generate smooth spline curve
const trackCurve = new THREE.CatmullRomCurve3(TRACK_POINTS, true);

// Items to collect on track
interface Collectible {
  id: number;
  position: THREE.Vector3;
  collected: boolean;
}

// Boost pads position along track (t parameters)
const BOOST_PADS_PARAMS = [0.08, 0.28, 0.52, 0.72, 0.92];

// Sound Synthesizer Engine using Web Audio API
class EngineSoundSynth {
  private ctx: AudioContext | null = null;
  private osc: OscillatorNode | null = null;
  private modulator: OscillatorNode | null = null;
  private modGain: GainNode | null = null;
  private subOsc: OscillatorNode | null = null;
  private subGain: GainNode | null = null;
  private turboOsc: OscillatorNode | null = null;
  private turboGain: GainNode | null = null;
  private filter: BiquadFilterNode | null = null;
  private mainGain: GainNode | null = null;
  
  // Brake and Skid sound synthesis nodes
  private brakeOsc: OscillatorNode | null = null;
  private brakeGain: GainNode | null = null;
  private skidSource: AudioBufferSourceNode | null = null;
  private skidFilter: BiquadFilterNode | null = null;
  private skidGain: GainNode | null = null;

  private active = false;

  constructor() {
    // Initialized on user interaction to abide by browser security policies
  }

  public start() {
    if (this.active) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      this.ctx = new AudioCtx();

      // --- ENGINE MOTOR SYNTH ---
      // 1. Main engine cylinder oscillator (sawtooth)
      this.osc = this.ctx.createOscillator();
      this.osc.type = 'sawtooth';
      this.osc.frequency.setValueAtTime(30, this.ctx.currentTime);

      // 2. Modulator oscillator for cylinder explosion pulse (FM)
      this.modulator = this.ctx.createOscillator();
      this.modulator.type = 'sawtooth';
      this.modulator.frequency.setValueAtTime(15, this.ctx.currentTime);

      this.modGain = this.ctx.createGain();
      this.modGain.gain.setValueAtTime(18, this.ctx.currentTime);

      // Connect modulator -> modGain -> osc frequency
      this.modulator.connect(this.modGain);
      this.modGain.connect(this.osc.frequency);

      // 3. Sub-bass engine rumble (triangle for deep bass feel)
      this.subOsc = this.ctx.createOscillator();
      this.subOsc.type = 'triangle';
      this.subOsc.frequency.setValueAtTime(15, this.ctx.currentTime);

      this.subGain = this.ctx.createGain();
      this.subGain.gain.setValueAtTime(0.04, this.ctx.currentTime);
      this.subOsc.connect(this.subGain);

      // 4. Turbo whine high pitch whistle (sine)
      this.turboOsc = this.ctx.createOscillator();
      this.turboOsc.type = 'sine';
      this.turboOsc.frequency.setValueAtTime(350, this.ctx.currentTime);

      this.turboGain = this.ctx.createGain();
      this.turboGain.gain.setValueAtTime(0.001, this.ctx.currentTime);
      this.turboOsc.connect(this.turboGain);

      // 5. Shared motor filter (lowpass filter for deep muffled roar)
      this.filter = this.ctx.createBiquadFilter();
      this.filter.type = 'lowpass';
      this.filter.frequency.setValueAtTime(180, this.ctx.currentTime);
      this.filter.Q.setValueAtTime(4.0, this.ctx.currentTime);

      // Connect primary oscillator to motor filter
      this.osc.connect(this.filter);

      // Master engine gain node
      this.mainGain = this.ctx.createGain();
      this.mainGain.gain.setValueAtTime(0.12, this.ctx.currentTime);

      // Route all engine components to master engine gain
      this.filter.connect(this.mainGain);
      this.subGain.connect(this.mainGain);
      this.turboGain.connect(this.mainGain);
      this.mainGain.connect(this.ctx.destination);

      // Start engine oscillators
      this.osc.start();
      this.modulator.start();
      this.subOsc.start();
      this.turboOsc.start();

      // --- BRAKE SQUEAL SYNTH ---
      this.brakeOsc = this.ctx.createOscillator();
      this.brakeOsc.type = 'sine';
      this.brakeOsc.frequency.setValueAtTime(3000, this.ctx.currentTime);

      this.brakeGain = this.ctx.createGain();
      this.brakeGain.gain.setValueAtTime(0.0, this.ctx.currentTime);
      this.brakeOsc.connect(this.brakeGain);
      this.brakeGain.connect(this.ctx.destination);
      this.brakeOsc.start();

      // --- DRIFT TIRE SKID SYNTH (White Noise + Filter) ---
      const bufferSize = 2 * this.ctx.sampleRate;
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      this.skidSource = this.ctx.createBufferSource();
      this.skidSource.buffer = noiseBuffer;
      this.skidSource.loop = true;

      this.skidFilter = this.ctx.createBiquadFilter();
      this.skidFilter.type = 'bandpass';
      this.skidFilter.frequency.setValueAtTime(800, this.ctx.currentTime);
      this.skidFilter.Q.setValueAtTime(2.5, this.ctx.currentTime);

      this.skidGain = this.ctx.createGain();
      this.skidGain.gain.setValueAtTime(0.0, this.ctx.currentTime);

      this.skidSource.connect(this.skidFilter);
      this.skidFilter.connect(this.skidGain);
      this.skidGain.connect(this.ctx.destination);
      this.skidSource.start();

      this.active = true;
    } catch (e) {
      console.warn('Failed to start synth engine:', e);
    }
  }

  public update(speedRatio: number, isBoosting: boolean, isBraking: boolean, isDrifting: boolean) {
    if (!this.active || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;

      // 1. Engine Core frequency & throb (higher ratio = faster cylinder ignition frequency)
      const baseHz = 28;
      const topHz = 165;
      const targetPitch = baseHz + speedRatio * (topHz - baseHz) + (isBoosting ? 60 : 0);
      
      const targetModHz = 14 + speedRatio * 45;
      const targetModGain = 16 + speedRatio * 75;

      if (this.osc) {
        this.osc.frequency.setTargetAtTime(targetPitch, now, 0.05);
      }
      if (this.modulator && this.modGain) {
        this.modulator.frequency.setTargetAtTime(targetModHz, now, 0.05);
        this.modGain.gain.setTargetAtTime(targetModGain, now, 0.05);
      }

      // 2. Lowpass resonance filter frequency (widens at high RPMs for a roaring sound)
      const filterFreq = 160 + speedRatio * 420 + (isBoosting ? 260 : 0);
      if (this.filter) {
        this.filter.frequency.setTargetAtTime(filterFreq, now, 0.05);
      }

      // 3. Sub-bass engine rumble tracking
      if (this.subOsc) {
        this.subOsc.frequency.setTargetAtTime(14 + speedRatio * 22, now, 0.08);
      }

      // 4. Turbo spool whine pitch and volume (extremely realistic high-rev spool)
      const turboHz = 350 + speedRatio * 1450 + (isBoosting ? 450 : 0);
      const turboVol = 0.001 + speedRatio * 0.015 + (isBoosting ? 0.015 : 0);
      if (this.turboOsc && this.turboGain) {
        this.turboOsc.frequency.setTargetAtTime(turboHz, now, 0.08);
        this.turboGain.gain.setTargetAtTime(turboVol, now, 0.08);
      }

      // 5. Brake squeal sound activation
      if (this.brakeGain && this.brakeOsc) {
        const targetBrakeVol = isBraking ? Math.min(0.018, speedRatio * 0.035) : 0.0;
        this.brakeGain.gain.setTargetAtTime(targetBrakeVol, now, 0.03);
        // Slight frequency variance to represent friction variations
        this.brakeOsc.frequency.setValueAtTime(3000 + Math.sin(now * 50) * 15, now);
      }

      // 6. Tires screech / skid sound activation
      if (this.skidGain && this.skidFilter) {
        const targetSkidVol = isDrifting ? Math.min(0.12, 0.04 + speedRatio * 0.12) : (isBraking && speedRatio > 0.3) ? 0.05 : 0.0;
        this.skidGain.gain.setTargetAtTime(targetSkidVol, now, 0.05);
        
        const skidFreq = 750 + speedRatio * 350 + (isDrifting ? 120 : 0);
        this.skidFilter.frequency.setValueAtTime(skidFreq, now);
      }
    } catch (e) {
      // Ignored
    }
  }

  public stop() {
    if (!this.active) return;
    try {
      this.osc?.stop();
      this.modulator?.stop();
      this.subOsc?.stop();
      this.turboOsc?.stop();
      this.brakeOsc?.stop();
      this.skidSource?.stop();
      this.ctx?.close();
    } catch (e) {}
    this.osc = null;
    this.modulator = null;
    this.modGain = null;
    this.subOsc = null;
    this.subGain = null;
    this.turboOsc = null;
    this.turboGain = null;
    this.filter = null;
    this.mainGain = null;
    this.brakeOsc = null;
    this.brakeGain = null;
    this.skidSource = null;
    this.skidFilter = null;
    this.skidGain = null;
    this.ctx = null;
    this.active = false;
  }
}

// Props for MiniCarGame
interface MiniCarGameProps {
  onClose: () => void;
}

export default function MiniCarGame({ onClose }: MiniCarGameProps) {
  const [gameState, setGameState] = useState<'countdown' | 'playing' | 'finished'>('countdown');
  const [countdown, setCountdown] = useState(3);
  const [lap, setLap] = useState(1);
  const [lapTimes, setLapTimes] = useState<number[]>([]);
  const [currentLapTime, setCurrentLapTime] = useState(0);
  const [bestLapTime, setBestLapTime] = useState<number | null>(null);
  const [speed, setSpeed] = useState(0);
  const [nitro, setNitro] = useState(100);
  const [isMuted, setIsMuted] = useState(false);
  const [cameraView, setCameraView] = useState<'chase' | 'retro' | 'cockpit'>('chase');
  const [checkpointsPassed, setCheckpointsPassed] = useState<boolean[]>([false, false, false]); // 3 checkpoints around the track
  const [score, setScore] = useState(0);
  const [showNotification, setShowNotification] = useState<string | null>(null);

  // Helper to dynamically calculate perfect start state on spline curve
  const getInitialCarState = () => {
    const startPt = trackCurve.getPointAt(0);
    const startTg = trackCurve.getTangentAt(0).normalize();
    const startAng = Math.atan2(-startTg.x, -startTg.z);
    return {
      x: startPt.x,
      y: startPt.y,
      z: startPt.z,
      angle: startAng,
      speed: 0,
      isBoosting: false,
      isDrifting: false,
      totalDistance: 0
    };
  };

  // References
  const soundSynth = useRef<EngineSoundSynth | null>(null);
  const carState = useRef(getInitialCarState());

  const keys = useRef({
    forward: false,
    backward: false,
    left: false,
    right: false,
    drift: false,
    boost: false
  });

  // Generate gold star collectibles around the track layout
  const collectibles = useMemo(() => {
    const list: Collectible[] = [];
    const count = 15;
    for (let i = 0; i < count; i++) {
      const t = (i / count) + 0.03;
      const point = trackCurve.getPointAt(t % 1);
      const normal = trackCurve.getTangentAt(t % 1).cross(new THREE.Vector3(0, 1, 0)).normalize();
      // Alternate left/right offset on the road
      const offset = (i % 2 === 0 ? 1 : -1) * (Math.random() * 1.5 + 0.5);
      const pos = point.clone().add(normal.multiplyScalar(offset));
      pos.y += 0.4;
      list.push({
        id: i,
        position: pos,
        collected: false
      });
    }
    return list;
  }, []);

  const [activeCollectibles, setActiveCollectibles] = useState<Collectible[]>(collectibles);

  // Keyboard Event Handlers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState === 'countdown') return;
      if (e.code === 'ArrowUp' || e.code === 'KeyW') keys.current.forward = true;
      if (e.code === 'ArrowDown' || e.code === 'KeyS') keys.current.backward = true;
      if (e.code === 'ArrowLeft' || e.code === 'KeyA') keys.current.left = true;
      if (e.code === 'ArrowRight' || e.code === 'KeyD') keys.current.right = true;
      if (e.code === 'Space') keys.current.drift = true;
      if (e.code === 'ShiftLeft' || e.code === 'ShiftRight' || e.code === 'KeyF') keys.current.boost = true;
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'ArrowUp' || e.code === 'KeyW') keys.current.forward = false;
      if (e.code === 'ArrowDown' || e.code === 'KeyS') keys.current.backward = false;
      if (e.code === 'ArrowLeft' || e.code === 'KeyA') keys.current.left = false;
      if (e.code === 'ArrowRight' || e.code === 'KeyD') keys.current.right = false;
      if (e.code === 'Space') keys.current.drift = false;
      if (e.code === 'ShiftLeft' || e.code === 'ShiftRight' || e.code === 'KeyF') keys.current.boost = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    // Auto-initialize synth on first key down
    const initAudioOnKey = () => {
      if (!soundSynth.current) {
        soundSynth.current = new EngineSoundSynth();
        if (!isMuted) soundSynth.current.start();
      }
      window.removeEventListener('keydown', initAudioOnKey);
    };
    window.addEventListener('keydown', initAudioOnKey);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('keydown', initAudioOnKey);
    };
  }, [gameState, isMuted]);

  // Handle game mute
  useEffect(() => {
    if (isMuted) {
      soundSynth.current?.stop();
    } else {
      soundSynth.current?.start();
    }
  }, [isMuted]);

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      soundSynth.current?.stop();
    };
  }, []);

  // Countdown timer effect
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setGameState('playing');
      soundSynth.current?.start();
    }
  }, [countdown]);

  // Lap timer update loop
  useEffect(() => {
    if (gameState !== 'playing') return;
    const interval = setInterval(() => {
      setCurrentLapTime(prev => prev + 0.1);
    }, 100);
    return () => clearInterval(interval);
  }, [gameState]);

  // Trigger floating notifications
  const triggerNotification = (text: string) => {
    setShowNotification(text);
    setTimeout(() => setShowNotification(null), 1800);
  };

  const handleRestart = () => {
    setGameState('countdown');
    setCountdown(3);
    setLap(1);
    setLapTimes([]);
    setCurrentLapTime(0);
    setBestLapTime(null);
    setSpeed(0);
    setNitro(100);
    setScore(0);
    setCheckpointsPassed([false, false, false]);
    setActiveCollectibles(collectibles.map(c => ({ ...c, collected: false })));
    
    // Reset car variables to starting point on the spline curve
    carState.current = getInitialCarState();
  };

  // On-screen Virtual Controls for touch/mouse play (操作しやすいようにして)
  const handleTouchStart = (key: 'forward' | 'backward' | 'left' | 'right' | 'drift' | 'boost') => {
    if (gameState === 'countdown') return;
    keys.current[key] = true;
    if (!soundSynth.current) {
      soundSynth.current = new EngineSoundSynth();
      if (!isMuted) soundSynth.current.start();
    }
  };

  const handleTouchEnd = (key: 'forward' | 'backward' | 'left' | 'right' | 'drift' | 'boost') => {
    keys.current[key] = false;
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col justify-between select-none overflow-hidden font-sans">
      
      {/* 3D WebGL Canvas Layer */}
      <div className="absolute inset-0 z-0">
        <Canvas shadows={{ type: THREE.PCFShadowMap }} camera={{ fov: 45 }}>
          <Scene 
            gameState={gameState}
            carState={carState}
            keys={keys}
            cameraView={cameraView}
            activeCollectibles={activeCollectibles}
            setActiveCollectibles={setActiveCollectibles}
            onUpdateHUD={(currSpeed, currNitro) => {
              setSpeed(currSpeed);
              setNitro(currNitro);
              // Update synth engine sound based on real-time driving inputs
              if (soundSynth.current) {
                const ratio = Math.min(Math.abs(currSpeed) / 130, 1.0);
                soundSynth.current.update(
                  ratio, 
                  keys.current.boost && currNitro > 0,
                  keys.current.backward && currSpeed > 5,
                  keys.current.drift && Math.abs(currSpeed) > 15
                );
              }
            }}
            onPassCheckpoint={(index) => {
              // Trigger a state update or check logic
              if (index === 0 && !checkpointsPassed[0]) {
                setCheckpointsPassed([true, false, false]);
                triggerNotification("⚡ CHECKPOINT 1!");
                setScore(prev => prev + 50);
              } else if (index === 1 && checkpointsPassed[0] && !checkpointsPassed[1]) {
                setCheckpointsPassed([true, true, false]);
                triggerNotification("⚡ CHECKPOINT 2!");
                setScore(prev => prev + 50);
              } else if (index === 2 && checkpointsPassed[1] && !checkpointsPassed[2]) {
                setCheckpointsPassed([true, true, true]);
                triggerNotification("⚡ SECTOR 3 COMPLETED!");
                setScore(prev => prev + 50);
              }
            }}
            onPassStartLine={() => {
              // Complete lap only if all checkpoints are satisfied!
              if (checkpointsPassed[2]) {
                triggerNotification(`🏁 LAP ${lap} COMPLETE!`);
                const currentLap = currentLapTime;
                setLapTimes(prev => [...prev, currentLap]);
                
                if (bestLapTime === null || currentLap < bestLapTime) {
                  setBestLapTime(currentLap);
                  triggerNotification(`👑 NEW BEST LAP: ${currentLap.toFixed(1)}s!`);
                }
                
                setScore(prev => prev + 200);
                setCheckpointsPassed([false, false, false]);
                setCurrentLapTime(0);

                if (lap >= 3) {
                  setGameState('finished');
                  soundSynth.current?.stop();
                } else {
                  setLap(prev => prev + 1);
                }
              } else {
                // Warning if trying to drive backwards/cheat
                triggerNotification("⚠️ MISSED CHECKPOINTS! FOLLOW TRACK");
              }
            }}
            onCollectStar={() => {
              setScore(prev => prev + 100);
              setNitro(prev => Math.min(prev + 15, 100));
            }}
            onBoostPad={() => {
              triggerNotification("🚀 BOOST SPEED ACTIVATED!");
              setScore(prev => prev + 25);
            }}
          />
        </Canvas>
      </div>

      {/* OVERLAY: HUD Top Bar */}
      <div className="relative z-10 w-full p-4 md:p-6 flex justify-between items-start pointer-events-none">
        
        {/* Top-Left: Exit & Lap Info */}
        <div className="flex flex-col gap-3 pointer-events-auto">
          <button 
            onClick={() => {
              soundSynth.current?.stop();
              onClose();
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900/90 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition-all hover:translate-x-1 active:scale-95"
          >
            <ArrowLeft size={16} />
            <span className="text-sm font-bold tracking-tight">Exit Circuit</span>
          </button>

          {/* Gamemode banner */}
          <div className="px-4 py-2 rounded-xl bg-indigo-950/80 backdrop-blur border border-indigo-500/30 flex items-center gap-2">
            <Gamepad2 size={16} className="text-brand-400 animate-bounce" />
            <span className="text-xs font-black font-mono tracking-widest text-brand-300">NEON CIRCUIT RACER</span>
          </div>
        </div>

        {/* Top-Center: Lap Times & Timer */}
        <div className="flex flex-col items-center">
          <div className="px-5 py-3 rounded-2xl bg-slate-950/90 backdrop-blur-xl border border-slate-800 flex items-center gap-6 shadow-xl">
            <div className="flex flex-col items-center">
              <span className="text-[9px] font-mono tracking-widest text-slate-400 uppercase">LAP</span>
              <span className="text-2xl font-black font-mono text-white">{lap}<span className="text-sm text-slate-500">/3</span></span>
            </div>

            <div className="h-8 w-[1px] bg-slate-800" />

            <div className="flex flex-col items-center min-w-[70px]">
              <span className="text-[9px] font-mono tracking-widest text-slate-400 uppercase">CURRENT</span>
              <span className="text-2xl font-black font-mono text-cyan-400 glow-cyan">
                {currentLapTime.toFixed(1)}s
              </span>
            </div>

            <div className="h-8 w-[1px] bg-slate-800" />

            <div className="flex flex-col items-center min-w-[70px]">
              <span className="text-[9px] font-mono tracking-widest text-slate-400 uppercase">BEST LAP</span>
              <span className="text-xl font-black font-mono text-purple-400">
                {bestLapTime ? `${bestLapTime.toFixed(1)}s` : '--.-s'}
              </span>
            </div>

            <div className="h-8 w-[1px] bg-slate-800" />

            <div className="flex flex-col items-center">
              <span className="text-[9px] font-mono tracking-widest text-slate-400 uppercase">SCORE</span>
              <span className="text-2xl font-black font-mono text-amber-400">{score}</span>
            </div>
          </div>

          {/* Checkpoint status bar */}
          <div className="mt-2 flex gap-1">
            {[0, 1, 2].map((idx) => (
              <span 
                key={idx}
                className={`text-[9px] px-2 py-0.5 rounded-full font-black font-mono border transition-all ${
                  checkpointsPassed[idx] 
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' 
                    : 'bg-slate-900/40 text-slate-500 border-slate-800'
                }`}
              >
                S{idx+1}
              </span>
            ))}
          </div>
        </div>

        {/* Top-Right: Sound & View controls */}
        <div className="flex gap-2 pointer-events-auto">
          {/* Mute Button */}
          <button 
            onClick={() => setIsMuted(!isMuted)}
            className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-600 transition-all active:scale-95"
            title={isMuted ? "Unmute sound" : "Mute sound"}
          >
            {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>

          {/* Camera View Switcher */}
          <button 
            onClick={() => {
              const views: ('chase' | 'retro' | 'cockpit')[] = ['chase', 'retro', 'cockpit'];
              const nextIdx = (views.indexOf(cameraView) + 1) % views.length;
              setCameraView(views[nextIdx]);
              triggerNotification(`CAMERA: ${views[nextIdx].toUpperCase()} VIEW`);
            }}
            className="flex items-center gap-2 px-4 py-3 rounded-xl bg-slate-900/90 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-600 transition-all active:scale-95"
            title="Switch camera angle (V)"
          >
            <Eye size={18} />
            <span className="text-xs font-bold font-mono tracking-wide hidden md:inline uppercase">{cameraView} VIEW</span>
          </button>
        </div>

      </div>

      {/* MIDDLE NOTIFICATION ELEMENT */}
      <AnimatePresence>
        {showNotification && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.8, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed top-1/4 left-1/2 -translate-x-1/2 z-30 pointer-events-none px-6 py-3 rounded-2xl bg-slate-950/95 border border-cyan-500/40 shadow-xl"
          >
            <span className="text-lg font-black tracking-wider text-cyan-400 glow-cyan uppercase font-mono">
              {showNotification}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MIDDLE SCREEN OVERLAYS: Countdown / Finished */}
      <AnimatePresence mode="wait">
        {gameState === 'countdown' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-40 bg-slate-950/80 backdrop-blur-md flex flex-col justify-center items-center"
          >
            <motion.div 
              key={countdown}
              initial={{ scale: 0.2, opacity: 0 }}
              animate={{ scale: 1.2, opacity: 1 }}
              exit={{ scale: 2.2, opacity: 0 }}
              transition={{ duration: 0.8 }}
              className="text-8xl md:text-9xl font-black font-mono text-cyan-400 glow-cyan"
            >
              {countdown > 0 ? countdown : 'START!'}
            </motion.div>
            <p className="text-slate-400 mt-8 text-sm uppercase tracking-widest font-mono font-medium animate-pulse">
              {countdown > 0 ? 'Prepare your vehicle...' : 'Go Go Go!'}
            </p>
          </motion.div>
        )}

        {gameState === 'finished' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-40 bg-slate-950/90 backdrop-blur-lg flex flex-col justify-center items-center p-6"
          >
            <motion.div 
              initial={{ y: -40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 flex flex-col items-center text-center shadow-2xl relative overflow-hidden"
            >
              {/* Decorative radial lighting */}
              <div className="absolute -top-16 -left-16 w-32 h-32 bg-emerald-500/20 rounded-full blur-2xl" />
              <div className="absolute -bottom-16 -right-16 w-32 h-32 bg-blue-500/20 rounded-full blur-2xl" />

              <div className="p-4 rounded-full bg-emerald-500/10 text-emerald-400 mb-6 border border-emerald-500/20 scale-110">
                <Trophy size={48} className="animate-bounce" />
              </div>

              <h2 className="text-3xl font-black tracking-tight text-white mb-2 font-sans">Race Finished!</h2>
              <p className="text-slate-400 text-sm mb-6">You've successfully conquered the Neon Serpentine Circuit.</p>

              {/* Score and Time breakdowns */}
              <div className="w-full space-y-3 bg-slate-950/80 rounded-2xl p-4 border border-slate-800 mb-8 font-mono text-sm">
                <div className="flex justify-between items-center text-slate-400">
                  <span>TOTAL SCORE:</span>
                  <span className="text-emerald-400 font-bold text-base">{score} PTS</span>
                </div>
                <div className="h-[1px] bg-slate-800/80 w-full" />
                <div className="flex justify-between items-center text-slate-400">
                  <span>BEST LAP TIME:</span>
                  <span className="text-cyan-400 font-bold">
                    {bestLapTime ? `${bestLapTime.toFixed(2)}s` : '--.-s'}
                  </span>
                </div>
                <div className="h-[1px] bg-slate-800/80 w-full" />
                <div className="text-left text-xs text-slate-500 mb-2 font-semibold">ALL LAPS:</div>
                {lapTimes.map((t, index) => (
                  <div key={index} className="flex justify-between items-center text-xs text-slate-400 pl-2">
                    <span>LAP {index + 1}:</span>
                    <span>{t.toFixed(2)}s</span>
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-4 w-full">
                <button
                  onClick={handleRestart}
                  className="flex items-center justify-center gap-2 py-3 px-5 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 hover:text-white hover:bg-slate-700 transition-all font-bold active:scale-95"
                >
                  <RotateCcw size={16} />
                  <span>Retry</span>
                </button>
                <button
                  onClick={onClose}
                  className="flex items-center justify-center gap-2 py-3 px-5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white shadow-lg transition-all font-bold active:scale-95"
                >
                  <ArrowLeft size={16} />
                  <span>Portfolio</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* BOTTOM HUD PANEL: Speedometer, Nitro gauge, and Virtual Touch Gamepad Controls */}
      <div className="relative z-10 w-full p-4 md:p-6 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent flex flex-col md:flex-row justify-between items-end gap-6 pointer-events-none">
        
        {/* Bottom Left: Speedometer Dial & Nitro Charge */}
        <div className="flex items-center gap-6 bg-slate-950/85 backdrop-blur-xl border border-slate-800 rounded-3xl px-6 py-4 shadow-xl pointer-events-auto min-w-[260px] max-w-sm w-full md:w-auto">
          
          {/* Radial speed circle indicator */}
          <div className="relative flex items-center justify-center w-16 h-16">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="32" cy="32" r="28" fill="transparent" stroke="#1e293b" strokeWidth="5" />
              <circle 
                cx="32" 
                cy="32" 
                r="28" 
                fill="transparent" 
                stroke="#22d3ee" 
                strokeWidth="5" 
                strokeDasharray="175"
                strokeDashoffset={175 - (175 * Math.min(speed, 150)) / 150}
                className="transition-all duration-100 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col justify-center items-center">
              <span className="text-xl font-black font-mono tracking-tight text-white leading-none">
                {Math.round(speed)}
              </span>
              <span className="text-[7px] text-slate-500 font-bold">KM/H</span>
            </div>
          </div>

          <div className="flex-1 flex flex-col gap-2">
            <div className="flex justify-between items-baseline">
              <span className="text-[9px] font-mono tracking-widest text-slate-400 font-bold uppercase flex items-center gap-1">
                <Flame size={10} className="text-orange-500 animate-pulse" /> NITRO BOOST [Shift]
              </span>
              <span className={`text-xs font-mono font-bold ${nitro < 30 ? 'text-rose-400 animate-pulse' : 'text-orange-400'}`}>
                {Math.round(nitro)}%
              </span>
            </div>
            
            {/* Nitro bar progress */}
            <div className="h-3 w-full bg-slate-900 border border-slate-800 rounded-full overflow-hidden p-[2px]">
              <div 
                className={`h-full rounded-full transition-all duration-150 ${
                  nitro > 50 
                    ? 'bg-gradient-to-r from-orange-500 to-amber-400' 
                    : 'bg-rose-500'
                }`}
                style={{ width: `${nitro}%` }}
              />
            </div>
          </div>
        </div>

        {/* Bottom Right: Responsive Gamepad Touch Controls (操作しやすいようにして) */}
        <div className="pointer-events-auto flex justify-between items-center w-full md:w-auto gap-8 max-w-md">
          
          {/* D-PAD Left / Right steer */}
          <div className="flex gap-2">
            <button
              onMouseDown={() => handleTouchStart('left')}
              onMouseUp={() => handleTouchEnd('left')}
              onMouseLeave={() => handleTouchEnd('left')}
              onTouchStart={() => handleTouchStart('left')}
              onTouchEnd={() => handleTouchEnd('left')}
              className="w-14 h-14 rounded-2xl bg-slate-900/90 hover:bg-slate-800 active:bg-brand-500/20 active:scale-90 border border-slate-800 active:border-brand-500/40 text-slate-300 active:text-white flex items-center justify-center select-none shadow-lg touch-none transition-transform"
              title="Steer Left [A]"
            >
              <Navigation size={22} className="-rotate-90" />
            </button>
            <button
              onMouseDown={() => handleTouchStart('right')}
              onMouseUp={() => handleTouchEnd('right')}
              onMouseLeave={() => handleTouchEnd('right')}
              onTouchStart={() => handleTouchStart('right')}
              onTouchEnd={() => handleTouchEnd('right')}
              className="w-14 h-14 rounded-2xl bg-slate-900/90 hover:bg-slate-800 active:bg-brand-500/20 active:scale-90 border border-slate-800 active:border-brand-500/40 text-slate-300 active:text-white flex items-center justify-center select-none shadow-lg touch-none transition-transform"
              title="Steer Right [D]"
            >
              <Navigation size={22} className="rotate-90" />
            </button>
          </div>

          {/* Special Buttons: Nitro and Handbrake Drift */}
          <div className="flex gap-2">
            <button
              onMouseDown={() => handleTouchStart('drift')}
              onMouseUp={() => handleTouchEnd('drift')}
              onMouseLeave={() => handleTouchEnd('drift')}
              onTouchStart={() => handleTouchStart('drift')}
              onTouchEnd={() => handleTouchEnd('drift')}
              className="px-4 h-14 rounded-2xl bg-indigo-950/70 border border-indigo-500/30 hover:bg-indigo-900 active:bg-indigo-500/30 active:scale-90 text-indigo-400 active:text-white flex flex-col items-center justify-center select-none shadow-lg touch-none transition-transform min-w-[70px]"
              title="Drift Skid [Space]"
            >
              <Sparkles size={16} />
              <span className="text-[9px] font-mono font-bold uppercase mt-1">Drift</span>
            </button>

            <button
              onMouseDown={() => handleTouchStart('boost')}
              onMouseUp={() => handleTouchEnd('boost')}
              onMouseLeave={() => handleTouchEnd('boost')}
              onTouchStart={() => handleTouchStart('boost')}
              onTouchEnd={() => handleTouchEnd('boost')}
              className="px-4 h-14 rounded-2xl bg-orange-950/70 border border-orange-500/30 hover:bg-orange-900 active:bg-orange-500/30 active:scale-90 text-orange-400 active:text-white flex flex-col items-center justify-center select-none shadow-lg touch-none transition-transform min-w-[70px]"
              title="Rocket Boost [Shift]"
            >
              <Zap size={16} />
              <span className="text-[9px] font-mono font-bold uppercase mt-1">Boost</span>
            </button>
          </div>

          {/* Accelerator Gas & Reverse Brake */}
          <div className="flex gap-2">
            <button
              onMouseDown={() => handleTouchStart('backward')}
              onMouseUp={() => handleTouchEnd('backward')}
              onMouseLeave={() => handleTouchEnd('backward')}
              onTouchStart={() => handleTouchStart('backward')}
              onTouchEnd={() => handleTouchEnd('backward')}
              className="w-14 h-14 rounded-2xl bg-rose-950/60 hover:bg-rose-900 active:bg-rose-500/20 active:scale-90 border border-rose-900/30 active:border-rose-500/50 text-rose-400 active:text-rose-200 flex flex-col items-center justify-center select-none shadow-lg touch-none transition-transform"
              title="Brake / Reverse [S]"
            >
              <span className="text-[9px] font-mono font-black uppercase">BRAKE</span>
              <span className="text-[8px] opacity-60">S</span>
            </button>
            <button
              onMouseDown={() => handleTouchStart('forward')}
              onMouseUp={() => handleTouchEnd('forward')}
              onMouseLeave={() => handleTouchEnd('forward')}
              onTouchStart={() => handleTouchStart('forward')}
              onTouchEnd={() => handleTouchEnd('forward')}
              className="w-16 h-16 rounded-2xl bg-emerald-900/60 hover:bg-emerald-800 active:bg-emerald-500/20 active:scale-90 border border-emerald-500/40 active:border-emerald-500/60 text-emerald-300 active:text-emerald-100 flex flex-col items-center justify-center select-none shadow-lg touch-none transition-transform"
              title="Accelerate [W]"
            >
              <span className="text-xs font-black font-mono uppercase">GAS</span>
              <span className="text-[9px] opacity-60">W</span>
            </button>
          </div>

        </div>

      </div>

    </div>
  );
}

// --- 3D CANVAS WORLD COMPONENT ---
interface SceneProps {
  gameState: 'countdown' | 'playing' | 'finished';
  carState: React.MutableRefObject<{
    x: number;
    y: number;
    z: number;
    angle: number;
    speed: number;
    isBoosting: boolean;
    isDrifting: boolean;
    totalDistance: number;
  }>;
  keys: React.MutableRefObject<{
    forward: boolean;
    backward: boolean;
    left: boolean;
    right: boolean;
    drift: boolean;
    boost: boolean;
  }>;
  cameraView: 'chase' | 'retro' | 'cockpit';
  activeCollectibles: Collectible[];
  setActiveCollectibles: React.Dispatch<React.SetStateAction<Collectible[]>>;
  onUpdateHUD: (speed: number, nitro: number) => void;
  onPassCheckpoint: (index: number) => void;
  onPassStartLine: () => void;
  onCollectStar: () => void;
  onBoostPad: () => void;
}

function Scene({
  gameState,
  carState,
  keys,
  cameraView,
  activeCollectibles,
  setActiveCollectibles,
  onUpdateHUD,
  onPassCheckpoint,
  onPassStartLine,
  onCollectStar,
  onBoostPad
}: SceneProps) {
  const { camera } = useThree();
  const carMeshRef = useRef<THREE.Group>(null);
  const wheelsRef = useRef<THREE.Mesh[]>([]);
  const nitroCharge = useRef(100);
  const boostPadCooldown = useRef(0);
  const activeBoostEffects = useRef(0);

  // Road geometry cache - smooth ribbon mesh
  const roadGeometry = useMemo(() => {
    const segments = 120;
    const vertices: number[] = [];
    const indices: number[] = [];
    const uvs: number[] = [];

    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const point = trackCurve.getPointAt(t % 1);
      const tangent = trackCurve.getTangentAt(t % 1);
      const up = new THREE.Vector3(0, 1, 0);
      const normal = tangent.clone().cross(up).normalize();

      const leftPoint = point.clone().add(normal.clone().multiplyScalar(-TRACK_WIDTH / 2));
      const rightPoint = point.clone().add(normal.clone().multiplyScalar(TRACK_WIDTH / 2));

      vertices.push(leftPoint.x, leftPoint.y, leftPoint.z);
      vertices.push(rightPoint.x, rightPoint.y, rightPoint.z);

      uvs.push(0, t * 20);
      uvs.push(1, t * 20);

      if (i < segments) {
        const row = i * 2;
        indices.push(row, row + 1, row + 2);
        indices.push(row + 1, row + 3, row + 2);
      }
    }

    const geom = new THREE.BufferGeometry();
    geom.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geom.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geom.setIndex(indices);
    geom.computeVertexNormals();
    return geom;
  }, []);

  // Sidewall barrier lines
  const barrierPoints = useMemo(() => {
    const leftBarrier: THREE.Vector3[] = [];
    const rightBarrier: THREE.Vector3[] = [];
    const centerline: THREE.Vector3[] = [];
    const segments = 120;

    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const point = trackCurve.getPointAt(t % 1);
      const tangent = trackCurve.getTangentAt(t % 1);
      const normal = tangent.clone().cross(new THREE.Vector3(0, 1, 0)).normalize();

      leftBarrier.push(point.clone().add(normal.clone().multiplyScalar(-TRACK_WIDTH / 2)));
      rightBarrier.push(point.clone().add(normal.clone().multiplyScalar(TRACK_WIDTH / 2)));
      centerline.push(point.clone());
    }
    return { leftBarrier, rightBarrier, centerline };
  }, []);

  // Core Frame Game Loop (Updates car position, calculates physics, updates camera)
  useFrame((_state, delta) => {
    const dt = Math.min(delta, 0.1);
    const car = carState.current;

    // 1. Vehicle Physics Engine
    if (gameState === 'playing') {
      let acceleration = 0;
      if (keys.current.forward) acceleration += 0.015;
      if (keys.current.backward) acceleration -= 0.01;

      // Handle Boost Pads Cooldown
      if (boostPadCooldown.current > 0) {
        boostPadCooldown.current -= dt;
      }

      // Check Nitro Speed Boost
      let isBoostingNow = false;
      if (keys.current.boost && nitroCharge.current > 2 && keys.current.forward) {
        acceleration += 0.025;
        nitroCharge.current = Math.max(0, nitroCharge.current - dt * 35);
        isBoostingNow = true;
      } else {
        // Slowly recharge nitro
        nitroCharge.current = Math.min(100, nitroCharge.current + dt * 4.5);
      }
      car.isBoosting = isBoostingNow;

      // Handle Drifting
      const isDriftKey = keys.current.drift;
      car.isDrifting = isDriftKey && Math.abs(car.speed) > 0.15;

      // Applying friction and drag
      if (car.isDrifting) {
        car.speed *= 0.968; // Lose speed while drifting
      } else if (acceleration === 0) {
        car.speed *= 0.96; // Rolling drag
      }

      car.speed += acceleration;

      // Clamp max velocities
      const maxSpd = isBoostingNow ? 0.95 : activeBoostEffects.current > 0 ? 1.1 : 0.65;
      const maxRev = -0.25;
      if (car.speed > maxSpd) car.speed = maxSpd;
      if (car.speed < maxRev) car.speed = maxRev;

      // Steering calculations
      if (Math.abs(car.speed) > 0.01) {
        const steeringDirection = car.speed > 0 ? 1 : -1;
        // Turn rate goes up in slide/drift!
        const steerFactor = (car.isDrifting ? 0.065 : 0.042) + (0.012 * Math.min(Math.abs(car.speed) * 3, 1));
        
        if (keys.current.left) car.angle += steerFactor * steeringDirection;
        if (keys.current.right) car.angle -= steerFactor * steeringDirection;
      }

      // Translate coordinates based on orientation angle
      car.x -= Math.sin(car.angle) * car.speed * 60 * dt;
      car.z -= Math.cos(car.angle) * car.speed * 60 * dt;

      // Track relative path parameters (useful for lap tracing & boundary safety) - using 2D projection for perfect stability
      const carPos2D = new THREE.Vector3(car.x, 0, car.z);
      
      // Look for closest spline point to prevent flying out of track
      let closestT = 0;
      let minDistance = Infinity;
      let closestPt = new THREE.Vector3();
      const searchResolution = 150;
      for (let i = 0; i < searchResolution; i++) {
        const tempT = i / searchResolution;
        const pt = trackCurve.getPointAt(tempT);
        const pt2D = new THREE.Vector3(pt.x, 0, pt.z);
        const dist = carPos2D.distanceTo(pt2D);
        if (dist < minDistance) {
          minDistance = dist;
          closestT = tempT;
          closestPt = pt;
        }
      }

      // Update car's vertical height to match the track's vertical profile (fixes the sinking car bug)
      car.y = closestPt.y;

      // Keep car within track bounds (soft constraint: slow down. hard constraint: bounce/push back)
      const maxAllowedDist = TRACK_WIDTH / 2 - CAR_RADIUS;
      if (minDistance > maxAllowedDist) {
        // Push car back onto track
        const toTrack = closestPt.clone().sub(carPos2D);
        toTrack.y = 0;
        toTrack.normalize();
        
        const pushForce = (minDistance - maxAllowedDist) * 1.05;
        car.x += toTrack.x * pushForce;
        car.z += toTrack.z * pushForce;

        // Reduce speed due to high barrier crash
        car.speed *= -0.4; // Bounce backwards!
      }

      // Check Checkpoints (t values)
      if (closestT > 0.22 && closestT < 0.28) onPassCheckpoint(0);
      if (closestT > 0.47 && closestT < 0.53) onPassCheckpoint(1);
      if (closestT > 0.72 && closestT < 0.78) onPassCheckpoint(2);

      // Check Start/Finish Line trigger (around t = 0 / 1.0)
      // Car crosses from sector 3 to start
      if (closestT > 0.96 || closestT < 0.04) {
        if (car.totalDistance > 10) {
          onPassStartLine();
          car.totalDistance = 0;
        }
      } else {
        car.totalDistance += Math.abs(car.speed);
      }

      // Check Collectibles collisions (using forgiving 2D checking so they are always reachable)
      activeCollectibles.forEach((item) => {
        if (!item.collected) {
          const itemPos2D = new THREE.Vector3(item.position.x, 0, item.position.z);
          const dist = carPos2D.distanceTo(itemPos2D);
          if (dist < 2.5) { // Wider collection range for widened track
            item.collected = true;
            onCollectStar();
            // Trigger confetti/particle flash visually
            setActiveCollectibles([...activeCollectibles]);
          }
        }
      });

      // Check Boost Pads
      if (boostPadCooldown.current <= 0) {
        BOOST_PADS_PARAMS.forEach((tVal) => {
          const padPos = trackCurve.getPointAt(tVal);
          const padPos2D = new THREE.Vector3(padPos.x, 0, padPos.z);
          const dist = carPos2D.distanceTo(padPos2D);
          if (dist < 4.0) { // Wider boost pad touch range for widened track
            car.speed = 1.15; // Mega speed burst
            boostPadCooldown.current = 1.2;
            onBoostPad();
          }
        });
      }

      // Sync speedometer velocity count
      onUpdateHUD(car.speed * 180, nitroCharge.current);
    }

    // 2. Synchronize 3D mesh position
    if (carMeshRef.current) {
      carMeshRef.current.position.set(car.x, car.y + 0.22, car.z);
      carMeshRef.current.rotation.y = car.angle;

      // Animate wheels turning and rotating
      wheelsRef.current.forEach((wheel, index) => {
        if (wheel) {
          // Rotate around wheel axis based on speed
          wheel.rotation.x += car.speed * 0.8;
          
          // Front steering wheels rotation
          if (index < 2) {
            let targetTurn = 0;
            if (keys.current.left) targetTurn = 0.32;
            if (keys.current.right) targetTurn = -0.32;
            wheel.rotation.y = THREE.MathUtils.lerp(wheel.rotation.y, targetTurn, 0.15);
          }
        }
      });
    }

    // 3. Dynamic Trailing Chase Camera Views
    if (carMeshRef.current) {
      if (cameraView === 'chase') {
        // Standard high-speed third person trail camera
        const targetCamX = car.x + Math.sin(car.angle) * 7.5;
        const targetCamZ = car.z + Math.cos(car.angle) * 7.5;
        const targetCamY = car.y + 3.4 + (car.speed * 1.8); // Pulls up at higher speed

        camera.position.x = THREE.MathUtils.lerp(camera.position.x, targetCamX, 0.1);
        camera.position.y = THREE.MathUtils.lerp(camera.position.y, targetCamY, 0.1);
        camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetCamZ, 0.1);

        // Look at point slightly in front of the car
        const lookTarget = new THREE.Vector3(
          car.x - Math.sin(car.angle) * 2.5,
          car.y + 0.8,
          car.z - Math.cos(car.angle) * 2.5
        );
        camera.lookAt(lookTarget);
      } else if (cameraView === 'retro') {
        // Top-down retro dynamic overhead view
        const targetCamX = car.x;
        const targetCamZ = car.z + 12;
        const targetCamY = 17.5;

        camera.position.x = THREE.MathUtils.lerp(camera.position.x, targetCamX, 0.1);
        camera.position.y = THREE.MathUtils.lerp(camera.position.y, targetCamY, 0.1);
        camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetCamZ, 0.1);
        
        camera.lookAt(new THREE.Vector3(car.x, car.y, car.z - 2.0));
      } else if (cameraView === 'cockpit') {
        // Inside/Front bonnet windshield view
        const headX = car.x - Math.sin(car.angle) * 0.4;
        const headY = car.y + 0.55;
        const headZ = car.z - Math.cos(car.angle) * 0.4;

        camera.position.set(headX, headY, headZ);

        const lookAtX = car.x - Math.sin(car.angle) * 12;
        const lookAtY = car.y + 0.35;
        const lookAtZ = car.z - Math.cos(car.angle) * 12;
        camera.lookAt(new THREE.Vector3(lookAtX, lookAtY, lookAtZ));
      }
    }
  });

  return (
    <>
      {/* Immersive space skybox environment */}
      <color attach="background" args={['#030712']} />
      <fog attach="fog" args={['#030712', 30, 85]} />
      <Stars radius={100} depth={50} count={3500} factor={4} saturation={0.5} fade speed={1.5} />

      {/* Atmospheric lighting - significantly enhanced to ensure high visibility */}
      <ambientLight intensity={0.85} color="#c7d2fe" />
      <directionalLight 
        position={[30, 45, 30]} 
        intensity={2.5} 
        color="#e0e7ff" 
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
      <hemisphereLight intensity={0.55} color="#ffffff" groundColor="#1e1b4b" />
      <pointLight position={[0, 20, 0]} intensity={3.5} color="#06b6d4" distance={150} />

      {/* Racetrack surface mesh - brighter, slicker, with light reflective qualities */}
      <mesh geometry={roadGeometry} receiveShadow position={[0, 0.01, 0]}>
        <meshStandardMaterial 
          color="#202942" 
          emissive="#121829"
          emissiveIntensity={0.65}
          roughness={0.4} 
          metalness={0.3}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Glowing centerline divider (guided road safety) */}
      <Line 
        points={barrierPoints.centerline} 
        color="#facc15" 
        lineWidth={1.8} 
        position={[0, 0.04, 0]} 
      />

      {/* Glowing boundary barriers - significantly thicker and brighter to prevent invisible collisions */}
      <Line 
        points={barrierPoints.leftBarrier} 
        color="#22d3ee" 
        lineWidth={5.0} 
        position={[0, BARRIER_HEIGHT, 0]} 
      />
      <Line 
        points={barrierPoints.rightBarrier} 
        color="#c084fc" 
        lineWidth={5.0} 
        position={[0, BARRIER_HEIGHT, 0]} 
      />

      {/* Golden checkpoints (Gates) */}
      {CHECKPOINT_T.map((tVal: number, index: number) => {
        const point = trackCurve.getPointAt(tVal);
        const tangent = trackCurve.getTangentAt(tVal);
        const angle = Math.atan2(tangent.x, tangent.z);
        return (
          <group key={index} position={[point.x, point.y + 1.5, point.z]} rotation={[0, angle + Math.PI / 2, 0]}>
            {/* Gate pillars - Glowing & Highly Visible */}
            <mesh position={[-TRACK_WIDTH / 2 - 0.2, -0.7, 0]} castShadow>
              <cylinderGeometry args={[0.15, 0.15, 1.8, 8]} />
              <meshStandardMaterial 
                color="#f43f5e" 
                emissive="#f43f5e"
                emissiveIntensity={1.2}
                roughness={0.2} 
                metalness={0.8} 
              />
            </mesh>
            {/* Left pillar neon ring */}
            <mesh position={[-TRACK_WIDTH / 2 - 0.2, -0.3, 0]}>
              <torusGeometry args={[0.2, 0.04, 8, 24]} />
              <meshBasicMaterial color="#f43f5e" toneMapped={false} />
            </mesh>

            <mesh position={[TRACK_WIDTH / 2 + 0.2, -0.7, 0]} castShadow>
              <cylinderGeometry args={[0.15, 0.15, 1.8, 8]} />
              <meshStandardMaterial 
                color="#f43f5e" 
                emissive="#f43f5e"
                emissiveIntensity={1.2}
                roughness={0.2} 
                metalness={0.8} 
              />
            </mesh>
            {/* Right pillar neon ring */}
            <mesh position={[TRACK_WIDTH / 2 + 0.2, -0.3, 0]}>
              <torusGeometry args={[0.2, 0.04, 8, 24]} />
              <meshBasicMaterial color="#f43f5e" toneMapped={false} />
            </mesh>

            {/* Gate Arch Header */}
            <mesh position={[0, 0.3, 0]} castShadow>
              <boxGeometry args={[TRACK_WIDTH + 0.6, 0.3, 0.4]} />
              <meshStandardMaterial 
                color="#06b6d4" 
                emissive="#0891b2"
                emissiveIntensity={1.0}
                roughness={0.1}
              />
            </mesh>
            {/* Glowing neon checkpoint plate */}
            <mesh position={[0, 0.3, 0.21]}>
              <boxGeometry args={[TRACK_WIDTH - 1.5, 0.15, 0.02]} />
              <meshBasicMaterial color="#38bdf8" toneMapped={false} />
            </mesh>
          </group>
        );
      })}

      {/* Start / Finish banner arch */}
      {(() => {
        const pt = trackCurve.getPointAt(0);
        const tangent = trackCurve.getTangentAt(0);
        const angle = Math.atan2(tangent.x, tangent.z);
        return (
          <group position={[pt.x, pt.y + 1.8, pt.z]} rotation={[0, angle + Math.PI/2, 0]}>
            {/* Massive arch support - Vibrant, luminous, and clear */}
            <mesh position={[-TRACK_WIDTH / 2 - 0.4, -0.9, 0]} castShadow>
              <cylinderGeometry args={[0.22, 0.22, 2.2, 8]} />
              <meshStandardMaterial 
                color="#a855f7" 
                emissive="#a855f7"
                emissiveIntensity={1.5}
                roughness={0.1} 
                metalness={0.9} 
              />
            </mesh>
            {/* Left pillar giant ring */}
            <mesh position={[-TRACK_WIDTH / 2 - 0.4, -0.4, 0]}>
              <torusGeometry args={[0.3, 0.05, 8, 24]} />
              <meshBasicMaterial color="#a855f7" toneMapped={false} />
            </mesh>

            <mesh position={[TRACK_WIDTH / 2 + 0.4, -0.9, 0]} castShadow>
              <cylinderGeometry args={[0.22, 0.22, 2.2, 8]} />
              <meshStandardMaterial 
                color="#a855f7" 
                emissive="#a855f7"
                emissiveIntensity={1.5}
                roughness={0.1} 
                metalness={0.9} 
              />
            </mesh>
            {/* Right pillar giant ring */}
            <mesh position={[TRACK_WIDTH / 2 + 0.4, -0.4, 0]}>
              <torusGeometry args={[0.3, 0.05, 8, 24]} />
              <meshBasicMaterial color="#a855f7" toneMapped={false} />
            </mesh>

            <mesh position={[0, 0.4, 0]} castShadow>
              <boxGeometry args={[TRACK_WIDTH + 1.2, 0.45, 0.6]} />
              <meshStandardMaterial 
                color="#6366f1" 
                emissive="#4f46e5"
                emissiveIntensity={1.0}
                roughness={0.1} 
                metalness={0.9} 
              />
            </mesh>
            {/* Neon START Banner glowing bar */}
            <mesh position={[0, 0.4, 0.31]}>
              <boxGeometry args={[3.0, 0.2, 0.02]} />
              <meshBasicMaterial color="#a855f7" toneMapped={false} />
            </mesh>
          </group>
        );
      })()}

      {/* Gold stars to collect */}
      {activeCollectibles.map((item) => {
        if (item.collected) return null;
        return (
          <group key={item.id} position={[item.position.x, item.position.y, item.position.z]}>
            <GoldStar />
          </group>
        );
      })}

      {/* Boost pads along track */}
      {BOOST_PADS_PARAMS.map((tVal, index) => {
        const pos = trackCurve.getPointAt(tVal);
        const tangent = trackCurve.getTangentAt(tVal);
        const angle = Math.atan2(tangent.x, tangent.z);
        return (
          <group key={index} position={[pos.x, pos.y + 0.05, pos.z]} rotation={[-Math.PI / 2, 0, -angle]}>
            {/* Glowing booster chevron geometry */}
            <mesh receiveShadow>
              <planeGeometry args={[2.5, 1.8]} />
              <meshBasicMaterial color="#eab308" transparent opacity={0.65} side={THREE.DoubleSide} />
            </mesh>
            {/* Glowing borders */}
            <Line points={[new THREE.Vector3(-1.25, -0.9, 0), new THREE.Vector3(0, 0.9, 0), new THREE.Vector3(1.25, -0.9, 0)]} color="#facc15" lineWidth={2} />
          </group>
        );
      })}

      {/* Modern Cyber Car Miniature Mesh */}
      <group ref={carMeshRef}>
        <MiniCar 
          isBoosting={carState.current.isBoosting}
          isDrifting={carState.current.isDrifting}
          onWheelRef={(wEl, idx) => {
            if (wEl) wheelsRef.current[idx] = wEl;
          }}
        />
      </group>

      {/* Surrounding City Neon Scenery (Futuristic skyscrapers backdrop) */}
      <CityScenery />
    </>
  );
}

// --- SUB-MESH: ROTATING COLLIDING GOLD STAR ---
function GoldStar() {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.04;
      // Hovering wave height
      meshRef.current.position.y = Math.sin(state.clock.getElapsedTime() * 4.0) * 0.12;
    }
  });

  return (
    <mesh ref={meshRef} castShadow>
      <octahedronGeometry args={[0.35, 0]} />
      <meshStandardMaterial 
        color="#eab308" 
        emissive="#ca8a04"
        emissiveIntensity={1.5}
        roughness={0.05} 
        metalness={0.9} 
      />
    </mesh>
  );
}

// --- SUB-MESH: MINI CAR DESIGN ---
interface MiniCarProps {
  isBoosting: boolean;
  isDrifting: boolean;
  onWheelRef: (el: THREE.Mesh | null, idx: number) => void;
}

function MiniCar({ isBoosting, isDrifting, onWheelRef }: MiniCarProps) {
  const exhaustFlameRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (exhaustFlameRef.current) {
      // Dynamic scaling for exhaust fire
      const pulse = 1.0 + Math.sin(state.clock.getElapsedTime() * 30) * 0.35;
      exhaustFlameRef.current.scale.set(
        pulse, 
        pulse, 
        isBoosting ? 2.5 : 0.8
      );
      exhaustFlameRef.current.visible = isBoosting || Math.random() > 0.4;
    }
  });

  return (
    <group>
      {/* Dynamic Headlight Projection - Illuminates road and obstacles directly in front of the car */}
      <spotLight 
        position={[0, 0.22, -0.85]} 
        angle={Math.PI / 3.2} 
        penumbra={0.5} 
        intensity={6.0} 
        distance={24} 
        color="#ffffff" 
        castShadow
        shadow-mapSize={[512, 512]}
      />

      {/* Dynamic Underglow Light Source - Casts bright ambient pool on the road */}
      <pointLight 
        position={[0, -0.08, 0]} 
        intensity={4.5} 
        distance={7.5} 
        color={isDrifting ? "#d8b4fe" : "#22d3ee"} 
      />

      {/* Main Body Chassis - Highly reflective and self-emissive */}
      <mesh castShadow receiveShadow position={[0, 0.1, 0]}>
        <boxGeometry args={[0.9, 0.25, 1.6]} />
        <meshStandardMaterial 
          color="#818cf8" 
          emissive="#312e81"
          emissiveIntensity={0.6}
          roughness={0.05} 
          metalness={0.9} 
        />
      </mesh>

      {/* Front Hood Scoop */}
      <mesh position={[0, 0.18, -0.4]} castShadow>
        <boxGeometry args={[0.7, 0.1, 0.6]} />
        <meshStandardMaterial 
          color="#6366f1" 
          emissive="#1e1b4b"
          emissiveIntensity={0.5}
          roughness={0.05} 
          metalness={0.95} 
        />
      </mesh>

      {/* Glowing Neon Cockpit Bubble */}
      <mesh position={[0, 0.26, 0.05]} castShadow>
        <sphereGeometry args={[0.35, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial 
          color="#22d3ee" 
          emissive="#0891b2"
          emissiveIntensity={0.8}
          transparent 
          opacity={0.85} 
          roughness={0.01} 
          metalness={0.98}
        />
      </mesh>

      {/* Cyber wing spoiler */}
      <mesh position={[0, 0.3, 0.68]} castShadow>
        <boxGeometry args={[1.05, 0.05, 0.25]} />
        <meshStandardMaterial 
          color="#c084fc" 
          emissive="#581c87"
          emissiveIntensity={0.6}
          roughness={0.1} 
          metalness={0.8} 
        />
      </mesh>
      {/* Spoiler mounts */}
      <mesh position={[-0.38, 0.18, 0.65]} castShadow>
        <boxGeometry args={[0.05, 0.2, 0.05]} />
        <meshStandardMaterial color="#4f46e5" />
      </mesh>
      <mesh position={[0.38, 0.18, 0.65]} castShadow>
        <boxGeometry args={[0.05, 0.2, 0.05]} />
        <meshStandardMaterial color="#4f46e5" />
      </mesh>

      {/* Headlights */}
      <mesh position={[-0.32, 0.12, -0.81]}>
        <boxGeometry args={[0.15, 0.06, 0.02]} />
        <meshBasicMaterial color="#22d3ee" toneMapped={false} />
      </mesh>
      <mesh position={[0.32, 0.12, -0.81]}>
        <boxGeometry args={[0.15, 0.06, 0.02]} />
        <meshBasicMaterial color="#22d3ee" toneMapped={false} />
      </mesh>

      {/* Taillights */}
      <mesh position={[-0.32, 0.12, 0.81]}>
        <boxGeometry args={[0.18, 0.05, 0.02]} />
        <meshBasicMaterial color="#f43f5e" toneMapped={false} />
      </mesh>
      <mesh position={[0.32, 0.12, 0.81]}>
        <boxGeometry args={[0.18, 0.05, 0.02]} />
        <meshBasicMaterial color="#f43f5e" toneMapped={false} />
      </mesh>

      {/* Underglow bar */}
      <mesh position={[0, -0.01, 0]}>
        <boxGeometry args={[0.7, 0.01, 1.2]} />
        <meshBasicMaterial color={isDrifting ? "#c084fc" : "#22d3ee"} toneMapped={false} />
      </mesh>

      {/* Wheels - Brighter gray tires with sleek design */}
      {/* Front Left */}
      <mesh ref={(el) => onWheelRef(el, 0)} position={[-0.52, 0.04, -0.45]} castShadow>
        <cylinderGeometry args={[0.22, 0.22, 0.15, 12]} />
        <meshStandardMaterial color="#4b5563" roughness={0.7} />
      </mesh>
      {/* Front Right */}
      <mesh ref={(el) => onWheelRef(el, 1)} position={[0.52, 0.04, -0.45]} castShadow>
        <cylinderGeometry args={[0.22, 0.22, 0.15, 12]} />
        <meshStandardMaterial color="#4b5563" roughness={0.7} />
      </mesh>
      {/* Rear Left */}
      <mesh ref={(el) => onWheelRef(el, 2)} position={[-0.52, 0.04, 0.45]} castShadow>
        <cylinderGeometry args={[0.24, 0.24, 0.18, 12]} />
        <meshStandardMaterial color="#4b5563" roughness={0.7} />
      </mesh>
      {/* Rear Right */}
      <mesh ref={(el) => onWheelRef(el, 3)} position={[0.52, 0.04, 0.45]} castShadow>
        <cylinderGeometry args={[0.24, 0.24, 0.18, 12]} />
        <meshStandardMaterial color="#4b5563" roughness={0.7} />
      </mesh>

      {/* Rocket Boost exhaust flame */}
      <mesh ref={exhaustFlameRef} position={[0, 0.1, 0.85]} rotation={[Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.12, 0.45, 8]} />
        <meshBasicMaterial color={isBoosting ? "#f97316" : "#c084fc"} toneMapped={false} />
      </mesh>
    </group>
  );
}

// --- SUB-MESH: CYBERPUNK CITY FLOATING SKYLINE ---
function CityScenery() {
  const skyscrapers = useMemo(() => {
    const list = [];
    const count = 45;
    for (let i = 0; i < count; i++) {
      // Circle layout far outside the widened track boundaries to prevent collisions
      const angle = (i / count) * Math.PI * 2 + Math.random() * 0.12;
      const radius = 180 + Math.random() * 90; // Placed far out (original was 65-90)
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;

      const width = 6 + Math.random() * 10;
      const depth = 6 + Math.random() * 10;
      const height = 30 + Math.random() * 45; // Taller, magnificent distant towers

      // Select bright neon wireframe color
      const colors = ["#4f46e5", "#0ea5e9", "#7c3aed", "#ec4899", "#10b981"];
      const neonColor = colors[Math.floor(Math.random() * colors.length)];

      list.push({
        id: i,
        position: [x, height / 2 - 1.0, z] as [number, number, number],
        args: [width, height, depth] as [number, number, number],
        color: neonColor
      });
    }
    return list;
  }, []);

  return (
    <group>
      {/* Cyber ground grid expanded for the new distant horizons */}
      <gridHelper args={[600, 100, '#1e1b4b', '#0f172a']} position={[0, -0.05, 0]} />

      {/* Distant skyscrapers wireframes */}
      {skyscrapers.map((building) => (
        <group key={building.id} position={building.position}>
          {/* Main solid mass */}
          <mesh castShadow receiveShadow>
            <boxGeometry args={building.args} />
            <meshStandardMaterial 
              color="#020617" 
              roughness={0.9} 
              metalness={0.1}
            />
          </mesh>
          {/* Glowing Neon edges to form futuristic aesthetic */}
          <Line 
            points={[
              new THREE.Vector3(-building.args[0]/2, building.args[1]/2, -building.args[2]/2),
              new THREE.Vector3(building.args[0]/2, building.args[1]/2, -building.args[2]/2),
              new THREE.Vector3(building.args[0]/2, building.args[1]/2, building.args[2]/2),
              new THREE.Vector3(-building.args[0]/2, building.args[1]/2, building.args[2]/2),
              new THREE.Vector3(-building.args[0]/2, building.args[1]/2, -building.args[2]/2)
            ]}
            color={building.color}
            lineWidth={1.2}
            position={[0, 0, 0]}
          />
        </group>
      ))}
    </group>
  );
}
