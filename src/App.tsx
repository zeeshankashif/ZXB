/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useEffect, useState, useLayoutEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { 
  Volume2, 
  VolumeX, 
  ArrowDown, 
  Cpu, 
  ShieldCheck, 
  Layers, 
  Check, 
  X, 
  Sparkles, 
  Info,
  Clock,
  ArrowRight,
  Activity,
  Compass,
  Moon,
  Wrench,
  Sliders
} from 'lucide-react';
import WatchScene from './components/WatchScene';
import AudioEqualizer from './components/AudioEqualizer';
import { chronosAudio } from './utils/audio';
import { GEAR_SPECS, GENERAL_SPECS } from './utils/specs';

// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

export default function App() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const mouseCoords = useRef({ x: 0, y: 0 });

  // GSAP Driven 3D parameters (updates the canvas smoothly via mutable ref inside useFrame)
  const scrollParams = useRef({
    progress: 0,
    positionX: 0,
    positionY: 0,
    positionZ: 0,
    rotationX: 0.2, // subtle initial forward tilt
    rotationY: 0,
    rotationZ: 0,
    explosionZ: 0, // 0 initially (fully assembled)
    sapphireOpacity: 0.65,
  });

  // State managers
  const [activeSpecIndex, setActiveSpecIndex] = useState(0);
  const [audioActive, setAudioActive] = useState(false);
  const [isReserved, setIsReserved] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [reservationCode, setReservationCode] = useState('');

  // Interactive micro-states for the 6 new sections
  const [alloyType, setAlloyType] = useState<'carbine' | 'composite'>('carbine');
  const [calibrationMode, setCalibrationMode] = useState<'standard' | 'orbital' | 'high-torque'>('orbital');
  const [lunarDrift, setLunarDrift] = useState<number>(42);

  // Handle Mouse Hover Tilt coordinates
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Normalised mouse coordinates [-1.0 to 1.0]
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = -(e.clientY / window.innerHeight) * 2 + 1;
      mouseCoords.current = { x, y };
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Initialize Lenis Smooth Scroll Physics
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.8,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Luxurious exponential momentum curve
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1.02,
    });

    const updateLenis = (time: number) => {
      lenis.raf(time * 1000);
    };

    lenis.on('scroll', ScrollTrigger.update);

    gsap.ticker.add(updateLenis);
    gsap.ticker.lagSmoothing(0);

    return () => {
      lenis.destroy();
      gsap.ticker.remove(updateLenis);
    };
  }, []);

  // GSAP ScrollTrigger timeline configuration with 9 sequential visual steps
  useLayoutEffect(() => {
    // Select elements directly inside the component
    const sec1Content = '.sec1-content';
    const sec1Background = '.sec1-background-text';
    const sec2Content = '.sec2-content';
    const sec3Content = '.sec3-content';
    const sec4Content = '.sec4-content';
    const sec5Content = '.sec5-content';
    const sec6Content = '.sec6-content';
    const sec7Content = '.sec7-content';
    const sec8Content = '.sec8-content';
    const sec9Content = '.sec9-content';

    const ctx = gsap.context(() => {
      // Primary scroll-driven timeline with elite elastic physics scrubbing
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: scrollContainerRef.current,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 2.0, // Induces ultra-premium liquid momentum drag
          invalidateOnRefresh: true,
        }
      });

      // Linear progress bar update across total scroll length
      tl.to(scrollParams.current, {
        progress: 1.0,
        ease: 'none',
        duration: 8.0,
      }, 0);

      // --- PAGE 1 to PAGE 2 (Time 0.0 -> 1.0) ---
      // Fade out the Page 1 massive ambient watermark so it is not distracting as page 2 rises
      tl.to(sec1Background, {
        opacity: 0.005,
        scale: 1.15,
        ease: 'power2.inOut',
        duration: 0.5
      }, 0.5)
      // Watch parameters transform: subtle offset tilt (glides seamlessly over the full step 0.0 -> 1.0)
      .to(scrollParams.current, {
        positionX: -1.7,
        positionY: 0.1,
        positionZ: 0.5,
        rotationX: 0.95,
        rotationY: 0.65,
        rotationZ: -0.3,
        explosionZ: 0.2,
        sapphireOpacity: 0.75,
        ease: 'power1.inOut',
        duration: 1.0
      }, 0.0)
      // Transition Page 2 In - Triggers exactly as Page 2 enters bottom of viewport (0.5 -> 0.9)
      .fromTo(sec2Content,
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, ease: 'power3.out', duration: 0.4 },
        0.5
      );

      // --- PAGE 2 to PAGE 3 (Time 1.0 -> 2.0) ---
      // Watch parameters transform: Explosion z-dispersion (seamless glide over 1.0 -> 2.0)
      tl.to(scrollParams.current, {
        positionX: 2.1,
        positionY: -0.15,
        positionZ: 0.6,
        rotationX: 0.7,
        rotationY: -0.8,
        rotationZ: -0.15,
        explosionZ: 2.3,
        sapphireOpacity: 0.6,
        ease: 'power1.inOut',
        duration: 1.0
      }, 1.0)
      // Transition Page 3 In - Triggers exactly as Page 3 enters bottom of viewport (1.5 -> 1.9)
      .fromTo(sec3Content,
        { opacity: 0, x: -40 },
        { opacity: 1, x: 0, ease: 'power3.out', duration: 0.4 },
        1.5
      );

      // --- PAGE 3 to PAGE 4 (Time 2.0 -> 3.0) ---
      // Watch parameters transform: Deep titanium zoom-in (seamless glide over 2.0 -> 3.0)
      tl.to(scrollParams.current, {
        positionX: -1.9,
        positionY: -0.3,
        positionZ: 1.8,
        rotationX: 1.2,
        rotationY: -0.3,
        rotationZ: 0.5,
        explosionZ: 1.1,
        sapphireOpacity: 0.3,
        ease: 'power1.inOut',
        duration: 1.0
      }, 2.0)
      // Transition Page 4 In - Triggers exactly as Page 4 enters bottom of viewport (2.5 -> 2.9)
      .fromTo(sec4Content,
        { opacity: 0, x: 40 },
        { opacity: 1, x: 0, ease: 'power3.out', duration: 0.4 },
        2.5
      );

      // --- PAGE 4 to PAGE 5 (Time 3.0 -> 4.0) ---
      // Watch parameters transform: Extreme close up of gear clusters (seamless glide 3.0 -> 4.0)
      tl.to(scrollParams.current, {
        positionX: 1.8,
        positionY: 0.4,
        positionZ: 2.5,
        rotationX: -0.5,
        rotationY: 1.1,
        rotationZ: 0.8,
        explosionZ: 3.5,
        sapphireOpacity: 0.05,
        ease: 'power1.inOut',
        duration: 1.0
      }, 3.0)
      // Transition Page 5 In - Triggers exactly as Page 5 enters bottom of viewport (3.5 -> 3.9)
      .fromTo(sec5Content,
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, ease: 'power3.out', duration: 0.4 },
        3.5
      );

      // --- PAGE 5 to PAGE 6 (Time 4.0 -> 5.0) ---
      // Watch parameters transform: Symmetrical front face view (seamless glide 4.0 -> 5.0)
      tl.to(scrollParams.current, {
        positionX: -2.0,
        positionY: -0.1,
        positionZ: 1.2,
        rotationX: 0,
        rotationY: 0,
        rotationZ: 0,
        explosionZ: 0.8,
        sapphireOpacity: 0.15,
        ease: 'power1.inOut',
        duration: 1.0
      }, 4.0)
      // Transition Page 6 In - Triggers exactly as Page 6 enters bottom of viewport (4.5 -> 4.9)
      .fromTo(sec6Content,
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, ease: 'power3.out', duration: 0.4 },
        4.5
      );

      // --- PAGE 6 to PAGE 7 (Time 5.0 -> 6.0) ---
      // Watch parameters transform: Stellar moonphase rotation angles (seamless glide 5.0 -> 6.0)
      tl.to(scrollParams.current, {
        positionX: 1.7,
        positionY: 0.25,
        positionZ: 0.5,
        rotationX: -0.85,
        rotationY: -0.55,
        rotationZ: -1.2,
        explosionZ: 1.5,
        sapphireOpacity: 0.85,
        ease: 'power1.inOut',
        duration: 1.0
      }, 5.0)
      // Transition Page 7 In - Triggers exactly as Page 7 enters bottom of viewport (5.5 -> 5.9)
      .fromTo(sec7Content,
        { opacity: 0, x: 40 },
        { opacity: 1, x: 0, ease: 'power3.out', duration: 0.4 },
        5.5
      );

      // --- PAGE 7 to PAGE 8 (Time 6.0 -> 7.0) ---
      // Watch parameters transform: Audio feedback centered focus (seamless glide 6.0 -> 7.0)
      tl.to(scrollParams.current, {
        positionX: 0.0,
        positionY: -1.4,
        positionZ: 2.3,
        rotationX: 0.82,
        rotationY: -1.0,
        rotationZ: 0.25,
        explosionZ: 2.8,
        sapphireOpacity: 0.05,
        ease: 'power1.inOut',
        duration: 1.0
      }, 6.0)
      // Transition Page 8 In - Triggers exactly as Page 8 enters bottom of viewport (6.5 -> 6.9)
      .fromTo(sec8Content,
        { opacity: 0, x: -40 },
        { opacity: 1, x: 0, ease: 'power3.out', duration: 0.4 },
        6.5
      );

      // --- PAGE 8 to PAGE 9 (Time 7.0 -> 8.0) ---
      // Watch parameters transform: Reassembled checkout isometric state (seamless glide 7.0 -> 8.0)
      tl.to(scrollParams.current, {
        positionX: -2.3,
        positionY: 0.15,
        positionZ: 1.1,
        rotationX: 0.65,
        rotationY: -0.65,
        rotationZ: 0.1,
        explosionZ: 0.0, // Fully reassembled
        sapphireOpacity: 0.9,
        ease: 'power1.inOut',
        duration: 1.0
      }, 7.0)
      // Transition Page 9 In - Triggers exactly as Page 9 enters bottom of view (7.4 -> 7.85)
      .fromTo(sec9Content,
        { opacity: 0, x: 40 },
        { opacity: 1, x: 0, ease: 'power3.out', duration: 0.45 },
        7.4
      );

    }, scrollContainerRef);

    return () => {
      ctx.revert(); // GSAP Context automatic clean-up of ScrollTriggers
    };
  }, []);

  const handleToggleSound = () => {
    chronosAudio.toggle();
    setAudioActive(chronosAudio.getIsPlaying());
  };

  const executeReservation = () => {
    const code = `ZXN-01-${Math.floor(100000 + Math.random() * 900000)}`;
    setReservationCode(code);
    setShowModal(true);
    setIsReserved(true);
  };

  return (
    <div className="relative w-full bg-gradient-to-b from-[#0a0f1d] via-[#05060b] to-[#04121a] min-h-screen selection:bg-cyan-500/30 selection:text-cyan-300 overflow-hidden">
      
      {/* =========================================================================
          BACKGROUND AMBIENT GLOWS (Immersive UI Theme) - Amplified Glows
          ========================================================================= */}
      <div className="absolute top-[-10%] left-[-10%] w-[450px] md:w-[900px] h-[450px] md:h-[900px] bg-cyan-500/22 rounded-full blur-[130px] pointer-events-none z-0 shadow-[0_0_150px_rgba(6,182,212,0.35)]"></div>
      <div className="absolute top-[25%] right-[-10%] w-[400px] md:w-[800px] h-[400px] md:h-[800px] bg-violet-500/18 rounded-full blur-[120px] pointer-events-none z-0 shadow-[0_0_120px_rgba(168,85,247,0.25)]"></div>
      <div className="absolute top-[50%] left-[-5%] w-[350px] md:w-[700px] h-[350px] md:h-[700px] bg-sky-500/18 rounded-full blur-[110px] pointer-events-none z-0 shadow-[0_0_100px_rgba(14,165,233,0.22)]"></div>
      <div className="absolute bottom-[-10%] right-[5%] w-[450px] md:w-[900px] h-[450px] md:h-[900px] bg-cyan-600/20 rounded-full blur-[140px] pointer-events-none z-0 shadow-[0_0_150px_rgba(6,182,212,0.3)]"></div>

      {/* =========================================================================
          BACKGROUND / AMBIENT CANVAS LAYER
          ========================================================================= */}
      <div className="fixed inset-0 w-full h-screen z-10 pointer-events-none">
        <WatchScene scrollParams={scrollParams} mouseCoords={mouseCoords} />
      </div>

      {/* =========================================================================
          HUD FOREGROUND NAVIGATION & BRAND (Immersive UI Style)
          ========================================================================= */}
      <nav className="fixed top-0 left-0 w-full z-30 flex items-center justify-between px-4 md:px-12 py-4 md:py-8 pointer-events-none backdrop-blur-[2px]">
        <div className="pointer-events-auto flex items-baseline space-x-2">
          <span className="font-display text-lg md:text-2xl font-bold tracking-tighter text-white text-glow">ZEXAN</span>
          <span className="font-mono text-[8px] md:text-[10px] uppercase tracking-[0.4em] opacity-60 text-cyan-400">// S-01</span>
        </div>
        <div className="pointer-events-auto flex items-center space-x-3 md:space-x-8 text-[8px] md:text-[11px] uppercase tracking-widest opacity-85">
          <span className="text-cyan-400 font-bold border-b border-cyan-400/50 text-glow">Dossier</span>
          <span className="hidden sm:inline opacity-50 text-white">Prototype S-01</span>
          <div className="flex items-center gap-1.5 text-white opacity-100 font-mono text-[9px] md:text-[10px] py-1 px-2.5 bg-cyan-500/10 border border-cyan-400/40 rounded-md box-glow animate-pulse">
            <Clock className="w-3 h-3 text-cyan-400" />
            <span>UTC 18:18</span>
          </div>
        </div>
      </nav>

      {/* Decorative Frame */}
      <div className="fixed inset-0 border-[6px] md:border-[20px] border-[#090a0f] pointer-events-none z-40"></div>

      {/* =========================================================================
          SCROLL CONTAINER (THE MULTI-SCENE DOM SEQUENCE)
          ========================================================================= */}
      <div 
        id="scroll-container" 
        ref={scrollContainerRef} 
        className="relative z-20 w-full pointer-events-none"
      >
        
        {/* =========================================================================
            PAGE 1: THE COLLAPSED ASSEMBLY (0vh - 100vh)
            ========================================================================= */}
        <section className="w-full h-screen flex flex-col justify-end p-6 md:p-24 relative overflow-hidden">
          {/* Gigantic ambient background display metadata typography */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden">
            <h2 className="sec1-background-text font-display font-bold text-[18vw] leading-none tracking-tighter text-cyan-400/[0.035] text-glow whitespace-nowrap uppercase">
              ZEXAN // 01
            </h2>
          </div>

          <div className="sec1-content max-w-xl flex flex-col gap-4 md:gap-5 relative z-10 pointer-events-auto text-center md:text-left items-center md:items-start mx-auto md:mx-0 w-full mb-4 sm:mb-8 text-balance">
            <div className="inline-block px-3 py-1 md:px-3.5 md:py-1.5 border border-cyan-500/30 bg-cyan-500/10 rounded-full w-fit box-glow">
              <span className="text-[8px] md:text-[9px] uppercase tracking-[0.2em] text-cyan-400 font-bold">Technical Breakdown // Series 01</span>
            </div>

            <h1 className="font-display text-4xl sm:text-5xl md:text-7xl font-extralight tracking-tight leading-none text-white cursor-default">
              <span className="heading-hover-effect block text-white select-none">CORE</span> <span className="font-bold text-cyan-400 text-glow text-shadow-cyan transition-all duration-500 hover:text-glow-violet heading-hover-effect inline-block mt-1">EXPLOSION</span>
            </h1>

            <p className="text-xs md:text-sm text-zinc-300 font-light leading-relaxed max-w-sm md:max-w-md">
              Witness the deconstruction of ZEXAN. Every component is hand-polished and aligned to micron-level precision within our orbital synthesis lab.
            </p>

            <div className="flex items-center gap-2 md:gap-3.5 pt-1 text-[8px] md:text-[10px] font-mono text-cyan-400/80 tracking-widest uppercase">
              <span>ORBIT DRIFT ACTIVE</span>
              <span className="text-zinc-700">//</span>
              <span>TILT DETECTED</span>
            </div>

            {/* Scroll Assist Hint */}
            <div className="mt-3 sm:mt-6 flex items-center gap-2.5 animate-bounce">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-zinc-400">
                <ArrowDown className="w-3.5 h-3.5 text-cyan-400" />
              </div>
              <span className="font-mono text-[8px] sm:text-[10px] text-zinc-500 tracking-[0.2em] uppercase">
                SCROLL DOWN TO INITIATE DECONSTRUCTION
              </span>
            </div>
          </div>
        </section>

        {/* =========================================================================
            PAGE 2: KINETIC DRIFT & ORBITING PERSPECTIVE (NEW)
            ========================================================================= */}
        <section className="w-full h-screen flex flex-col md:flex-row items-center justify-end md:justify-start p-6 md:p-24 relative overflow-hidden">
          <div className="sec2-content max-w-lg w-full flex flex-col gap-3.5 md:gap-6 relative z-10 opacity-0 transform translate-y-[100px] pointer-events-auto text-center md:text-left items-center md:items-start mb-6 md:mb-0">
            <div className="flex flex-col gap-1.5 items-center md:items-start text-balance">
              <div className="inline-block px-2.5 py-0.5 md:px-3 md:py-1 border border-cyan-500/30 bg-cyan-500/5 rounded-full w-fit">
                <span className="text-[8px] md:text-[9px] uppercase tracking-[0.2em] text-cyan-400 font-semibold">Gravity Compensation // 001</span>
              </div>
              <h2 className="heading-hover-effect font-display text-2xl sm:text-3xl md:text-5xl font-bold text-white tracking-tight text-center md:text-left">
                Gravity-Isolated Tourbillon
              </h2>
            </div>

            <p className="text-xs md:text-sm text-zinc-400 font-light leading-relaxed max-w-sm md:max-w-md text-balance">
              To offset physical gravitational influence, our dual-axis micro-regulating escapement floats in zero-friction suspension. This guarantees perfect chronometric drift containment in extreme environments.
            </p>

            {/* Micro stats deck */}
            <div className="grid grid-cols-3 gap-2.5 sm:gap-4 pt-1 sm:pt-4 pointer-events-auto w-full">
              <div className="p-2.5 sm:p-4 border border-white/5 bg-white/[0.01] rounded-xl flex flex-col items-center md:items-start gap-0.5">
                <Compass className="w-3.5 sm:w-4 sm:h-4 text-cyan-400 mb-0.5" />
                <span className="text-[8px] sm:text-[10px] text-zinc-500 font-mono uppercase text-center md:text-left leading-none">Friction</span>
                <span className="text-[10px] sm:text-xs md:text-sm font-semibold text-white font-display text-center md:text-left">0.00 % DET</span>
              </div>
              <div className="p-2.5 sm:p-4 border border-white/5 bg-white/[0.01] rounded-xl flex flex-col items-center md:items-start gap-0.5">
                <Activity className="w-3.5 sm:w-4 sm:h-4 text-cyan-400 mb-0.5" />
                <span className="text-[8px] sm:text-[10px] text-zinc-500 font-mono uppercase text-center md:text-left leading-none">Deviation</span>
                <span className="text-[10px] sm:text-xs md:text-sm font-semibold text-white font-display text-center md:text-left">±0.01s/D</span>
              </div>
              <div className="p-2.5 sm:p-4 border border-white/5 bg-white/[0.01] rounded-xl flex flex-col items-center md:items-start gap-0.5">
                <Sliders className="w-3.5 sm:w-4 sm:h-4 text-cyan-400 mb-0.5" />
                <span className="text-[8px] sm:text-[10px] text-zinc-500 font-mono uppercase text-center md:text-left leading-none">Tension</span>
                <span className="text-[10px] sm:text-xs md:text-sm font-semibold text-white font-display text-center md:text-left">0-G Vector</span>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            PAGE 3: Z-AXIS DISPERSION (100vh - 200vh)
            ========================================================================= */}
        <section className="w-full h-screen flex flex-col md:flex-row items-center justify-end md:justify-start p-6 md:p-24 relative overflow-hidden">
          <div className="sec3-content max-w-lg w-full flex flex-col gap-3 md:gap-5 relative z-10 opacity-0 transform translate-x-[-100px] pointer-events-auto text-center md:text-left items-center md:items-start mb-6 md:mb-0">
            <div className="flex flex-col gap-1.5 items-center md:items-start text-balance">
              <div className="inline-block px-2.5 py-0.5 md:px-3 md:py-1 border border-cyan-500/30 bg-cyan-500/5 rounded-full w-fit">
                <span className="text-[8px] md:text-[9px] uppercase tracking-[0.2em] text-cyan-400 font-semibold">Interactive Deconstruction // 002</span>
              </div>
              <h2 className="heading-hover-effect font-display text-2xl sm:text-3xl md:text-5xl font-bold text-white tracking-tight">
                Z-Axis Mechanical Dispersion
              </h2>
            </div>

            <p className="text-[11px] md:text-sm text-zinc-400 font-light leading-relaxed max-w-sm md:max-w-md text-balance hidden sm:block">
              Explore the deconstructed layers. The gears, main dial plate, and sapphire crystal elements dynamically disperse on scroll speed and kinetic frequency.
            </p>

            {/* Spec Layer Selectors */}
            <div className="flex flex-col gap-2 sm:gap-3 pointer-events-auto w-full">
              {GEAR_SPECS.map((spec, index) => {
                const isActive = activeSpecIndex === index;
                return (
                  <div
                    key={spec.id}
                    onClick={() => setActiveSpecIndex(index)}
                    className={`glass-panel p-2.5 sm:p-4 rounded-xl cursor-pointer transition-all duration-300 border-l-[3px] flex items-start gap-2.5 sm:gap-4 ${
                      isActive 
                        ? 'border-cyan-400 bg-white/[0.03] shadow-lg shadow-cyan-950/15'
                        : 'border-white/10 hover:border-white/30 hover:bg-white/[0.015]'
                    }`}
                  >
                    <div className={`p-1.5 sm:p-2 rounded-lg border transition-colors shrink-0 ${
                      isActive ? 'bg-cyan-950/45 border-cyan-400/40 text-cyan-300' : 'bg-white/5 border-white/10 text-zinc-500'
                    }`}>
                      {index === 0 && <Layers className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
                      {index === 1 && <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
                      {index === 2 && <Cpu className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
                    </div>
                    
                    <div className="flex-1 flex flex-col gap-0.5 text-left">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[8px] sm:text-[9px] text-zinc-500 tracking-wider">
                          {spec.tag}
                        </span>
                        <span className="font-mono text-[8px] sm:text-[9px] text-cyan-400 font-semibold tracking-wide">
                          {spec.metric}
                        </span>
                      </div>
                      <h3 className="font-display font-medium text-xs sm:text-sm text-white">
                        {spec.title}
                      </h3>
                      {isActive && (
                        <p className="text-[10px] sm:text-xs text-zinc-400 font-light mt-0.5 animate-fadeIn leading-relaxed">
                          {spec.description}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* =========================================================================
            PAGE 4: CARBIDE CARBON FORGE (NEW)
            ========================================================================= */}
        <section className="w-full h-screen flex flex-col md:flex-row items-center justify-end p-6 md:p-24 relative overflow-hidden">
          <div className="sec4-content max-w-lg w-full flex flex-col gap-3 md:gap-5 relative z-10 opacity-0 transform translate-x-[100px] pointer-events-auto text-center md:text-left items-center md:items-start mb-6 md:mb-0">
            <div className="flex flex-col gap-1.5 items-center md:items-start text-balance">
              <div className="inline-block px-2.5 py-0.5 md:px-3 md:py-1 border border-cyan-500/30 bg-cyan-500/5 rounded-full w-fit">
                <span className="text-[8px] md:text-[9px] uppercase tracking-[0.2em] text-cyan-400 font-semibold">Molecular Engineering // 003</span>
              </div>
              <h2 className="heading-hover-effect font-display text-2xl sm:text-3xl md:text-5xl font-bold text-white tracking-tight">
                Carbine Carbon Shell Synthesis
              </h2>
            </div>

            <p className="text-[11px] md:text-sm text-zinc-400 font-light leading-relaxed max-w-sm md:max-w-md text-balance hidden sm:block">
              Our casings undergo zero-gravity sintering, fusing pulverized titanium atoms with synthetic diamond-crystalline matrices. This provides extraordinary structural density while maintaining microscopic weight advantages.
            </p>

            {/* Interactive Alloy Material Toggler */}
            <div className="glass-panel p-4 sm:p-5 rounded-2xl flex flex-col gap-3 sm:gap-4 pointer-events-auto w-full text-left">
              <div className="flex items-center justify-between pb-1.5 sm:pb-2 border-b border-cyan-500/20">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <Wrench className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-400 animate-pulse" />
                  <span className="text-[11px] sm:text-xs text-zinc-100 font-display font-semibold text-glow">Active Material Matrix</span>
                </div>
                <span className="font-mono text-[8px] sm:text-[10px] text-cyan-400 font-semibold tracking-wide">SINTER DECK v9</span>
              </div>

              <div className="grid grid-cols-2 gap-2 sm:gap-2.5">
                <button
                  onClick={() => setAlloyType('carbine')}
                  className={`px-3 py-2 sm:px-4 sm:py-3 rounded-xl font-display text-[10px] sm:text-xs font-semibold cursor-pointer transition-all duration-300 text-left flex flex-col gap-0.5 sm:gap-1 border ${
                    alloyType === 'carbine'
                      ? 'bg-cyan-950/30 border-cyan-400 text-cyan-300'
                      : 'bg-white/[0.01] border-white/10 text-zinc-400 hover:border-white/20'
                  }`}
                >
                  <span className="truncate">Anthracite Carbine</span>
                  <span className="text-[8px] sm:text-[9px] font-mono opacity-60">S-Density: 4.85 g/cm³</span>
                </button>

                <button
                  onClick={() => setAlloyType('composite')}
                  className={`px-3 py-2 sm:px-4 sm:py-3 rounded-xl font-display text-[10px] sm:text-xs font-semibold cursor-pointer transition-all duration-300 text-left flex flex-col gap-0.5 sm:gap-1 border ${
                    alloyType === 'composite'
                      ? 'bg-cyan-950/30 border-cyan-400 text-cyan-300'
                      : 'bg-white/[0.01] border-white/10 text-zinc-400 hover:border-white/20'
                  }`}
                >
                  <span className="truncate">Alacrite Composite</span>
                  <span className="text-[8px] sm:text-[9px] font-mono opacity-60">S-Density: 5.12 g/cm³</span>
                </button>
              </div>

              <div className="p-2 sm:p-3 bg-white/[0.015] rounded-xl flex items-center gap-2.5 border border-white/5">
                <Info className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span className="text-[9px] sm:text-[10px] md:text-xs text-zinc-400 font-light leading-normal">
                  {alloyType === 'carbine' 
                    ? 'Engineered for tactical scratch containment. Replicating lunar shield structures with over 2,400 Vickers hardness scale properties.' 
                    : 'Engineered for acoustic optimization. Dampens vibration echoes to keep micro-escapement frequencies pure.'}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            PAGE 5: MICRO-ESCAPEMENT MECHANICS (NEW)
            ========================================================================= */}
        <section className="w-full h-screen flex flex-col md:flex-row items-center justify-end md:justify-start p-6 md:p-24 relative overflow-hidden">
          <div className="sec5-content max-w-lg w-full flex flex-col gap-3.5 md:gap-5 relative z-10 opacity-0 transform translate-y-[100px] pointer-events-auto text-center md:text-left items-center md:items-start mb-6 md:mb-0">
            <div className="flex flex-col gap-1.5 items-center md:items-start text-balance">
              <div className="inline-block px-2.5 py-0.5 md:px-3 md:py-1 border border-cyan-500/30 bg-cyan-500/5 rounded-full w-fit">
                <span className="text-[8px] md:text-[9px] uppercase tracking-[0.2em] text-cyan-400 font-semibold">Pulse Calibration // 004</span>
              </div>
              <h2 className="heading-hover-effect font-display text-2xl sm:text-3xl md:text-5xl font-bold text-white tracking-tight">
                High-Frequency Ruby Orbitals
              </h2>
            </div>

            <p className="text-xs md:text-sm text-zinc-400 font-light leading-relaxed max-w-sm md:max-w-md text-balance text-left sm:text-center md:text-left">
              At the center of our timepiece is a high-torque mechanical cluster pulsing at a rigid 32,800 beats per hour. Supported by 25 synthetically-grown ruby pivot rings, the escapement achieves unparalleled mechanical balance over a 72-hour period.
            </p>

            {/* Spec grid */}
            <div className="grid grid-cols-2 gap-2.5 sm:gap-3.5 pt-1 w-full text-left">
              <div className="p-3 sm:p-4 border border-white/5 bg-white/[0.02] rounded-xl flex flex-col justify-between">
                <div>
                  <span className="text-[8px] sm:text-[9px] uppercase tracking-wider text-cyan-400/80 font-mono block mb-0.5 sm:mb-1">Pulsing Rate</span>
                  <span className="text-[11px] sm:text-xs font-semibold text-white font-display block">4.5 Hz Constant</span>
                </div>
                <span className="text-[8px] sm:text-[9px] text-zinc-500 font-mono block mt-1.5 leading-tight sm:leading-normal">270,000 sub-pulses / hour</span>
              </div>
              <div className="p-3 sm:p-4 border border-white/5 bg-white/[0.02] rounded-xl flex flex-col justify-between">
                <div>
                  <span className="text-[8px] sm:text-[9px] uppercase tracking-wider text-cyan-400/80 font-mono block mb-0.5 sm:mb-1">Escapement Core</span>
                  <span className="text-[11px] sm:text-xs font-semibold text-white font-display block">Silicium Hairspring</span>
                </div>
                <span className="text-[8px] sm:text-[9px] text-zinc-500 font-mono block mt-1.5 leading-tight sm:leading-normal font-light">Anti-magnetic atomic grid</span>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            PAGE 6: CHRONOMETRIC METRICS (NEW)
            ========================================================================= */}
        <section className="w-full h-screen flex flex-col md:flex-row items-center justify-end md:justify-start p-6 md:p-24 relative overflow-hidden">
          <div className="sec6-content max-w-lg w-full flex flex-col gap-3 sm:gap-5 relative z-10 opacity-0 transform translate-y-[100px] pointer-events-auto text-center md:text-left items-center md:items-start mb-6 md:mb-0">
            <div className="flex flex-col gap-1.5 items-center md:items-start text-balance">
              <div className="inline-block px-2.5 py-0.5 md:px-3 md:py-1 border border-cyan-500/30 bg-cyan-500/5 rounded-full w-fit">
                <span className="text-[8px] md:text-[9px] uppercase tracking-[0.2em] text-cyan-400 font-semibold">Sensor Interface // 005</span>
              </div>
              <h2 className="heading-hover-effect font-display text-2xl sm:text-3xl md:text-5xl font-bold text-white tracking-tight">
                Algorithmic Telemetry Metrics
              </h2>
            </div>

            <p className="text-xs md:text-sm text-zinc-400 font-light leading-relaxed font-sans max-w-sm md:max-w-md text-balance hidden sm:block">
              Integrate with systemic micro-tracking models. Select your calibration frequency mode to regulate the dynamic compensation loop vectors.
            </p>

            {/* Interactive Telemetry controller */}
            <div className="glass-panel p-3.5 sm:p-5 rounded-2xl flex flex-col gap-3 pointer-events-auto w-full text-left">
              <div className="flex items-center justify-between pb-1 border-b border-white/5">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <Activity className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-400 animate-pulse" />
                  <span className="text-[10px] sm:text-xs text-zinc-100 font-mono font-bold text-glow">Active Calibration</span>
                </div>
                <span className="text-[8px] sm:text-[9px] text-cyan-400 font-mono uppercase tracking-widest font-bold text-glow">{calibrationMode}</span>
              </div>

              <div className="flex flex-col gap-1.5 sm:gap-2">
                {[
                  { mode: 'standard', title: 'Standard Dial Alignment', desc: 'Baseline calibration for gravity.' },
                  { mode: 'orbital', title: 'Orbital Compensation', desc: 'Active multi-axis rotation tracking.' },
                  { mode: 'high-torque', title: 'High-Torque Coupling', desc: 'Maximum friction suppression.' }
                ].map((item) => {
                  const isSel = calibrationMode === item.mode;
                  return (
                    <div
                      key={item.mode}
                      onClick={() => setCalibrationMode(item.mode as any)}
                      className={`p-2 sm:p-3 rounded-xl border cursor-pointer transition-all duration-300 flex items-center justify-between gap-3 ${
                        isSel 
                          ? 'bg-cyan-500/5 border-cyan-400/40 text-cyan-300' 
                          : 'bg-white/[0.005] border-white/5 text-zinc-400 hover:border-white/10 hover:bg-white/[0.01]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className={`w-3 h-3 rounded-full border flex items-center justify-center shrink-0 ${
                          isSel ? 'border-cyan-400 bg-cyan-400' : 'border-zinc-700'
                        }`}>
                          {isSel && <div className="w-1.5 h-1.5 rounded-full bg-black" />}
                        </div>
                        <span className="text-[11px] sm:text-xs font-semibold font-display text-white">{item.title}</span>
                      </div>
                      <span className="hidden leading-normal sm:block text-[9px] sm:text-[10px] text-zinc-500">{item.desc}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            PAGE 7: CELESTIAL ALIGNMENT (NEW)
            ========================================================================= */}
        <section className="w-full h-screen flex flex-col md:flex-row items-center justify-end p-6 md:p-24 relative overflow-hidden">
          <div className="sec7-content max-w-lg w-full flex flex-col gap-3.5 sm:gap-5 relative z-10 opacity-0 transform translate-x-[80px] pointer-events-auto text-center md:text-left items-center md:items-start mb-6 md:mb-0">
            <div className="flex flex-col gap-1.5 items-center md:items-start text-balance">
              <div className="inline-block px-2.5 py-0.5 md:px-3 md:py-1 border border-cyan-500/30 bg-cyan-500/5 rounded-full w-fit">
                <span className="text-[8px] md:text-[9px] uppercase tracking-[0.2em] text-cyan-400 font-semibold">Astral Complications // 006</span>
              </div>
              <h2 className="heading-hover-effect font-display text-2xl sm:text-3xl md:text-5xl font-bold text-white tracking-tight">
                Celestial Lunar Synchronization
              </h2>
            </div>

            <p className="text-xs md:text-sm text-zinc-400 font-light leading-relaxed max-w-sm md:max-w-md text-balance hidden sm:block">
              Equipped with a custom lunar tracking complication module. This gears alignment adjusts focal drift based on real-time orbital distances to maintain chronological harmony.
            </p>

            {/* Slider complication deck */}
            <div className="p-4 sm:p-5 glass-panel rounded-2xl flex flex-col gap-3 sm:gap-3.5 pointer-events-auto border-glow-cyan shadow-[0_0_25px_rgba(0,243,255,0.08)] w-full text-left">
              <div className="flex items-center justify-between font-mono text-[9px] sm:text-[10px]">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <Moon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-300 animate-bounce" />
                  <span className="text-zinc-[110] font-bold text-glow">Lunar Eccentricity</span>
                </div>
                <span className="text-cyan-400 font-extrabold text-glow">{lunarDrift}° Offset</span>
              </div>

              <input
                type="range"
                min="0"
                max="180"
                value={lunarDrift}
                onChange={(e) => setLunarDrift(parseInt(e.target.value))}
                className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-cyan-400 my-1 sm:my-0"
              />

              <div className="grid grid-cols-2 gap-2 text-center text-[8px] sm:text-[9px] font-mono whitespace-nowrap pt-0.5">
                <div className="bg-white/[0.015] border border-white/5 p-1.5 sm:p-2 rounded-lg">
                  <span className="opacity-50 block uppercase text-[7px] sm:text-[9px]">Calculated Apex</span>
                  <span className="text-white block font-semibold mt-0.5">{(lunarDrift * 2.3).toFixed(1)} km RAD</span>
                </div>
                <div className="bg-white/[0.015] border border-white/5 p-1.5 sm:p-2 rounded-lg">
                  <span className="opacity-50 block uppercase text-[7px] sm:text-[9px]">Syntonic Error</span>
                  <span className="text-white block font-semibold mt-0.5">{(0.00012 * lunarDrift).toFixed(5)} % MAX</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            PAGE 8: AUDIO-REACTIVE SOUL CORE (200vh - 300vh)
            ========================================================================= */}
        <section className="w-full h-screen flex flex-col md:flex-row items-center justify-end md:justify-start p-6 md:p-24 relative overflow-hidden">
          <div className="sec8-content max-w-lg w-full flex flex-col gap-3.5 sm:gap-5 relative z-10 opacity-0 transform translate-x-[-80px] pointer-events-auto text-center md:text-left items-center md:items-start mb-6 md:mb-0">
            <div className="flex flex-col gap-1.5 items-center md:items-start text-balance">
              <div className="inline-block px-2.5 py-0.5 md:px-3 md:py-1 border border-cyan-500/30 bg-cyan-500/5 rounded-full w-fit">
                <span className="text-[8px] md:text-[9px] uppercase tracking-[0.2em] text-cyan-400 font-semibold">Sonic Alignment // 007</span>
              </div>
              <h2 className="heading-hover-effect font-display text-2xl sm:text-3xl md:text-5xl font-bold text-white tracking-tight">
                Harmonic Oscillation Core
              </h2>
            </div>

            <p className="text-xs md:text-sm text-zinc-400 font-light leading-relaxed max-w-sm md:max-w-md text-balance text-center sm:text-left md:text-left hidden sm:block">
              Witness acoustic vibration synchronization. Activating core frequencies below transmits audio-reactive pulse measurements right through the gears balance cage.
            </p>

            <div className="glass-panel p-4 sm:p-5 rounded-2xl flex flex-col gap-3 sm:gap-4 pointer-events-auto w-full text-left">
              {/* =========================================================================
                  AUDIO INTEG BUTTON & GRAPHIC WAVE EQUALIZER DISPLAY
                  ========================================================================= */}
              <div className="flex flex-col gap-2.5 sm:gap-3">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex flex-col">
                    <span className="font-mono text-[8px] sm:text-[9px] text-cyan-400 font-extrabold tracking-widest uppercase text-glow">
                      SONIC FEEDBACK
                    </span>
                    <span className="font-display text-[10px] sm:text-xs text-zinc-100 font-semibold">
                      Audio-Reactive Kinetic Engine
                    </span>
                  </div>

                  <button
                    onClick={handleToggleSound}
                    className={`px-2.5 py-1 sm:px-3.5 sm:py-1.5 rounded-lg font-mono text-[8px] sm:text-[9px] uppercase font-bold tracking-widest flex items-center gap-1.5 sm:gap-2 transition-all duration-300 cursor-pointer ${
                      audioActive
                        ? 'bg-cyan-500 text-black shadow-[0_0_15px_rgba(6,182,212,0.5)] scale-105'
                        : 'bg-white/5 border border-white/10 text-cyan-400 hover:bg-cyan-500/10'
                    }`}
                  >
                    {audioActive ? (
                      <>
                        <Volume2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 animate-bounce" />
                        ACTIVE
                      </>
                    ) : (
                      <>
                        <VolumeX className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                        ACTIVATE
                      </>
                    )}
                  </button>
                </div>

                {/* Cyber Equalizer Graphic Wave display - High Performance Decoupled */}
                <AudioEqualizer audioActive={audioActive} />
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            PAGE 9: SECURE RESERVATION CARD (DECK FINISH OUT)
            ========================================================================= */}
        <section className="w-full h-screen flex flex-col md:flex-row items-center justify-end p-6 md:p-24 relative overflow-hidden">
          <div className="sec9-content max-w-md w-full relative z-10 opacity-0 transform translate-x-[100px] pointer-events-auto mb-4 sm:mb-0">
            
            {/* The pre-order custom visual glass wrapper card */}
            <div className="backdrop-blur-[45px] bg-white/[0.04] border border-cyan-400/30 p-4 sm:p-6 md:p-8 rounded-2xl w-full pointer-events-auto shadow-[0_0_50px_rgba(0,243,255,0.18)] flex flex-col gap-4 sm:gap-5">
              
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <span className="font-mono text-[10px] text-cyan-300 tracking-widest uppercase text-glow">
                    ACQUIRE SERIES
                  </span>
                  <span className="bg-cyan-500/15 border border-cyan-400/40 px-2.5 py-0.5 rounded-full text-[9px] font-mono text-cyan-200">
                    LIMITED RELEASE
                  </span>
                </div>
                <h2 className="heading-hover-effect font-display text-2xl md:text-3xl font-bold text-white tracking-tight text-glow w-fit">
                  ZEXAN CONCEPT SER-01
                </h2>
              </div>

              {/* General Tech specs metadata block (GRID Theme) */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/10 backdrop-blur-xl flex flex-col gap-0.5">
                  <div className="text-[9px] uppercase tracking-widest text-cyan-400/60 font-mono">Case Material</div>
                  <div className="text-xs font-medium text-white font-display">Anthracite Carbine</div>
                </div>
                <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/10 backdrop-blur-xl flex flex-col gap-0.5">
                  <div className="text-[9px] uppercase tracking-widest text-cyan-400/60 font-mono">Movement</div>
                  <div className="text-xs font-medium text-white font-display">C-01 Tourbillon</div>
                </div>
                <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/10 backdrop-blur-xl flex flex-col gap-0.5">
                  <div className="text-[9px] uppercase tracking-widest text-cyan-400/60 font-mono">Power Reserve</div>
                  <div className="text-xs font-medium text-white font-display">72 Hours Pure</div>
                </div>
                <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/10 backdrop-blur-xl flex flex-col gap-0.5">
                  <div className="text-[9px] uppercase tracking-widest text-cyan-400/60 font-mono">Optics Glass</div>
                  <div className="text-xs font-medium text-white font-display">Sapphire 9H Armor</div>
                </div>
              </div>

              {/* Direct Reservation Execution Call Action */}
              <div className="flex flex-col gap-3 py-1 border-t border-white/5 pt-4">
                <div className="flex justify-between items-baseline">
                  <span className="font-mono text-zinc-400 text-xs">MODEL TIER</span>
                  <span className="font-display font-medium text-xl text-white">
                    $8,500 <span className="text-zinc-500 text-xs">USD</span>
                  </span>
                </div>

                {isReserved ? (
                  <div className="bg-emerald-950/15 border border-emerald-500/30 p-4 rounded-xl flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full bg-emerald-950/80 flex items-center justify-center text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.3)]">
                      <Check className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="font-display text-sm font-semibold text-emerald-200">
                        RESERVATION REGISTERED
                      </span>
                      <span className="font-mono text-[9px] text-emerald-400/80 tracking-wide uppercase">
                        CODE: {reservationCode}
                      </span>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={executeReservation}
                    className="w-full bg-gradient-to-r from-cyan-500 to-sky-500 hover:from-cyan-400 hover:to-sky-400 text-black py-3.5 rounded-xl font-display font-bold text-xs uppercase tracking-widest transition-all duration-300 shadow-[0_0_20px_rgba(6,182,212,0.25)] hover:shadow-[0_0_25px_rgba(6,182,212,0.45)] cursor-pointer flex items-center justify-center gap-2"
                  >
                    Confirm Secure Reservation
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}

                <span className="font-mono text-[8px] text-zinc-600 text-center tracking-wider block mt-1">
                  SECURE CRYPTO-SIGNATURE GENERATOR ENFORCED ON PROTOCOLS
                </span>
              </div>

            </div>
          </div>
        </section>

      </div>

      {/* =========================================================================
          FOOTER DASHBOARD (Immersive UI Theme)
          ========================================================================= */}
      <footer className="fixed bottom-0 left-0 w-full z-30 px-6 md:px-12 py-6 md:py-8 flex items-end justify-between border-t border-white/5 bg-gradient-to-t from-black to-transparent pointer-events-none">
        <div className="flex space-x-6 md:space-x-12 pointer-events-auto">
          <div className="space-y-1">
            <div className="text-[9px] uppercase tracking-[0.2em] opacity-40">Current Latitude</div>
            <div className="text-[10px] md:text-xs font-mono">34.0522° N, 118.2437° W</div>
          </div>
          <div className="space-y-1">
            <div className="text-[9px] uppercase tracking-[0.2em] opacity-40">Network Link</div>
            <div className="text-[10px] md:text-xs font-mono text-cyan-400 font-semibold text-glow">ENCRYPTED_ACTIVE</div>
          </div>
        </div>
        
        <div className="flex items-center space-x-4 md:space-x-6">
          <div className="text-right">
            <div className="text-[9px] uppercase tracking-[0.2em] opacity-40">Est. Delivery</div>
            <div className="text-[10px] md:text-xs font-mono text-zinc-300">OCT // 2026</div>
          </div>
        </div>
      </footer>

      {/* =========================================================================
          INTERACTIVE RESERVATION POPUP CONFIRMATION MODAL
          ========================================================================= */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="relative max-w-md w-full glass-panel bg-zinc-950/80 border border-cyan-500/20 p-8 rounded-2xl flex flex-col gap-6 shadow-2xl">
            {/* Close Button */}
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Glowing Icon */}
            <div className="w-14 h-14 rounded-full bg-cyan-950/50 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mx-auto shadow-[0_0_25px_rgba(0,243,255,0.25)]">
              <ShieldCheck className="w-7 h-7" />
            </div>

            <div className="text-center flex flex-col gap-2">
                <h3 className="font-display text-xl font-bold text-white tracking-tight text-glow">
                  Reservation Confirmed
                </h3>
                <p className="text-xs text-zinc-300 font-light leading-relaxed">
                  Your priority slot for <strong className="text-white text-glow">ZEXAN CONCEPT SER-01</strong> is locked. A secure smart-contract receipt has been generated for your record.
                </p>
              </div>

            {/* Code presentation block */}
            <div className="bg-black/45 border border-white/5 p-4 rounded-xl flex flex-col items-center gap-1.5">
              <span className="font-mono text-[9px] text-zinc-500 tracking-widest uppercase">
                ESTABLISHED SIGNATURE
              </span>
              <span className="font-mono font-bold text-lg text-cyan-400 tracking-wider">
                {reservationCode}
              </span>
              <span className="font-mono text-[8px] text-[#00f3ff]/40 tracking-widest">
                VERIFIED CRYPTO SIGNATURE KEY
              </span>
            </div>

            <div className="flex flex-col gap-2.5">
              <button
                onClick={() => setShowModal(false)}
                className="w-full bg-white/5 border border-white/10 hover:bg-white/10 text-white text-xs font-display font-medium py-3 rounded-lg tracking-widest uppercase transition-all cursor-pointer"
              >
                Close Receipt
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
