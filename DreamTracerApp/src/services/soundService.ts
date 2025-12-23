import Sound from 'react-native-sound';

// Define available sound keys
export type SoundKey = 'intro' | 'click' | 'success' | 'notification' | 'error';

// Map keys to filenames (Assumes files are in android/app/src/main/res/raw)
const SOUND_FILES: Record<SoundKey, string> = {
    intro: 'intro_sound.mp3.wav',
    click: 'ui_click.wav',
    success: 'success_sparkle.wav',
    notification: 'soft_notification.wav',
    error: 'error_glass.wav',
};

class SoundService {
    private sounds: Record<SoundKey, Sound | null> = {
        intro: null,
        click: null,
        success: null,
        notification: null,
        error: null,
    };
    private isMuted: boolean = false;

    constructor() {
        Sound.setCategory('Ambient');
        // Optional: Preload specific sounds here if needed, 
        // but usually better to load on demand or in a dedicated init method
    }

    // Initialize critical sounds
    init() {
        Object.keys(SOUND_FILES).forEach((key) => {
            this.loadSound(key as SoundKey);
        });
    }

    private loadSound(key: SoundKey) {
        const filename = SOUND_FILES[key];
        const sound = new Sound(filename, Sound.MAIN_BUNDLE, (error) => {
            if (error) {
                // Console log optional, silence is better than crash
                // console.log(`failed to load sound: ${key}`, error);
                return;
            }
        });
        this.sounds[key] = sound;
    }

    play(key: SoundKey) {
        if (this.isMuted) return;

        const sound = this.sounds[key];
        if (sound) {
            if (sound.isLoaded()) {
                sound.stop(() => {
                    sound.play(); // Restart handling
                });
            } else {
                // Try to play anyway (might have loaded late)
                sound.play();
            }
        } else {
            // Try reloading and playing if not initialized
            this.loadSound(key);
        }
    }

    setMute(mute: boolean) {
        this.isMuted = mute;
    }
}

export const soundService = new SoundService();
