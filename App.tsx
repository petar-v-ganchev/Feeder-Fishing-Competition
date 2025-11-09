import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, signOut, User as FirebaseAuthUser } from 'firebase/auth';
import { auth } from './services/firebase';
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
import { updatePlayerStats } from './services/leaderboardService';
import { getUserProfile, updateUserProfile, deleteUserAccount } from './services/userService';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [currentScreen, setCurrentScreen] = useState<Screen>(Screen.Login);
  
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

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        let userProfile = await getUserProfile(firebaseUser.uid);

        // Heuristic to detect a new user: creation time and last sign-in time are very close.
        // This helps us handle the race condition where the profile document isn't available yet.
        const creationTime = new Date(firebaseUser.metadata.creationTime || 0).getTime();
        const lastSignInTime = new Date(firebaseUser.metadata.lastSignInTime || 0).getTime();
        const isNewUser = Math.abs(creationTime - lastSignInTime) < 5000; // 5-second tolerance

        if (!userProfile && isNewUser) {
          console.log("New user detected, but profile not found. Retrying to fetch profile...");
          // Retry fetching the profile to account for Firestore replication delay.
          for (let i = 0; i < 3; i++) {
            await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1))); // 1s, 2s, 3s waits
            userProfile = await getUserProfile(firebaseUser.uid);
            if (userProfile) {
              console.log("Profile found on retry.");
              break;
            }
          }
        }
        
        if (userProfile) {
          // This is a normal login for an existing user OR a successful registration.
          setUser(userProfile);
          setCurrentScreen(Screen.MainMenu);
          fetchAndSetChallenge();
        } else {
          // Auth user exists but profile doc is missing.
          // This could happen if registration was interrupted. Signing out is the correct recovery path.
          console.error(`User ${firebaseUser.uid} is authenticated but has no profile. Forcing logout.`);
          await signOut(auth);
          sessionStorage.setItem('registrationError', 'Your profile is incomplete. Please try to register again.');
        }
      } else {
        // User is logged out.
        setUser(null);
        setCurrentScreen(Screen.Login);
      }
      setIsAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    // The onAuthStateChanged listener will handle state updates
  };

  const handleNavigate = (screen: Screen) => {
    setCurrentScreen(screen);
  };

  const handleStartMatch = (loadout: Loadout) => {
    setMatchLoadout(loadout);
    setCurrentScreen(Screen.MatchUI);
  };

  const handleMatchEnd = async (result: MatchResult) => {
    if (user) {
        const playerRank = result.standings.findIndex(p => !p.isBot) + 1;
        const isWin = playerRank === 1;
        const isTop5 = playerRank <= 5;

        // Update daily challenge progress
        if (dailyChallenge && !dailyChallenge.isCompleted) {
            let newProgress = dailyChallenge.progress;
            const { challengeType, targetCount } = dailyChallenge;

            if (challengeType === 'enter') newProgress++;
            else if (challengeType === 'win' && isWin) newProgress++;
            else if (challengeType === 'top5' && isTop5) newProgress++;
            
            if (newProgress > dailyChallenge.progress) {
                const isCompleted = newProgress >= targetCount;
                const updatedChallenge = { ...dailyChallenge, progress: newProgress, isCompleted };
                setDailyChallenge(updatedChallenge);
                const today = new Date().toDateString();
                localStorage.setItem('dailyChallenge', JSON.stringify({ date: today, challenge: updatedChallenge }));
            }
        }
        
        // --- Update stats and log match history ---
        await updatePlayerStats(user.id, isWin, playerRank, user.country, user.displayName);

        // Optimistically update local user state for immediate feedback
        const newStats = { ...user.stats };
        newStats.matchesPlayed += 1;
        if (isWin) newStats.wins += 1;

        setUser({
            ...user,
            euros: user.euros + result.eurosEarned,
            stats: newStats,
        });

        setMatchResult(result);
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
        const today = new Date().toDateString();
        localStorage.setItem('dailyChallenge', JSON.stringify({ date: today, challenge: updatedChallenge }));
    }
  };

  const handlePurchaseItem = async (itemToBuy: GameItem) => {
    if (!user) return;
    if (user.inventory.some(i => i.id === itemToBuy.id)) return alert("You already own this item.");
    if (user.euros < itemToBuy.price) return alert("You don't have enough euros.");

    const updatedUser: User = {
      ...user,
      euros: user.euros - itemToBuy.price,
      inventory: [...user.inventory, itemToBuy],
    };
    
    const { id, ...dataToUpdate } = updatedUser;
    await updateUserProfile(id, dataToUpdate, user);
    setUser(updatedUser);
    alert(`Successfully purchased ${itemToBuy.name}!`);
  };

  const handleUpdateProfile = async (updatedData: { displayName: string; email: string; avatar: string; country: string }) => {
    if (!user) return;
    try {
        await updateUserProfile(user.id, updatedData, user);
        setUser({ ...user, ...updatedData });
        alert('Profile updated successfully!');
        setCurrentScreen(Screen.Profile);
    } catch (error: any) {
        alert(`Error updating profile: ${error.message}`);
    }
  };

  const handleDeleteProfile = async () => {
    try {
      await deleteUserAccount();
      // onAuthStateChanged listener handles UI changes
      alert('Profile deleted.');
    } catch (error: any) {
      alert(`Error deleting profile: ${error.message}. You may need to log in again to perform this action.`);
    }
  };

  const renderScreen = () => {
    if (isAuthLoading) {
      return <div className="min-h-screen flex items-center justify-center"><p>Loading Game...</p></div>;
    }
    
    if (!user) {
      return <LoginScreen />;
    }
    
    // Logged-in user, render game screens
    switch (currentScreen) {
      case Screen.MainMenu:
        return <MainMenuScreen user={user} onNavigate={handleNavigate} dailyChallenge={dailyChallenge} onClaimReward={handleClaimChallengeReward} isChallengeLoading={isChallengeLoading} />;
      case Screen.Matchmaking:
        return <MatchmakingScreen onMatchFound={() => setCurrentScreen(Screen.Loadout)} />;
      case Screen.Loadout:
        return <LoadoutScreen user={user} onStartMatch={handleStartMatch} onBack={() => setCurrentScreen(Screen.MainMenu)} onNavigate={handleNavigate} />;
      case Screen.MatchUI:
        return matchLoadout && <MatchUIScreen user={user} playerLoadout={matchLoadout} onMatchEnd={handleMatchEnd} />;
      case Screen.Results:
        return matchResult && <ResultsScreen result={matchResult} onContinue={handleResultsContinue} />;
      case Screen.Profile:
        return <ProfileScreen user={user} onNavigate={handleNavigate} onLogout={handleLogout} />;
      case Screen.EditProfile:
        return <EditProfileScreen user={user} onBack={() => setCurrentScreen(Screen.Profile)} onSave={handleUpdateProfile} onDeleteAccount={handleDeleteProfile} />;
      case Screen.Inventory:
          return <InventoryScreen user={user} onBack={() => setCurrentScreen(Screen.Loadout)} />;
      case Screen.Shop:
          return <ShopScreen user={user} onBack={() => setCurrentScreen(Screen.Loadout)} onPurchase={handlePurchaseItem} />;
      case Screen.Leaderboard:
          return <LeaderboardScreen user={user} onBack={() => setCurrentScreen(Screen.MainMenu)} />;
      default:
        // Fallback for any unknown state, go to main menu or login.
        return user ? <MainMenuScreen user={user} onNavigate={handleNavigate} dailyChallenge={dailyChallenge} onClaimReward={handleClaimChallengeReward} isChallengeLoading={isChallengeLoading} /> : <LoginScreen />;
    }
  };

  return (
    <main className="container mx-auto max-w-lg min-h-screen bg-gray-900 text-white">
      {renderScreen()}
    </main>
  );
};

export default App;