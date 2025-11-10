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
import { CreateProfileScreen } from './components/CreateProfileScreen';
import { getDailyChallenge } from './services/dailyChallengeService';
import { updatePlayerStats } from './services/leaderboardService';
import { getUserProfile, updateUserProfile, deleteUserAccount, updateUserEmail } from './services/userService';
import { ConfirmationModal } from './components/common/ConfirmationModal';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [pendingFirebaseUser, setPendingFirebaseUser] = useState<FirebaseAuthUser | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [screenStack, setScreenStack] = useState<Screen[]>([Screen.Login]);
  
  const [matchLoadout, setMatchLoadout] = useState<Loadout | null>(null);
  const [matchResult, setMatchResult] = useState<MatchResult | null>(null);
  const [dailyChallenge, setDailyChallenge] = useState<DailyChallenge | null>(null);
  const [isChallengeLoading, setIsChallengeLoading] = useState(false);
  const [infoModal, setInfoModal] = useState<{title: string, message: string} | null>(null);

  const currentScreen = screenStack[screenStack.length - 1];
  
  const handleNavigate = (screen: Screen) => {
    setScreenStack(prev => [...prev, screen]);
  };

  const handleBack = () => {
    if (screenStack.length > 1) {
      setScreenStack(prev => prev.slice(0, -1));
    }
  };
  
  const handleReplaceScreen = (screen: Screen) => {
    setScreenStack(prev => [...prev.slice(0, -1), screen]);
  };

  const handleResetStack = (screen: Screen) => {
    setScreenStack([screen]);
  };

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
        const userProfile = await getUserProfile(firebaseUser.uid);
        
        if (userProfile) {
          // Sync email from Auth to Firestore if they differ. This handles verified email changes.
          if (firebaseUser.email && userProfile.email !== firebaseUser.email) {
            console.log("Email mismatch detected. Syncing from Auth to Firestore.");
            await updateUserProfile(firebaseUser.uid, { email: firebaseUser.email });
            userProfile.email = firebaseUser.email;
          }

          setUser(userProfile);
          setPendingFirebaseUser(null);
          handleResetStack(Screen.MainMenu);
          fetchAndSetChallenge();
        } else {
          // Auth user exists but profile doc is missing.
          const creationTime = new Date(firebaseUser.metadata.creationTime || 0).getTime();
          const lastSignInTime = new Date(firebaseUser.metadata.lastSignInTime || 0).getTime();
          const isNewUser = Math.abs(creationTime - lastSignInTime) < 5000;

          if (isNewUser) {
            // This is a new user who needs to create their profile.
            setPendingFirebaseUser(firebaseUser);
            handleResetStack(Screen.CreateProfile);
          } else {
            // This is an established user whose profile is genuinely missing. This is an error state.
            console.error(`User ${firebaseUser.uid} is authenticated but has no profile. Forcing logout.`);
            await signOut(auth);
            sessionStorage.setItem('registrationError', 'Your user profile could not be found. Please contact support.');
          }
        }
      } else {
        // User is logged out.
        setUser(null);
        setPendingFirebaseUser(null);
        handleResetStack(Screen.Login);
      }
      setIsAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    if (user?.email) {
      localStorage.setItem('rememberedEmail', user.email);
    }
    await signOut(auth);
  };

  const handleStartMatch = (loadout: Loadout) => {
    setMatchLoadout(loadout);
    handleNavigate(Screen.MatchUI);
  };

  const handleMatchEnd = async (result: MatchResult) => {
    if (user) {
        const playerRank = result.standings.findIndex(p => !p.isBot) + 1;
        const isWin = playerRank === 1;
        const isTop5 = playerRank <= 5;

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
        
        await updatePlayerStats(user.id, isWin, playerRank, user.country);

        const newStats = { ...user.stats };
        newStats.matchesPlayed += 1;
        if (isWin) newStats.wins += 1;

        setUser({
            ...user,
            euros: user.euros + result.eurosEarned,
            stats: newStats,
        });

        setMatchResult(result);
        handleReplaceScreen(Screen.Results);
    }
  };

  const handleResultsContinue = () => {
    setMatchResult(null);
    setMatchLoadout(null);
    handleResetStack(Screen.MainMenu);
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
    if (user.inventory.some(i => i.id === itemToBuy.id)) {
      setInfoModal({ title: "Already Owned", message: "You already own this item." });
      return;
    }
    if (user.euros < itemToBuy.price) {
      setInfoModal({ title: "Insufficient Funds", message: "You don't have enough euros to purchase this." });
      return;
    }

    const updatedUser: User = {
      ...user,
      euros: user.euros - itemToBuy.price,
      inventory: [...user.inventory, itemToBuy],
    };
    
    const { id, ...dataToUpdate } = updatedUser;
    await updateUserProfile(id, dataToUpdate);
    setUser(updatedUser);
    setInfoModal({ title: "Purchase Successful", message: `Successfully purchased ${itemToBuy.name}!` });
  };

  const handleUpdateProfile = async (updatedData: { displayName: string; email: string; avatar: string; country: string }): Promise<{ emailChanged: boolean }> => {
    if (!user) {
        throw new Error("User not found.");
    }
    try {
        const hasEmailChanged = updatedData.email.toLowerCase() !== user.email.toLowerCase();

        const profileDataToUpdate: Partial<User> = {
            displayName: updatedData.displayName,
            avatar: updatedData.avatar,
            country: updatedData.country,
        };

        await updateUserProfile(user.id, profileDataToUpdate);

        if (hasEmailChanged) {
            await updateUserEmail(updatedData.email);
        }
        
        setUser(prev => prev ? { ...prev, ...profileDataToUpdate } : null);
        
        return { emailChanged: hasEmailChanged };
    } catch (error: any) {
        console.error("Error updating profile in App.tsx:", error);
        // Robustly get the error message, whether it's from an Error object or a raw string.
        const errorMessage = error?.message || error;
        throw new Error(errorMessage || 'An unexpected error occurred.');
    }
  };

  const handleDeleteProfile = async () => {
    try {
      await deleteUserAccount();
      alert('Profile deleted.');
    } catch (error: any) {
      setInfoModal({ 
        title: "Deletion Error", 
        message: `Error deleting profile: ${error.message}. You may need to log in again to perform this action.`
      });
    }
  };

  const renderScreen = () => {
    if (isAuthLoading) {
      return <div className="min-h-screen flex items-center justify-center"><p>Loading Game...</p></div>;
    }
    
    if (currentScreen === Screen.Login) {
      return <LoginScreen />;
    }

    if (currentScreen === Screen.CreateProfile && pendingFirebaseUser) {
      return <CreateProfileScreen firebaseUser={pendingFirebaseUser} onProfileCreated={(newUser) => {
          setUser(newUser);
          setPendingFirebaseUser(null);
          handleResetStack(Screen.MainMenu);
      }} />;
    }
    
    if (!user) {
        // If we are not loading, not on Login/CreateProfile, and have no user, something is wrong. Default to Login.
        return <LoginScreen />;
    }
    
    switch (currentScreen) {
      case Screen.MainMenu:
        return <MainMenuScreen user={user} onNavigate={handleNavigate} dailyChallenge={dailyChallenge} onClaimReward={handleClaimChallengeReward} isChallengeLoading={isChallengeLoading} />;
      case Screen.Matchmaking:
        return <MatchmakingScreen onMatchFound={() => handleNavigate(Screen.Loadout)} />;
      case Screen.Loadout:
        return <LoadoutScreen user={user} onStartMatch={handleStartMatch} onBack={() => handleResetStack(Screen.MainMenu)} onNavigate={handleNavigate} />;
      case Screen.MatchUI:
        return matchLoadout && <MatchUIScreen user={user} playerLoadout={matchLoadout} onMatchEnd={handleMatchEnd} />;
      case Screen.Results:
        return matchResult && <ResultsScreen result={matchResult} onContinue={handleResultsContinue} />;
      case Screen.Profile:
        return <ProfileScreen user={user} onNavigate={handleNavigate} onLogout={handleLogout} onBack={handleBack} />;
      case Screen.EditProfile:
        return <EditProfileScreen user={user} onBack={handleBack} onSave={handleUpdateProfile} onDeleteAccount={handleDeleteProfile} />;
      case Screen.Inventory:
          return <InventoryScreen user={user} onBack={handleBack} />;
      case Screen.Shop:
          return <ShopScreen user={user} onBack={handleBack} onPurchase={handlePurchaseItem} />;
      case Screen.Leaderboard:
          return <LeaderboardScreen user={user} onBack={handleBack} />;
      default:
        return <LoginScreen />;
    }
  };

  return (
    <main className="container mx-auto max-w-lg min-h-screen bg-gray-900 text-white">
      {renderScreen()}
      {infoModal && (
        <ConfirmationModal
          isOpen={true}
          title={infoModal.title}
          message={infoModal.message}
          onConfirm={() => setInfoModal(null)}
          confirmText="OK"
          confirmVariant="primary"
        />
      )}
    </main>
  );
};

export default App;