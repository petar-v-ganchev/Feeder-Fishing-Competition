
import React from 'react';
import { Screen, type User } from '../types';
import { Button } from './common/Button';
import { Card } from './common/Card';
import { Header } from './common/Header';

interface ProfileScreenProps {
  user: User;
  onNavigate: (screen: Screen) => void;
  onLogout: () => void;
}

const StatItem: React.FC<{label: string, value: string | number}> = ({label, value}) => (
    <div className="flex justify-between items-center py-3 border-b border-gray-700 last:border-b-0">
        <span className="text-gray-400">{label}</span>
        <span className="font-bold text-lg">{value}</span>
    </div>
);

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ user, onNavigate, onLogout }) => {
  return (
    <div className="p-4 max-w-2xl mx-auto">
      <Header title="Profile & Stats" onBack={() => onNavigate(Screen.MainMenu)} />
      
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
        <StatItem label="Global Ranking Position" value={`#${user.stats.globalRank}`} />
        <StatItem label="Country Ranking Position" value={`#${user.stats.countryRank}`} />
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