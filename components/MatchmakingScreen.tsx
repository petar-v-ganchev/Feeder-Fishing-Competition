import React, { useEffect } from 'react';
import { Screen } from '../types';

interface MatchmakingScreenProps {
  onMatchFound: () => void;
}

export const MatchmakingScreen: React.FC<MatchmakingScreenProps> = ({ onMatchFound }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onMatchFound();
    }, 3000); // Simulate a 3-second matchmaking process

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <h1 className="text-3xl font-bold mb-4 animate-pulse">Finding Opponents...</h1>
      <p className="text-gray-400">Preparing The Venue.</p>
    </div>
  );
};