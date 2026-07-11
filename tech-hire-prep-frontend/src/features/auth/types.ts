export type UserRole = 'STUDENT' | 'ADMIN';
export type UserStatus = 'active' | 'suspended' | 'deleted';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  status: UserStatus;
  avatarUrl?: string;
  isEmailVerified: boolean;
}