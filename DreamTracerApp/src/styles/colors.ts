/**
 * DreamTracer (꿈결) Color Palette
 * Based on the "Premium Mystic" design system.
 */

export const Colors = {
    // Primary Backgrounds
    background: '#191D2E',      // Night Sky Blue
    surface: '#2D2D44',         // Deep Space Purple
    surfaceLight: '#4A4063',    // Dawn Purple

    // Accents
    primary: '#FFDDA8',        // Starlight Gold
    secondary: '#A78BFA',      // Mystic Purple
    accent: '#FF7E5F',         // Sunset Coral (Emotional intensity)

    // Status
    success: '#4ADE80',
    error: '#FB7185',
    warning: '#FBBF24',
    info: '#60A5FA',

    // Text
    textPrimary: '#EAE8F0',    // Warm Grey 100
    textSecondary: '#8F8C9B',  // Warm Grey 400
    textMuted: '#595566',      // Warm Grey 600
    textInverse: '#191D2E',    // Night Sky Blue (for use on Gold)

    // Decorative
    border: 'rgba(255, 255, 255, 0.1)',
    borderLight: 'rgba(255, 221, 168, 0.15)',
    glass: 'rgba(255, 255, 255, 0.05)',
    glow: 'rgba(167, 139, 250, 0.3)',
} as const;

export default Colors;
