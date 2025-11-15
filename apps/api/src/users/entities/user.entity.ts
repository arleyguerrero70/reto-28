export interface UserEntity {
  id: string;
  email: string;
  fullName: string;
  role: 'participant' | 'super_admin';
  mentorIds: string[];
  motivation?: string;
  expectation?: string;
  timezone?: string;
  createdAt: string;
}
