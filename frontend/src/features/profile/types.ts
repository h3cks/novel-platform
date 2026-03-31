import { User } from '../auth/types';
import { Novel } from '../novels/types';

export interface ProfileStats {
  followers: number;
  following: number;
  novels: number;
}

export interface UserProfile extends User {
  bio?: string | null;
  stats?: ProfileStats;
  recentNovels?: Novel[]; // Останні роботи автора
}