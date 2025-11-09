

export enum Screen {
  Login,
  MainMenu,
  Matchmaking,
  Loadout,
  MatchUI,
  Results,
  Profile,
  Inventory,
  Shop,
  Leaderboard,
  EditProfile,
}

export interface User {
  id: string; // Corresponds to Firebase Auth UID
  displayName: string;
  email: string;
  avatar: string;
  country: string;
  euros: number;
  inventory: GameItem[];
  stats: {
    matchesPlayed: number;
    wins: number;
  };
}

export interface GameItem {
  id: string;
  name: string;
  type: 'Rod' | 'Reel' | 'Line' | 'Hook' | 'Feeder' | 'Bait' | 'Groundbait' | 'Additive' | 'Accessory';
  description: string;
  price: number;
}

export interface Loadout {
  rod: string;
  bait: string;
  groundbait: string;
  hookSize: string;
  feederType: string;
  feederTip: string;
  castingDistance: string;
  castingInterval: string;
}

export interface MatchResult {
  playerWeight: number;
  opponentWeight: number;
  eurosEarned: number;
  standings: MatchParticipant[];
}

export interface DailyChallenge {
  challengeType: 'enter' | 'win' | 'top5';
  description: string;
  reward: number;
  targetCount: number;
  progress: number;
  isCompleted: boolean;
  isClaimed: boolean;
}

export interface MatchParticipant {
  id: string;
  name: string;
  isBot: boolean;
  loadout: Loadout;
  totalWeight: number;
  catchStreak: number;
}

export type VenueCondition = 'Clear Water' | 'Murky Water' | 'Warm Weather' | 'Cool Weather';

export interface NewsItem {
  id: number;
  message: string;
  isHint?: boolean;
}

export interface MatchHistory {
  id?: string; // Firestore doc ID
  userId: string;
  displayName: string;
  country: string;
  isWin: boolean;
  rank: number;
  timestamp: any; // Firebase ServerTimestamp
}