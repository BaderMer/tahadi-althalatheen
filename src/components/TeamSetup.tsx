/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Users, Award, Play, ChevronLeft, ShieldAlert } from 'lucide-react';
import { soundEffects } from '../utils/audio';

interface TeamSetupProps {
  onBack: () => void;
  onNext: (teamAName: string, teamBName: string, maxRounds: number) => void;
}

export default function TeamSetup({ onBack, onNext }: TeamSetupProps) {
  const [teamA, setTeamA] = useState('الأشاوس');
  const [teamB, setTeamB] = useState('الوحوش');
  const [rounds, setRounds] = useState(5);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamA.trim() || !teamB.trim()) {
      soundEffects.playFailure();
      return;
    }
    soundEffects.playClick();
    onNext(teamA.trim(), teamB.trim(), rounds);
  };

  const selectRounds = (num: number) => {
    soundEffects.playClick();
    setRounds(num);
  };

  // Fun random generators
  const teamNamesA = ['الفرسان', 'الأشاوس', 'نمور الجلسة', 'صقور الرمال', 'الملوك'];
  const teamNamesB = ['الوحوش', 'العمالقة', 'أسود القلعة', 'المرعبين', 'الكوماندوز'];

  const randomizeNames = () => {
    soundEffects.playClick();
    const randA = teamNamesA[Math.floor(Math.random() * teamNamesA.length)];
    const randB = teamNamesB[Math.floor(Math.random() * teamNamesB.length)];
    setTeamA(randA);
    setTeamB(randB);
  };

  return (
    <div className="flex flex-col items-center justify-between min-h-screen text-white bg-slate-950 p-6 select-none relative overflow-auto" dir="rtl">
      {/* Background glow */}
      <div className="absolute top-10 left-10 w-64 h-64 bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-64 h-64 bg-violet-500/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Top Header */}
      <div className="w-full flex items-center justify-between z-10 max-w-md">
        <button
          onClick={() => {
            soundEffects.playClick();
            onBack();
          }}
          className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 transition-all flex items-center justify-center cursor-pointer"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <span className="text-sm font-bold text-slate-400 font-sans">تجهيز الفرق</span>
        <div className="w-10 h-10" /> {/* Spacer */}
      </div>

      {/* Main card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-slate-900/50 backdrop-blur-md rounded-3xl p-6 border border-slate-800/80 my-8 shadow-2xl z-10"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Section: Names */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-indigo-400 flex items-center gap-1.5 step-heading">
                <Users className="w-4 h-4" />
                تسمية الفريقين
              </h3>
              <button
                type="button"
                onClick={randomizeNames}
                className="text-xs text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-800 px-2.5 py-1 rounded-lg transition-all"
              >
                توليد عشوائي 🎲
              </button>
            </div>

            {/* Team A Input */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-rose-300 block">فريق أ (اللون الأحمر)</label>
              <input
                type="text"
                value={teamA}
                onChange={(e) => setTeamA(e.target.value)}
                maxLength={15}
                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 hover:border-rose-500/30 focus:border-rose-500 rounded-xl text-slate-100 font-extrabold text-base focus:outline-none transition-all placeholder:text-slate-600"
                placeholder="أدخل اسم الفريق الأول..."
              />
            </div>

            {/* Team B Input */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-sky-300 block">فريق ب (اللون الأزرق)</label>
              <input
                type="text"
                value={teamB}
                onChange={(e) => setTeamB(e.target.value)}
                maxLength={15}
                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 hover:border-sky-500/30 focus:border-sky-500 rounded-xl text-slate-100 font-extrabold text-base focus:outline-none transition-all placeholder:text-slate-600"
                placeholder="أدخل اسم الفريق الثاني..."
              />
            </div>
          </div>

          {/* Section: Round Settings */}
          <div className="space-y-3 pt-2">
            <h3 className="text-sm font-bold text-indigo-400 flex items-center gap-1.5 step-heading">
              <Award className="w-4 h-4" />
              النقاط المطلوبة للفوز
            </h3>
            <p className="text-xs text-slate-400">كم جولة مرشحة للفوز الكلي بالمعركة؟</p>
            
            <div className="grid grid-cols-4 gap-2">
              {[3, 5, 7, 10].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => selectRounds(num)}
                  className={`py-3 rounded-xl font-bold font-sans transition-all text-sm border cursor-pointer ${
                    rounds === num
                      ? 'bg-gradient-to-r from-violet-600 to-indigo-600 border-violet-500 text-white shadow-md shadow-violet-500/10'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-900'
                  }`}
                >
                  {num} جولات
                </button>
              ))}
            </div>
          </div>

          {/* Guidelines info */}
          <div className="flex gap-2.5 items-start bg-slate-950 p-3 rounded-xl border border-slate-800 text-[11px] leading-relaxed text-slate-400">
            <ShieldAlert className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-slate-300">مهمة الحكم:</span> اللعبة تتطلب تسليم الهاتف لشخص واحد يدير الجلسة كالحكم/المضيف، يقرأ الأسئلة ويحسب النقاط للعدالة والحماس!
            </div>
          </div>

          <motion.button
            whileTap={{ scale: 0.96 }}
            type="submit"
            className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-550 hover:to-indigo-550 text-white font-bold text-base py-3.5 rounded-2xl transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-indigo-600/10 cursor-pointer"
          >
            الانتقال لتحديد التصنيفات 🎯
          </motion.button>

        </form>
      </motion.div>

      <div className="h-6" /> {/* Spacer */}
    </div>
  );
}
