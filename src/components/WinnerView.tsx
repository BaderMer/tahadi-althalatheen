/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Trophy, RefreshCw, Star, Sparkles, Heart } from 'lucide-react';
import { soundEffects } from '../utils/audio';

interface WinnerViewProps {
  winnerName: string;
  winnerTeam: 'A' | 'B' | 'TIE';
  scoreA: number;
  scoreB: number;
  nameA: string;
  nameB: string;
  onRestart: () => void;
}

export default function WinnerView({
  winnerName,
  winnerTeam,
  scoreA,
  scoreB,
  nameA,
  nameB,
  onRestart,
}: WinnerViewProps) {
  
  // Custom particle state for simulated cascading confetti
  const [particles, setParticles] = useState<any[]>([]);

  useEffect(() => {
    // Play winner triumph fanfare chord sequence
    soundEffects.playFanfare();

    // Generate confetti specs
    const colors = ['#f43f5e', '#ec4899', '#3b82f6', '#10b981', '#eab308', '#a855f7'];
    const specs = Array.from({ length: 45 }).map((_, idx) => ({
      id: idx,
      x: Math.random() * 100, // random start horizontal %
      y: Math.random() * -20 - 5, // random start offset above top
      color: colors[Math.floor(Math.random() * colors.length)],
      delay: Math.random() * 2,
      duration: Math.random() * 3 + 2,
      rotation: Math.random() * 360,
      size: Math.random() * 8 + 6,
    }));
    setParticles(specs);
  }, []);

  const isTie = winnerTeam === 'TIE';

  return (
    <div className="flex flex-col justify-between min-h-screen text-white bg-slate-950 p-6 select-none relative overflow-hidden" dir="rtl">
      
      {/* simulated DOM confetti particles flying around */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
        {particles.map((p) => (
          <motion.div
            key={p.id}
            initial={{ y: `${p.y}vh`, x: `${p.x}vw`, rotate: p.rotation, opacity: 1 }}
            animate={{ 
              y: '105vh', 
              x: `${p.x + (Math.random() * 20 - 10)}vw`,
              rotate: p.rotation + 360,
              opacity: [1, 1, 1, 0]
            }}
            transition={{ 
              duration: p.duration, 
              delay: p.delay, 
              repeat: Infinity, 
              ease: "linear" 
            }}
            style={{
              position: 'absolute',
              width: `${p.size}px`,
              height: `${p.size}px`,
              backgroundColor: p.color,
              borderRadius: p.id % 2 === 0 ? '50%' : '2px',
            }}
          />
        ))}
      </div>

      {/* Radiant theme flows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-violet-600/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Score header */}
      <div className="w-full text-center pt-4 z-10">
        <span className="text-2xs text-slate-500 font-bold block">انتهت الجلسة التنافسية الكبرى</span>
        <h2 className="text-sm font-semibold text-slate-400">تتويج بطل المباراة الكبرى</h2>
      </div>

      {/* Main champion presentation area */}
      <div className="w-full max-w-md flex-1 flex flex-col justify-center items-center z-10 my-4 text-center">
        
        {/* Glowing Trophy */}
        <motion.div
          initial={{ scale: 0.3, opacity: 0 }}
          animate={{ scale: [1, 1.1, 1], opacity: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="relative mb-6"
        >
          <div className={`absolute inset-0 rounded-full blur-[45px] opacity-25 animate-pulse ${
            isTie ? 'bg-indigo-505' : 'bg-yellow-500'
          }`} />
          <div className={`bg-slate-900/80 border p-7 rounded-full shadow-2xl relative ${
            isTie ? 'border-indigo-500/40' : 'border-yellow-500/30'
          }`}>
            <Trophy className={`w-20 h-20 mx-auto animate-bounce ${
              isTie ? 'text-indigo-400 drop-shadow-[0_0_15px_rgba(99,102,241,0.4)]' : 'text-yellow-400 drop-shadow-[0_0_15px_rgba(234,179,8,0.4)]'
            }`} />
          </div>
        </motion.div>

        {/* Winner Announcement Ribbon */}
        <div className="space-y-3 max-w-xs">
          <span className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center justify-center gap-1">
            <Sparkles className="w-4 h-4 fill-current text-yellow-400" />
            {isTie ? 'تعادل ملحمي مستحق!' : 'ألف مبروك النصر!'}
            <Sparkles className="w-4 h-4 fill-current text-yellow-400" />
          </span>

          <h1 className={`text-3xl font-black drop-shadow-md ${
            isTie 
              ? 'text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-sky-400' 
              : winnerTeam === 'A' 
                ? 'text-rose-400' 
                : 'text-sky-400'
          }`}>
            ★ {isTie ? 'تعادل بطولي!' : winnerName} ★
          </h1>

          <p className="text-xs text-slate-400 font-sans leading-relaxed">
            {isTie 
              ? `قدّم كل من فريق ${nameA} وفريق ${nameB} مواجهة أسطورية وانتهت الجلسة بتقاسم العظمة بالتساوي بمجموع ${scoreA} نقطة!`
              : `أثبت فريق ${winnerName} تفوقه الاستراتيجي في كافة تفرعات وتحديات المواجهة، فالمجد لكم اليوم!`
            }
          </p>
        </div>

        {/* Final details table */}
        <div className="w-full bg-slate-900/40 p-5 rounded-3xl border border-slate-850 mt-6 space-y-3.5">
          <h3 className="text-xs font-semibold text-slate-500 text-right pr-1">لوحة الترتيب الختامي للدرجات:</h3>
          
          <div className="flex justify-between items-center bg-slate-950 p-3 rounded-2xl border border-slate-900">
            <span className="text-xs text-rose-300 font-extrabold truncate max-w-[150px]">{nameA}</span>
            <span className="text-base font-black font-sans text-rose-450">{scoreA} نقاط كليّة</span>
          </div>

          <div className="flex justify-between items-center bg-slate-950 p-3 rounded-2xl border border-slate-900">
            <span className="text-xs text-sky-300 font-extrabold truncate max-w-[150px]">{nameB}</span>
            <span className="text-base font-black font-sans text-sky-450">{scoreB} نقاط كليّة</span>
          </div>
        </div>

      </div>

      {/* Bottom control */}
      <div className="w-full max-w-md z-10 pt-4">
        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={() => {
            soundEffects.playClick();
            onRestart();
          }}
          className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-base py-4 rounded-2xl flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/10 cursor-pointer animate-pulse"
        >
          <RefreshCw className="w-5 h-5" />
          مباراة انتقامية جديدة 🔄
        </motion.button>
      </div>
    </div>
  );
}
