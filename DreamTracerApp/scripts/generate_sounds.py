import wave
import math
import struct
import os

def generate_tone(frequency, duration, volume=0.5, rate=44100):
    n_samples = int(rate * duration)
    data = []
    for i in range(n_samples):
        # Sine wave
        value = math.sin(2 * math.pi * frequency * i / rate)
        # Apply envelope (Fade In/Out) to avoid clicking
        envelope = 1.0
        if i < 500: envelope = i / 500
        if i > n_samples - 500: envelope = (n_samples - i) / 500
        
        packed_value = int(value * volume * envelope * 32767)
        data.append(struct.pack('h', packed_value))
    return b''.join(data)

def generate_chord(freqs, duration, volume=0.3, rate=44100):
    n_samples = int(rate * duration)
    data = []
    for i in range(n_samples):
        value = 0
        for f in freqs:
            value += math.sin(2 * math.pi * f * i / rate)
        value = value / len(freqs) # Normalize
        
        # Envelope
        envelope = 1.0
        if i < 1000: envelope = i / 1000
        if i > n_samples - 2000: envelope = (n_samples - i) / 2000
        
        packed_value = int(value * volume * envelope * 32767)
        data.append(struct.pack('h', packed_value))
    return b''.join(data)

def save_wav(filename, data, rate=44100):
    with wave.open(filename, 'w') as f:
        f.setnchannels(1)
        f.setsampwidth(2)
        f.setframerate(rate)
        f.writeframes(data)

# Directory
TARGET_DIR = 'android/app/src/main/res/raw'
if not os.path.exists(TARGET_DIR):
    os.makedirs(TARGET_DIR)

# 1. Intro Sound (Dreamy Chord: Cmaj7)
# C4 (261.63), E4 (329.63), G4 (392.00), B4 (493.88)
intro_data = generate_chord([261.63, 329.63, 392.00, 493.88], 2.0, 0.4)
save_wav(os.path.join(TARGET_DIR, 'intro_sound.mp3.wav'), intro_data) 
# Note: Adding .wav extension, SoundService expects filename map. 
# Android raw resources ignore extension in ID, but SoundService uses string name. 
# react-native-sound might need explicit extension?
# If I request 'intro_sound.mp3', it looks for that. 
# I should update SoundService to use .wav if providing generated files.

# 2. Click (High short blip)
click_data = generate_tone(800, 0.05, 0.2)
save_wav(os.path.join(TARGET_DIR, 'ui_click.wav'), click_data)

# 3. Success (Major Triad Arpeggio: C-E-G)
# Can't easily do sequence in this simple function without concat.
# Let's just do a high chord.
success_data = generate_chord([523.25, 659.25, 783.99], 0.6, 0.4)
save_wav(os.path.join(TARGET_DIR, 'success_sparkle.wav'), success_data)

# 4. Notification (Soft Bell: A4)
notif_data = generate_tone(440.00, 0.4, 0.4)
save_wav(os.path.join(TARGET_DIR, 'soft_notification.wav'), notif_data)

# 5. Error (Low Dissonant)
error_data = generate_chord([100, 105], 0.4, 0.4)
save_wav(os.path.join(TARGET_DIR, 'error_glass.wav'), error_data)

print("Generated dummy sounds in", TARGET_DIR)
