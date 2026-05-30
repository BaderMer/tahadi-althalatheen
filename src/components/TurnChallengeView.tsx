/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Heart, 
  Clock, 
  Check, 
  X, 
  RefreshCw, 
  AlertTriangle,
  HelpCircle,
  Award,
  BookOpen
} from 'lucide-react';
import { ListQuestion, Team } from '../types';
import { soundEffects } from '../utils/audio';

interface TurnChallengeViewProps {
  key?: any;
  question: ListQuestion;
  teamA: Team;
  teamB: Team;
  currentRound: number;
  maxRounds: number;
  onFinishRound: (winningTeam: 'A' | 'B' | null, scoreGain: number, scoreGainB?: number) => void;
  onSkipRound: () => void;
}

export default function TurnChallengeView({ 
  question, 
  teamA, 
  teamB, 
  currentRound,
  maxRounds,
  onFinishRound, 
  onSkipRound 
}: TurnChallengeViewProps) {
  
  const [activeTeam, setActiveTeam] = useState<'A' | 'B'>('A');
  const [livesA, setLivesA] = useState(3);
  const [livesB, setLivesB] = useState(3);
  const [discoveredAnswers, setDiscoveredAnswers] = useState<string[]>([]);
  const [timeLeft, setTimeLeft] = useState(30);
  const [roundOver, setRoundOver] = useState(false);
  const [winner, setWinner] = useState<'A' | 'B' | null>(null);
  const [isDraw, setIsDraw] = useState(false);
  const [strikeTriggered, setStrikeTriggered] = useState(false);
  const [hasPassA, setHasPassA] = useState(true);
  const [hasPassB, setHasPassB] = useState(true);
  const [passAnimationTeam, setPassAnimationTeam] = useState<'A' | 'B' | null>(null);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const playPassSound = () => {
    try {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtxClass) return;
      const ctx = new AudioCtxClass();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.25);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    } catch (e) {
      // Safe fallback
    }
  };

  const handleUsePass = (team: 'A' | 'B') => {
    if (roundOver) return;
    if (team === 'A' && (!hasPassA || activeTeam !== 'A')) return;
    if (team === 'B' && (!hasPassB || activeTeam !== 'B')) return;

    // Consume the PASS
    if (team === 'A') {
      setHasPassA(false);
    } else {
      setHasPassB(false);
    }

    // Play Custom PASS transition sound
    playPassSound();

    // Trigger visual notification
    setPassAnimationTeam(team);
    setTimeout(() => {
      setPassAnimationTeam(null);
    }, 1500);

    // Swap turn without losing lives or recording strikes
    switchTurn();
  };

  // Restart 30-second timer whenever turn switches
  useEffect(() => {
    if (roundOver) return;

    setTimeLeft(30);
    
    if (timerRef.current) clearInterval(timerRef.current);
    
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleTimeout();
          return 30;
        }
        // Play tick sound effects
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
  }, [activeTeam, roundOver]);

  // Handle timeout (counts as a strike for active team)
  const handleTimeout = () => {
    applyStrike(activeTeam);
  };

  const applyStrike = (team: 'A' | 'B') => {
    // Raucous game-show fail buzzer and visual effect launch
    soundEffects.playStrikeBuzzer();
    setStrikeTriggered(true);
    setTimeout(() => {
      setStrikeTriggered(false);
    }, 1000);

    if (team === 'A') {
      setLivesA(prev => {
        const next = prev - 1;
        if (next <= 0) {
          triggerRoundEnd('B');
          return 0;
        }
        return next;
      });
    } else {
      setLivesB(prev => {
        const next = prev - 1;
        if (next <= 0) {
          triggerRoundEnd('A');
          return 0;
        }
        return next;
      });
    }
    // Switch turn anyway
    switchTurn();
  };

  const switchTurn = () => {
    setActiveTeam(prev => prev === 'A' ? 'B' : 'A');
  };

  const triggerRoundEnd = (winningTeam: 'A' | 'B') => {
    setRoundOver(true);
    setWinner(winningTeam);
    if (timerRef.current) clearInterval(timerRef.current);
    soundEffects.playFanfare();
  };

  // When judge registers a correct answer from the answer bank
  const handleCorrectAnswer = (ans: string) => {
    if (roundOver || discoveredAnswers.includes(ans)) return;
    
    soundEffects.playSuccess();
    const updated = [...discoveredAnswers, ans];
    setDiscoveredAnswers(updated);

    // If all are discovered before either runs out of lives -> determine outcome based on lives comparison
    if (updated.length >= question.answers.length) {
      setRoundOver(true);
      if (timerRef.current) clearInterval(timerRef.current);

      if (livesA === livesB) {
        setWinner(null);
        setIsDraw(true);
        soundEffects.playFailure();
      } else {
        const finalWinner = livesA > livesB ? 'A' : 'B';
        setWinner(finalWinner);
        setIsDraw(false);
        soundEffects.playFanfare();
      }
      return;
    }

    // Switch turn to other team
    switchTurn();
  };

  // General WRONG answer button clicked by judge
  const handleWrongAnswer = () => {
    if (roundOver) return;
    applyStrike(activeTeam);
  };

  const handleFinishAndSubmit = () => {
    if (isDraw) {
      onFinishRound(null, 0);
    } else if (winner) {
      onFinishRound(winner, 1);
    } else {
      // Manual forcing of winner based on lives
      const finalWinner = livesA > livesB ? 'A' : 'B';
      if (livesA === livesB) {
        onFinishRound(null, 0);
      } else {
        onFinishRound(finalWinner, 1);
      }
    }
  };

  return (
    <motion.div 
      animate={strikeTriggered ? {
        x: [0, -35, 30, -35, 25, -20, 15, -10, 5, 0],
        y: [0, 20, -15, 15, -10, 8, -6, 4, -2, 0],
        scale: [1, 1.06, 0.94, 1.04, 0.97, 1.02, 1]
      } : {}}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="flex flex-col justify-between min-h-screen text-white bg-slate-950 p-6 select-none relative overflow-hidden" 
      dir="rtl"
    >
      {/* Full-screen red flash overlay for satisfying strike feedback */}
      <AnimatePresence>
        {strikeTriggered && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0.4, 1, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.9, times: [0, 0.15, 0.4, 0.65, 1] }}
            className="absolute inset-0 bg-red-600/35 border-[24px] border-red-600 z-50 pointer-events-none"
          />
        )}
      </AnimatePresence>

      {/* Full-screen PASS used overlay/toast */}
      <AnimatePresence>
        {passAnimationTeam && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="absolute inset-0 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm z-50 pointer-events-none"
          >
            <div className={`px-6 py-4 rounded-3xl border text-center shadow-2xl space-y-2 max-w-[280px] ${
              passAnimationTeam === 'A' 
                ? 'bg-rose-950/90 border-rose-500 shadow-rose-900/40 text-rose-200' 
                : 'bg-sky-950/90 border-sky-500 shadow-sky-900/40 text-sky-200'
            }`}>
              <div className="text-3xl">🛡️</div>
              <h2 className="text-lg font-black tracking-wide">تم استخدام PASS</h2>
              <p className="text-xs text-slate-300 leading-normal">
                قام فريق <span className="font-extrabold text-white">{passAnimationTeam === 'A' ? teamA.name : teamB.name}</span> بتجاوز الدور وحماية أرواحه!
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Background radial glows */}
      <div className="absolute top-10 left-10 w-64 h-64 bg-violet-600/5 rounded-full blur-[90px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-64 h-64 bg-indigo-600/5 rounded-full blur-[90px] pointer-events-none" />

      {/* Top Header details/Scoreboard */}
      <div className="grid grid-cols-3 gap-3 w-full z-10 max-w-md items-center">
        {/* Team A stats */}
        <div className={`p-3 rounded-2xl border text-center transition-all ${
          activeTeam === 'A' && !roundOver 
            ? 'bg-rose-950/40 border-rose-500 shadow-md shadow-rose-500/10' 
            : 'bg-slate-900/50 border-slate-800'
        }`}>
          <span className="text-xs text-rose-300 block font-bold truncate">{teamA.name}</span>
          <div className="flex gap-1.5 justify-center mt-1.5 h-5 items-center">
            {[1, 2, 3].map((val) => {
              const isActive = val <= livesA;
              return (
                <motion.div 
                  key={val}
                  animate={
                    isActive 
                      ? { scale: [1, 1.15, 1], rotate: [0, 2, -2, 0] } 
                      : { scale: [1, 2.8, 0], rotate: [0, 180, 540], opacity: [1, 1, 0] }
                  }
                  transition={{ duration: 0.85, ease: "easeOut" }}
                  className="relative flex items-center justify-center w-5 h-5 flex-shrink-0"
                >
                  {isActive ? (
                    <Heart className="w-4 h-4 text-rose-500 fill-rose-500 animate-pulse" />
                  ) : (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.2, duration: 0.25 }}
                    >
                      <X className="w-3.5 h-3.5 text-rose-500 stroke-[3]" />
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </div>
          {/* PASS button */}
          <div className="mt-2.5">
            <button
              onClick={() => handleUsePass('A')}
              disabled={roundOver || !hasPassA || activeTeam !== 'A'}
              className={`w-full py-1 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1 border min-h-[30px] ${
                !hasPassA
                  ? 'bg-slate-950 border-slate-900/40 text-slate-600 opacity-40 cursor-not-allowed'
                  : activeTeam === 'A'
                    ? 'bg-rose-600/20 hover:bg-rose-600/35 border-rose-500 text-rose-300 shadow-md shadow-rose-500/10'
                    : 'bg-slate-950/40 border-slate-850 text-slate-500 hover:text-slate-400'
              }`}
            >
              <span>PASS</span>
              <span className="font-sans font-black">×{hasPassA ? 1 : 0}</span>
            </button>
          </div>
        </div>

        {/* Center state timer */}
        <div className="flex flex-col items-center justify-center">
          <div className="text-[10px] text-slate-500 font-bold mb-1">السؤال {currentRound}/{maxRounds}</div>
          <div className={`w-12 h-12 rounded-full border flex items-center justify-center font-sans text-lg font-black transition-colors ${
            timeLeft <= 6 ? 'bg-rose-950/60 border-rose-500 text-rose-400 animate-pulse' : 'bg-slate-900 border-slate-800 text-slate-100'
          }`}>
            {timeLeft}
          </div>
        </div>

        {/* Team B stats */}
        <div className={`p-3 rounded-2xl border text-center transition-all ${
          activeTeam === 'B' && !roundOver 
            ? 'bg-sky-950/40 border-sky-500 shadow-md shadow-sky-500/10' 
            : 'bg-slate-900/50 border-slate-800'
        }`}>
          <span className="text-xs text-sky-300 block font-bold truncate">{teamB.name}</span>
          <div className="flex gap-1.5 justify-center mt-1.5 h-5 items-center">
            {[1, 2, 3].map((val) => {
              const isActive = val <= livesB;
              return (
                <motion.div 
                  key={val}
                  animate={
                    isActive 
                      ? { scale: [1, 1.15, 1], rotate: [0, 2, -2, 0] } 
                      : { scale: [1, 2.8, 0], rotate: [0, 180, 540], opacity: [1, 1, 0] }
                  }
                  transition={{ duration: 0.85, ease: "easeOut" }}
                  className="relative flex items-center justify-center w-5 h-5 flex-shrink-0"
                >
                  {isActive ? (
                    <Heart className="w-4 h-4 text-sky-500 fill-sky-500 animate-pulse" />
                  ) : (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.2, duration: 0.25 }}
                    >
                      <X className="w-3.5 h-3.5 text-sky-500 stroke-[3]" />
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </div>
          {/* PASS button */}
          <div className="mt-2.5">
            <button
              onClick={() => handleUsePass('B')}
              disabled={roundOver || !hasPassB || activeTeam !== 'B'}
              className={`w-full py-1 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1 border min-h-[30px] ${
                !hasPassB
                  ? 'bg-slate-950 border-slate-900/40 text-slate-600 opacity-40 cursor-not-allowed'
                  : activeTeam === 'B'
                    ? 'bg-sky-600/20 hover:bg-sky-600/35 border-sky-500 text-sky-300 shadow-md shadow-sky-500/10'
                    : 'bg-slate-950/40 border-slate-850 text-slate-500 hover:text-slate-400'
              }`}
            >
              <span>PASS</span>
              <span className="font-sans font-black">×{hasPassB ? 1 : 0}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Turn indicator ribbon */}
      {!roundOver && (
        <div className="w-full flex justify-center z-10 mt-3">
          <div className={`px-4 py-1 rounded-full text-xs font-black uppercase tracking-wide border ${
            activeTeam === 'A' 
              ? 'bg-rose-950/50 border-rose-500/30 text-rose-300' 
              : 'bg-sky-950/50 border-sky-500/30 text-sky-300'
          }`}>
            دور: {activeTeam === 'A' ? teamA.name : teamB.name} 🔄
          </div>
        </div>
      )}

      {/* Main Game Card */}
      <div className="w-full max-w-md flex-1 flex flex-col justify-center z-10 my-4 text-center">
        
        {/* Question Panel */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }} 
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-900/40 backdrop-blur-md rounded-3xl p-5 border border-slate-805 text-right relative overflow-hidden flex flex-col justify-between"
        >
          <div>
            <span className="text-[10px] font-bold tracking-wider text-indigo-400 uppercase bg-indigo-505/10 px-2 py-0.5 rounded-full border border-indigo-500/15">
              تحدي الدور المستمر
            </span>
            <h2 className="text-xl font-extrabold text-slate-100 mt-2.5 leading-relaxed text-right">
              {question.questionAr}
            </h2>
          </div>

          {/* Answer banks representation and discovery progress */}
          <div className="mt-4 pt-4 border-t border-slate-800/60">
            <div className="flex justify-between items-center text-xs text-slate-400 mb-2">
              <span>الإجابات المكتشفة:</span>
              <span className="font-mono text-indigo-400 font-bold">
                {discoveredAnswers.length} من {question.answers.length}
              </span>
            </div>

            {/* Answer chips mapping */}
            <div className="flex flex-wrap gap-1.5 justify-start max-h-[180px] overflow-y-auto pr-1">
              {question.answers.map((ans, idx) => {
                const found = discoveredAnswers.includes(ans);
                return (
                  <span
                    key={idx}
                    className={`text-2xs px-3 py-1.5 rounded-xl font-bold transition-all whitespace-normal break-words leading-tight max-w-full inline-block text-right ${
                      found
                        ? 'bg-indigo-600/20 border border-indigo-500/40 text-indigo-300'
                        : 'bg-slate-950 border border-slate-850 text-slate-600'
                    }`}
                  >
                    {found ? `${idx + 1}. ${ans} ✓` : `${idx + 1}. ؟؟؟؟؟`}
                  </span>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* JUDGE'S CONTROLS - Interactive Answer Sheet */}
        <div className="mt-4 text-right">
          <label className="text-2xs font-extrabold text-slate-400 mr-1 block mb-1">لوحة تحكيم المضيف (اضغط على الإجابة لتسجيلها للفريق الحالي):</label>
          <div className="bg-slate-900/20 p-3 rounded-2xl border border-slate-850 max-h-[220px] overflow-y-auto grid grid-cols-2 gap-2">
            {question.answers.map((ans, idx) => {
              const found = discoveredAnswers.includes(ans);
              return (
                <button
                  key={idx}
                  onClick={() => handleCorrectAnswer(ans)}
                  disabled={found || roundOver}
                  className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all text-right flex items-center justify-between gap-1.5 border min-h-[44px] cursor-pointer ${
                    found
                      ? 'bg-slate-950 border-slate-900 text-slate-600 opacity-50'
                      : 'bg-slate-950 border-slate-850 text-slate-200 hover:bg-slate-900 hover:border-slate-800'
                  }`}
                >
                  <span className="whitespace-normal break-words text-right leading-tight flex-1">{ans}</span>
                  {!found && <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Screen action items */}
      <div className="w-full max-w-md z-10 space-y-3">
        
        {/* Huge RED WRONG button for judge */}
        {!roundOver ? (
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleWrongAnswer}
              className="py-3 bg-rose-950/60 border border-rose-500/40 text-rose-300 font-bold text-sm rounded-xl hover:bg-rose-900 hover:border-rose-500 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <X className="w-4 h-4" />
              إجابة خاطئة فريق ({activeTeam === 'A' ? 'أ' : 'ب'})
            </button>
            <button
              onClick={() => {
                soundEffects.playClick();
                onSkipRound();
              }}
              className="py-3 bg-slate-900/60 border border-slate-800 text-slate-400 font-medium text-xs rounded-xl hover:bg-slate-800 transition-all flex items-center justify-center cursor-pointer font-sans"
            >
              تخطي هذا السؤال ⏭️
            </button>
          </div>
        ) : (
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="bg-slate-900/95 border border-slate-800 p-5 rounded-3xl text-center shadow-2xl relative overflow-hidden"
          >
            {isDraw ? (
              <div className="absolute inset-0 bg-gradient-to-b from-amber-500/5 to-transparent pointer-events-none" />
            ) : (
              <div className={`absolute inset-0 bg-gradient-to-b ${winner === 'A' ? 'from-rose-500/5' : 'from-sky-500/5'} to-transparent pointer-events-none`} />
            )}

            {isDraw ? (
              <motion.div 
                animate={{ rotate: [-2, 2, -2, 2, 0], scale: [1, 1.05, 1] }}
                transition={{ duration: 0.8, repeat: Infinity, repeatDelay: 1.5 }}
                className="inline-block"
              >
                <div className="w-12 h-12 rounded-full bg-slate-800/80 border border-slate-700 flex items-center justify-center text-xl mx-auto mb-2">
                  🤝
                </div>
              </motion.div>
            ) : (
              <motion.div
                animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
                transition={{ duration: 0.6, repeat: Infinity, repeatDelay: 2 }}
                className="inline-block"
              >
                <Award className={`w-10 h-10 ${winner === 'A' ? 'text-rose-400' : 'text-sky-400'} mx-auto mb-2 filter drop-shadow-[0_0_8px_rgba(251,191,36,0.3)]`} />
              </motion.div>
            )}

            {isDraw ? (
              <>
                <motion.h3 
                  initial={{ y: 5 }}
                  animate={{ y: 0 }}
                  className="text-lg font-black text-amber-300"
                >
                  انتهت الجولة بالتعادل! 🤝
                </motion.h3>
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="text-xs text-slate-300 mt-2 leading-relaxed px-2"
                >
                  تم اكتشاف كافة الإجابات وتساوي الفريقين في عدد الأرواح ({livesA} أرواح متبقية). لا يحصل أي فريق على نقطة في هذه الجولة.
                </motion.p>
              </>
            ) : (
              <>
                <motion.h3 
                  initial={{ y: 5 }}
                  animate={{ y: 0 }}
                  className="text-sm font-bold text-slate-400 uppercase tracking-widest"
                >
                  انتهت الجولة بفوز
                </motion.h3>
                <motion.p 
                  animate={{ scale: [1, 1.07, 1] }}
                  transition={{ duration: 0.5, repeat: 1 }}
                  className={`text-xl font-black mt-1 ${winner === 'A' ? 'text-rose-400' : 'text-sky-400'} tracking-wide`}
                >
                  ★ {winner === 'A' ? teamA.name : teamB.name} ★
                </motion.p>
                {discoveredAnswers.length >= question.answers.length ? (
                  <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-xs text-emerald-400 bg-emerald-950/40 border border-emerald-900/40 py-1.5 px-3 rounded-xl mt-2.5 leading-relaxed"
                  >
                    تم اكتشاف جميع الإجابات! فاز الفريق الحاصل على عدد أرواح أكبر: <span className="font-extrabold">{winner === 'A' ? livesA : livesB} أرواح مقابل {winner === 'A' ? livesB : livesA}</span> (+١ نقطة جولة).
                  </motion.p>
                ) : (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-xs text-slate-300 mt-2 leading-relaxed"
                  >
                    تفوق في الأرواح وإقصاء المنافس بنجاح! (+١ نقطة جولة).
                  </motion.p>
                )}
              </>
            )}

            <button
              onClick={handleFinishAndSubmit}
              className={`w-full mt-4 py-3.5 rounded-2xl font-black text-sm transition-all text-white cursor-pointer shadow-lg hover:brightness-110 active:scale-98 ${
                isDraw 
                  ? 'bg-slate-800 border border-slate-750 text-slate-100' 
                  : winner === 'A' 
                    ? 'bg-gradient-to-r from-rose-500 to-pink-600 shadow-rose-950/40' 
                    : 'bg-gradient-to-r from-sky-500 to-blue-600 shadow-sky-950/40'
              }`}
            >
              {isDraw ? 'الموافقة والانتقال للنتائج 📊' : 'تسجيل النقطة والانتقال للنتائج 🏆'}
            </button>
          </motion.div>
        )}

      </div>
    </motion.div>
  );
}
