
import { GoogleGenAI } from "@google/genai";
import type { Loadout, VenueCondition } from "../types";

export async function getMatchHint(playerLoadout: Loadout, condition: VenueCondition, locale: string = 'en'): Promise<string> {
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

        const response = await ai.models.generateContent({
            model: 'gemini-3-pro-preview',
            contents: `Current Venue Condition: ${condition}
Target Fish: ${playerLoadout.venueFish?.dominant}
Current Loadout:
- Rod: ${playerLoadout.rod}
- Bait: ${playerLoadout.bait}
- Groundbait: ${playerLoadout.groundbait}
- Hook: ${playerLoadout.hook}
- Feeder: ${playerLoadout.feeder}
- Feeder Tip: ${playerLoadout.feederTip}
- Distance: ${playerLoadout.castingDistance}
- Interval: ${playerLoadout.castingInterval}`,
            config: {
                systemInstruction: `You are an expert feeder fishing consultant. 
                Provide a single, short tactical hint (max 15 words) for the player.
                Respond strictly in the following language: ${locale}.
                Do not use greetings or pleasantries. Be technical and precise.`,
            },
        });

        // Use .text property as per guidelines
        return response.text || "Try changing your bait to match the target species.";
    } catch (error) {
        console.error("Error fetching match hint:", error);
        return "Focus on your casting accuracy and keep your bait fresh.";
    }
}
