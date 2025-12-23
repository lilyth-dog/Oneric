/**
 * Application Configuration
 * Centralizes environment-specific settings
 */
import { Platform } from 'react-native';

// Android Emulator: 10.0.2.2 usually maps to host localhost
// iOS Simulator: localhost is host localhost
// Physical Device: Requires real IP address of host
const LOCALHOST = Platform.OS === 'android' ? '10.0.2.2' : 'localhost';

export const Config = {
    // Base URL for Backend API
    API_BASE_URL: __DEV__
        ? `http://${LOCALHOST}:8000/api/v1`
        : 'https://api.dreamtracer.app/api/v1', // Production URL (Placeholder)

    // Timeouts
    TIMEOUT: 10000,
};

export default Config;
