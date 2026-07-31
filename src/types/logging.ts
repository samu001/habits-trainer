export type SessionResult = 'completed' | 'partial' | 'skipped';

export type SessionLog = {
  id: string;
  habitId: string;
  loggedAt: string;
  weekId: string;
  result: SessionResult;
  prescribedMinutes: number;
  minutesDone: number;
  credit: number;
  note?: string;
};

export type LogSessionInput = {
  habitId: string;
  result: SessionResult;
  minutesDone?: number;
  note?: string;
  loggedAt?: Date;
};

export type WeeklyProgress = {
  weekId: string;
  weekLabel: string;
  requiredSessions: number;
  prescribedMinutes: number;
  prescriptionLabel: string;
  logs: SessionLog[];
  earnedCredits: number;
  completionRate: number;
  remainingSessions: number;
  isComplete: boolean;
};
