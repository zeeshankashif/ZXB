/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export class AudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private analyser: AnalyserNode | null = null;
  private droneOsc1: OscillatorNode | null = null;
  private droneOsc2: OscillatorNode | null = null;
  private isPlaying = false;
  private timerId: number | null = null;
  private bpm = 82; // Premium chilled cyber cyber-beat BPM (about 730ms per beat)
  private beatTime = 0;
  private currentBeatPulse = 0; // Value from 0 -> 1 for smooth visual spring coupling

  constructor() {
    // Lazy initialisation to comply with workspace policies
  }

  public init() {
    if (this.ctx) return;
    
    // Create audio context
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    this.ctx = new AudioContextClass();
    
    // Create Analyser
    this.analyser = this.ctx.createAnalyser();
    this.analyser.fftSize = 64;
    
    // Master Gain
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(0, this.ctx.currentTime);
    
    // Connect nodes
    this.analyser.connect(this.masterGain);
    this.masterGain.connect(this.ctx.destination);
    
    // Setup Drone
    this.setupSpaceDrone();
    
    // Start Beat Scheduler
    this.isPlaying = true;
    this.scheduleNextBeat();
    
    // Fade in
    this.masterGain.gain.linearRampToValueAtTime(0.4, this.ctx.currentTime + 1.5);
  }

  private setupSpaceDrone() {
    if (!this.ctx || !this.analyser) return;

    // Filter to make it deep and warm
    const lowpass = this.ctx.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.setValueAtTime(140, this.ctx.currentTime);
    lowpass.Q.setValueAtTime(1.5, this.ctx.currentTime);
    lowpass.connect(this.analyser);

    // Deep sub drone
    this.droneOsc1 = this.ctx.createOscillator();
    this.droneOsc1.type = 'sawtooth';
    this.droneOsc1.frequency.setValueAtTime(55, this.ctx.currentTime); // A1 note
    
    const droneGain1 = this.ctx.createGain();
    droneGain1.gain.setValueAtTime(0.18, this.ctx.currentTime);
    
    this.droneOsc1.connect(droneGain1);
    droneGain1.connect(lowpass);
    this.droneOsc1.start();

    // Minor third / fifth ambient pulse to make it feel cybertech
    this.droneOsc2 = this.ctx.createOscillator();
    this.droneOsc2.type = 'triangle';
    this.droneOsc2.frequency.setValueAtTime(82.4, this.ctx.currentTime); // E2 note (~fifth interval vibe)
    
    const droneGain2 = this.ctx.createGain();
    droneGain2.gain.setValueAtTime(0.10, this.ctx.currentTime);
    
    // Slow lfo on drone 2 filter or gain
    const lfo = this.ctx.createOscillator();
    lfo.frequency.setValueAtTime(0.15, this.ctx.currentTime); // Very slow swell
    const lfoGain = this.ctx.createGain();
    lfoGain.gain.setValueAtTime(0.08, this.ctx.currentTime);
    
    lfo.connect(lfoGain);
    lfoGain.connect(droneGain2.gain);
    
    this.droneOsc2.connect(droneGain2);
    droneGain2.connect(lowpass);
    lfo.start();
    this.droneOsc2.start();
  }

  private triggerProceduralKick() {
    if (!this.ctx || !this.analyser) return;

    const time = this.ctx.currentTime;
    
    // Kick drum synthesis
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.connect(gain);
    gain.connect(this.analyser);
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(120, time);
    // Sweep frequency down to sub bass
    osc.frequency.exponentialRampToValueAtTime(38, time + 0.16);
    
    // Amplitude decay
    gain.gain.setValueAtTime(0.85, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.35);
    
    this.currentBeatPulse = 1.0; // Instantly spike visual beat pulse
    
    osc.start(time);
    osc.stop(time + 0.38);

    // Procedural hi-hat / click
    const clickOsc = this.ctx.createOscillator();
    const clickGain = this.ctx.createGain();
    const highpass = this.ctx.createBiquadFilter();
    
    highpass.type = 'highpass';
    highpass.frequency.setValueAtTime(8000, time);
    
    clickOsc.connect(highpass);
    highpass.connect(clickGain);
    clickGain.connect(this.analyser);
    
    clickOsc.type = 'triangle';
    clickOsc.frequency.setValueAtTime(10000, time);
    
    clickGain.gain.setValueAtTime(0.02, time);
    clickGain.gain.exponentialRampToValueAtTime(0.001, time + 0.04);
    
    clickOsc.start(time);
    clickOsc.stop(time + 0.05);
  }

  private scheduleNextBeat() {
    if (!this.isPlaying) return;

    const delay = (60 / this.bpm) * 1000;
    this.triggerProceduralKick();
    
    this.timerId = window.setTimeout(() => {
      this.scheduleNextBeat();
    }, delay);
  }

  public updateBeatFading() {
    // Keep decaying the current beat pulse for smooth animations
    this.currentBeatPulse += (0.01 - this.currentBeatPulse) * 0.12; 
  }

  public getCurrentBeatValue(): number {
    return this.currentBeatPulse;
  }

  public getAnalyserData(): number {
    if (!this.analyser) return 0;
    
    const bufferLength = this.analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    this.analyser.getByteFrequencyData(dataArray);
    
    // Return average volume of mid/low frequencies
    let sum = 0;
    for (let i = 0; i < 12; i++) {
       sum += dataArray[i] || 0;
    }
    return sum / 12 / 255; // Normalized 0 -> 1
  }

  public toggle(forceState?: boolean) {
    const nextState = forceState !== undefined ? forceState : !this.isPlaying;
    if (nextState) {
      if (!this.ctx) {
        this.init();
      } else {
        this.isPlaying = true;
        if (this.ctx.state === 'suspended') {
          this.ctx.resume();
        }
        this.scheduleNextBeat();
        this.masterGain?.gain.linearRampToValueAtTime(0.4, this.ctx.currentTime + 0.5);
      }
    } else {
      this.isPlaying = false;
      if (this.timerId) {
        clearTimeout(this.timerId);
        this.timerId = null;
      }
      this.masterGain?.gain.linearRampToValueAtTime(0, this.ctx?.currentTime || 0 + 0.3);
    }
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  public cleanup() {
    this.isPlaying = false;
    if (this.timerId) {
      clearTimeout(this.timerId);
    }
    if (this.droneOsc1) {
      try { this.droneOsc1.stop(); } catch(e){}
    }
    if (this.droneOsc2) {
      try { this.droneOsc2.stop(); } catch(e){}
    }
    if (this.ctx) {
      this.ctx.close();
      this.ctx = null;
    }
  }
}

export const chronosAudio = new AudioEngine();
