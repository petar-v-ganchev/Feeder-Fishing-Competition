
import { GoogleGenAI, Type } from "@google/genai";
import type { DailyChallenge } from "../types";

const MOCK_CHALLENGES: DailyChallenge[] = [
    {
        challengeType: 'win',
        description: "Win a match.",
        reward: 200,
        targetCount: 1,
        progress: 0,
        isCompleted: false,
        isClaimed: false,
    },
    {
        challengeType: 'enter',
        description: "Enter 3 matches.",
        reward: 150,
        targetCount: 3,
        progress: 0,
        isCompleted: false,
        isClaimed: false,
    },
];

const challengeSchema = {
  type: Type.OBJECT,
  properties: {
    challengeType: {
      type: Type.STRING,
      description: "The type of challenge. Must be one of: 'enter', 'win', 'top5'.",
    },
    description: {
      type: Type.STRING,
      description: 'A short, specific, and creative fishing challenge related to match performance. For example: "Enter 3 matches", "Win a match", or "Place in the top 5 in a match".',
    },
    reward: {
      type: Type.INTEGER,
      description: 'A fair coin reward for the challenge based on its difficulty, between 100 and 500.',
    },
     target: {
      type: Type.INTEGER,
      description: 'The number of actions required. For "Enter 3 matches", this is 3. For "Win a match", this is 1.',
    }
  },
  required: ['challengeType', 'description', 'reward', 'target'],
};


export async function getDailyChallenge(): Promise<DailyChallenge> {
  try {
    if (!process.env.API_KEY) {
      throw new Error("API_KEY not set.");
    }

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: "Generate a single, unique, and creative daily challenge for a feeder fishing game. The challenge must be about either entering a number of matches, winning a number of matches, or placing in the top 5 of a match. It should be a simple cumulative task, not 'in a row'. Provide the challenge type ('enter', 'win', 'top5'), a descriptive sentence, a fair coin reward, and a target count.",
      config: {
        responseMimeType: "application/json",
        responseSchema: challengeSchema,
      },
    });
    
    const jsonString = response.text;
    const parsed = JSON.parse(jsonString);

    return {
        challengeType: parsed.challengeType as DailyChallenge['challengeType'],
        description: parsed.description,
        reward: parsed.reward,
        targetCount: parsed.target,
        progress: 0,
        isCompleted: false,
        isClaimed: false,
    };

  } catch (error) {
    console.warn("Error fetching daily challenge from Gemini, using mock challenge:", error);
    // Return a random mock challenge as a fallback
    return MOCK_CHALLENGES[Math.floor(Math.random() * MOCK_CHALLENGES.length)];
  }
}