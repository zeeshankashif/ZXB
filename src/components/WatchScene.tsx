/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { chronosAudio } from '../utils/audio';

interface WatchSceneProps {
  scrollParams: React.MutableRefObject<{
    progress: number;
    positionX: number;
    positionY: number;
    positionZ: number;
    rotationX: number;
    rotationY: number;
    rotationZ: number;
    explosionZ: number;
    sapphireOpacity: number;
  }>;
  mouseCoords: React.MutableRefObject<{ x: number; y: number }>;
}

function MainWatch({ scrollParams, mouseCoords }: WatchSceneProps) {
  const masterGroupRef = useRef<THREE.Group>(null);
  const { size } = useThree();
  const isMobile = size.width < 768;
  
  // Layer Refs
  const glassRef = useRef<THREE.Mesh>(null);
  const dialRef = useRef<THREE.Group>(null);
  const gearsRef = useRef<THREE.Group>(null);
  
  // Material Refs
  const glassMatRef = useRef<THREE.MeshPhysicalMaterial>(null);
  const gearsMatRef = useRef<THREE.MeshStandardMaterial>(null);
  
  // Dial Hands
  const hourHandRef = useRef<THREE.Mesh>(null);
  const minuteHandRef = useRef<THREE.Mesh>(null);
  const secondHandRef = useRef<THREE.Mesh>(null);

  // For dynamic velocity-based explosion spacing
  const prevProgress = useRef(0);
  const scrollSpeed = useRef(0);

  useFrame((state) => {
    const { clock } = state;
    const time = clock.getElapsedTime();

    // 1. Calculate Scroll Velocity
    const currentProg = scrollParams.current.progress;
    const delta = Math.abs(currentProg - prevProgress.current);
    prevProgress.current = currentProg;

    // Smoothly decay/increase the scroll speed (momentum effect)
    scrollSpeed.current = THREE.MathUtils.lerp(scrollSpeed.current, delta * 32.0, 0.08);

    // 2. Fetch Audio Engine Analysis
    chronosAudio.updateBeatFading();
    const beatVal = chronosAudio.getCurrentBeatValue();
    const audioPower = chronosAudio.getAnalyserData();
    const finalAudioPulse = Math.max(beatVal, audioPower * 1.6);

    // 3. Ambient Floating Drift (Zero-Gravity Inertia)
    const floatY = Math.sin(time * 0.6) * 0.08;
    const floatX = Math.cos(time * 0.4) * 0.05;

    // 4. Mouse-Move Focus Tilt
    const targetTiltX = mouseCoords.current.y * 0.35;
    const targetTiltY = mouseCoords.current.x * 0.35;

    // Determine responsive slide position vectors
    let targetX = scrollParams.current.positionX + floatX;
    let targetY = scrollParams.current.positionY + floatY;

    if (isMobile) {
      // Keep model horizontally centered on narrow mobile screens (with an active sway)
      targetX = 0 + floatX * 0.45;

      // Dynamic 9-step mobile trajectory path synchronized perfectly with the scroll sections
      const p = scrollParams.current.progress;
      const MOBILE_Y_VALUES = [0.78, 0.84, 0.45, 0.82, 0.58, 0.84, 0.65, 0.40, 0.88];
      let calculatedY = 0.78;

      if (p <= 0) {
        calculatedY = 0.78;
      } else if (p >= 1) {
        calculatedY = 0.88;
      } else {
        const segmentIndex = Math.min(Math.floor(p / 0.125), 7);
        const startSegmentProg = segmentIndex * 0.125;
        const startY = MOBILE_Y_VALUES[segmentIndex];
        const endY = MOBILE_Y_VALUES[segmentIndex + 1];
        
        // Normalize scroll progress within the active section segment [0.0 to 1.0]
        const t = (p - startSegmentProg) / 0.125;
        // Apply Hermite smoothstep spline easing for ultra-fluid momentum
        const smoothT = t * t * (3 - 2 * t);
        calculatedY = THREE.MathUtils.lerp(startY, endY, smoothT);
      }
      
      targetY = calculatedY + floatY * 0.45;
    }

    // 5. Apply Core Transform and Interpolation
    if (masterGroupRef.current) {
      // Rotate and Position Master Group smoothly
      masterGroupRef.current.position.x = THREE.MathUtils.lerp(
        masterGroupRef.current.position.x, 
        targetX, 
        0.08
      );
      masterGroupRef.current.position.y = THREE.MathUtils.lerp(
        masterGroupRef.current.position.y, 
        targetY, 
        0.08
      );
      masterGroupRef.current.position.z = THREE.MathUtils.lerp(
        masterGroupRef.current.position.z, 
        scrollParams.current.positionZ, 
        0.08
      );

      // Smoothly animate responsive scaling of the model
      const targetScale = isMobile 
        ? 0.62 + (scrollParams.current.positionZ * 0.06) 
        : 1.0;
      masterGroupRef.current.scale.x = THREE.MathUtils.lerp(masterGroupRef.current.scale.x, targetScale, 0.08);
      masterGroupRef.current.scale.y = THREE.MathUtils.lerp(masterGroupRef.current.scale.y, targetScale, 0.08);
      masterGroupRef.current.scale.z = THREE.MathUtils.lerp(masterGroupRef.current.scale.z, targetScale, 0.08);

      // Blend GSAP scroll target rotation with absolute mouse pointer feedback
      const targetRotX = scrollParams.current.rotationX + targetTiltX;
      const targetRotY = scrollParams.current.rotationY + targetTiltY;
      const targetRotZ = scrollParams.current.rotationZ;

      masterGroupRef.current.rotation.x = THREE.MathUtils.lerp(masterGroupRef.current.rotation.x, targetRotX, 0.08);
      masterGroupRef.current.rotation.y = THREE.MathUtils.lerp(masterGroupRef.current.rotation.y, targetRotY, 0.08);
      masterGroupRef.current.rotation.z = THREE.MathUtils.lerp(masterGroupRef.current.rotation.z, targetRotZ, 0.08);
    }

    // 6. Explosion Logic along Z-Axis (driven by GSAP + dynamic velocity overshoot)
    const baseExplosionOffset = scrollParams.current.explosionZ;
    // Add extra separation based on how fast the user is scrolling
    const activeExplosion = baseExplosionOffset + scrollSpeed.current * 2.5;

    // Sapphire Glass moves forward (Layer 1)
    if (glassRef.current) {
      const targetGlassZ = activeExplosion;
      glassRef.current.position.z = THREE.MathUtils.lerp(glassRef.current.position.z, targetGlassZ, 0.1);
      // Subtle spin
      glassRef.current.rotation.z = time * 0.05;
    }

    // Watch Dial remaining relatively near origin (Layer 2)
    if (dialRef.current) {
      dialRef.current.position.z = THREE.MathUtils.lerp(dialRef.current.position.z, 0, 0.1);
    }

    // Mechanical Gears recede backward (Layer 3)
    if (gearsRef.current) {
      const targetGearsZ = -activeExplosion;
      gearsRef.current.position.z = THREE.MathUtils.lerp(gearsRef.current.position.z, targetGearsZ, 0.1);

      // Kinetic audio wobble: Tilt the gears slightly when the sound waves kick high
      const wobbleX = Math.sin(time * 8.0) * (finalAudioPulse * 0.25);
      const wobbleY = Math.cos(time * 6.0) * (finalAudioPulse * 0.25);
      gearsRef.current.rotation.x = time * 0.25 + wobbleX;
      gearsRef.current.rotation.y = time * 0.2 + wobbleY;
      
      // Dynamic scaling for gear pulsing
      const scaleBase = 1.0;
      const scaleMultiplier = 1.0 + (finalAudioPulse * 0.28);
      gearsRef.current.scale.setScalar(THREE.MathUtils.lerp(gearsRef.current.scale.x, scaleMultiplier, 0.12));
    }

    // 7. Watch Hands - Elite Mechanical Ticking
    const date = new Date();
    const currSeconds = date.getSeconds();
    const currMilliseconds = date.getMilliseconds();
    
    // Smooth custom clock hands
    const hours = date.getHours() % 12;
    const minutes = date.getMinutes();
    
    const minutesAngle = ((minutes + currSeconds / 60) * 6 * Math.PI) / 180;
    const hoursAngle = (((hours % 12) * 30 + minutes * 0.5) * Math.PI) / 180;
    
    if (hourHandRef.current) hourHandRef.current.rotation.z = -hoursAngle;
    if (minuteHandRef.current) minuteHandRef.current.rotation.z = -minutesAngle;

    // Physical ticking clockwork with spring overshoot on second hand
    if (secondHandRef.current) {
      const t = currMilliseconds / 1000;
      let tickAngle = (currSeconds * 6 * Math.PI) / 180;
      if (t < 0.18) {
        const phase = t / 0.18;
        // Bounce formula (overshoot and rebound)
        const bounce = Math.sin(phase * Math.PI) * 0.05;
        tickAngle += (phase * 6 * Math.PI) / 180 + bounce;
      } else {
        tickAngle += (6 * Math.PI) / 180;
      }
      secondHandRef.current.rotation.z = -tickAngle;
    }

    // 8. Fades & Material Parameter Refinements
    if (glassMatRef.current) {
      // Target opacity driven by Core Reveal in milestones
      glassMatRef.current.opacity = THREE.MathUtils.lerp(
        glassMatRef.current.opacity,
        scrollParams.current.sapphireOpacity,
        0.08
      );
    }

    if (gearsMatRef.current) {
      // Glow emission fluctuates dynamically to show the audio activity in neon lines!
      const targetEmissiveIntensity = 1.8 + (finalAudioPulse * 3.2);
      gearsMatRef.current.emissiveIntensity = THREE.MathUtils.lerp(
        gearsMatRef.current.emissiveIntensity, 
        targetEmissiveIntensity, 
        0.15
      );
    }
  });

  return (
    <group ref={masterGroupRef}>
      {/* ==================== LAYER 1: SAPPHIRE GLASS & PREMIUM BEZEL ==================== */}
      <group>
        <mesh ref={glassRef}>
          <torusGeometry args={[1.25, 0.08, 16, 100]} />
          <meshPhysicalMaterial
            ref={glassMatRef}
            color="#a5f3fc"
            transmission={0.92}
            roughness={0.02}
            thickness={0.6}
            transparent={true}
            opacity={0.65}
            clearcoat={1.0}
            clearcoatRoughness={0.01}
            metalness={0.15}
          />
        </mesh>
        
        {/* Subtle cyan ring detail matching bezel */}
        <mesh position={[0, 0, 0.02]}>
          <ringGeometry args={[1.15, 1.18, 64]} />
          <meshStandardMaterial color="#00f3ff" roughness={0.1} metalness={0.9} transparent opacity={0.65} />
        </mesh>
      </group>

      {/* ==================== LAYER 2: DIAL FACE & MECHANICAL HANDS ==================== */}
      <group ref={dialRef} position={[0, 0, 0]}>
        {/* Main plate */}
        <mesh>
          <cylinderGeometry args={[1.15, 1.15, 0.06, 64]} />
          <meshStandardMaterial
            color="#0b0c10"
            roughness={0.3}
            metalness={0.92}
          />
        </mesh>

        {/* Outer scale markings */}
        <group position={[0, 0, 0.04]}>
          <mesh>
            <ringGeometry args={[1.05, 1.1, 64]} />
            <meshStandardMaterial color="#334155" roughness={0.1} metalness={0.8} />
          </mesh>
          
          {/* Hour tick marks */}
          {Array.from({ length: 12 }).map((_, i) => {
            const angle = (i * 30 * Math.PI) / 180;
            const x = Math.sin(angle) * 0.98;
            const y = Math.cos(angle) * 0.98;
            return (
              <mesh key={i} position={[x, y, 0.005]} rotation={[0, 0, -angle]}>
                <boxGeometry args={[0.025, 0.08, 0.01]} />
                <meshStandardMaterial color={i % 3 === 0 ? '#00f3ff' : '#94a3b8'} emissive={i % 3 === 0 ? '#00f3ff' : '#000000'} emissiveIntensity={i % 3 === 0 ? 1.8 : 0} />
              </mesh>
            );
          })}
        </group>

        {/* Chrono Subdials */}
        <group position={[0, 0, 0.035]}>
          {/* Subdial 1: Chrono seconds at left */}
          <mesh position={[-0.4, 0, 0.01]}>
            <ringGeometry args={[0.22, 0.25, 32]} />
            <meshStandardMaterial color="#1e293b" />
          </mesh>
          {/* Subdial 2: Power reserve at right */}
          <mesh position={[0.4, 0, 0.01]}>
            <ringGeometry args={[0.22, 0.25, 32]} />
            <meshStandardMaterial color="#1e293b" />
          </mesh>
        </group>

        {/* Center spindle pinion */}
        <mesh position={[0, 0, 0.065]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.04, 0.04, 0.04, 16]} />
          <meshStandardMaterial color="#38bdf8" roughness={0.1} metalness={0.9} />
        </mesh>

        {/* HOUR HAND */}
        <mesh ref={hourHandRef} position={[0, 0, 0.05]} name="hour-hand">
          <boxGeometry args={[0.05, 0.5, 0.015]} />
          {/* Offset origin to spindle pivot */}
          <meshStandardMaterial color="#f8fafc" roughness={0.1} metalness={0.5} />
        </mesh>

        {/* MINUTE HAND */}
        <mesh ref={minuteHandRef} position={[0, 0, 0.056]} name="minute-hand">
          <boxGeometry args={[0.035, 0.85, 0.015]} />
          <meshStandardMaterial color="#38bdf8" roughness={0.1} metalness={0.7} />
        </mesh>

        {/* SECOND HAND (Ticking Smoothly with overshoot) */}
        <mesh ref={secondHandRef} position={[0, 0, 0.062]} name="second-hand">
          <group position={[0, 0.38, 0]}>
            <boxGeometry args={[0.018, 0.95, 0.01]} />
            <meshStandardMaterial color="#00f3ff" emissive="#00f3ff" emissiveIntensity={2.5} />
          </group>
          {/* Small balanced counterbalance on opposite end */}
          <group position={[0, -0.15, 0]}>
            <boxGeometry args={[0.03, 0.3, 0.01]} />
            <meshStandardMaterial color="#0f172a" />
          </group>
        </mesh>
      </group>

      {/* ==================== LAYER 3: CORE GLOWING GEAR ARCHITECTURE ==================== */}
      <group ref={gearsRef} position={[0, 0, 0]}>
        {/* Core detailed Icosahedron Frame */}
        <mesh>
          <icosahedronGeometry args={[0.72, 1]} />
          <meshStandardMaterial
            ref={gearsMatRef}
            color="#00f3ff"
            wireframe={true}
            emissive="#00f3ff"
            emissiveIntensity={0.6}
            roughness={0.0}
            metalness={1.0}
          />
        </mesh>

        {/* Main Central Drive Wheel Gear Cog */}
        <mesh position={[0, 0, 0.1]} rotation={[0, 0, 0]}>
          <cylinderGeometry args={[0.42, 0.42, 0.04, 24]} />
          <meshStandardMaterial color="#1e293b" roughness={0.3} metalness={0.9} />
        </mesh>

        {/* Surrounding concentric support mechanical ring */}
        <mesh rotation={[0, 0, 0]}>
          <ringGeometry args={[0.82, 0.86, 30]} />
          <meshStandardMaterial color="#00f3ff" transparent opacity={0.35} wireframe />
        </mesh>

        {/* Orbiting gear support satellites */}
        {[-0.45, 0.45].map((offX, idx) => (
          <group key={idx} position={[offX, offX * 0.5, -0.12]} rotation={[0, 0, idx * Math.PI / 4]}>
            <mesh>
              <cylinderGeometry args={[0.2, 0.2, 0.06, 12]} />
              <meshStandardMaterial color="#475569" roughness={0.2} metalness={0.9} wireframe />
            </mesh>
          </group>
        ))}

        {/* Deep background sub-housing plate */}
        <mesh position={[0, 0, -0.28]}>
          <cylinderGeometry args={[1.0, 1.0, 0.04, 32]} />
          <meshStandardMaterial color="#020617" roughness={0.6} metalness={0.9} />
        </mesh>
      </group>
    </group>
  );
}

