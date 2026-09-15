// Question Source Types
export enum QuestionSource {
  MANUAL = "MANUAL",
  SYSTEM = "SYSTEM",
  AI = "AI"
}

// Question Status Types
export enum QuestionStatus {
  DRAFT = "DRAFT",
  REVIEW = "REVIEW",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
  ARCHIVED = "ARCHIVED"
}

// Question Type Types
export enum QuestionType {
  MULTIPLE_CHOICE = "MULTIPLE_CHOICE",
  TRUE_FALSE = "TRUE_FALSE",
  TEXT_INPUT = "TEXT_INPUT",
  RIDDLE = "RIDDLE",
  TRANSLATION = "TRANSLATION",
  FILL_BLANK = "FILL_BLANK",
  ORDERING = "ORDERING",
  MATCHING = "MATCHING"
}

// Difficulty Types
export enum Difficulty {
  BEGINNER = "BEGINNER",
  EASY = "EASY",
  MEDIUM = "MEDIUM",
  HARD = "HARD",
  EXPERT = "EXPERT",
  MASTER = "MASTER",
  LEGEND = "LEGEND"
}

// Language Types
export enum Language {
  FR = "FR",
  HT = "HT",
  EN = "EN",
  ES = "ES"
}

// Game Status Types
export enum GameStatus {
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
  ABANDONED = "ABANDONED"
}

// Game Type Types
export enum GameType {
  QUIZ = "QUIZ",
  RIDDLE = "RIDDLE",
  SUDOKU = "SUDOKU",
  ENIGMA = "ENIGMA"
}

// Sudoku Size Types
export enum SudokuSize {
  SUDOKU_4X4 = "SUDOKU_4X4",
  SUDOKU_6X6 = "SUDOKU_6X6",
  SUDOKU_9X9 = "SUDOKU_9X9"
}

// Badge Type Types
export enum BadgeType {
  FIRST_WIN = "FIRST_WIN",
  STREAK_5 = "STREAK_5",
  STREAK_10 = "STREAK_10",
  PERFECT_SCORE = "PERFECT_SCORE",
  CATEGORY_MASTER = "CATEGORY_MASTER",
  SPEED_DEMON = "SPEED_DEMON",
  PUZZLE_MASTER = "PUZZLE_MASTER"
}

// Leaderboard Type Types
export enum LeaderboardType {
  DAILY = "DAILY",
  WEEKLY = "WEEKLY",
  MONTHLY = "MONTHLY",
  ALL_TIME = "ALL_TIME",
  FRIENDS = "FRIENDS",
  GLOBAL = "GLOBAL",
  CATEGORY = "CATEGORY"
}

// User Role Types
export enum UserRole {
  USER = "USER",
  ADMIN = "ADMIN",
  MODERATOR = "MODERATOR"
}

// Question Option Interface
export interface QuestionOption {
  id: string
  questionId: string
  text: string
  isCorrect: boolean
  order: number
}