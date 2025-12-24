import type { DailyChallenge } from "../types";
import { translations } from "../i18n/translations";

const STATIC_CHALLENGES: Array<{ type: DailyChallenge['challengeType'], id: string, target: number, reward: number }> = [
    { type: 'enter', id: 'ch1', target: 5, reward: 250 },
    { type: 'win', id: 'ch2', target: 1, reward: 300 },
    { type: 'top5', id: 'ch3', target: 1, reward: 200 },
    { type: 'enter', id: 'ch4', target: 3, reward: 150 },
    { type: 'win', id: 'ch5', target: 3, reward: 500 },
    { type: 'enter', id: 'ch6', target: 1, reward: 100 },
    { type: 'top5', id: 'ch7', target: 3, reward: 400 },
    { type: 'win', id: 'ch8', target: 5, reward: 1000 },
    { type: 'enter', id: 'ch9', target: 10, reward: 600 },
    { type: 'top5', id: 'ch10', target: 5, reward: 800 },
];

/**
 * Gets a deterministic challenge for the current day.
 * Cycles through 10 static challenges without repetition based on days since epoch.
 */
export async function getDailyChallenge(locale: string = 'en'): Promise<DailyChallenge> {
    // Determine the day index
    const now = new Date();
    const daysSinceEpoch = Math.floor(now.getTime() / (1000 * 60 * 60 * 24));
    const challengeIndex = daysSinceEpoch % STATIC_CHALLENGES.length;
    
    const config = STATIC_CHALLENGES[challengeIndex];
    
    // Resolve localized description
    const langDict = translations[locale] || translations['en'];
    const description = langDict[`challenge.desc.${config.id}`] || langDict[`challenge.desc.ch1`];

    return {
        challengeType: config.type,
        description: description,
        reward: config.reward,
        targetCount: config.target,
        progress: 0,
        isCompleted: false,
        isClaimed: false,
    };
}