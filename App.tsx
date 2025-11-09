

import React, { useState, useEffect } from 'react';
import { Screen, User, Loadout, MatchResult, DailyChallenge, GameItem } from './types';
import { LoginScreen } from './components/LoginScreen';
import { MainMenuScreen } from './components/MainMenuScreen';
import { MatchmakingScreen } from './components/MatchmakingScreen';
import { LoadoutScreen } from './components/LoadoutScreen';
import { MatchUIScreen } from './components/MatchUIScreen';
import { ResultsScreen } from './components/ResultsScreen';
import { ProfileScreen } from './components/ProfileScreen';
import { InventoryScreen } from './components/InventoryScreen';
import { ShopScreen } from './components/ShopScreen';
import { LeaderboardScreen } from './components/LeaderboardScreen';
import { EditProfileScreen } from './components/EditProfileScreen';
import { getDailyChallenge } from './services/dailyChallengeService';


const App: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>(Screen.Login);
  const [user, setUser] = useState<User | null>(null);
  const [matchLoadout, setMatchLoadout] = useState<Loadout | null>(null);
  const [matchResult, setMatchResult] = useState<MatchResult | null>(null);
  const [dailyChallenge, setDailyChallenge] = useState<DailyChallenge | null>(null);
  const [isChallengeLoading, setIsChallengeLoading] = useState(false);

  const fetchAndSetChallenge = async () => {
      const today = new Date().toDateString();
      const storedChallenge = localStorage.getItem('dailyChallenge');
      if (storedChallenge) {
          const parsed = JSON.parse(storedChallenge);
          if (parsed.date === today) {
              setDailyChallenge(parsed.challenge);
              return;
          }
      }
      
      setIsChallengeLoading(true);
      const challenge = await getDailyChallenge();
      setDailyChallenge(challenge);
      localStorage.setItem('dailyChallenge', JSON.stringify({ date: today, challenge }));
      setIsChallengeLoading(false);
  };


  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser);
    fetchAndSetChallenge();
    setCurrentScreen(Screen.MainMenu);
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentScreen(Screen.Login);
  };

  const handleNavigate = (screen: Screen) => {
    setCurrentScreen(screen);
  };

  const handleStartMatchmaking = () => {
    setCurrentScreen(Screen.Matchmaking);
  };

  const handleMatchFound = () => {
    setCurrentScreen(Screen.Loadout);
  };

  const handleStartMatch = (loadout: Loadout) => {
    setMatchLoadout(loadout);
    setCurrentScreen(Screen.MatchUI);
  };

  const handleMatchEnd = (result: MatchResult) => {
    if (user) {
        const playerRank = result.standings.findIndex(p => !p.isBot) + 1;
        const isWin = playerRank === 1;
        const isTop5 = playerRank <= 5;

        // Update daily challenge progress
        if (dailyChallenge && !dailyChallenge.isCompleted) {
            let newProgress = dailyChallenge.progress;
            const { challengeType, targetCount } = dailyChallenge;

            if (challengeType === 'enter') {
                newProgress += 1;
            } else if (challengeType === 'win' && isWin) {
                newProgress += 1;
            } else if (challengeType === 'top5' && isTop5) {
                newProgress += 1;
            }
            
            if (newProgress > dailyChallenge.progress) {
                const isCompleted = newProgress >= targetCount;
                const updatedChallenge = { ...dailyChallenge, progress: newProgress, isCompleted };
                
                setDailyChallenge(updatedChallenge);

                // Update localStorage
                const today = new Date().toDateString();
                localStorage.setItem('dailyChallenge', JSON.stringify({ date: today, challenge: updatedChallenge }));
            }
        }
        
        const oldStats = { ...user.stats };
        const newStats = { ...user.stats };
        newStats.matchesPlayed += 1;
        if (isWin) {
            newStats.wins += 1;
            // Simulate rank improvement on win
            newStats.globalRank = Math.max(1, newStats.globalRank - Math.floor(Math.random() * 3 + 1)); // Improve by 1-3
            newStats.countryRank = Math.max(1, newStats.countryRank - Math.floor(Math.random() * 2 + 1)); // Improve by 1-2
        } else if (playerRank > 5) { // If player did poorly (outside top 5), rank might drop
             newStats.globalRank = newStats.globalRank + Math.floor(Math.random() * 3); // drop by 0-2
             newStats.countryRank = newStats.countryRank + Math.floor(Math.random() * 2); // drop by 0-1
        }
        // If not a win but in top 5, rank stays same (for simplicity)

        const rankChanges = {
            oldGlobalRank: oldStats.globalRank,
            newGlobalRank: newStats.globalRank,
            oldCountryRank: oldStats.countryRank,
            newCountryRank: newStats.countryRank,
        };

        setUser({
            ...user,
            euros: user.euros + result.eurosEarned,
            stats: newStats,
        });

        const finalResult = { ...result, rankChanges };
        setMatchResult(finalResult);
        setCurrentScreen(Screen.Results);
    }
  };

  const handleResultsContinue = () => {
    setMatchResult(null);
    setMatchLoadout(null);
    setCurrentScreen(Screen.MainMenu);
  };

  const handleClaimChallengeReward = () => {
    if (user && dailyChallenge && dailyChallenge.isCompleted && !dailyChallenge.isClaimed) {
        setUser(prevUser => prevUser ? ({ ...prevUser, euros: prevUser.euros + dailyChallenge.reward}) : null);
        
        const updatedChallenge = {...dailyChallenge, isClaimed: true};
        setDailyChallenge(updatedChallenge);

        // Update localStorage
        const today = new Date().toDateString();
        localStorage.setItem('dailyChallenge', JSON.stringify({ date: today, challenge: updatedChallenge }));
    }
  };

  const handlePurchaseItem = (itemToBuy: GameItem) => {
    if (!user) return;

    if (user.inventory.some(i => i.id === itemToBuy.id)) {
      alert("You already own this item.");
      return;
    }

    if (user.euros < itemToBuy.price) {
      alert("You don't have enough euros to purchase this item.");
      return;
    }

    const updatedUser: User = {
      ...user,
      euros: user.euros - itemToBuy.price,
      inventory: [...user.inventory, itemToBuy],
    };

    setUser(updatedUser);
    alert(`Successfully purchased ${itemToBuy.name}!`);
  };

  const handleUpdateProfile = (updatedData: { displayName: string; email: string; avatar: string; country: string }) => {
    if (!user) return;
    setUser({ ...user, ...updatedData });
    alert('Profile updated successfully!');
    setCurrentScreen(Screen.Profile);
  };

  const handleDeleteProfile = () => {
    handleLogout();
    alert('Profile deleted.');
  };

  const renderScreen = () => {
    if (!user) {
      return <LoginScreen onLogin={handleLogin} />;
    }

    switch (currentScreen) {
      case Screen.MainMenu:
        return <MainMenuScreen user={user} onNavigate={handleNavigate} dailyChallenge={dailyChallenge} onClaimReward={handleClaimChallengeReward} isChallengeLoading={isChallengeLoading} />;
      case Screen.Matchmaking:
        return <MatchmakingScreen onMatchFound={handleMatchFound} />;
      case Screen.Loadout:
        return <LoadoutScreen user={user} onStartMatch={handleStartMatch} onBack={() => setCurrentScreen(Screen.MainMenu)} />;
      case Screen.MatchUI:
        return matchLoadout && <MatchUIScreen user={user} playerLoadout={matchLoadout} onMatchEnd={handleMatchEnd} />;
      case Screen.Results:
        return matchResult && <ResultsScreen result={matchResult} onContinue={handleResultsContinue} />;
      case Screen.Profile:
        return <ProfileScreen user={user} onNavigate={handleNavigate} onLogout={handleLogout} />;
      case Screen.EditProfile:
        return <EditProfileScreen user={user} onBack={() => setCurrentScreen(Screen.Profile)} onSave={handleUpdateProfile} onDeleteAccount={handleDeleteProfile} />;
      case Screen.Inventory:
          return <InventoryScreen user={user} onBack={() => setCurrentScreen(Screen.MainMenu)} />;
      case Screen.Shop:
          return <ShopScreen user={user} onBack={() => setCurrentScreen(Screen.MainMenu)} onPurchase={handlePurchaseItem} />;
      case Screen.Leaderboard:
          return <LeaderboardScreen onBack={() => setCurrentScreen(Screen.MainMenu)} />;
      default:
        return <MainMenuScreen user={user} onNavigate={handleNavigate} dailyChallenge={dailyChallenge} onClaimReward={handleClaimChallengeReward} isChallengeLoading={isChallengeLoading} />;
    }
  };

  return (
    <main className="container mx-auto max-w-lg min-h-screen bg-gray-900 text-white">
      {renderScreen()}
    </main>
  );
};

export default App;