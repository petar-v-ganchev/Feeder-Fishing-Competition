
/**
 * HapticService provides an abstraction for the Browser Vibration API.
 * Mimics native Taptic Engine behavior.
 */
export const HapticService = {
    /**
     * Light impact, similar to a soft UI click.
     */
    light: () => {
        if ('vibrate' in navigator) {
            navigator.vibrate(10);
        }
    },

    /**
     * Medium impact, used for standard interactions or selections.
     */
    medium: () => {
        if ('vibrate' in navigator) {
            navigator.vibrate(25);
        }
    },

    /**
     * Heavy impact, used for fish bites or errors.
     */
    heavy: () => {
        if ('vibrate' in navigator) {
            navigator.vibrate(50);
        }
    },

    /**
     * Notification pattern for success.
     */
    success: () => {
        if ('vibrate' in navigator) {
            navigator.vibrate([20, 30, 20]);
        }
    },

    /**
     * Error pattern.
     */
    error: () => {
        if ('vibrate' in navigator) {
            navigator.vibrate([50, 50, 50]);
        }
    }
};
