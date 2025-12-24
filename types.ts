export enum Screen {
  Login,
  MainMenu,
  Matchmaking,
  LiveMatchmaking,
  Loadout,
  MatchUI,
  Results,
  Profile,
  Inventory,
  Shop,
  Leaderboard,
  EditProfile,
  CreateProfile,
}

export interface User {
  id: string; // Corresponds to Firebase Auth UID
  displayName: string;
  email: string;
  avatar: string;
  country: string;
  language?: string;
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
  reel: string;
  line: string;
  hook: string;
  feeder: string;
  bait: string;
  groundbait: string;
  additive: string;
  feederTip: string;
  castingDistance: string;
  castingInterval: string;
  venueFish?: {
    dominant: string;
    secondary: string;
  };
}

export interface MatchResult {
  playerWeight: number;
  opponentWeight: number;
  eurosEarned: number;
  standings: MatchParticipant[];
  isLive: boolean;
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
  lastCatchTime: number; // For trend tracking
  avatar?: string;
  country?: string;
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
  country: string;
  isWin: boolean;
  rank: number;
  timestamp: any; // Firebase ServerTimestamp
}