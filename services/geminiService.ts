
import { GoogleGenAI } from "@google/genai";
import type { Loadout, VenueCondition } from "../types";

export async function getMatchHint(playerLoadout: Loadout, condition: VenueCondition): Promise<string> {
    try {
        if (!process.env.API_KEY) {
            throw new Error("API_KEY not set.");
        }

        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

        const prompt = `You are an expert fishing coach. A player is struggling in a competitive fishing match.
        
        Current Venue Condition: ${condition}
        Player's Current Loadout:
        - Rod: ${playerLoadout.rod}
        - Bait: ${playerLoadout.bait}
        - Groundbait: ${playerLoadout.groundbait}
        // Fixed: Accessing 'hook' property instead of non-existent 'hookSize'
        - Hook Size: ${playerLoadout.hook}
        // Fixed: Accessing 'feeder' property instead of non-existent 'feederType'
        - Feeder Type: ${playerLoadout.feeder}
        - Feeder Tip: ${playerLoadout.feederTip}
        - Casting Distance: ${playerLoadout.castingDistance}
        - Casting Interval: ${playerLoadout.castingInterval}

        Based on the venue condition, provide one single, short, helpful sentence (max 20 words) to help them. The tip should be a direct suggestion for a change. Do not greet the player or add any extra text.

        Example for 'Clear Water': "Try switching to a smaller hook size to avoid spooking the fish."
        Example for 'Murky Water': "A fishmeal groundbait might draw in more bites in this cloudy water."
        `;
        
        // Use gemini-3-flash-preview as recommended for Basic Text Tasks
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: prompt,
        });

        // The .text property is used correctly here.
        return response.text.trim();

    } catch (error) {
        console.error("Error fetching match hint from Gemini:", error);
        // Provide a generic fallback hint
        return "Pay attention to the conditions and try changing your bait.";
    }
}
