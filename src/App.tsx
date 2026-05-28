/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import Splash from './components/Splash';
import MainMenu from './components/MainMenu';
import TeamSetup from './components/TeamSetup';
import CategorySelect from './components/CategorySelect';
import GameModeSelect from './components/GameModeSelect';
import TurnChallengeView from './components/TurnChallengeView';
import AuctionView from './components/AuctionView';
import BuzzerView from './components/BuzzerView';
import WhoAmIView from './components/WhoAmIView';
import RoundResultView from './components/RoundResultView';
import WinnerView from './components/WinnerView';

import { LIST_QUESTIONS, TRIVIA_QUESTIONS } from './data/questions';
import { GameMode, CategoryId, Team, ListQuestion, TriviaQuestion } from './types';

export default function App() {
  // Screens: 'splash' | 'menu' | 'team_setup' | 'category_select' | 'mode_select' | 'gameplay' | 'round_result' | 'winner'
  const [screen, setScreen] = useState<'splash' | 'menu' | 'team_setup' | 'category_select' | 'mode_select' | 'gameplay' | 'round_result' | 'winner'>('splash');

  // Unified State Engine
  const [teamA, setTeamA] = useState<Team>({ name: 'الأشاوس', score: 0, strikes: 0 });
  const [teamB, setTeamB] = useState<Team>({ name: 'الوحوش', score: 0, strikes: 0 });
  
  const [currentRound, setCurrentRound] = useState(1);
  const [maxRounds, setMaxRounds] = useState(5);
  const [selectedCategories, setSelectedCategories] = useState<CategoryId[]>([]);
  const [currentGameMode, setCurrentGameMode] = useState<GameMode | null>(null);

  // Question Engine lists
  const [usedListQuestionIds, setUsedListQuestionIds] = useState<string[]>([]);
  const [usedTriviaQuestionIds, setUsedTriviaQuestionIds] = useState<string[]>([]);

  const [activeListQuestion, setActiveListQuestion] = useState<ListQuestion | null>(null);
  const [activeTriviaQuestion, setActiveTriviaQuestion] = useState<TriviaQuestion | null>(null);

  // Score keeping per turn
  const [roundWinner, setRoundWinner] = useState<'A' | 'B' | null>(null);
  const [scoreGain, setScoreGain] = useState(1);

  // Custom question cycle helper for list mode
  const getNextListQuestion = (): ListQuestion => {
    let available = LIST_QUESTIONS.filter(q => selectedCategories.includes(q.category) && !usedListQuestionIds.includes(q.id));
    if (available.length === 0) {
      setUsedListQuestionIds([]);
      available = LIST_QUESTIONS.filter(q => selectedCategories.includes(q.category));
    }
    if (available.length === 0) {
      available = LIST_QUESTIONS; // fallback
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
      available = TRIVIA_QUESTIONS; // fallback
    }
    const selected = available[Math.floor(Math.random() * available.length)];
    setUsedTriviaQuestionIds(prev => [...prev, selected.id]);
    return selected;
  };

  // Custom question cycle engine
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
    if (currentGameMode) {
      selectQuestionForMode(currentGameMode, selectedCategories);
    }
  };

  // Handler: Select a mode
  const handleSelectMode = (mode: GameMode) => {
    setCurrentGameMode(mode);
    selectQuestionForMode(mode, selectedCategories);
    setScreen('gameplay');
  };

  // Handler: Finish active gameplay round
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

  const handleNextRoundProgression = () => {
    setCurrentRound(prev => prev + 1);
    setScreen('mode_select');
  };

  const [matchWinnerName, setMatchWinnerName] = useState('');
  const [matchWinnerTeam, setMatchWinnerTeam] = useState<'A' | 'B'>('A');

  const handleFinishGameAndCrown = (winner: 'A' | 'B') => {
    setMatchWinnerTeam(winner);
    setMatchWinnerName(winner === 'A' ? teamA.name : teamB.name);
    setScreen('winner');
  };

  // Game flow resets
  const handleRestartFullGame = () => {
    setTeamA({ name: 'الأشاوس', score: 0, strikes: 0 });
    setTeamB({ name: 'الوحوش', score: 0, strikes: 0 });
    setCurrentRound(1);
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
          onNext={(nameA, nameB, totalRounds) => {
            setTeamA({ name: nameA, score: 0, strikes: 0 });
            setTeamB({ name: nameB, score: 0, strikes: 0 });
            setMaxRounds(totalRounds);
            setScreen('category_select');
          }}
        />
      )}

      {screen === 'category_select' && (
        <CategorySelect
          onBack={() => setScreen('team_setup')}
          onNext={(categories) => {
            setSelectedCategories(categories);
            setScreen('mode_select');
          }}
        />
      )}

      {screen === 'mode_select' && (
        <GameModeSelect
          onBack={() => setScreen('category_select')}
          onSelectMode={handleSelectMode}
          teamAName={teamA.name}
          teamBName={teamB.name}
          currentRound={currentRound}
        />
      )}

      {screen === 'gameplay' && currentGameMode === 'turn_challenge' && activeListQuestion && (
        <TurnChallengeView
          key={activeListQuestion.id}
          question={activeListQuestion}
          teamA={teamA}
          teamB={teamB}
          currentRound={currentRound}
          maxRounds={maxRounds}
          onFinishRound={handleFinishRound}
          onSkipRound={handleSkipQuestion}
        />
      )}

      {screen === 'gameplay' && currentGameMode === 'auction' && activeListQuestion && (
        <AuctionView
          key={`auction_${currentRound}`}
          question={activeListQuestion}
          teamA={teamA}
          teamB={teamB}
          currentRound={currentRound}
          maxRounds={maxRounds}
          onFinishRound={handleFinishRound}
          onGetNextQuestion={getNextListQuestion}
        />
      )}

      {screen === 'gameplay' && currentGameMode === 'buzzer' && activeTriviaQuestion && (
        <BuzzerView
          key={activeTriviaQuestion.id}
          question={activeTriviaQuestion}
          teamA={teamA}
          teamB={teamB}
          currentRound={currentRound}
          maxRounds={maxRounds}
          onFinishRound={handleFinishRound}
          onSkipRound={handleSkipQuestion}
          onGetNextTriviaQuestion={getNextTriviaQuestion}
        />
      )}

      {screen === 'gameplay' && currentGameMode === 'who_am_i' && activeTriviaQuestion && (
        <WhoAmIView
          key={activeTriviaQuestion.id}
          question={activeTriviaQuestion}
          teamA={teamA}
          teamB={teamB}
          currentRound={currentRound}
          maxRounds={maxRounds}
          onFinishRound={handleFinishRound}
          onSkipRound={handleSkipQuestion}
        />
      )}

      {screen === 'round_result' && (
        <RoundResultView
          teamA={teamA}
          teamB={teamB}
          currentRound={currentRound}
          maxRounds={maxRounds}
          roundWinner={roundWinner}
          scoreGain={scoreGain}
          onNextRound={handleNextRoundProgression}
          onFinishGame={handleFinishGameAndCrown}
        />
      )}

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
