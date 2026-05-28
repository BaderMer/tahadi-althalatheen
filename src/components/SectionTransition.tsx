/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Play, Award, Volume2, ShieldAlert } from 'lucide-react';
import { soundEffects } from '../utils/audio';

interface SectionTransitionProps {
  sectionIndex: number; // 0 to 3
  sectionTitle: string;
  description: string;
  rules: string[];
  onComplete: () => void;
}

export default function SectionTransition({
  sectionIndex,
  sectionTitle,
  description,
  rules,
  onComplete
}: SectionTransitionProps) {
  const [countdown, setCountdown] = useState(4); // 4 means pre-stages, 3,2,1,0 is action!
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Play a cool cosmic cinematic deep bass sweep on load
  useEffect(() => {
    // Custom deep TV game show transition rise sweep
    try {
      if (typeof window !== 'undefined') {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContextClass) {
          const ctx = new AudioContextClass();
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          const filter = ctx.createBiquadFilter();

          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(60, ctx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(320, ctx.currentTime + 1.2);

          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(150, ctx.currentTime);
          filter.frequency.exponentialRampToValueAtTime(1400, ctx.currentTime + 1.2);
          filter.Q.setValueAtTime(4, ctx.currentTime);

          gain.gain.setValueAtTime(0.01, ctx.currentTime);
          gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.15);
          gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1.2);

          osc.connect(filter);
          filter.connect(gain);
          gain.connect(ctx.destination);

          osc.start();
          osc.stop(ctx.currentTime + 1.2);
        }
      }
    } catch (e) {
      // Ignored if browser blocks audio autoplay
    }
  }, [sectionIndex]);

  // Handle countdown progression
  useEffect(() => {
    if (countdown === 4) {
      // Pre-countdown show duration (gives users 3.5 seconds to read the rules, or lock attention)
      const timer = setTimeout(() => {
        setCountdown(3);
        soundEffects.playTick();
        soundEffects.vibrate(50);
      }, 3500);
      return () => clearTimeout(timer);
    }

    if (countdown > 0 && countdown <= 3) {
      const timer = setTimeout(() => {
        const next = countdown - 1;
        setCountdown(next);
        if (next > 0) {
          soundEffects.playTick();
          soundEffects.vibrate(50);
        } else {
          // Play a triumphant success cue on 'Go' (0)
          soundEffects.playSuccess();
          soundEffects.vibrate([100, 50, 200]);
        }
      }, 1000);
      return () => clearTimeout(timer);
    }

    if (countdown === 0) {
      const timer = setTimeout(() => {
        setIsTransitioning(true);
        onComplete();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown, onComplete]);

  // Section icons or indicators
  const sectionIcons = ['🕹️', '⚖️', '🔔', '👤'];
  const colors = [
    'from-rose-500/20 to-violet-500/20',     // Turn Challenge
    'from-amber-550/20 to-orange-500/20',   // Auction
    'from-emerald-500/20 to-sky-500/20',     // Buzzer
    'from-indigo-500/20 to-purple-500/20'    // Who Am I
  ];

  return (
    <div 
      className="flex flex-col items-center justify-between min-h-screen text-white bg-slate-950 p-6 select-none relative overflow-hidden" 
      dir="rtl"
      id="section-transition-container"
    >
      {/* Dynamic colorful light glows in the background */}
      <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-gradient-to-r ${colors[sectionIndex]} rounded-full blur-[160px] opacity-60 pointer-events-none`} />

      {/* Top TV Header indicator */}
      <div className="w-full flex justify-between items-center z-10 max-w-md pt-4">
        <span className="text-2xs font-extrabold text-indigo-400 bg-indigo-950/50 border border-indigo-900/40 px-3 py-1.5 rounded-full tracking-widest font-mono">
          القسم ج{sectionIndex + 1} • جولة رسمية
        </span>
        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          <Volume2 className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
          <span>الصوت مفعل 🔊</span>
        </div>
      </div>

      {/* Main content body */}
      <div className="flex-1 w-full max-w-md flex flex-col items-center justify-center z-10 gap-8 min-h-[60vh]">
        <AnimatePresence mode="wait">
          {countdown === 4 ? (
            <motion.div
              key="intro"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="text-center space-y-7 w-full"
            >
              {/* Giant icon */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="text-7xl mb-2 drop-shadow-[0_0_25px_rgba(255,255,255,0.1)] select-none"
              >
                {sectionIcons[sectionIndex]}
              </motion.div>

              {/* Dynamic announcement string */}
              <div className="space-y-2">
                <span className="text-sm font-bold tracking-widest text-indigo-400 uppercase">استعدوا للمواجهة القادمة</span>
                <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-100 to-indigo-300 drop-shadow">
                  {sectionTitle}
                </h1>
                <p className="text-xs text-slate-300 max-w-xs mx-auto px-4 mt-2 leading-relaxed">
                  {description}
                </p>
              </div>

              {/* Rules Card */}
              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="bg-slate-900/80 border border-slate-800/80 p-5 rounded-3xl text-right space-y-3.5 shadow-2xl relative"
              >
                <div className="flex items-center gap-2 border-b border-slate-800/80 pb-2 text-xs font-bold text-slate-300">
                  <ShieldAlert className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  قواعد اللعب في هذا القسم:
                </div>
                <div className="space-y-2.5">
                  {rules.map((rule, index) => (
                    <div key={index} className="flex items-start gap-2.5 text-xs text-slate-300">
                      <span className="w-5 h-5 rounded-full bg-slate-950 flex items-center justify-center text-[10px] font-black text-indigo-400 border border-slate-800 flex-shrink-0">
                        {index + 1}
                      </span>
                      <p className="leading-relaxed mt-0.5">{rule}</p>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Informative loading spacer */}
              <div className="pt-2 text-[11px] font-mono tracking-wider text-slate-500 animate-pulse">
                يبدأ العد التنازلي تلقائياً...
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="countdown"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.5, opacity: 0 }}
              className="flex flex-col items-center justify-center text-center space-y-4"
            >
              <AnimatePresence mode="popLayout">
                <motion.div
                  key={countdown}
                  initial={{ scale: 0.3, opacity: 0, rotate: -30 }}
                  animate={{ scale: 1, opacity: 1, rotate: 0 }}
                  exit={{ scale: 1.6, opacity: 0, filter: "blur(4px)" }}
                  transition={{ type: "spring", stiffness: 350, damping: 20 }}
                  className="font-black drop-shadow-[0_0_35px_rgba(99,102,241,0.5)] select-none text-highlight"
                >
                  {countdown === 0 ? (
                    <span className="text-4xl xs:text-5xl md:text-6xl text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400 tracking-wide block">
                      انطلق! 🚀
                    </span>
                  ) : (
                    <span className="text-7xl xs:text-8xl md:text-9xl text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-indigo-400">
                      {countdown}
                    </span>
                  )}
                </motion.div>
              </AnimatePresence>
              <span className="text-sm font-bold text-indigo-300 tracking-widest mt-4 uppercase">
                {countdown === 0 ? 'ابدأ كحكم بحساب النقاط!' : 'احبسوا أنفاسكم...'}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer Branding */}
      <div className="w-full z-10 max-w-md pb-4 text-center">
        <div className="text-[10px] text-slate-600 font-mono tracking-widest">
          مواجهة تحدي الجلسة الودية الرسمية
        </div>
      </div>
    </div>
  );
}
