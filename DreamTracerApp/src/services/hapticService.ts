import { Vibration, Platform } from 'react-native';

type HapticType = 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error';

class HapticService {
    private enabled: boolean = true;

    trigger(type: HapticType = 'light') {
        if (!this.enabled) return;

        if (Platform.OS === 'android') {
            let duration = 10;
            switch (type) {
                case 'light': duration = 10; break;
                case 'medium': duration = 30; break;
                case 'heavy': duration = 50; break;
                case 'success':
                    Vibration.vibrate([0, 30, 100, 30]); // Pattern: wait, vib, wait, vib
                    return;
                case 'warning':
                    Vibration.vibrate([0, 30, 50, 30]);
                    return;
                case 'error':
                    Vibration.vibrate([0, 50, 100, 50, 100, 50]);
                    return;
            }
            Vibration.vibrate(duration);
        } else {
            // iOS: Fallback to standard vibration without external libs
            // Note: react-native-haptic-feedback is recommended for iOS Taptic Engine
            Vibration.vibrate();
        }
    }

    setEnabled(enabled: boolean) {
        this.enabled = enabled;
    }
}

export const hapticService = new HapticService();
