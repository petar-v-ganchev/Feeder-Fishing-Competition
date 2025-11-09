import React from 'react';
import type { MatchResult, MatchParticipant } from '../types';
import { Button } from './common/Button';
import { Card } from './common/Card';

interface ResultsScreenProps {
  result: MatchResult;
  onContinue: () => void;
}

const RankChangeItem: React.FC<{label: string, oldRank: number, newRank: number}> = ({ label, oldRank, newRank }) => {
    const change = oldRank - newRank; // Positive change is good (rank number decreases)
    const changeText = change > 0 ? `▲${change}` : (change < 0 ? `▼${Math.abs(change)}` : '–');
    const changeColor = change > 0 ? 'text-green-400' : (change < 0 ? 'text-red-400' : 'text-gray-400');

    return (
        <div className="flex justify-between items-center px-2">
            <span className="text-gray-300">{label}</span>
            <div className="flex items-center space-x-4">
                <span className="font-bold">#{newRank}</span>
                <span className={`font-semibold w-12 text-right ${changeColor}`}>
                    {changeText}
                </span>
            </div>
        </div>
    );
};

export const ResultsScreen: React.FC<ResultsScreenProps> = ({ result, onContinue }) => {
  const getWeightDisplay = (participant: MatchParticipant) => {
    return `${participant.totalWeight.toFixed(2)} kg`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md text-center">
        <Card className="text-left p-4">
            <h2 className="text-xl font-bold mb-2 sticky top-0 bg-gray-800 py-1 border-b border-gray-700 -mx-4 px-4">Final Standings</h2>
            <ul>
                {result.standings.map((p, index) => (
                    <li key={p.id} className={`flex justify-between items-center px-2 rounded ${!p.isBot ? 'bg-blue-800 border border-blue-600' : ''}`}>
                        <div className="flex items-center">
                            <span className="font-bold w-8 text-center text-gray-400">{index + 1}</span>
                            <span className="ml-2 truncate font-semibold">{p.name}</span>
                        </div>
                        <span className="font-bold text-blue-400">{getWeightDisplay(p)}</span>
                    </li>
                ))}
            </ul>
        </Card>

        {result.rankChanges && (
            <Card className="mt-6 p-4 text-left">
                <h2 className="text-xl font-bold mb-2 border-b border-gray-700 py-1 -mx-4 px-4">Rank Progression</h2>
                <div>
                    <RankChangeItem 
                        label="Global Rank" 
                        oldRank={result.rankChanges.oldGlobalRank}
                        newRank={result.rankChanges.newGlobalRank}
                    />
                    <RankChangeItem 
                        label="Country Rank" 
                        oldRank={result.rankChanges.oldCountryRank}
                        newRank={result.rankChanges.newCountryRank}
                    />
                </div>
            </Card>
        )}
        
        <Card className="bg-gray-900 mt-6 mb-8 p-2">
            <h2 className="font-semibold text-lg">Rewards</h2>
            <p className="text-yellow-400 text-lg font-semibold">+{result.eurosEarned} Euro</p>
        </Card>

        <Button onClick={onContinue}>Join Another Competition</Button>
      </div>
    </div>
  );
};