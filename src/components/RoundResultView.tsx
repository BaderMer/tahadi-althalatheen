/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { Trophy, ArrowLeft, Zap, Star, Shield, Play, Layers } from 'lucide-react';
import { Team } from '../types';
import { soundEffects } from '../utils/audio';

interface RoundResultProps {
  teamA: Team;
  teamB: Team;
  currentSectionIndex: number; // 0 to 3
  currentQuestionIndexInSection: number; // e.g. 1 to 5
  totalQuestionsInSection: number; // e.g. 5
  sectionTitle: string;
  roundWinner: 'A' | 'B' | null;
  scoreGain: number;
  isLastQuestionOfMatch: boolean;
  isSectionChange: boolean; // Tells us if the next click moves to a brand new section
  nextSectionTitle?: string;
  onProceed: () => void;
}

export default function RoundResultView({
  teamA,
  teamB,
  currentSectionIndex,
  currentQuestionIndexInSection,
  totalQuestionsInSection,
  sectionTitle,
  roundWinner,
  scoreGain,
  isLastQuestionOfMatch,
  isSectionChange,
  nextSectionTitle,
  onProceed,
}: RoundResultProps) {
  
  const handleProceedClick = () => {
    soundEffects.playClick();
    onProceed();
  };

  // Static list of all sections for TV standings checkoff
  const sectionsInfo = [
    { title: 'تحدي الدور', subtitle: '٥ أسئلة منفصلة' },
    { title: 'المزاد الحاسم', subtitle: '٥ أسئلة مزايدة' },
    { title: 'جرس السرعة', subtitle: '٥ أسئلة سرعة' },
    { title: 'مسابقة من أنا', subtitle: '٥ أسئلة تلميحات' }
  ];

  return (
    <div className="flex flex-col justify-between min-h-screen text-white bg-slate-950 p-6 select-none relative" dir="rtl">
      {/* Decorative gradients */}
      <div className="absolute top-1/4 right-1/4 w-80 h-80 bg-violet-600/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-rose-600/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Header */}
      <div className="w-full text-center z-10 pt-2">
        <span className="text-2xs text-indigo-400 font-bold tracking-wider font-mono uppercase bg-indigo-950/40 border border-indigo-900/30 px-3 py-1 rounded-full inline-block">
          {sectionTitle} • السؤال {currentQuestionIndexInSection} من {totalQuestionsInSection}
        </span>
        <h2 className="text-xl font-black text-slate-200 mt-2">نقاط المواجهة الحالية 📊</h2>
      </div>

      {/* Main content */}
      <div className="w-full max-w-md flex-1 flex flex-col justify-center z-10 my-4 text-center">
        
        {/* Celebrate who just won this specific round! */}
        {roundWinner ? (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="mb-5 p-4 bg-slate-900/60 border border-slate-800/60 rounded-2xl relative overflow-hidden"
          >
            <Star className="w-4 h-4 text-yellow-500 absolute top-3 right-3 animate-pulse" />
            <span className="text-[10px] font-bold tracking-wider text-yellow-400 bg-yellow-400/10 px-2.5 py-0.5 rounded-full border border-yellow-400/20">
              مقاتل الجولة الأخيرة 🏆
            </span>
            <p className="text-sm font-semibold text-slate-300 mt-2 leading-relaxed">
              حقق فريق <span className="font-extrabold text-white text-rose-300">{roundWinner === 'A' ? teamA.name : teamB.name}</span> فوزاً ساحقاً وحصل على <span className="text-yellow-400 font-extrabold">+{scoreGain}</span> نقطة!
            </p>
          </motion.div>
        ) : (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="mb-5 p-4 bg-slate-900/60 border border-slate-800/60 rounded-2xl relative overflow-hidden"
          >
            <span className="text-[10px] font-bold tracking-wider text-slate-400 bg-slate-800/30 px-2.5 py-0.5 rounded-full border border-slate-700/30">
              تعادل أو لا نقاط 🤝
            </span>
            <p className="text-sm font-semibold text-slate-300 mt-2 leading-relaxed">
              انتهت الجولة الحالية دون إضافة نقاط جديدة لأي فريق. شدّوا الهمة للقادم!
            </p>
          </motion.div>
        )}

        {/* Core Live Score Standings */}
        <div className="bg-slate-900/40 p-5 rounded-3xl border border-slate-850 space-y-5">
          <div className="text-[10px] font-bold text-slate-500 font-mono tracking-wider uppercase mb-1">لوحة الترتيب المباشر لمجموع النقاط:</div>

          {/* TEAM A STAT */}
          <div className="space-y-2 text-right">
            <div className="flex justify-between items-end">
              <span className="text-sm font-extrabold text-rose-300 truncate max-w-[150px]">{teamA.name}</span>
              <span className="text-xs font-bold font-sans text-rose-400">
                <span className="text-xl font-black">{teamA.score}</span> نقطة كسبها
              </span>
            </div>
            {/* Visual background tracker bar */}
            <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-850">
              <div 
                style={{ width: `${Math.min(100, Math.max(5, (teamA.score / Math.max(1, teamA.score + teamB.score)) * 100))}%` }}
                className="bg-gradient-to-r from-rose-500 to-rose-600 h-full rounded-full transition-all duration-500"
              />
            </div>
          </div>

          {/* TEAM B STAT */}
          <div className="space-y-2 text-right pt-2 border-t border-slate-800/60">
            <div className="flex justify-between items-end">
              <span className="text-sm font-extrabold text-sky-300 truncate max-w-[150px]">{teamB.name}</span>
              <span className="text-xs font-bold font-sans text-sky-400">
                <span className="text-xl font-black">{teamB.score}</span> نقطة كسبها
              </span>
            </div>
            {/* Visual background tracker bar */}
            <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-850">
              <div 
                style={{ width: `${Math.min(100, Math.max(5, (teamB.score / Math.max(1, teamA.score + teamB.score)) * 100))}%` }}
                className="bg-gradient-to-r from-sky-500 to-sky-600 h-full rounded-full transition-all duration-500"
              />
            </div>
          </div>
        </div>

        {/* Section flow sequence map */}
        <div className="mt-5 p-4 bg-slate-900/20 rounded-2xl border border-slate-900 text-right">
          <span className="text-[10px] font-extrabold text-indigo-400 block mb-3">مسار البرنامج التنافسي 📺:</span>
          
          <div className="grid grid-cols-4 gap-2">
            {sectionsInfo.map((sec, idx) => {
              const isPast = idx < currentSectionIndex;
              const isCurrent = idx === currentSectionIndex;
              return (
                <div 
                  key={idx} 
                  className={`p-2 rounded-xl text-center border transition-all ${
                    isCurrent 
                      ? 'bg-indigo-950/60 border-indigo-500/50 shadow-sm shadow-indigo-500/10' 
                      : isPast 
                        ? 'bg-slate-900/30 border-slate-800/50 opacity-40' 
                        : 'bg-slate-950/20 border-slate-900/30 opacity-20'
                  }`}
                >
                  <p className={`text-[10px] font-black leading-tight ${
                    isCurrent ? 'text-indigo-400' : 'text-slate-200'
                  }`}>
                    {sec.title}
                  </p>
                  <span className="text-5xs block mt-0.5 text-slate-500">
                    {isPast ? 'مكتمل ✅' : isCurrent ? 'نشط 🟢' : 'مغلق 🔒'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Actions */}
      <div className="w-full max-w-md z-10 pt-2">
        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={handleProceedClick}
          className="w-full bg-gradient-to-r from-violet-600 to-indigo-650 hover:from-violet-550 hover:to-indigo-550 text-white font-black text-base py-3.5 rounded-2xl flex items-center justify-center gap-1.5 shadow-xl shadow-indigo-600/15 cursor-pointer"
        >
          {isLastQuestionOfMatch ? (
            <>
              تتويج بطل التحدي النهائي! 👑
            </>
          ) : isSectionChange ? (
            <>
              الانتقال للقسم التالي: {nextSectionTitle} ⚖️
            </>
          ) : (
            <>
              الانتقال للسؤال القادم 🚀
            </>
          )}
        </motion.button>
      </div>
    </div>
  );
}
