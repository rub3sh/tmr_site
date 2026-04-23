export interface UserProfile {
  id: string;
  email: string;
  name: string | null;
  role: 'STUDENT' | 'ADMIN';
  createdAt: string;
}

export interface UserWithStats extends UserProfile {
  purchaseCount: number;
  completionPercent: number;
}
