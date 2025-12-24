import React, { useState, useEffect, useCallback } from 'react';
import { onAuthStateChanged, signOut, User as FirebaseAuthUser } from 'firebase/auth';
import { auth } from './services/firebase';
import { Screen, User, Loadout, MatchResult, DailyChallenge, GameItem } from './types';
import { LoginScreen } from './components/LoginScreen';
import { MainMenuScreen } from './components/MainMenuScreen';
import { MatchmakingScreen } from './components/MatchmakingScreen';
import { LiveMatchmakingScreen } from './components/LiveMatchmakingScreen';
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
import { type LiveParticipant } from './services/liveMatchService';
import { LanguageProvider, useTranslation } from './i18n/LanguageContext';
import { LanguageCode } from './i18n/translations';

const AppContent: React.FC = () => {
  const { locale, setLocale, t } = useTranslation();
  const [user, setUser] = useState<User | null>(null);
  const [pendingFirebaseUser, setPendingFirebaseUser] = useState<FirebaseAuthUser | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [screenStack, setScreenStack] = useState<Screen[]>([Screen.Login]);
  
  const [matchLoadout, setMatchLoadout] = useState<Loadout | null>(null);
  const [matchResult, setMatchResult] = useState<MatchResult | null>(null);
  const [dailyChallenge, setDailyChallenge] = useState<DailyChallenge | null>(null);
  const [isChallengeLoading, setIsChallengeLoading] = useState(false);
  const [infoModal, setInfoModal] = useState<{title: string, message: string} | null>(null);
  const [liveParticipants, setLiveParticipants] = useState<LiveParticipant[]>([]);

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

  const fetchAndSetChallenge = useCallback(async (currentLocale: string) => {
      const today = new Date().toDateString();
      const storedChallenge = localStorage.getItem('dailyChallenge');
      if (storedChallenge) {
          const parsed = JSON.parse(storedChallenge);
          if (parsed.date === today && parsed.locale === currentLocale) {
              setDailyChallenge(parsed.challenge);
              return;
          }
      }
      
      setIsChallengeLoading(true);
      const challenge = await getDailyChallenge(currentLocale);
      setDailyChallenge(challenge);
      localStorage.setItem('dailyChallenge', JSON.stringify({ 
        date: today, 
        challenge,
        locale: currentLocale 
      }));
      setIsChallengeLoading(false);
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userProfile = await getUserProfile(firebaseUser.uid);
        
        if (userProfile) {
          if (firebaseUser.email && userProfile.email !== firebaseUser.email) {
            await updateUserProfile(firebaseUser.uid, { email: firebaseUser.email });
            userProfile.email = firebaseUser.email;
          }

          // Persistence Fix: The user just selected a language on Login Screen.
          // This choice is in LocalStorage. We must enforce it over the old DB value.
          const activeAppLocale = localStorage.getItem('appLocale') as LanguageCode;
          
          if (activeAppLocale && userProfile.language !== activeAppLocale) {
             // User explicitly picked a new language during this session/login
             await updateUserProfile(firebaseUser.uid, { language: activeAppLocale });
             userProfile.language = activeAppLocale;
          } else if (userProfile.language && !activeAppLocale) {
             // First time on this device, use DB setting
             setLocale(userProfile.language as LanguageCode);
          }

          setUser(userProfile);
          setPendingFirebaseUser(null);
          handleResetStack(Screen.MainMenu);
          fetchAndSetChallenge(userProfile.language || 'en');
        } else {
          const creationTime = new Date(firebaseUser.metadata.creationTime || 0).getTime();
          const lastSignInTime = new Date(firebaseUser.metadata.lastSignInTime || 0).getTime();
          const isNewUser = Math.abs(creationTime - lastSignInTime) < 5000;

          if (isNewUser) {
            setPendingFirebaseUser(firebaseUser);
            handleResetStack(Screen.CreateProfile);
          } else {
            await signOut(auth);
            sessionStorage.setItem('registrationError', t('error.profile_missing'));
          }
        }
      } else {
        setUser(null);
        setPendingFirebaseUser(null);
        handleResetStack(Screen.Login);
      }
      setIsAuthLoading(false);
    });

    return () => unsubscribe();
  }, [t, fetchAndSetChallenge, setLocale]); 

  useEffect(() => {
    if (user) {
      fetchAndSetChallenge(locale);
    }
  }, [locale, user, fetchAndSetChallenge]);

  const handleLogout = async () => {
    await signOut(auth);
  };

  const handleStartMatch = (loadout: Loadout) => {
    setMatchLoadout(loadout);
    handleNavigate(Screen.MatchUI);
  };

  const handleMatchEnd = async (result: MatchResult) => {
    if (user) {
        const playerRank = result.standings.findIndex(p => p.id === user.id) + 1;
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
                localStorage.setItem('dailyChallenge', JSON.stringify({ 
                  date: today, 
                  challenge: updatedChallenge,
                  locale 
                }));
            }
        }
        
        await updatePlayerStats(user.id, isWin, playerRank, user.country, result.eurosEarned, result.isLive);

        const newStats = { ...user.stats };
        if (result.isLive) {
            newStats.matchesPlayed += 1;
            if (isWin) newStats.wins += 1;
        }

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
    setLiveParticipants([]);
    handleResetStack(Screen.MainMenu);
  };

  const handleClaimChallengeReward = () => {
    if (user && dailyChallenge && dailyChallenge.isCompleted && !dailyChallenge.isClaimed) {
        setUser(prevUser => prevUser ? ({ ...prevUser, euros: prevUser.euros + dailyChallenge.reward}) : null);
        const updatedChallenge = {...dailyChallenge, isClaimed: true};
        setDailyChallenge(updatedChallenge);
        const today = new Date().toDateString();
        localStorage.setItem('dailyChallenge', JSON.stringify({ 
          date: today, 
          challenge: updatedChallenge,
          locale 
                }));
    }
  };

  const handlePurchaseItem = async (itemToBuy: GameItem) => {
    if (!user) return;
    if (user.inventory.some(i => i.id === itemToBuy.id)) {
      setInfoModal({ title: t('shop.owned'), message: t('error.already_owned') });
      return;
    }
    if (user.euros < itemToBuy.price) {
      setInfoModal({ title: t('shop.balance'), message: t('error.insufficient_funds') });
      return;
    }

    const updatedUser: User = {
      ...user,
      euros: user.euros - itemToBuy.price,
      inventory: [...user.inventory, itemToBuy],
    };
    
    await updateUserProfile(user.id, {
        euros: updatedUser.euros,
        inventory: updatedUser.inventory
    });

    setUser(updatedUser);
    setInfoModal({ title: t('common.ok'), message: t('success.profile_updated') });
  };

  const handleUpdateProfile = async (updatedData: { displayName: string; email: string; avatar: string; country: string }) => {
    if (!user) {
        throw new Error(t('error.generic'));
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
        throw error;
    }
  };

  const handleDeleteProfile = async () => {
    try {
      await deleteUserAccount();
    } catch (error: any) {
      setInfoModal({ 
        title: t('common.error'), 
        message: error.message.includes("recent-login") ? t('error.recent_login_required') : t('error.generic')
      });
    }
  };

  const renderScreen = () => {
    if (isAuthLoading) {
      return <div className="min-h-screen flex items-center justify-center bg-gray-900"><p className="text-gray-400 font-bold">{t('app.loading')}</p></div>;
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
        return <LoginScreen />;
    }
    
    switch (currentScreen) {
      case Screen.MainMenu:
        return <MainMenuScreen user={user} onNavigate={handleNavigate} dailyChallenge={dailyChallenge} onClaimReward={handleClaimChallengeReward} isChallengeLoading={isChallengeLoading} />;
      case Screen.Matchmaking:
        return <MatchmakingScreen onMatchFound={() => handleNavigate(Screen.Loadout)} />;
      case Screen.LiveMatchmaking:
        return <LiveMatchmakingScreen user={user} onBack={handleBack} onMatchFound={(participants) => {
            setLiveParticipants(participants);
            handleNavigate(Screen.Loadout);
        }} />;
      case Screen.Loadout:
        return <LoadoutScreen user={user} onStartMatch={handleStartMatch} onBack={() => handleResetStack(Screen.MainMenu)} onNavigate={handleNavigate} />;
      case Screen.MatchUI:
        return matchLoadout && <MatchUIScreen user={user} playerLoadout={matchLoadout} onMatchEnd={handleMatchEnd} participantsOverride={liveParticipants.length > 0 ? liveParticipants : undefined} />;
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
    <main className="container mx-auto max-w-lg min-h-screen bg-gray-900 text-white shadow-2xl overflow-x-hidden">
      {renderScreen()}
      {infoModal && (
        <ConfirmationModal
          isOpen={true}
          title={infoModal.title}
          message={infoModal.message}
          onConfirm={() => setInfoModal(null)}
          confirmText={t('common.ok')}
          confirmVariant="primary"
        />
      )}
    </main>
  );
};

const App: React.FC = () => {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
};

export default App;