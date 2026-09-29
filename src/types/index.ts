export type ISODate = string; // YYYY-MM-DD

export type WorkoutType =
  | 'musculacao' | 'funcional' | 'crossfit' | 'pilates' | 'corrida'
  | 'natacao' | 'danca' | 'esporte' | 'outro';

export type CardioType =
  | 'caminhada' | 'corrida' | 'bicicleta' | 'escada' | 'transport' | 'eliptico' | 'outro';

export interface Rules {
  workoutsPerWeek: number;      // mínimo semanal (4)
  workoutBonusAt: number;       // nº do treino que dá bônus (5)
  cardioPerWeek: number;        // 3
  cardioMinMinutes: number;     // 30
  waterGoalMl: number;          // 3000
  points: {
    workout: number;            // 10
    workoutBonus: number;       // 5
    cardio: number;             // 5
    water: number;              // 5
    noSweets: number;           // 5
    noAlcohol: number;          // 5
  };
}

export type ChallengeStatus = 'draft' | 'active' | 'ended';

export interface Challenge {
  id: string;
  groupId: string;
  name: string;
  startDate: ISODate;
  durationDays: number;
  status: ChallengeStatus;
  rules: Rules;
}

export interface User {
  id: string;
  name: string;
  email: string;
  photo?: string;
  isAdmin?: boolean;
}

export interface Group {
  id: string;
  name: string;
  photo?: string;
  inviteCode: string;
  memberIds: string[];
  adminId: string;
  challengeId: string;
}

export interface Workout {
  id: string;
  userId: string;
  date: ISODate;
  type: WorkoutType;
  minutes?: number;
  note?: string;
}

export interface Cardio {
  id: string;
  userId: string;
  date: ISODate;
  time: string; // HH:MM
  type: CardioType;
  minutes: number;
  note?: string;
  photo?: string;
}

/** Registro diário: água + zero doce + zero álcool. */
export interface DayLog {
  userId: string;
  date: ISODate;
  waterMl: number;
  noSweets: boolean | null;   // true = cumpriu, false = não cumpriu, null = não registrado
  noAlcohol: boolean | null;
}

export interface Activity {
  id: string;
  userId: string;
  text: string;
  createdAt: string; // ISO datetime
  reactions: { userId: string; emoji: '❤️' | '🔥' | '💪' | '👏' }[];
  comments: { id: string; userId: string; text: string; createdAt: string }[];
}

export interface NotificationPrefs {
  water: boolean; workout: boolean; cardio: boolean;
  sweets: boolean; alcohol: boolean; dailyClose: boolean;
}

export type MinStatus = 'below' | 'met' | 'bonus';

export interface UserData {
  workouts: Workout[];
  cardios: Cardio[];
  days: DayLog[];
}

export interface UserStats {
  userId: string;
  points: number;
  weekPoints: number;
  todayPoints: number;
  workoutsTotal: number;
  workoutPoints: number;
  cardioTotal: number;
  cardioPoints: number;
  waterDays: number;
  waterPoints: number;
  sweetsDays: number;
  alcoholDays: number;
  disciplinePoints: number;
  sweetsStreak: number;
  alcoholStreak: number;
  bestSweetsStreak: number;
  bestAlcoholStreak: number;
  streak: number;               // dias seguidos com tudo cumprido (doce+álcool+água)
  workoutsThisWeek: number;
  cardioThisWeek: number;
  workoutStatus: MinStatus;
  cardioMet: boolean;
  failedWeeks: number;          // semanas já encerradas sem o mínimo de treino
}

export type RankingFilter =
  | 'geral' | 'semana' | 'hoje' | 'treinos' | 'cardio' | 'agua' | 'disciplina';
