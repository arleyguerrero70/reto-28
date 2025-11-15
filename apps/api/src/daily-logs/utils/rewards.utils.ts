export const DAILY_HIT_REWARDS = [7, 14, 21, 28];

export function isRewardDay(day: number): boolean {
  return DAILY_HIT_REWARDS.includes(day);
}
