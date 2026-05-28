/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Zap, 
  Check, 
  X, 
  Award, 
  ChevronRight,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  HelpCircle
} from 'lucide-react';
import { TriviaQuestion, Team } from '../types';
import { soundEffects } from '../utils/audio';

interface BuzzerViewProps {
  key?: any;
  question: TriviaQuestion;
  teamA: Team;
  teamB: Team;
  currentRound: number;
  maxRounds: number;
  onFinishRound: (winningTeam: 'A' | 'B' | null, scoreGain: number, scoreGainB?: number) => void;
  onSkipRound: () => void;
  onGetNextTriviaQuestion?: () => TriviaQuestion;
}

export default function BuzzerView({ 
  question, 
  teamA, 
  teamB, 
  currentRound,
  maxRounds,
  onFinishRound, 
  onSkipRound,
  onGetNextTriviaQuestion
}: BuzzerViewProps) {
  
  const [currentQuestion, setCurrentQuestion] = useState<TriviaQuestion>(question);
  const [isPrep, setIsPrep] = useState(true);

  // States: 'idle' (waiting for buzz) | 'buzzed' (one team pressed) | 'transferred' (first team got it wrong, transfer to other) | 'result'
  const [buzzerState, setBuzzerState] = useState<'idle' | 'buzzed' | 'transferred' | 'result'>('idle');
  const [buzzerWinner, setBuzzerWinner] = useState<'A' | 'B' | null>(null);
  const [roundWinner, setRoundWinner] = useState<'A' | 'B' | null>(null);

  const handleSwapQuestion = () => {
    if (onGetNextTriviaQuestion) {
      soundEffects.playClick();
      const nextQ = onGetNextTriviaQuestion();
      setCurrentQuestion(nextQ);
      // Reset modes
      setBuzzerState('idle');
      setBuzzerWinner(null);
      setRoundWinner(null);
    } else {
      onSkipRound();
    }
  };

  const handleBuzz = (team: 'A' | 'B') => {
    if (buzzerState !== 'idle') return;
    
    soundEffects.playBuzzer();
    if (navigator.vibrate) {
      navigator.vibrate(200);
    }
    setBuzzerWinner(team);
    setBuzzerState('buzzed');
  };

  const handleJudgeDecision = (correct: boolean) => {
    if (!buzzerWinner) return;

    if (correct) {
      soundEffects.playSuccess();
      setRoundWinner(buzzerWinner);
      setBuzzerState('result');
    } else {
      soundEffects.playFailure();
      if (buzzerState === 'buzzed') {
        // First team guessed wrong! Transfer directly to other team
        const otherTeam: 'A' | 'B' = buzzerWinner === 'A' ? 'B' : 'A';
        setBuzzerWinner(otherTeam);
        setBuzzerState('transferred');
      } else {
        // Second team also got it wrong! No points, skip or let judge choose
        setBuzzerState('result');
        setRoundWinner(null); // Tie / No winner
      }
    }
  };

  const handleFinishAndSubmit = () => {
    if (roundWinner) {
      onFinishRound(roundWinner, 1);
    } else {
      // In case of a fallback tie, default to original buzzer team as penalty or skip
      onSkipRound();
    }
  };

  // Render Judge Prep Screen - STEP 1
  if (isPrep) {
    return (
      <div className="flex flex-col justify-between min-h-screen text-white bg-slate-950 p-6 select-none relative overflow-hidden" dir="rtl">
        {/* Background radial glows */}
        <div className="absolute top-10 left-10 w-64 h-64 bg-amber-600/5 rounded-full blur-[90px] pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-64 h-64 bg-yellow-600/5 rounded-full blur-[90px] pointer-events-none" />

        {/* Top bar info */}
        <div className="w-full text-center z-10 pt-2">
          <span className="text-2xs text-slate-500 font-bold block">مرحلة المعاينة والتحضير</span>
          <h2 className="text-lg font-black text-slate-200">خاص بمشرف اللعبة (الحكم) 🤫</h2>
        </div>

        {/* Main Card */}
        <div className="w-full max-w-md mx-auto flex-1 flex flex-col justify-center z-10 my-4 text-center">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-slate-900/80 border border-slate-800 p-6 rounded-3xl text-right space-y-6 shadow-2xl relative"
          >
            <div className="absolute top-3 left-3 bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded-md text-[10px] text-rose-400 font-bold flex items-center gap-1">
              <AlertTriangle className="w-3 h-3 text-rose-400" />
              أخفِ الشاشة عن اللاعبين
            </div>

            <div>
              <span className="text-[10px] font-bold text-amber-400 uppercase bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
                القسم الثالث • جرس السرعة (السؤال {currentRound} من {maxRounds})
              </span>
              <div className="text-xs text-slate-500 mt-2">
                المرجع للقسم: {currentQuestion.category.toUpperCase()}
              </div>
            </div>

            {/* Simulated Display question */}
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-850 space-y-1">
              <span className="text-2xs font-extrabold text-slate-500 block">السؤال المعروض:</span>
              <p className="text-sm font-black text-slate-200 leading-relaxed">
                {currentQuestion.questionAr}
              </p>
            </div>

            {/* Correct answer showing ONLY to the judge */}
            <div className="bg-slate-950/60 p-4 rounded-2xl border-2 border-emerald-500/30 text-emerald-300 relative overflow-hidden bg-gradient-to-l from-emerald-950/10 to-transparent">
              <span className="text-2xs font-extrabold text-emerald-400 block mb-1">الإجابة المعتمدة (السرية):</span>
              <p className="text-base font-black whitespace-normal break-words leading-relaxed">
                {currentQuestion.correctAnswer}
              </p>
              <div className="absolute bottom-1 left-2 text-[8px] text-emerald-600 font-extrabold">للتحكيم فقط</div>
            </div>

            {/* Action buttons */}
            <div className="space-y-2 pt-2">
              <button
                onClick={() => {
                  soundEffects.playClick();
                  setIsPrep(false);
                }}
                className="w-full bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 py-3.5 rounded-2xl font-black text-sm text-white shadow-xl shadow-amber-500/10 cursor-pointer flex items-center justify-center gap-1.5"
              >
                تأكيد السؤال والبدء 🚀
              </button>
              <button
                onClick={handleSwapQuestion}
                className="w-full bg-slate-950 border border-slate-850 text-slate-300 hover:text-white py-3 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                تخطي وتبديل السؤال 🔄
              </button>
            </div>
          </motion.div>
        </div>

        {/* Footer info */}
        <div className="w-full text-center text-xs text-slate-500 z-10 font-sans">
          تحدي الثلاثين • تحديات الموت المفاجئ
        </div>
      </div>
    );
  }

  // Render Real Buzzer Screen - STEP 2
  return (
    <div className="flex flex-col justify-between min-h-screen text-white bg-slate-950 p-4 select-none relative overflow-hidden">
      
      {/* Decorative center background glow */}
      <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/5 to-yellow-500/5 pointer-events-none" />

      {/* PHASE 1 & 2: Waiting or Buzzed Dual Split Panel */}
      {buzzerState !== 'result' ? (
        <div className="flex-1 flex flex-col justify-between w-full h-full my-1 gap-2">
          
          {/* TOP BUZZER PANEL: TEAM B (Rotated 180 degrees) */}
          <motion.button
            whileTap={{ scale: buzzerState === 'idle' ? 0.95 : 1 }}
            onClick={() => handleBuzz('B')}
            disabled={buzzerState !== 'idle'}
            className={`flex-1 rounded-3xl transition-all duration-300 relative flex flex-col items-center justify-center overflow-hidden border cursor-pointer ${
              buzzerState === 'idle' 
                ? 'bg-sky-950/20 border-sky-500/20 active:bg-sky-900/45 text-sky-400 font-sans'
                : buzzerWinner === 'B' 
                  ? 'bg-sky-600 border-sky-400 text-white shadow-2xl shadow-sky-500/25 ring-4 ring-sky-300/40 animate-pulse'
                  : 'bg-slate-950 border-slate-900 opacity-20'
            }`}
          >
            {/* Rotated text */}
            <div className="rotate-180 transform flex flex-col items-center gap-1.5 p-4 text-center">
              <span className="text-2xs opacity-60 font-black uppercase tracking-widest block font-sans">فريق اللون الأزرق</span>
              <h2 className="text-lg font-black truncate max-w-[200px]">{teamB.name}</h2>
              {buzzerState === 'idle' ? (
                <div className="mt-2 text-2xl animate-pulse">🛎️ اضغط السرعة 🛎️</div>
              ) : buzzerWinner === 'B' ? (
                <div className="mt-2 text-xs font-black bg-black/30 px-3 py-1 rounded-full text-sky-200">
                  {buzzerState === 'transferred' ? 'فرصة الإجابة منقولة إليكم!' : 'أجيبوا الآن! قرعتم الجرس'}
                </div>
              ) : null}
            </div>
          </motion.button>

          {/* CENTER QUESTION CARD (Stay flat for judge and spectators - Completely HIDES answers!) */}
          <div className="bg-slate-900 border border-slate-850 p-4 rounded-3xl text-center shadow-xl flex flex-col justify-center items-center z-20 min-h-[140px]" dir="rtl">
            <span className="text-2xs font-extrabold text-amber-500 uppercase flex items-center gap-1.5 mb-1 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/15">
              <Zap className="w-3 h-3 fill-current" />
              جرس السرعة الحاسم • السؤال {currentRound} من {maxRounds}
            </span>
            <p className="text-base font-black text-slate-100 leading-relaxed font-sans mt-1">
              {currentQuestion.questionAr}
            </p>
            {/* Answer is completely HIDDEN during playing state */}
            <div className="mt-2.5 text-[10px] text-slate-500 font-bold font-sans">
              ⚠️ يُمنع الغش - تظهر الإجابة فقط عند مراجعة الحكم.
            </div>
          </div>

          {/* BOTTOM BUZZER PANEL: TEAM A (Normal Direction) */}
          <motion.button
            whileTap={{ scale: buzzerState === 'idle' ? 0.95 : 1 }}
            onClick={() => handleBuzz('A')}
            disabled={buzzerState !== 'idle'}
            className={`flex-1 rounded-3xl transition-all duration-300 relative flex flex-col items-center justify-center overflow-hidden border cursor-pointer ${
              buzzerState === 'idle' 
                ? 'bg-rose-950/20 border-rose-500/20 active:bg-rose-900/45 text-rose-400 font-sans'
                : buzzerWinner === 'A' 
                  ? 'bg-rose-600 border-rose-400 text-white shadow-2xl shadow-rose-500/25 ring-4 ring-rose-300/40 animate-pulse'
                  : 'bg-slate-950 border-slate-900 opacity-20'
            }`}
          >
            <div className="flex flex-col items-center gap-1.5 p-4 text-center">
              <span className="text-2xs opacity-60 font-black uppercase tracking-widest block font-sans">فريق اللون الأحمر</span>
              <h2 className="text-lg font-black truncate max-w-[200px]">{teamA.name}</h2>
              {buzzerState === 'idle' ? (
                <div className="mt-2 text-2xl animate-pulse">🛎️ اضغط السرعة 🛎️</div>
              ) : buzzerWinner === 'A' ? (
                <div className="mt-2 text-xs font-black bg-black/30 px-3 py-1 rounded-full text-rose-200">
                  {buzzerState === 'transferred' ? 'فرصة الإجابة منقولة إليكم!' : 'أجيبوا الآن! قرعتم الجرس'}
                </div>
              ) : null}
            </div>
          </motion.button>

          {/* JUDGE'S IMMEDIATE ACTION BOX (Visible after buzz) */}
          <AnimatePresence>
            {buzzerState !== 'idle' && (
              <motion.div
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 50, opacity: 0 }}
                className="bg-slate-900 border-2 border-slate-800 p-4 rounded-3xl flex flex-col gap-2.5 z-30 shadow-2xl"
                dir="rtl"
              >
                <div className="text-center text-xs font-bold text-slate-300">
                  هل إجابة فريق <span className="text-amber-400 font-extrabold">{buzzerWinner === 'A' ? teamA.name : teamB.name}</span> صحيحة؟
                </div>
                
                {/* Embedded secret answer display for the judge to double check */}
                <div className="bg-slate-950 px-3 py-2 rounded-xl border border-slate-850">
                  <span className="text-[10px] text-slate-500 block">الإجابة المعتمدة للتحقق:</span>
                  <p className="text-xs font-bold text-emerald-400 mt-0.5 whitespace-normal break-words leading-relaxed">{currentQuestion.correctAnswer}</p>
                </div>

                <div className="grid grid-cols-2 gap-3 mt-1">
                  <button
                    onClick={() => handleJudgeDecision(true)}
                    className="py-3 bg-emerald-600 hover:bg-emerald-550 text-white font-black text-sm rounded-xl flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Check className="w-4 h-4 stroke-[3]" />
                    إجابة صحيحة ✓
                  </button>
                  <button
                    onClick={() => handleJudgeDecision(false)}
                    className="py-3 bg-rose-600 hover:bg-rose-550 text-white font-black text-sm rounded-xl flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <X className="w-4 h-4 stroke-[3]" />
                    خاطئة ❌
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      ) : (
        /* PHASE 3: Round Outcome Results */
        <div className="flex-1 flex flex-col justify-center items-center z-10 max-w-md w-full mx-auto" dir="rtl">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-slate-900 border border-slate-850 p-6 rounded-3xl w-full text-center space-y-6 shadow-2xl"
          >
            <Award className="w-14 h-14 text-yellow-400 mx-auto" />
            
            {roundWinner ? (
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-slate-450">بطل جولة الجرس</h3>
                <h2 className="text-2xl font-black text-emerald-400">
                  ★ {roundWinner === 'A' ? teamA.name : teamB.name} ★
                </h2>
                <p className="text-sm text-slate-300 font-sans">
                  حقق الفريق نقطة التحدي بنجاح وسرعة بديهة خاطفة!
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <h2 className="text-xl font-black text-slate-200">تعادل أو عدم الإجابة 🤝</h2>
                <p className="text-sm text-slate-400 font-sans mt-2">
                  أخطأ كلا الفريقين في تأكيد الإجابة الصحيحة. لا تمنح نقاط لأي فريق.
                </p>
              </div>
            )}

            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-850 text-right">
              <span className="text-2xs text-slate-500 block">تفصيل السؤال والإجابة:</span>
              <p className="text-xs text-slate-300 font-semibold mt-1 whitespace-normal break-words leading-relaxed">{currentQuestion.questionAr}</p>
              <p className="text-xs text-emerald-400 font-bold mt-1 whitespace-normal break-words leading-relaxed">الإجابة الصحيحة: {currentQuestion.correctAnswer}</p>
            </div>

            <div className="grid grid-cols-2 gap-3 w-full pt-2">
              {roundWinner ? (
                <button
                  onClick={handleFinishAndSubmit}
                  className="col-span-2 bg-gradient-to-r from-emerald-500 to-teal-600 py-3.5 rounded-xl font-bold text-sm text-white shadow-lg shadow-emerald-550/15 transition-all cursor-pointer"
                >
                  تسجيل الفوز والانتقال 🏆
                </button>
              ) : (
                <>
                  <button
                    onClick={() => {
                      soundEffects.playClick();
                      onSkipRound();
                    }}
                    className="bg-slate-950 border border-slate-850 text-slate-400 py-3 rounded-xl text-xs font-semibold cursor-pointer"
                  >
                    تخطي الجولة
                  </button>
                  <button
                    onClick={() => {
                      soundEffects.playClick();
                      setBuzzerState('idle');
                      setBuzzerWinner(null);
                      setRoundWinner(null);
                      setIsPrep(true);
                    }}
                    className="bg-slate-800 text-slate-200 py-3 rounded-xl text-xs font-semibold cursor-pointer flex items-center justify-center gap-1"
                  >
                    شاشة التحضير 🔄
                  </button>
                </>
              )}
            </div>
          </motion.div>
        </div>
      )}

      {/* Basic bottom navigation */}
      {buzzerState !== 'result' && (
        <button
          onClick={() => {
            soundEffects.playClick();
            onSkipRound();
          }}
          className="w-full text-center text-xs text-slate-500 hover:text-slate-300 py-2 cursor-pointer mt-2"
        >
          تخطي هذا السؤال ⏭️
        </button>
      )}
    </div>
  );
}
