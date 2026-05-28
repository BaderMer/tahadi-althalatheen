/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { HelpCircle, Play, Volume2, VolumeX, Sparkles, BookOpen, Clock, Heart, Zap, Award } from 'lucide-react';
import { soundEffects } from '../utils/audio';

interface MainMenuProps {
  onStartGame: () => void;
}

export default function MainMenu({ onStartGame }: MainMenuProps) {
  const [showHowToPlay, setShowHowToPlay] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const toggleSound = () => {
    soundEffects.playClick();
    setSoundEnabled(!soundEnabled);
    // Real toggle in localStorage if wanted, but simpler is state for feedback
  };

  const handleStart = () => {
    soundEffects.playClick();
    onStartGame();
  };

  const handleOpenHelp = () => {
    soundEffects.playClick();
    setShowHowToPlay(true);
  };

  const handleCloseHelp = () => {
    soundEffects.playClick();
    setShowHowToPlay(false);
  };

  return (
    <div className="flex flex-col items-center justify-between min-h-screen text-white bg-slate-950 p-6 select-none relative overflow-hidden">
      {/* Decorative ambient neon background glows */}
      <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-indigo-600/10 rounded-full blur-[80px] pointer-events-none" />
      <div className="absolute bottom-1/3 left-1/4 w-72 h-72 bg-purple-600/10 rounded-full blur-[80px] pointer-events-none" />

      {/* Header bar */}
      <div className="w-full flex items-center justify-between z-10 max-w-md">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={toggleSound}
          className="p-3 rounded-2xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 transition-all cursor-pointer"
        >
          {soundEnabled ? <Volume2 className="w-5 h-5 text-indigo-400" /> : <VolumeX className="w-5 h-5 text-slate-500" />}
        </motion.button>

        <h3 className="text-sm font-bold text-slate-400 font-sans tracking-wide">تحدي الثلاثين</h3>

        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={handleOpenHelp}
          className="p-3 rounded-2xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 transition-all cursor-pointer"
        >
          <HelpCircle className="w-5 h-5 text-slate-300" />
        </motion.button>
      </div>

      {/* Main title & logo */}
      <div className="flex-1 flex flex-col items-center justify-center z-10 max-w-md w-full my-8 text-center">
        <motion.div
          animate={{ rotate: [0, 2, -2, 0] }}
          transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
          className="relative mb-6"
        >
          <div className="absolute inset-0 bg-violet-600 rounded-2xl blur-lg opacity-30 animate-pulse" />
          <div className="bg-slate-900 border border-slate-700/50 p-6 rounded-3xl shadow-2xl relative">
            <Sparkles className="w-12 h-12 text-yellow-400 mx-auto mb-2 animate-bounce" />
            <h2 className="text-3xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-rose-400">
              تحدي الثلاثين
            </h2>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <div className="w-full space-y-4">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleStart}
            className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-black text-xl py-4 rounded-2xl shadow-lg shadow-emerald-500/10 hover:shadow-emerald-500/25 transition-all flex items-center justify-center gap-2.5 border border-emerald-400/20 cursor-pointer"
          >
            <Play className="w-6 h-6 fill-current text-white" />
            ابدأ المعركة ⚔️
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleOpenHelp}
            className="w-full bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-200 font-bold text-base py-3.5 rounded-2xl transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <BookOpen className="w-5 h-5 text-indigo-400" />
            طريقة اللعب والأنظمة
          </motion.button>
        </div>
      </div>

      {/* Footer credits / status */}
      <div className="text-center z-10 text-[11px] text-slate-500 font-mono tracking-wider">
        تحدي محلي • فريق ضد فريق • هاتف واحد
      </div>

      {/* "How to Play" Bottom Sheet / Modal Panel */}
      <AnimatePresence>
        {showHowToPlay && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 z-50 flex items-end justify-center px-4 pb-4"
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md p-6 max-h-[85vh] overflow-y-auto text-right shadow-2xl"
              dir="rtl"
            >
              <div className="flex items-center justify-between mb-6 sticky top-0 bg-slate-900 pb-2 border-b border-slate-800">
                <h3 className="text-xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-indigo-400 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-violet-400" />
                  دليل الأطوار وأنظمة اللعب
                </h3>
                <button
                  onClick={handleCloseHelp}
                  className="p-1 px-3 bg-slate-800 rounded-xl text-slate-400 text-xs font-bold hover:bg-slate-700 transition-colors"
                >
                  إغلاق
                </button>
              </div>

              <div className="space-y-6 font-sans">
                {/* Mode 1 */}
                <div className="bg-slate-950 p-4 rounded-2xl border border-violet-500/20">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-2 h-2 bg-violet-400 rounded-full" />
                    <h4 className="font-bold text-violet-300 text-base">تحدي الدور (١)</h4>
                  </div>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    الحكم يسأل سؤالاً واحداً له إجابات متعددة (مثل: دول تطل على البحر الأحمر). يبدأ الفريق الأول بذكر إجابة، ثم ينتقل الدور للفريق الثاني، وهكذا بالتناوب. تملك كل فرقة ٣ أرواح (قلوب). الإجابة الخاطئة أو المكررة تخصم روحاً. ينتهي الدور بفناء الأرواح أو نفاد الإجابات.
                  </p>
                </div>

                {/* Mode 2 */}
                <div className="bg-slate-950 p-4 rounded-2xl border border-rose-500/20">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-2 h-2 bg-rose-400 rounded-full" />
                    <h4 className="font-bold text-rose-300 text-base">المزاد الحاسم (٢)</h4>
                  </div>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    يطلب الحكم سؤالاً يتطلب عدداً (مثل: كم لاعب فاز بالكرة الذهبية تستطيعون تسميته؟). تزايد الفرق على من يستطيع تسمية أكبر عدد في ٣٠ ثانية. الفريق الحاصل على المزاد الأعلى يخوض التحدي، وإذا أجاب بنجاح يحصل على النقاط المحددة. وإذا سقط في الفخ، يحصل الخصم على النقاط!
                  </p>
                </div>

                {/* Mode 3 */}
                <div className="bg-slate-950 p-4 rounded-2xl border border-amber-500/20">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-2 h-2 bg-amber-400 rounded-full" />
                    <h4 className="font-bold text-amber-300 text-base">جرس السرعة (٣)</h4>
                  </div>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    يوضع الهاتف بالوسط بين الفريقين. يظهر سؤال مباشر غامض، ومن يضغط على زر الجرس المضاء أولاً يجيب فورياً على الحكم. الإجابة الصحيحة تمنح الفريق نقطة، بينما الإجابة الخاطئة تنقل الفرصة كاملةً وبأمان للفريق الآخر.
                  </p>
                </div>

                {/* Mode 4 */}
                <div className="bg-slate-950 p-4 rounded-2xl border border-emerald-500/20">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-2 h-2 bg-emerald-400 rounded-full" />
                    <h4 className="font-bold text-emerald-300 text-base">من أنا؟ لغز الاستنتاج (٤)</h4>
                  </div>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    يقرأ الحكم دليلاً تلو الآخر (يتدرج الدليل من الصعوبة الشديدة إلى السهولة). يتنافس الفريقان في التخمين السريع قبل فوات الوقت. أسرع فريق ينجح في العثور على الإجابة الصحيحة من الأدلة يفوز بجوائز المعركة!
                  </p>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-800 text-center text-xs text-slate-500">
                لعبة عائلية خالية من الإعلانات صُممت للجمعات السعيدة 🤍
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
