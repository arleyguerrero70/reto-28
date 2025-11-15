export type ChallengeStatus = 'active' | 'completed' | 'paused';

export interface ChallengeEntity {
  id: string;
  userId: string;
  startsAt: string;
  currentDay: number;
  status: ChallengeStatus;
  goalDescription?: string;
  timezone: string;
  createdAt: string;
}
