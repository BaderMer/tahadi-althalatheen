/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import Splash from './components/Splash';
import MainMenu from './components/MainMenu';
import TeamSetup from './components/TeamSetup';
import CategorySelect from './components/CategorySelect';
import TurnChallengeView from './components/TurnChallengeView';
import AuctionView from './components/AuctionView';
import BuzzerView from './components/BuzzerView';
import WhoAmIView from './components/WhoAmIView';
import RoundResultView from './components/RoundResultView';
import WinnerView from './components/WinnerView';
import SectionTransition from './components/SectionTransition';

import { LIST_QUESTIONS, TRIVIA_QUESTIONS } from './data/questions';
import { GameMode, CategoryId, Team, ListQuestion, TriviaQuestion } from './types';

// Static configurations for the TV-show sequential match flow
const MATCH_SECTIONS = [
  {
    id: 'turn_challenge' as const,
    title: 'تحدي الدور 🕹️',
    description: '٣ أسئلة • الإجابة بالدور مع ٣ أرواح لكل فريق. تجنب الخطأ واحصد نقاط التفوق!',
    rules: [
      "٣ أسئلة متسلسلة للطرفين يتم الإجابة فيها بالتبادل والتناوب.",
      "كل فريق لديه ٣ أرواح (محاولات خطأ) والهدف كشف أكبر عدد من إجابات الكلمة.",
      "الفريق الحاصد لبقايا الأرواح الأكثر يكسب نقطة السؤال!"
    ]
  },
  {
    id: 'auction' as const,
    title: 'مزاد الإجابات ⚖️',
    description: '٤ أسئلة مزايدة حاسمة • زايد بذكاء مع خصمك على كمية الإجابات التي يمكنك سردها ثقة بالنجاح!',
    rules: [
      "مسابقة مزايدة حماسية تدوم لـ ٤ عناصر سرية ممتعة.",
      "صاحب المزايدة الأعلى يحب عليه كشف العدد المعلن بدون خطأ واحد ليكسب المزاد.",
      "الفشل يمنح النقطة مباشرة وبشكل تنافسي للخصم دون عناء!"
    ]
  },
  {
    id: 'buzzer' as const,
    title: 'جرس السرعة 🔔',
    description: '٥ أسئلة سرعة • من يقرع جرس السرعة ويسارع في الرد يستولي على النقطة!',
    rules: [
      "٥ جولات صاخبة للأسئلة الثقافية السريعة والبديهية.",
      "السرعة القصوى بضغط زر الضربة هي من تفصل الفريق المجيب.",
      "الفشل في الإجابة يطردك ويضمن للخصم التقدم الآمن!"
    ]
  },
  {
    id: 'who_am_i' as const,
    title: 'من أنا؟ 👤',
    description: '٥ أسئلة تلميحات تدريجية • خمّن الشخصية أو المعلم الجغرافي قبل نفاد الوقت والمعلومات!',
    rules: [
      "٥ تحديات غامضة متتالية مع مؤقت تراجع سريع لـ ٥ معلومات.",
      "يتم كشف التلميحات بشكل مدرج من الأصعب إلى الأبسط.",
      "تتطلب معرفة الخيوط بالتركيز والمخاطرة السريعة لكسب النقطة كلياً!"
    ]
  }
];

