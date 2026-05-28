/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type GameMode = 'turn_challenge' | 'auction' | 'buzzer' | 'who_am_i';

export type Difficulty = 'easy' | 'medium' | 'hard';

export type CategoryId = 
  | 'geography' 
  | 'history' 
  | 'science' 
  | 'general' 
  | 'football' 
  | 'capitals' 
  | 'islamic' 
  | 'adult_18'
  | 'foreign_series'
  | 'countries';

export interface Category {
  id: CategoryId;
  name: string;
  icon: string;
  description: string;
  color: string;
  gradient: string;
}

// Question structures suited for different modes
export interface ListQuestion {
  id: string;
  category: CategoryId;
  difficulty: Difficulty;
  questionAr: string;
  questionEn?: string;
  answers: string[]; // List of multiple correct answers (e.g. Red Sea countries, Surat Al-Baqarah details, etc.)
  minTarget?: number; // Recommended target for bidding
}

export interface TriviaQuestion {
  id: string;
  category: CategoryId;
  difficulty: Difficulty;
  questionAr: string;
  clues: string[]; // For Who Am I (starts with hard clues, moves to easier ones)
  correctAnswer: string;
  wrongAnswers?: string[]; // Optional multiple choice distractors
}

export interface Team {
  name: string;
  score: number;
  strikes: number; // For active rounds with strikes/lives
}

export interface GameState {
  currentScreen: 'splash' | 'menu' | 'team_setup' | 'category_select' | 'mode_select' | 'gameplay' | 'round_result' | 'winner';
  teamA: Team;
  teamB: Team;
  selectedCategories: CategoryId[];
  currentGameMode: GameMode | null;
  currentRound: number;
  roundsLimit: number;
  winnerTeam: 'A' | 'B' | null;
}
