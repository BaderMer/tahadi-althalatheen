/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, Trophy, Zap } from 'lucide-react';
import { soundEffects } from '../utils/audio';

interface SplashProps {
  onStart: () => void;
}

export default function Splash({ onStart }: SplashProps) {
  const handleStart = () => {
    soundEffects.playClick();
    onStart();
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-white bg-slate-950 px-4 select-none relative overflow-hidden text-center">
      {/* Decorative ambient neon background glows */}
      <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-violet-600/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-rose-600/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Main Container */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="z-10 max-w-md w-full flex flex-col items-center"
      >
        {/* Creator Credit Badge */}
        <div className="mb-6 text-xs font-semibold text-slate-400 bg-slate-900/45 px-3.5 py-1.5 rounded-full border border-slate-800/60 shadow-sm shadow-indigo-950/25 whitespace-nowrap">
          Created by <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-300 to-indigo-300 font-bold tracking-wide">Bader Mershed</span>
        </div>

        {/* Game Badge */}
        <motion.div
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
          className="bg-slate-900 border border-violet-500/30 text-violet-300 font-sans tracking-wide text-xs px-4 py-1.5 rounded-full flex items-center gap-1.5 mb-6 shadow-lg shadow-violet-500/5"
        >
          <Trophy className="w-3.5 h-3.5 text-yellow-400" />
          تحدي الجلسة المثير للفرق
        </motion.div>

        {/* Brand / Logo Title */}
        <h1 className="text-5xl font-extrabold tracking-tight mb-2 text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-pink-400 to-rose-400">
          تحدي الثلاثين
        </h1>
        <h2 className="text-2xl font-bold text-slate-300 mb-8 font-sans">
          لعبة التحديات الجماعية 
        </h2>

        {/* Visual Game Concept */}
        <div className="grid grid-cols-2 gap-3 w-full mb-10 text-right">
          <div className="bg-slate-900/60 backdrop-blur-md rounded-2xl p-4 border border-slate-800 flex flex-col justify-between">
            <Zap className="w-6 h-6 text-rose-400 mb-2" />
            <div>
              <h3 className="text-sm font-bold text-slate-200">٤ أطوار لعب</h3>
              <p className="text-xs text-slate-400 mt-1">تحدي الدور، المزاد، الجرس، ومن أنا في شاشة واحدة.</p>
            </div>
          </div>
          <div className="bg-slate-900/60 backdrop-blur-md rounded-2xl p-4 border border-slate-800 flex flex-col justify-between">
            <Sparkles className="w-6 h-6 text-yellow-400 mb-2" />
            <div>
              <h3 className="text-sm font-bold text-slate-200">أسئلة متنوعة</h3>
              <p className="text-xs text-slate-400 mt-1">٨ تصنيفات حماسية ومستويات متفاوتة تناسب الجميع.</p>
            </div>
          </div>
        </div>

        {/* Play Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleStart}
          className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-lg py-4 px-8 rounded-2xl shadow-xl shadow-indigo-600/20 hover:shadow-indigo-600/30 transition-all border border-violet-500/20 flex items-center justify-center gap-2 cursor-pointer"
        >
          ابدأ اللعب الآن 🚀
        </motion.button>

        {/* Description footer */}
        <p className="text-xs text-slate-500 mt-8 leading-relaxed font-sans max-w-xs">
          اللعبة تُلعب محلياً على هاتف واحد بين فريقين. الحكم يمسك الهاتف ويدير الأسئلة والمؤقتات.
        </p>
      </motion.div>
    </div>
  );
}
