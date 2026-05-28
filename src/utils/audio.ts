/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Web Audio API Synthesizer for instant, lag-free offline sound effects
let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export const soundEffects = {
  // Mobile haptic vibration fallback
  vibrate(duration: number | number[] = 100) {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try {
        navigator.vibrate(duration);
      } catch (e) {
        // Safe catch for permissions
      }
    }
  },

  playClick() {
    const ctx = getAudioContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.1);
    
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.12);
    this.vibrate(20);
  },

  playSuccess() {
    const ctx = getAudioContext();
    if (!ctx) return;
    
    // Play a lovely major ascending triad (Arpeggio)
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, index) => {
      const timeOffset = index * 0.08;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + timeOffset);
      
      gain.gain.setValueAtTime(0.1, ctx.currentTime + timeOffset);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + timeOffset + 0.25);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + timeOffset);
      osc.stop(ctx.currentTime + timeOffset + 0.25);
    });
    this.vibrate(50);
  },

  playFailure() {
    const ctx = getAudioContext();
    if (!ctx) return;
    
    // Sad downward buzzing tone
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(180, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(80, ctx.currentTime + 0.35);
    
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.4);
    this.vibrate(250);
  },

  playStrikeBuzzer() {
    const ctx = getAudioContext();
    if (!ctx) return;
    
    // LOUD, SHARP, AND ANNOYING GAME-SHOW BUZZER (TOOOOOT!)
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const osc3 = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    
    // Aggressive, dirty retro frequencies
    osc1.type = 'sawtooth';
    osc1.frequency.setValueAtTime(125, ctx.currentTime);
    
    osc2.type = 'square';
    osc2.frequency.setValueAtTime(127, ctx.currentTime); // Beating detone
    
    osc3.type = 'sawtooth';
    osc3.frequency.setValueAtTime(188, ctx.currentTime); // Dissonant tritone offset
    
    // Lowpass resonance honk
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1200, ctx.currentTime);
    filter.Q.setValueAtTime(6, ctx.currentTime);
    
    // High envelope: Instant attack, sustain, rapid fade
    const dur = 0.65; // Extended to be satisfyingly dramatic
    gain.gain.setValueAtTime(0.02, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.6, ctx.currentTime + 0.04); // Powerful pop!
    gain.gain.setValueAtTime(0.6, ctx.currentTime + 0.45);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + dur);
    
    osc1.connect(filter);
    osc2.connect(filter);
    osc3.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    
    osc1.start();
    osc2.start();
    osc3.start();
    
    osc1.stop(ctx.currentTime + dur);
    osc2.stop(ctx.currentTime + dur);
    osc3.stop(ctx.currentTime + dur);
    
    // Rhythmic, urgent double haptic vibration
    this.vibrate([180, 80, 300]);
  },

  playBuzzer() {
    const ctx = getAudioContext();
    if (!ctx) return;
    
    // Aggressive dual-frequency buzzer sound
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc1.type = 'sawtooth';
    osc1.frequency.setValueAtTime(140, ctx.currentTime);
    
    osc2.type = 'square';
    osc2.frequency.setValueAtTime(143, ctx.currentTime); // Slight detune for that dirty raw retro buzz
    
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
    
    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);
    
    osc1.start();
    osc2.start();
    
    osc1.stop(ctx.currentTime + 0.4);
    osc2.stop(ctx.currentTime + 0.4);
    this.vibrate(300);
  },

  playTick() {
    const ctx = getAudioContext();
    if (!ctx) return;
    
    // High-pitched clock woodblock tick
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1200, ctx.currentTime);
    
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.005, ctx.currentTime + 0.05);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.06);
  },

  playHurryUpTick() {
    const ctx = getAudioContext();
    if (!ctx) return;
    
    // Urgent alarm double tick
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(1500, ctx.currentTime);
    
    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.005, ctx.currentTime + 0.06);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.07);
  },

  playFanfare() {
    const ctx = getAudioContext();
    if (!ctx) return;
    
    // Celebration chords! C-major arpeggiator/chord sequence in eighth-notes
    const scheduleTone = (freq: number, start: number, duration: number, vol: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, start);
      gain.gain.setValueAtTime(vol, start);
      gain.gain.exponentialRampToValueAtTime(0.01, start + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(start);
      osc.stop(start + duration);
    };

    const baseOffset = ctx.currentTime;
    
    // Quick trumpet style rhythm
    scheduleTone(261.63, baseOffset + 0.0, 0.15, 0.15); // C4
    scheduleTone(329.63, baseOffset + 0.15, 0.15, 0.15); // E4
    scheduleTone(392.00, baseOffset + 0.30, 0.15, 0.15); // G4
    scheduleTone(523.25, baseOffset + 0.45, 0.40, 0.20); // C5
    
    // Harmony notes for the final C5 chord
    scheduleTone(659.25, baseOffset + 0.45, 0.40, 0.10); // E5
    scheduleTone(783.99, baseOffset + 0.45, 0.40, 0.08); // G5
    
    this.vibrate(100);
    setTimeout(() => this.vibrate(100), 150);
    setTimeout(() => this.vibrate(300), 450);
  }
};
