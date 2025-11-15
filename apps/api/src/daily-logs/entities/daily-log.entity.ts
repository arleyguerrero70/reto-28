export interface DailyLogEntity {
  id: string;
  challengeId: string;
  logDate: string;
  completed: boolean;
  minutesSpent: number;
  moodBefore?: string;
  moodAfter?: string;
  note?: string;
  sharedInGroup: boolean;
  sharedMessageId?: string;
  createdAt: string;
}