// Scene Camera Configuration and Studio Lights
export default function WatchScene({ scrollParams, mouseCoords }: WatchSceneProps) {
  return (
    <div className="w-full h-full">
      <Canvas
        camera={{ position: [0, 0, 4.5], fov: 42 }}
        gl={{ 
          antialias: true, 
          alpha: true, 
          preserveDrawingBuffer: false,
          powerPreference: "high-performance"
        }}
        onCreated={({ gl }) => {
          gl.setClearColor(0x000000, 0); // Transparent background for DOM blending
        }}
      >
        {/* Elite Ambient Fill - Boosted for Brighter Look */}
        <ambientLight intensity={1.5} />

        {/* Spotlighting for Reflections - Amplified significantly */}
        <spotLight
          position={[4, 6, 8]}
          intensity={6.5}
          angle={0.45}
          penumbra={1.0}
        />
        <spotLight
          position={[-4, 4, 3]}
          intensity={3.2}
          angle={0.6}
          penumbra={0.8}
        />

        {/* Secondary Fill (Cyan tech mood lighting) - Powerful Glow */}
        <directionalLight
          position={[0, -3, 4]}
          intensity={3.5}
          color="#00f3ff"
        />
        <directionalLight
          position={[2, -1, -3]}
          intensity={1.2}
          color="#a5f3fc"
        />

        <MainWatch scrollParams={scrollParams} mouseCoords={mouseCoords} />

        {/* Optional light control for rotating highlights */}
        <pointLight position={[0, 0, 2]} intensity={2.5} color="#38bdf8" />
      </Canvas>
    </div>
  );
}
