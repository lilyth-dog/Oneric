import Share from 'react-native-share';
import { captureRef } from 'react-native-view-shot';

class DreamSharingService {
    /**
     * Captures a view reference as an image and opens the native share dialog.
     * @param viewRef React ref of the view to capture (must be a View component)
     * @param title Title of the share dialog
     * @param message Message to share with the image
     */
    async shareDreamCard(viewRef: any, title: string = 'Share your dream', message: string = 'Check out my dream on Oneiric!') {
        try {
            const uri = await captureRef(viewRef, {
                format: 'png',
                quality: 0.9,
                result: 'tmpfile'
            });

            const shareOptions = {
                title: title,
                message: message,
                url: uri,
                type: 'image/png',
            };

            await Share.open(shareOptions);
            return true;
        } catch (error) {
            console.error('Error sharing dream card:', error);
            // User might have cancelled (error.message === 'User did not share')
            return false;
        }
    }
}

export const dreamSharingService = new DreamSharingService();
