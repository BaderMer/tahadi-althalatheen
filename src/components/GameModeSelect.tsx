/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronLeft, 
  HelpCircle, 
  Sparkles, 
  Zap, 
  Heart, 
  VolumeX, 
  Volume2, 
  BookOpen, 
  Clock,
  Dices
} from 'lucide-react';
import { GameMode } from '../types';
import { soundEffects } from '../utils/audio';

interface GameModeSelectProps {
  onBack: () => void;
  onSelectMode: (mode: GameMode) => void;
  teamAName: string;
  teamBName: string;
  currentRound: number;
}

interface ModeTemplate {
  id: GameMode;
  name: string;
  badge: string;
  titleAr: string;
  descAr: string;
  icon: string;
  color: string;
  borderColor: string;
  glowColor: string;
}

const MODES: ModeTemplate[] = [
  {
    id: 'turn_challenge',
    name: 'تحدي الدور',
    badge: 'استنزاف الأرواح',
    titleAr: 'تحدي الدور 🔄',
    descAr: 'الحكم يسأل الفرقتين بالتناوب. كل إجابة صحيحة تمدد الدور، وكل خطأ يسحب روحاً. من يصمد للنهاية؟',
    icon: '🔁',
    color: 'from-violet-500 to-indigo-600',
    borderColor: 'border-violet-500/30',
    glowColor: 'shadow-violet-500/10'
  },
  {
    id: 'auction',
    name: 'المزاد الحاسم',
    badge: 'مزايدة ومخاطرة',
    titleAr: 'المزاد الحاسم 📢',
    descAr: 'زايد على عدد الإجابات التي تقدر على سردها خلال ٣٠ ثانية. المزايد الأعلى يخوض المغامرة بمفرده!',
    icon: '🔥',
    color: 'from-rose-500 to-pink-600',
    borderColor: 'border-rose-500/30',
    glowColor: 'shadow-rose-500/10'
  },
  {
    id: 'buzzer',
    name: 'جرس السرعة',
    badge: 'سرعة رد الفعل',
    titleAr: 'جرس السرعة 🔔',
    descAr: 'ضع الهاتف بالمنتصف. سؤال يظهر، ومن يضغط الجرس أولاً يربح الدور. إجابة خاطئة تنقل الدور فورياً لخصمك!',
    icon: '⚡',
    color: 'from-amber-500 to-yellow-600',
    borderColor: 'border-amber-500/30',
    glowColor: 'shadow-amber-500/10'
  },
  {
    id: 'who_am_i',
    name: 'من أنا؟',
    badge: 'دقة استنتاجية',
    titleAr: 'لغز من أنا؟ 🕵️‍♂️',
    descAr: 'الحكم يبدأ بسرد أدلة غامضة تتدرج في السهولة. أسرع فريق يحزر المقصود يحقق نقاط النصر.',
    icon: '🧠',
    color: 'from-emerald-500 to-teal-600',
    borderColor: 'border-emerald-500/30',
    glowColor: 'shadow-emerald-500/10'
  }
];

