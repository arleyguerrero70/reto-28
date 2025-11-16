export interface UserEntity {
  id: string;
  email: string;
  emailContact?: string;
  fullName: string;
  role: 'participant' | 'super_admin';
  mentorIds: string[];
  motivation?: string;
  expectation?: string;
  timezone?: string;
  habitGoal?: string;
  telegramUserId?: string;
  createdAt: string;
}
