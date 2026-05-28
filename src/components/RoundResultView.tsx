/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { Trophy, ArrowLeft, Zap, Star, Shield, Play } from 'lucide-react';
import { Team } from '../types';
import { soundEffects } from '../utils/audio';

interface RoundResultProps {
  teamA: Team;
  teamB: Team;
  currentRound: number;
  maxRounds: number;
  roundWinner: 'A' | 'B' | null;
  scoreGain: number;
  onNextRound: () => void;
  onFinishGame: (winner: 'A' | 'B') => void;
}

export default function RoundResultView({
  teamA,
  teamB,
  currentRound,
  maxRounds,
  roundWinner,
  scoreGain,
  onNextRound,
  onFinishGame,
}: RoundResultProps) {
  
  // Decide if there is a ultimate match winner right now!
  const targetCompleted = teamA.score >= maxRounds || teamB.score >= maxRounds;
  const matchWinner = teamA.score >= teamB.score ? 'A' : 'B';

  const handleProceed = () => {
    soundEffects.playClick();
    if (targetCompleted) {
      onFinishGame(matchWinner);
    } else {
      onNextRound();
    }
  };

  const percentA = Math.min(100, (teamA.score / maxRounds) * 100);
  const percentB = Math.min(100, (teamB.score / maxRounds) * 100);

  return (
    <div className="flex flex-col justify-between min-h-screen text-white bg-slate-950 p-6 select-none relative" dir="rtl border">
      {/* Decorative gradients */}
      <div className="absolute top-1/4 right-1/4 w-80 h-80 bg-violet-600/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-rose-600/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Header */}
      <div className="w-full text-center z-10 pt-2">
        <span className="text-2xs text-slate-500 font-bold block">ملخص الجولة المنقضية</span>
        <h2 className="text-lg font-black text-slate-200">النتائج الترتيبية ومعدل الفوز</h2>
      </div>

      {/* Main card */}
      <div className="w-full max-w-md flex-1 flex flex-col justify-center z-10 my-4 text-center">
        
        {/* Celebrate who just won this specific round! */}
        {roundWinner && (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="mb-6 p-4 bg-slate-900/60 border border-slate-850 rounded-2xl relative overflow-hidden"
          >
            {/* Tiny stars overlay */}
            <Star className="w-4 h-4 text-yellow-400 absolute top-3 right-3 animate-ping" />
            <span className="text-[10px] font-bold tracking-wider text-yellow-400 bg-yellow-400/10 px-2 py-0.5 rounded-full border border-yellow-400/20">
              مقاتل الجولة الأخيرة 🏆
            </span>
            <p className="text-sm font-semibold text-slate-300 mt-2">
              حقق فريق <span className="font-extrabold text-white">{roundWinner === 'A' ? teamA.name : teamB.name}</span> فوزاً ساحقاً وحصل على <span className="text-yellow-400 font-extrabold">+{scoreGain}</span> نقطة!
            </p>
          </motion.div>
        )}

        {/* Dynamic Dual Progress Standings */}
        <div className="space-y-6 bg-slate-900/40 p-5 rounded-3xl border border-slate-850">
          
          <div className="text-xs text-slate-400">
            الهدف الكلي للفوز بالمعركة: <span className="font-bold text-white">{maxRounds} نقاط</span>
          </div>

          {/* TEAM A STAT */}
          <div className="space-y-2 text-right">
            <div className="flex justify-between items-end">
              <span className="text-sm font-extrabold text-rose-300 truncate max-w-[150px]">{teamA.name}</span>
              <span className="text-xs font-bold font-sans text-rose-400">
                <span className="text-lg font-black">{teamA.score}</span> / {maxRounds} نقاط
              </span>
            </div>
            {/* Track bar */}
            <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden border border-slate-850">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${percentA}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="bg-gradient-to-r from-rose-500 to-rose-600 h-full rounded-full"
              />
            </div>
          </div>

          {/* TEAM B STAT */}
          <div className="space-y-2 text-right pt-2 border-t border-slate-800/60">
            <div className="flex justify-between items-end">
              <span className="text-sm font-extrabold text-sky-300 truncate max-w-[150px]">{teamB.name}</span>
              <span className="text-xs font-bold font-sans text-sky-400">
                <span className="text-lg font-black">{teamB.score}</span> / {maxRounds} نقاط
              </span>
            </div>
            {/* Track bar */}
            <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden border border-slate-850">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${percentB}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="bg-gradient-to-r from-sky-500 to-sky-600 h-full rounded-full"
              />
            </div>
          </div>

        </div>
      </div>

      {/* Actions */}
      <div className="w-full max-w-md z-10 pt-2">
        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={handleProceed}
          className="w-full bg-gradient-to-r from-violet-600 to-indigo-650 hover:from-violet-550 hover:to-indigo-550 text-white font-black text-base py-3.5 rounded-2xl flex items-center justify-center gap-1.5 shadow-xl shadow-indigo-600/15 cursor-pointer"
        >
          {targetCompleted ? (
            <>
              تتويج بطل التحدي النهائي! 👑
            </>
          ) : (
            <>
              الانتقال للجولة القادمة ({currentRound + 1}) 🚀
            </>
          )}
        </motion.button>
      </div>
    </div>
  );
}
