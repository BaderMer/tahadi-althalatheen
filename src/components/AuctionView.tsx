/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Trophy, 
  Clock, 
  Check, 
  X, 
  Play, 
  Plus, 
  Minus, 
  Award,
  ChevronRight,
  Sparkles,
  Zap,
  Volume2
} from 'lucide-react';
import { ListQuestion, Team } from '../types';
import { soundEffects } from '../utils/audio';

interface AuctionViewProps {
  key?: any;
  question: ListQuestion;
  teamA: Team;
  teamB: Team;
  currentRound: number;
  maxRounds: number;
  onFinishRound: (winningTeam: 'A' | 'B' | null, scoreGain: number, scoreGainB?: number) => void;
  onGetNextQuestion: () => ListQuestion;
}

export default function AuctionView({ 
  question, 
  teamA, 
  teamB, 
  currentRound,
  maxRounds,
  onFinishRound, 
  onGetNextQuestion 
}: AuctionViewProps) {
  
  // Outer State managing the 4 sub-rounds inside Auction Mode
  const [currentQuestion, setCurrentQuestion] = useState<ListQuestion>(question);
  const [auctionRound, setAuctionRound] = useState(1);
  const [scoreA, setScoreA] = useState(0);
  const [scoreB, setScoreB] = useState(0);

  // Stages: 'bidding' | 'action' | 'result'
  const [stage, setStage] = useState<'bidding' | 'action' | 'result'>('bidding');
  
  // Bidding states relative to current question
  const [bidA, setBidA] = useState(currentQuestion.minTarget || 3);
  const [bidB, setBidB] = useState(currentQuestion.minTarget || 3);
  const [activeBidder, setActiveBidder] = useState<'A' | 'B' | null>(null);
  const [finalBidAmount, setFinalBidAmount] = useState(0);

  // Active Challenge states
  const [activeTeam, setActiveTeam] = useState<'A' | 'B'>('A');
  const [discoveredAnswers, setDiscoveredAnswers] = useState<string[]>([]);
  const [timeLeft, setTimeLeft] = useState(30);
  const [challengeSuccess, setChallengeSuccess] = useState<boolean | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Synchronize on first load or changes
  useEffect(() => {
    setCurrentQuestion(question);
    setBidA(question.minTarget || 3);
    setBidB(question.minTarget || 3);
  }, [question]);

  // Calculation of points earned based on target list length
  const calculatePoints = (count: number): number => {
    if (count <= 10) return 1;
    if (count <= 20) return 2;
    if (count <= 30) return 3;
    return 4;
  };

  const scorePoints = calculatePoints(finalBidAmount);

  // Action timer start (Phase 2)
  useEffect(() => {
    if (stage !== 'action' || challengeSuccess !== null) return;

    setTimeLeft(30);
    
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          // Timer ended!
          handleChallengeResult(false);
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
  }, [stage, challengeSuccess]);

  const handleAdjustBid = (team: 'A' | 'B', change: number) => {
    soundEffects.playClick();
    if (team === 'A') {
      setBidA(prev => Math.max(1, Math.min(currentQuestion.answers.length, prev + change)));
    } else {
      setBidB(prev => Math.max(1, Math.min(currentQuestion.answers.length, prev + change)));
    }
  };

  // Lock the bid for a team
  const lockBidAndStart = (biddingTeam: 'A' | 'B') => {
    soundEffects.playClick();
    const amount = biddingTeam === 'A' ? bidA : bidB;
    setFinalBidAmount(amount);
    setActiveTeam(biddingTeam);
    setStage('action');
  };

  const handleCorrectAnswer = (ans: string) => {
    if (stage !== 'action' || challengeSuccess !== null || discoveredAnswers.includes(ans)) return;

    soundEffects.playClick();
    const updated = [...discoveredAnswers, ans];
    setDiscoveredAnswers(updated);

    // If they reach the bidding target, they WIN!
    if (updated.length >= finalBidAmount) {
      handleChallengeResult(true);
    }
  };

  const handleChallengeResult = (success: boolean) => {
    if (timerRef.current) clearInterval(timerRef.current);
    setChallengeSuccess(success);
    setStage('result');
    if (success) {
      soundEffects.playSuccess();
    } else {
      soundEffects.playFailure();
    }
  };

  const handleFinishAndSubmit = () => {
    const opponent: 'A' | 'B' = activeTeam === 'A' ? 'B' : 'A';
    const subWinner = challengeSuccess ? activeTeam : opponent;
    
    // Calculate final scores accumulators
    let finalA = scoreA;
    let finalB = scoreB;
    if (subWinner === 'A') {
      finalA += scorePoints;
      setScoreA(prev => prev + scorePoints);
    } else {
      finalB += scorePoints;
      setScoreB(prev => prev + scorePoints);
    }

    if (auctionRound < 4) {
      // Proceed to the next auction question
      soundEffects.playClick();
      const nextQ = onGetNextQuestion();
      setCurrentQuestion(nextQ);
      
      // Reset modes states
      setStage('bidding');
      setBidA(nextQ.minTarget || 3);
      setBidB(nextQ.minTarget || 3);
      setActiveBidder(null);
      setFinalBidAmount(0);
      setActiveTeam('A');
      setDiscoveredAnswers([]);
      setTimeLeft(30);
      setChallengeSuccess(null);
      
      setAuctionRound(prev => prev + 1);
    } else {
      // 4th internal round finished -> transition back to Master screen
      soundEffects.playFanfare();
      
      const overallWinner = finalA > finalB ? 'A' : (finalB > finalA ? 'B' : null);
      onFinishRound(overallWinner, finalA, finalB);
    }
  };

  // Force local skip/regenerate question at this sub-level
  const handleLocalSkip = () => {
    soundEffects.playClick();
    const nextQ = onGetNextQuestion();
    setCurrentQuestion(nextQ);
    
    // Reset all round states
    setStage('bidding');
    setBidA(nextQ.minTarget || 3);
    setBidB(nextQ.minTarget || 3);
    setActiveBidder(null);
    setFinalBidAmount(0);
    setActiveTeam('A');
    setDiscoveredAnswers([]);
    setTimeLeft(30);
    setChallengeSuccess(null);
  };

  return (
    <div className="flex flex-col justify-between min-h-screen text-white bg-slate-950 p-6 select-none relative" dir="rtl">
      {/* Background neon elements */}
      <div className="absolute top-10 left-10 w-64 h-64 bg-rose-600/5 rounded-full blur-[90px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-64 h-64 bg-pink-600/5 rounded-full blur-[90px] pointer-events-none" />

      {/* Header Info with dynamic counters and team scores inside current tournament round */}
      <div className="w-full flex justify-between items-center z-10 max-w-md bg-slate-900/45 p-3.5 rounded-2xl border border-slate-850 shadow-md">
        <div className="text-right">
          <span className="text-xs text-rose-300 font-bold block">المزاد الحاسم • السؤال {auctionRound} من 4</span>
          <span className="text-[10px] text-slate-500 font-sans">الجولة العامة {currentRound} من {maxRounds}</span>
        </div>
        <div className="bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800/80 flex items-center gap-2 text-2xs font-extrabold font-sans">
          <span className="text-rose-400 font-sans">{teamA.name} <span className="font-sans font-black text-sm text-rose-100">{scoreA}</span></span>
          <span className="text-slate-700 font-sans">|</span>
          <span className="text-sky-400 font-sans">{teamB.name} <span className="font-sans font-black text-sm text-sky-100">{scoreB}</span></span>
        </div>
      </div>

      {/* Main Container */}
      <div className="w-full max-w-md flex-1 flex flex-col justify-center z-10 my-4 text-center">
        
        {/* Phase 1: Bidding Stage */}
        <AnimatePresence mode="wait">
          {stage === 'bidding' && (
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="space-y-6 w-full text-right"
              key="stage_bidding"
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentQuestion.id}
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -20, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="bg-slate-900/40 border border-slate-850 p-5 rounded-3xl text-right relative overflow-hidden"
                >
                  <div className="flex justify-between items-center mb-2.5">
                    <span className="text-[10px] font-bold tracking-wider text-rose-450 uppercase bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/15">
                      السؤال {auctionRound} من 4 • تحدي المزايدة الجماعية
                    </span>
                    <button
                      onClick={handleLocalSkip}
                      className="px-3 py-1 bg-slate-950 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      تبديل السؤال 🔄
                    </button>
                  </div>
                  <h2 className="text-xl font-extrabold text-slate-100 leading-relaxed">
                    {currentQuestion.questionAr}
                  </h2>
                  <div className="text-xs text-slate-400 mt-2">
                    العدد الكلي للإجابات المتاحة بالبنك: <span className="font-bold text-slate-200">{currentQuestion.answers.length}</span> إجابة.
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* High precision bidding panels */}
              <div className="grid grid-cols-2 gap-4">
                {/* Team A Bidder */}
                <div className="bg-slate-900/30 border border-rose-500/20 p-4 rounded-3xl text-center space-y-3">
                  <span className="text-xs font-bold text-rose-300 block truncate">{teamA.name}</span>
                  <div className="flex items-center justify-between bg-slate-950 p-2 rounded-2xl border border-slate-800">
                    <button
                      onClick={() => handleAdjustBid('A', -1)}
                      className="p-1 bg-slate-900 rounded-lg hover:bg-slate-800 text-slate-300 cursor-pointer"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="text-xl font-black font-sans text-white">{bidA}</span>
                    <button
                      onClick={() => handleAdjustBid('A', 1)}
                      className="p-1 bg-slate-900 rounded-lg hover:bg-slate-800 text-slate-300 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <button
                    onClick={() => lockBidAndStart('A')}
                    className="w-full bg-rose-600 hover:bg-rose-550 py-2.5 rounded-xl text-xs font-extrabold text-white transition-all shadow-md shadow-rose-600/10 cursor-pointer"
                  >
                    رسا المزاد بـ {bidA} 🏷️
                  </button>
                </div>

                {/* Team B Bidder */}
                <div className="bg-slate-900/30 border border-sky-500/20 p-4 rounded-3xl text-center space-y-3">
                  <span className="text-xs font-bold text-sky-300 block truncate">{teamB.name}</span>
                  <div className="flex items-center justify-between bg-slate-950 p-2 rounded-2xl border border-slate-800">
                    <button
                      onClick={() => handleAdjustBid('B', -1)}
                      className="p-1 bg-slate-900 rounded-lg hover:bg-slate-800 text-slate-300 cursor-pointer"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="text-xl font-black font-sans text-white">{bidB}</span>
                    <button
                      onClick={() => handleAdjustBid('B', 1)}
                      className="p-1 bg-slate-900 rounded-lg hover:bg-slate-800 text-slate-300 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <button
                    onClick={() => lockBidAndStart('B')}
                    className="w-full bg-sky-600 hover:bg-sky-550 py-2.5 rounded-xl text-xs font-extrabold text-white transition-all shadow-md shadow-sky-600/10 cursor-pointer"
                  >
                    رسا المزاد بـ {bidB} 🏷️
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Phase 2: Action Stage (Bidding team performs under timer) */}
          {stage === 'action' && (
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="space-y-4 w-full"
              key="stage_action"
            >
              {/* Question overview */}
              <div className="bg-slate-900/40 border border-slate-855 p-4 rounded-2xl text-right flex justify-between items-start">
                <div className="flex-1 min-w-0 pr-1">
                  <h3 className="text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-rose-450 to-pink-400">
                    السؤال {auctionRound} من 4 • فريق المقاومة: {activeTeam === 'A' ? teamA.name : teamB.name} ⚔️
                  </h3>
                  <p className="text-sm font-extrabold text-white mt-1 leading-normal">{currentQuestion.questionAr}</p>
                </div>

                {/* Circular Countdown Progress */}
                <div className="flex-shrink-0 flex flex-col items-center">
                  <div className={`w-11 h-11 rounded-full border flex items-center justify-center font-sans text-xs font-black ${
                    timeLeft <= 6 ? 'bg-rose-950 text-rose-400 border-rose-500 animate-pulse' : 'bg-slate-950 border-slate-800 text-slate-200'
                  }`}>
                    {timeLeft}s
                  </div>
                </div>
              </div>

              {/* Progress visual bar */}
              <div className="bg-slate-900 border border-slate-850 p-4 rounded-2xl relative">
                <div className="flex justify-between items-center text-xs text-slate-400 mb-1.5 font-sans">
                  <span>الهدف لإرضاء المزاد الحاسم:</span>
                  <span className="font-extrabold text-white">
                    {discoveredAnswers.length} من <span className="text-rose-400 text-sm font-black">{finalBidAmount}</span>
                  </span>
                </div>
                
                {/* Real interactive bar percent */}
                <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-850">
                  <div 
                    className="bg-gradient-to-r from-rose-500 to-pink-500 h-full transition-all duration-300"
                    style={{ width: `${Math.min(100, (discoveredAnswers.length / finalBidAmount) * 100)}%` }}
                  />
                </div>
              </div>

              {/* Judge point-and-tap answer sheet */}
              <div className="text-right">
                <label className="text-2xs font-extrabold text-slate-500 block mb-1">لوحة تحكيم المضيف (انقر بمجرد سماع الإجابة الصحيحة):</label>
                <div className="bg-slate-900/20 p-3 rounded-2xl border border-slate-850 max-h-[220px] overflow-y-auto grid grid-cols-2 gap-2">
                  {currentQuestion.answers.map((ans, idx) => {
                    const found = discoveredAnswers.includes(ans);
                    return (
                      <button
                        key={idx}
                        onClick={() => handleCorrectAnswer(ans)}
                        disabled={found}
                        className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all text-right flex items-center justify-between gap-1.5 border min-h-[44px] cursor-pointer ${
                          found
                            ? 'bg-slate-950 border-slate-905 text-slate-650 opacity-40'
                            : 'bg-slate-950 border-slate-850 text-slate-205 hover:bg-slate-900'
                        }`}
                      >
                        <span className="whitespace-normal break-words text-right leading-tight flex-1">{ans}</span>
                        {!found && <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Failure trigger button */}
              <button
                onClick={() => handleChallengeResult(false)}
                className="w-full py-3 bg-slate-950 hover:bg-rose-900/20 border border-slate-850 hover:border-rose-500/30 text-xs font-bold text-slate-400 hover:text-rose-300 rounded-xl transition-all cursor-pointer"
              >
                أعلن الاستسلام / فشل تحقيق المزاد 🏳️
              </button>
            </motion.div>
          )}

          {/* Phase 3: Result Stage */}
          {stage === 'result' && (
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-900 border border-slate-850 p-6 rounded-3xl w-full text-center space-y-4"
              key="stage_result"
            >
              <Award className="w-12 h-12 text-yellow-400 mx-auto" />
              <div>
                <h3 className="text-base font-black text-slate-400">السؤال {auctionRound} من 4 완료</h3>
                {challengeSuccess ? (
                  <>
                    <h2 className="text-xl font-black text-rose-400 mt-1">تحدي ناجح بالكامل! 🎉</h2>
                    <p className="text-sm text-slate-300 mt-2 leading-relaxed">
                      استطاع فريق <span className="font-extrabold text-white">{activeTeam === 'A' ? teamA.name : teamB.name}</span> سرد الإجابات المطلوبة ({finalBidAmount} إجابة) بنجاح باهر!
                    </p>
                    <p className="text-xs text-yellow-400 mt-2">يحصلون على {scorePoints} نقطة.</p>
                  </>
                ) : (
                  <>
                    <h2 className="text-xl font-black text-slate-100 mt-1">فشل وفوات المزاد! ❌</h2>
                    <p className="text-sm text-slate-300 mt-2 leading-relaxed">
                      لم يوفّق فريق <span className="font-extrabold text-white">{activeTeam === 'A' ? teamA.name : teamB.name}</span> في تسليم {finalBidAmount} إجابات في الوقت المحدد.
                    </p>
                    <p className="text-xs text-emerald-400 mt-2">
                      تنتقل نقاط المعركة ({scorePoints} نقطة) تلقائياً لفريق <span className="font-bold">{activeTeam === 'A' ? teamB.name : teamA.name}</span> لالتزامهم بالأمان!
                    </p>
                  </>
                )}
              </div>

              <button
                onClick={handleFinishAndSubmit}
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 py-3 rounded-xl font-bold text-sm text-white shadow-lg transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>{auctionRound < 4 ? `الموافقة والانتقال للسؤال ${auctionRound + 1}` : 'الموافقة وإنهاء المزاد الحاسم 🏆'}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

      </div>

      {/* Screen bottom bar spacer / skip - Omnipresent except when submitting the final tournament scores */}
      {!(stage === 'result' && auctionRound === 4) && (
        <button
          onClick={handleLocalSkip}
          className="w-full text-center text-xs text-slate-500 hover:text-slate-300 transition-colors py-2 cursor-pointer mt-4"
        >
          تخطي السؤال الحالي والانتقال لسؤال عشوائي آخر ⏭️
        </button>
      )}
    </div>
  );
}
