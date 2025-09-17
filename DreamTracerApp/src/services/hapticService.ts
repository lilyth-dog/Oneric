/**
 * 햅틱 피드백 서비스
 * "고요한 탐험" 컨셉에 맞는 미세한 진동 피드백 제공
 */
import { Haptics } from 'expo-haptics';

export enum HapticType {
  LIGHT = 'light',
  MEDIUM = 'medium',
  HEAVY = 'heavy',
  SUCCESS = 'success',
  WARNING = 'warning',
  ERROR = 'error',
}

class HapticService {
  /**
   * 햅틱 피드백 실행
   */
  async trigger(type: HapticType): Promise<void> {
    try {
      switch (type) {
        case HapticType.LIGHT:
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          break;
        case HapticType.MEDIUM:
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          break;
        case HapticType.HEAVY:
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          break;
        case HapticType.SUCCESS:
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          break;
        case HapticType.WARNING:
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          break;
        case HapticType.ERROR:
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          break;
        default:
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    } catch (error) {
      console.warn('Haptic feedback not available:', error);
    }
  }

  /**
   * 버튼 클릭 시 가벼운 햅틱
   */
  async buttonPress(): Promise<void> {
    await this.trigger(HapticType.LIGHT);
  }

  /**
   * 꿈 저장 완료 시 성공 햅틱
   */
  async dreamSaved(): Promise<void> {
    await this.trigger(HapticType.SUCCESS);
  }

  /**
   * 분석 완료 시 중간 햅틱
   */
  async analysisComplete(): Promise<void> {
    await this.trigger(HapticType.MEDIUM);
  }

  /**
   * 오류 발생 시 경고 햅틱
   */
  async error(): Promise<void> {
    await this.trigger(HapticType.ERROR);
  }
}

const hapticService = new HapticService();
export default hapticService;