const MATCH_FLOW = [
  // Section 0: تحدي الدور (3 questions)
  { sectionIndex: 0, mode: 'turn_challenge' as const, questionIndexInSection: 1, totalQuestionsInSection: 3 },
  { sectionIndex: 0, mode: 'turn_challenge' as const, questionIndexInSection: 2, totalQuestionsInSection: 3 },
  { sectionIndex: 0, mode: 'turn_challenge' as const, questionIndexInSection: 3, totalQuestionsInSection: 3 },
  
  // Section 1: المزاد (1 step that plays 4 questions internally)
  { sectionIndex: 1, mode: 'auction' as const, questionIndexInSection: 1, totalQuestionsInSection: 1 },
  
  // Section 2: الجرس (5 questions)
  { sectionIndex: 2, mode: 'buzzer' as const, questionIndexInSection: 1, totalQuestionsInSection: 5 },
  { sectionIndex: 2, mode: 'buzzer' as const, questionIndexInSection: 2, totalQuestionsInSection: 5 },
  { sectionIndex: 2, mode: 'buzzer' as const, questionIndexInSection: 3, totalQuestionsInSection: 5 },
  { sectionIndex: 2, mode: 'buzzer' as const, questionIndexInSection: 4, totalQuestionsInSection: 5 },
  { sectionIndex: 2, mode: 'buzzer' as const, questionIndexInSection: 5, totalQuestionsInSection: 5 },
  
  // Section 3: من أنا (5 questions)
  { sectionIndex: 3, mode: 'who_am_i' as const, questionIndexInSection: 1, totalQuestionsInSection: 5 },
  { sectionIndex: 3, mode: 'who_am_i' as const, questionIndexInSection: 2, totalQuestionsInSection: 5 },
  { sectionIndex: 3, mode: 'who_am_i' as const, questionIndexInSection: 3, totalQuestionsInSection: 5 },
  { sectionIndex: 3, mode: 'who_am_i' as const, questionIndexInSection: 4, totalQuestionsInSection: 5 },
  { sectionIndex: 3, mode: 'who_am_i' as const, questionIndexInSection: 5, totalQuestionsInSection: 5 },
];