export default function GameModeSelect({ onBack, onSelectMode, teamAName, teamBName, currentRound }: GameModeSelectProps) {
  const [spinning, setSpinning] = useState(false);
  const [spinIndex, setSpinIndex] = useState<number | null>(null);

  const startRandomSpin = () => {
    if (spinning) return;
    soundEffects.playClick();
    setSpinning(true);
    
    let counter = 0;
    const duration = 2000; // 2 seconds total spin
    const intervalTime = 100; // interval between highlights
    
    const interval = setInterval(() => {
      const idx = counter % MODES.length;
      setSpinIndex(idx);
      soundEffects.playTick();
      counter++;
    }, intervalTime);
    
    setTimeout(() => {
      clearInterval(interval);
      // land on a random index
      const finalIdx = Math.floor(Math.random() * MODES.length);
      setSpinIndex(finalIdx);
      setSpinning(false);
      
      // Delay slightly, play fanfare and select
      soundEffects.playSuccess();
      setTimeout(() => {
        onSelectMode(MODES[finalIdx].id);
      }, 700);
      
    }, duration);
  };

  const handleManualSelect = (modeId: GameMode) => {
    if (spinning) return;
    soundEffects.playClick();
    onSelectMode(modeId);
  };

  return (
    <div className="flex flex-col items-center justify-between min-h-screen text-white bg-slate-950 p-6 select-none relative overflow-auto" dir="rtl">
      {/* Glow styles */}
      <div className="absolute top-1/4 right-1/4 w-72 h-72 bg-indigo-600/5 rounded-full blur-[90px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/4 w-72 h-72 bg-violet-600/5 rounded-full blur-[90px] pointer-events-none" />

      {/* Header */}
      <div className="w-full flex items-center justify-between z-10 max-w-md">
        <button
          onClick={() => {
            if (spinning) return;
            soundEffects.playClick();
            onBack();
          }}
          disabled={spinning}
          className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 transition-all flex items-center justify-center disabled:opacity-50 cursor-pointer"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="text-center font-sans">
          <span className="text-xs text-slate-500 block">الجولة {currentRound}</span>
          <span className="text-sm font-bold text-slate-200">اختر طور التحدي</span>
        </div>
        <div className="w-10 h-10" />
      </div>

      {/* Main Container */}
      <div className="w-full max-w-md flex-1 flex flex-col justify-start z-10 mt-6 px-1">
        
        {/* Dynamic Random Spin Button - Pure game show look */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={startRandomSpin}
          disabled={spinning}
          className="w-full mb-6 py-4 bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 rounded-2xl border border-violet-500/25 flex items-center justify-center gap-2.5 shadow-xl shadow-indigo-600/20 text-base font-black tracking-wide disabled:opacity-75 relative overflow-hidden cursor-pointer"
        >
          {spinning ? (
            <>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              >
                <Dices className="w-5 h-5 text-yellow-300" />
              </motion.div>
              <span className="text-yellow-300 font-bold animate-pulse">جاري سحب الطور عشوائياً...</span>
            </>
          ) : (
            <>
              <Dices className="w-5 h-5 text-yellow-300" />
              <span>الطور العشوائي الحماسي 🎲</span>
            </>
          )}

          {/* Rainbow neon background sheen during spinning */}
          {spinning && (
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 via-pink-500/20 to-emerald-500/20 mix-blend-overlay animate-pulse" />
          )}
        </motion.button>

        <div className="space-y-3">
          {MODES.map((mode, idx) => {
            const isHighlighted = spinIndex === idx;
            
            return (
              <motion.div
                key={mode.id}
                whileTap={{ scale: spinning ? 1 : 0.98 }}
                onClick={() => handleManualSelect(mode.id)}
                className={`p-4 rounded-2xl border transition-all duration-300 flex items-center gap-4 cursor-pointer relative overflow-hidden ${
                  isHighlighted 
                    ? `bg-slate-900 border-${mode.id === 'turn_challenge' ? 'violet' : mode.id === 'auction' ? 'rose' : mode.id === 'buzzer' ? 'amber' : 'emerald'}-400/80 ring-2 ring-${mode.id === 'turn_challenge' ? 'violet' : mode.id === 'auction' ? 'rose' : mode.id === 'buzzer' ? 'amber' : 'emerald'}-400/50 scale-[1.03] shadow-lg ${mode.glowColor}`
                    : 'bg-slate-900/45 border-slate-800/80 hover:border-slate-800'
                }`}
              >
                {/* Visual decorative side color strap */}
                <div className={`absolute top-0 bottom-0 right-0 w-1.5 bg-gradient-to-b ${mode.color}`} />

                {/* Left Side Icon Badge */}
                <div className={`p-3 rounded-2xl bg-gradient-to-br ${mode.color} text-2xl flex-shrink-0 flex items-center justify-center shadow-md shadow-black/20`}>
                  <span className="leading-none">{mode.icon}</span>
                </div>

                {/* Centered details */}
                <div className="flex-1 flex flex-col text-right font-sans pr-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-extrabold text-slate-100">{mode.name}</h3>
                    <span className="text-[10px] items-center px-2 py-0.5 rounded-full bg-slate-950/60 border border-slate-800 text-slate-400 font-bold">
                      {mode.badge}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    {mode.descAr}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      <div className="mt-4 text-center text-xs text-slate-500">
        اضغط على أي طور للبدء، أو اترك القدر يختار للاحتكام والدقة!
      </div>
    </div>
  );
}
