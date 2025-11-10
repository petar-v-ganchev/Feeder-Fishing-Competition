import React, { useState, useEffect } from 'react';
import { Screen, type User } from '../types';
import { Button } from './common/Button';
import { Card } from './common/Card';
import { Header } from './common/Header';
import { getPlayerRanks } from '../services/leaderboardService';

interface ProfileScreenProps {
  user: User;
  onNavigate: (screen: Screen) => void;
  onLogout: () => void;
  onBack: () => void;
}

const StatItem: React.FC<{label: string, value: string | number, isLoading?: boolean}> = ({label, value, isLoading}) => (
    <div className="flex justify-between items-center py-3 border-b border-gray-700 last:border-b-0">
        <span className="text-gray-400">{label}</span>
        {isLoading ? (
            <div className="h-6 w-16 bg-gray-700 rounded animate-pulse"></div>
        ) : (
            <span className="font-bold text-lg">{value}</span>
        )}
    </div>
);

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ user, onNavigate, onLogout, onBack }) => {
  const [ranks, setRanks] = useState<{global: number, country: number} | null>(null);
  const [isLoadingRanks, setIsLoadingRanks] = useState(true);

  useEffect(() => {
      const fetchRanks = async () => {
          setIsLoadingRanks(true);
          const playerRanks = await getPlayerRanks(user.id, user.country);
          setRanks(playerRanks);
          setIsLoadingRanks(false);
      };
      fetchRanks();
  }, [user.id, user.country]);

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <Header title="Profile & Stats" onBack={onBack} />
      
      <Card className="mb-6">
        <div className="flex items-center space-x-4">
            {user.avatar.startsWith('data:image/') ? (
                <img src={user.avatar} alt="User Avatar" className="w-20 h-20 rounded-full object-cover border-2 border-gray-600" />
            ) : (
                <div className="w-20 h-20 rounded-full bg-gray-700 flex items-center justify-center font-bold text-3xl">
                    {user.avatar}
                </div>
            )}
            <div>
                <h2 className="text-2xl font-bold">{user.displayName}</h2>
                <p className="text-gray-400">{user.email}</p>
                <p className="text-gray-400 mt-1">{user.country}</p>
            </div>
        </div>
      </Card>
      
      <Card>
        <h3 className="text-xl font-bold mb-4">Fishing Statistics</h3>
        <StatItem label="Matches Played" value={user.stats.matchesPlayed} />
        <StatItem label="Matches Won" value={user.stats.wins} />
        <StatItem label="Win Rate" value={`${user.stats.matchesPlayed > 0 ? ((user.stats.wins / user.stats.matchesPlayed) * 100).toFixed(0) : 0}%`} />
        <StatItem label="All-Time Global Rank" value={ranks ? `#${ranks.global}` : '-'} isLoading={isLoadingRanks} />
        <StatItem label="All-Time Country Rank" value={ranks ? `#${ranks.country}` : '-'} isLoading={isLoadingRanks} />
      </Card>

      <div className="mt-8 space-y-4">
        <Button onClick={() => onNavigate(Screen.EditProfile)} variant="secondary">
          Edit Profile
        </Button>
        <div className="text-center">
          <button onClick={onLogout} className="text-red-500 font-medium">Logout</button>
        </div>
      </div>
    </div>
  );
};