export default function App() {
  // Navigation Screens list
  const [screen, setScreen] = useState<'splash' | 'menu' | 'team_setup' | 'category_select' | 'section_transition' | 'gameplay' | 'round_result' | 'winner'>('splash');

  // Core Game State and details
  const [teamA, setTeamA] = useState<Team>({ name: 'الأشاوس', score: 0, strikes: 0 });
  const [teamB, setTeamB] = useState<Team>({ name: 'الوحوش', score: 0, strikes: 0 });
  
  const [selectedCategories, setSelectedCategories] = useState<CategoryId[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  // Question Engine lists for duplicate prevention
  const [usedListQuestionIds, setUsedListQuestionIds] = useState<string[]>([]);
  const [usedTriviaQuestionIds, setUsedTriviaQuestionIds] = useState<string[]>([]);

  const [activeListQuestion, setActiveListQuestion] = useState<ListQuestion | null>(null);
  const [activeTriviaQuestion, setActiveTriviaQuestion] = useState<TriviaQuestion | null>(null);

  // Per-turn match stats
  const [roundWinner, setRoundWinner] = useState<'A' | 'B' | null>(null);
  const [scoreGain, setScoreGain] = useState(1);

  const [matchWinnerName, setMatchWinnerName] = useState('');
  const [matchWinnerTeam, setMatchWinnerTeam] = useState<'A' | 'B' | 'TIE'>('A');

  // Custom question cycle helper for list mode
  const getNextListQuestion = (): ListQuestion => {
    let available = LIST_QUESTIONS.filter(q => selectedCategories.includes(q.category) && !usedListQuestionIds.includes(q.id));
    if (available.length === 0) {
      setUsedListQuestionIds([]);
      available = LIST_QUESTIONS.filter(q => selectedCategories.includes(q.category));
    }
    if (available.length === 0) {
      available = LIST_QUESTIONS; // fallback if no specific categories selected
    }
    const selected = available[Math.floor(Math.random() * available.length)];
    setUsedListQuestionIds(prev => [...prev, selected.id]);
    return selected;
  };

  // Custom question cycle helper for trivia mode
  const getNextTriviaQuestion = (): TriviaQuestion => {
    let available = TRIVIA_QUESTIONS.filter(q => selectedCategories.includes(q.category) && !usedTriviaQuestionIds.includes(q.id));
    if (available.length === 0) {
      setUsedTriviaQuestionIds([]);
      available = TRIVIA_QUESTIONS.filter(q => selectedCategories.includes(q.category));
    }
    if (available.length === 0) {
      available = TRIVIA_QUESTIONS; // fallback if empty
    }
    const selected = available[Math.floor(Math.random() * available.length)];
    setUsedTriviaQuestionIds(prev => [...prev, selected.id]);
    return selected;
  };

  // Select question for specific mode
  const selectQuestionForMode = (mode: GameMode, categories: CategoryId[]) => {
    if (mode === 'turn_challenge' || mode === 'auction') {
      const selected = getNextListQuestion();
      setActiveListQuestion(selected);
    } else {
      const selected = getNextTriviaQuestion();
      setActiveTriviaQuestion(selected);
    }
  };

  // Skip / Regenerate question if judge requests
  const handleSkipQuestion = () => {
    const currentStep = MATCH_FLOW[currentStepIndex];
    selectQuestionForMode(currentStep.mode, selectedCategories);
  };

  // Transition counts complete trigger to start playing!
  const handleTransitionComplete = () => {
    const currentStep = MATCH_FLOW[currentStepIndex];
    selectQuestionForMode(currentStep.mode, selectedCategories);
    setScreen('gameplay');
  };

  // Handler: Finish score accounting for single gameplay question
  const handleFinishRound = (winningTeam: 'A' | 'B' | null, pointsAwarded: number, pointsB: number = 0) => {
    // Determine target team awards
    let realPointsA = pointsAwarded;
    let realPointsB = pointsB;
    if (pointsB === 0 && winningTeam) {
      if (winningTeam === 'A') {
        realPointsA = pointsAwarded;
        realPointsB = 0;
      } else {
        realPointsA = 0;
        realPointsB = pointsAwarded;
      }
    }

    setRoundWinner(winningTeam);
    setScoreGain(realPointsA >= realPointsB ? realPointsA : realPointsB);

    setTeamA(prev => ({ ...prev, score: prev.score + realPointsA }));
    setTeamB(prev => ({ ...prev, score: prev.score + realPointsB }));

    setScreen('round_result');
  };

  // Crown grand champion on match end
  const handleFinishGameAndCrown = (winner: 'A' | 'B' | 'TIE', name: string) => {
    setMatchWinnerTeam(winner);
    setMatchWinnerName(name);
    setScreen('winner');
  };

  // Full system reset
  const handleRestartFullGame = () => {
    setTeamA({ name: 'الأشاوس', score: 0, strikes: 0 });
    setTeamB({ name: 'الوحوش', score: 0, strikes: 0 });
    setCurrentStepIndex(0);
    setUsedListQuestionIds([]);
    setUsedTriviaQuestionIds([]);
    setScreen('menu');
  };

  return (
    <div className="bg-slate-950 min-h-screen text-slate-100 selection:bg-indigo-505 selection:text-white">
      {screen === 'splash' && (
        <Splash onStart={() => setScreen('menu')} />
      )}

      {screen === 'menu' && (
        <MainMenu onStartGame={() => setScreen('team_setup')} />
      )}

      {screen === 'team_setup' && (
        <TeamSetup 
          onBack={() => setScreen('menu')}
          onNext={(nameA, nameB) => {
            setTeamA({ name: nameA, score: 0, strikes: 0 });
            setTeamB({ name: nameB, score: 0, strikes: 0 });
            setScreen('category_select');
          }}
        />
      )}

      {screen === 'category_select' && (
        <CategorySelect
          onBack={() => setScreen('team_setup')}
          onNext={(categories) => {
            setSelectedCategories(categories);
            setCurrentStepIndex(0);
            setScreen('section_transition');
          }}
        />
      )}

      {screen === 'section_transition' && (
        <SectionTransition
          sectionIndex={MATCH_FLOW[currentStepIndex].sectionIndex}
          sectionTitle={MATCH_SECTIONS[MATCH_FLOW[currentStepIndex].sectionIndex].title}
          description={MATCH_SECTIONS[MATCH_FLOW[currentStepIndex].sectionIndex].description}
          rules={MATCH_SECTIONS[MATCH_FLOW[currentStepIndex].sectionIndex].rules}
          onComplete={handleTransitionComplete}
        />
      )}

      {screen === 'gameplay' && (() => {
        const currentStep = MATCH_FLOW[currentStepIndex];

        if (currentStep.mode === 'turn_challenge' && activeListQuestion) {
          return (
            <TurnChallengeView
              key={activeListQuestion.id}
              question={activeListQuestion}
              teamA={teamA}
              teamB={teamB}
              currentRound={currentStep.questionIndexInSection}
              maxRounds={currentStep.totalQuestionsInSection}
              onFinishRound={handleFinishRound}
              onSkipRound={handleSkipQuestion}
            />
          );
        }

        if (currentStep.mode === 'auction' && activeListQuestion) {
          return (
            <AuctionView
              key={`auction_${currentStepIndex}`}
              question={activeListQuestion}
              teamA={teamA}
              teamB={teamB}
              currentRound={currentStep.questionIndexInSection}
              maxRounds={currentStep.totalQuestionsInSection}
              onFinishRound={handleFinishRound}
              onGetNextQuestion={getNextListQuestion}
            />
          );
        }

        if (currentStep.mode === 'buzzer' && activeTriviaQuestion) {
          return (
            <BuzzerView
              key={activeTriviaQuestion.id}
              question={activeTriviaQuestion}
              teamA={teamA}
              teamB={teamB}
              currentRound={currentStep.questionIndexInSection}
              maxRounds={currentStep.totalQuestionsInSection}
              onFinishRound={handleFinishRound}
              onSkipRound={handleSkipQuestion}
              onGetNextTriviaQuestion={getNextTriviaQuestion}
            />
          );
        }

        if (currentStep.mode === 'who_am_i' && activeTriviaQuestion) {
          return (
            <WhoAmIView
              key={activeTriviaQuestion.id}
              question={activeTriviaQuestion}
              teamA={teamA}
              teamB={teamB}
              currentRound={currentStep.questionIndexInSection}
              maxRounds={currentStep.totalQuestionsInSection}
              onFinishRound={handleFinishRound}
              onSkipRound={handleSkipQuestion}
            />
          );
        }

        return null;
      })()}

      {screen === 'round_result' && (() => {
        const currentStep = MATCH_FLOW[currentStepIndex];
        const nextStep = currentStepIndex + 1 < MATCH_FLOW.length ? MATCH_FLOW[currentStepIndex + 1] : null;
        const isLastQuestionOfMatch = !nextStep;
        const isSectionChange = nextStep ? nextStep.sectionIndex !== currentStep.sectionIndex : false;
        const nextSectionTitle = isSectionChange && nextStep ? MATCH_SECTIONS[nextStep.sectionIndex].title : '';

        return (
          <RoundResultView
            teamA={teamA}
            teamB={teamB}
            currentSectionIndex={currentStep.sectionIndex}
            currentQuestionIndexInSection={currentStep.questionIndexInSection}
            totalQuestionsInSection={currentStep.totalQuestionsInSection}
            sectionTitle={MATCH_SECTIONS[currentStep.sectionIndex].title}
            roundWinner={roundWinner}
            scoreGain={scoreGain}
            isLastQuestionOfMatch={isLastQuestionOfMatch}
            isSectionChange={isSectionChange}
            nextSectionTitle={nextSectionTitle}
            onProceed={() => {
              if (isLastQuestionOfMatch) {
                // Determine grand overall champion
                const finalWinnerTeam = teamA.score > teamB.score ? 'A' : (teamB.score > teamA.score ? 'B' : 'TIE');
                const finalWinnerName = finalWinnerTeam === 'A' ? teamA.name : (finalWinnerTeam === 'B' ? teamB.name : '');
                handleFinishGameAndCrown(finalWinnerTeam, finalWinnerName);
              } else {
                const nextIdx = currentStepIndex + 1;
                setCurrentStepIndex(nextIdx);
                const nextStepObj = MATCH_FLOW[nextIdx];

                if (isSectionChange) {
                  // Direct to cinematic countdown transition of next section
                  setScreen('section_transition');
                } else {
                  // Simply transition directly to the next question in the current section
                  selectQuestionForMode(nextStepObj.mode, selectedCategories);
                  setScreen('gameplay');
                }
              }
            }}
          />
        );
      })()}

      {screen === 'winner' && (
        <WinnerView
          winnerName={matchWinnerName}
          winnerTeam={matchWinnerTeam}
          scoreA={teamA.score}
          scoreB={teamB.score}
          nameA={teamA.name}
          nameB={teamB.name}
          onRestart={handleRestartFullGame}
        />
      )}
    </div>
  );
}
