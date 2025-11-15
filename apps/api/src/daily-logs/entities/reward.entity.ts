export type RewardType = 'shield' | 'bonus';

export interface RewardEntity {
  id: string;
  userId: string;
  type: RewardType;
  grantedDay: number;
  consumed: boolean;
  createdAt: string;
}
