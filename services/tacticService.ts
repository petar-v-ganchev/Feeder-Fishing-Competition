import { Loadout } from '../types';

const ACTIVE_LOADOUT_KEY = 'ffc_active_match_loadout';

/**
 * Persists the chosen loadout/tactics for the current match session.
 */
export const saveActiveLoadout = (loadout: Loadout): void => {
  try {
    localStorage.setItem(ACTIVE_LOADOUT_KEY, JSON.stringify(loadout));
  } catch (e) {
    console.error('Failed to save active match loadout:', e);
  }
};

/**
 * Retrieves the persisted loadout/tactics for the current match session.
 */
export const loadActiveLoadout = (): Loadout | null => {
  try {
    const saved = localStorage.getItem(ACTIVE_LOADOUT_KEY);
    if (!saved) return null;
    return JSON.parse(saved) as Loadout;
  } catch (e) {
    console.error('Failed to load active match loadout:', e);
    return null;
  }
};

/**
 * Clears the active match loadout from storage.
 */
export const clearActiveLoadout = (): void => {
  localStorage.removeItem(ACTIVE_LOADOUT_KEY);
};
