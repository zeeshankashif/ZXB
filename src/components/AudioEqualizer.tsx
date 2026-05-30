/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { chronosAudio } from '../utils/audio';

interface AudioEqualizerProps {
  audioActive: boolean;
}

export default function AudioEqualizer({ audioActive }: AudioEqualizerProps) {
  const [bars, setBars] = useState<number[]>(new Array(12).fill(0.08));

  useEffect(() => {
    if (!audioActive) {
      setBars(new Array(12).fill(0.1));
      return;
    }

    let isSubscribed = true;
    const updateLoop = () => {
      if (!isSubscribed) return;

      const power = chronosAudio.getAnalyserData(); // 0 -> 1 value
      const beat = chronosAudio.getCurrentBeatValue(); // decaying impulse

      // Synthesize 12 aesthetic bars moving fluidly to the beat metrics
      const nextBars = Array.from({ length: 12 }).map((_, i) => {
        // Individualized offset frequencies
        const noise = Math.sin(Date.now() * 0.007 + i * 0.45) * 0.3 + 0.35;
        const reactiveAddition = power * 0.6 + beat * 0.9 * (i % 2 === 0 ? 0.9 : 0.5);
        return Math.max(0.08, Math.min(1.0, noise * 0.35 + reactiveAddition * 0.65));
      });

      setBars(nextBars);
      requestAnimationFrame(updateLoop);
    };

    requestAnimationFrame(updateLoop);
    return () => {
      isSubscribed = false;
    };
  }, [audioActive]);

  return (
    <div className="h-10 w-full bg-black/45 hover:bg-black/60 rounded-lg flex items-end justify-between px-5 py-2 border border-white/5 relative overflow-hidden transition-all">
      <div className="absolute top-1.5 left-4 flex items-center gap-1.5 pointer-events-none">
        <span className={`w-1.5 h-1.5 rounded-full ${audioActive ? 'bg-cyan-400 animate-pulse' : 'bg-zinc-600'}`} />
        <span className="font-mono text-[7px] text-zinc-500 tracking-widest uppercase">
          {audioActive ? 'SYNTH PULSE: CONSTANT' : 'SOUND ENGINE COLD'}
        </span>
      </div>
      
      {bars.map((h, i) => (
        <div
          key={i}
          style={{ height: `${h * 100}%` }}
          className={`w-1.5 rounded-t-sm transition-all duration-75 ${
            audioActive ? 'bg-gradient-to-t from-cyan-600 to-cyan-400' : 'bg-zinc-800'
          }`}
        />
      ))}
    </div>
  );
}
