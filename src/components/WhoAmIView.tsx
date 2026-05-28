/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  HelpCircle, 
  Check, 
  X, 
  Award, 
  Clock, 
  Eye, 
  ChevronRight,
  User,
  Zap
} from 'lucide-react';
import { TriviaQuestion, Team } from '../types';
import { soundEffects } from '../utils/audio';

interface WhoAmIViewProps {
  key?: any;
  question: TriviaQuestion;
  teamA: Team;
  teamB: Team;
  currentRound: number;
  maxRounds: number;
  onFinishRound: (winningTeam: 'A' | 'B' | null, scoreGain: number, scoreGainB?: number) => void;
  onSkipRound: () => void;
}

export default function WhoAmIView({ 
  question, 
  teamA, 
  teamB, 
  currentRound,
  maxRounds,
  onFinishRound, 
  onSkipRound 
}: WhoAmIViewProps) {
  
  const [clueIndex, setClueIndex] = useState(0); // starts at clue 0
  const [timeLeft, setTimeLeft] = useState(30);
  const [roundOver, setRoundOver] = useState(false);
  const [winner, setWinner] = useState<'A' | 'B' | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (roundOver) return;
    
    setTimeLeft(30); // reset clock on each new clue
    
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          // Clue expired! Increment clue automatically if possible
          handleTimeExpired();
          return 0;
        }
        if (prev <= 6) {
          soundEffects.playHurryUpTick();
        } else {
          soundEffects.playTick();
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [clueIndex, roundOver]);

  const handleTimeExpired = () => {
    soundEffects.playFailure();
    if (clueIndex < question.clues.length - 1) {
      // Move to next clue
      setClueIndex(prev => prev + 1);
    } else {
      // All clues exhausted! No one wins, terminate
      setRoundOver(true);
      setWinner(null);
    }
  };

  const revealNextClue = () => {
    if (clueIndex >= question.clues.length - 1) return;
    soundEffects.playClick();
    setClueIndex(prev => prev + 1);
  };

  const handleWinnerSelected = (team: 'A' | 'B') => {
    soundEffects.playSuccess();
    setWinner(team);
    setRoundOver(true);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const handleFinishAndSubmit = () => {
    if (winner) {
      onFinishRound(winner, 1);
    } else {
      onSkipRound();
    }
  };

  return (
    <div className="flex flex-col justify-between min-h-screen text-white bg-slate-950 p-6 select-none relative" dir="rtl border">
      {/* Glows */}
      <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-emerald-600/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-teal-600/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Header info */}
      <div className="grid grid-cols-3 gap-3 w-full z-15 max-w-md items-center">
        <div className="text-right">
          <span className="text-2xs text-slate-500 block">فريق أ</span>
          <span className="text-xs font-black text-rose-300 block truncate">{teamA.name}</span>
        </div>

        {/* Clue Progress and Clock */}
        <div className="flex flex-col items-center">
          <div className="text-[10px] text-slate-500 font-bold mb-1 col-span-1">السؤال {currentRound}/{maxRounds}</div>
          <div className={`w-11 h-11 rounded-full border flex items-center justify-center font-sans text-xs font-black transition-all ${
            timeLeft <= 6 ? 'bg-rose-950/60 border-rose-500 text-rose-400 animate-pulse' : 'bg-slate-900 border-slate-800 text-slate-200'
          }`}>
            {timeLeft}s
          </div>
        </div>

        <div className="text-left font-sans">
          <span className="text-2xs text-slate-500 block">فريق ب</span>
          <span className="text-xs font-black text-sky-300 block truncate text-left">{teamB.name}</span>
        </div>
      </div>

      {/* Main controller card */}
      <div className="w-full max-w-md flex-1 flex flex-col justify-center z-10 my-4 text-center">
        <div className="bg-slate-900/40 backdrop-blur-md rounded-3xl p-5 border border-slate-850 text-right space-y-4 relative overflow-hidden">
          
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold tracking-wider text-emerald-400 uppercase bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/15">
              لعبة المستنتج الصغير (من أنا؟) 🕵️‍♂️
            </span>
            <span className="text-2xs text-slate-500">الدليل {clueIndex + 1} من {question.clues.length}</span>
          </div>

          {/* Clues layout container */}
          <div className="space-y-3 min-h-[160px] flex flex-col justify-center">
            {question.clues.map((clue, idx) => {
              const revealed = idx <= clueIndex;
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -10 }}
                  animate={revealed ? { opacity: 1, x: 0 } : { opacity: 0, x: -10 }}
                  transition={{ duration: 0.4 }}
                  className={`p-3 rounded-2xl border text-right transition-all font-sans ${
                    idx === clueIndex
                      ? 'bg-slate-950 border-emerald-500 text-slate-100 shadow-md shadow-emerald-500/5 scale-[1.01]'
                      : revealed
                        ? 'bg-slate-950/40 border-slate-900 text-slate-400 opacity-60'
                        : 'hidden'
                  }`}
                >
                  <div className="flex items-center gap-1.5 text-[10px] font-black uppercase text-emerald-400 mb-1">
                    <User className="w-3.5 h-3.5" />
                    المستوى {idx === 0 ? 'الأول (صعب)' : idx === 1 ? 'الثاني (متوسط)' : 'الأخير (سهل)'}
                  </div>
                  <p className="text-sm font-semibold leading-relaxed whitespace-normal break-words">{clue}</p>
                </motion.div>
              );
            })}
          </div>

          {/* Key Answer reveal block for Judge safety */}
          <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-850">
            <span className="text-2xs text-slate-500 block leading-none">إجابة اللغز المعتمدة:</span>
            <span className="text-xs font-extrabold text-emerald-400 mt-1 block whitespace-normal break-words leading-normal">{question.correctAnswer}</span>
          </div>
        </div>
      </div>

      {/* Action controls */}
      <div className="w-full max-w-md z-10 space-y-3">
        
        {!roundOver ? (
          <div className="space-y-3">
            {/* Split winner selectors for judge */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleWinnerSelected('A')}
                className="py-3 bg-rose-600 hover:bg-rose-550 rounded-xl text-xs font-black text-white transition-all shadow-md shadow-rose-600/10 cursor-pointer"
              >
                ثبت لـ {teamA.name} ★
              </button>
              <button
                onClick={() => handleWinnerSelected('B')}
                className="py-3 bg-sky-600 hover:bg-sky-550 rounded-xl text-xs font-black text-white transition-all shadow-md shadow-sky-600/10 cursor-pointer"
              >
                ثبت لـ {teamB.name} ★
              </button>
            </div>

            {/* Next clue manual reveal */}
            {clueIndex < question.clues.length - 1 && (
              <button
                onClick={revealNextClue}
                className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold text-xs rounded-xl border border-slate-800 hover:border-slate-700 transition-all flex items-center justify-center gap-1 cursor-pointer"
              >
                <Eye className="w-4 h-4 text-emerald-400" />
                كشف الدليل التالي الحاسم 🔎
              </button>
            )}
          </div>
        ) : (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-slate-900 border border-slate-850 p-4 rounded-3xl text-center space-y-3"
          >
            <Award className="w-8 h-8 text-yellow-400 mx-auto" />
            {winner ? (
              <>
                <h3 className="text-xs font-bold text-slate-400">فائز لغز الاستنتاج</h3>
                <h2 className={`text-lg font-black ${winner === 'A' ? 'text-rose-400' : 'text-sky-400'}`}>
                  ★ {winner === 'A' ? teamA.name : teamB.name} ★
                </h2>
                <p className="text-xs text-slate-400 font-sans">
                  استطاع الفريق تخمين الإجابة الصحيحة بسرعة! (الإجابة: {question.correctAnswer})
                </p>
              </>
            ) : (
              <>
                <h2 className="text-base font-black text-slate-200">لم يحزر أحد! 💔</h2>
                <p className="text-xs text-slate-400 mt-1">
                  نفدت جميع الأدلة الثلاثة والوقت ولم يكتشف أي فريق الإجابة المعتمدة (الإجابة: {question.correctAnswer}).
                </p>
              </>
            )}

            <button
              onClick={handleFinishAndSubmit}
              className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 py-3 rounded-xl font-bold text-sm text-white transition-all cursor-pointer"
            >
              تسجيل النتيجة والمتابعة 🏆
            </button>
          </motion.div>
        )}

        {!winner && (
          <button
            onClick={() => {
              soundEffects.playClick();
              onSkipRound();
            }}
            className="w-full text-center text-xs text-slate-500 hover:text-slate-300 py-1 transition-colors block cursor-pointer"
          >
            تخطي هذا اللغز ⏭️
          </button>
        )}
      </div>
    </div>
  );
}
