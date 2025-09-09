/**
 * 프리미엄 구독 서비스
 * 서버비를 해결하기 위한 수익 모델
 */

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  period: 'monthly' | 'yearly';
  features: string[];
  popular?: boolean;
}

export interface PremiumFeatures {
  unlimitedAnalysis: boolean;
  advancedVisualization: boolean;
  dreamJournalExport: boolean;
  prioritySupport: boolean;
  adFree: boolean;
  customThemes: boolean;
  cloudSync: boolean;
}

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'free',
    name: '무료',
    price: 0,
    period: 'monthly',
    features: [
      '월 10회 꿈 분석',
      '기본 시각화',
      '꿈 일기 작성',
      '커뮤니티 참여'
    ]
  },
  {
    id: 'premium_monthly',
    name: '프리미엄',
    price: 2900,
    period: 'monthly',
    features: [
      '무제한 꿈 분석',
      '고급 시각화',
      '꿈 일기 내보내기',
      '우선 지원',
      '광고 없음',
      '커스텀 테마',
      '클라우드 동기화'
    ],
    popular: true
  },
  {
    id: 'premium_yearly',
    name: '프리미엄 연간',
    price: 29000,
    period: 'yearly',
    features: [
      '무제한 꿈 분석',
      '고급 시각화',
      '꿈 일기 내보내기',
      '우선 지원',
      '광고 없음',
      '커스텀 테마',
      '클라우드 동기화',
      '2개월 무료'
    ]
  }
];

export class SubscriptionService {
  private static instance: SubscriptionService;
  private currentPlan: string = 'free';
  private premiumFeatures: PremiumFeatures = {
    unlimitedAnalysis: false,
    advancedVisualization: false,
    dreamJournalExport: false,
    prioritySupport: false,
    adFree: false,
    customThemes: false,
    cloudSync: false
  };

  static getInstance(): SubscriptionService {
    if (!SubscriptionService.instance) {
      SubscriptionService.instance = new SubscriptionService();
    }
    return SubscriptionService.instance;
  }

  /**
   * 현재 구독 플랜 확인
   */
  getCurrentPlan(): string {
    return this.currentPlan;
  }

  /**
   * 프리미엄 기능 사용 가능 여부 확인
   */
  hasFeature(feature: keyof PremiumFeatures): boolean {
    return this.premiumFeatures[feature];
  }

  /**
   * 구독 플랜 업그레이드
   */
  async upgradePlan(planId: string): Promise<boolean> {
    try {
      // 실제 결제 처리 로직
      const plan = SUBSCRIPTION_PLANS.find(p => p.id === planId);
      if (!plan) {
        throw new Error('존재하지 않는 플랜입니다');
      }

      // 결제 처리 (실제 구현에서는 결제 API 연동)
      const paymentSuccess = await this.processPayment(plan);
      
      if (paymentSuccess) {
        this.currentPlan = planId;
        this.updatePremiumFeatures(planId);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('구독 업그레이드 실패:', error);
      return false;
    }
  }

  /**
   * 구독 취소
   */
  async cancelSubscription(): Promise<boolean> {
    try {
      // 구독 취소 처리
      this.currentPlan = 'free';
      this.updatePremiumFeatures('free');
      return true;
    } catch (error) {
      console.error('구독 취소 실패:', error);
      return false;
    }
  }

  /**
   * 결제 처리 (시뮬레이션)
   */
  private async processPayment(plan: SubscriptionPlan): Promise<boolean> {
    // 실제 구현에서는 결제 API 연동
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(true); // 시뮬레이션: 항상 성공
      }, 1000);
    });
  }

  /**
   * 프리미엄 기능 업데이트
   */
  private updatePremiumFeatures(planId: string): void {
    if (planId === 'free') {
      this.premiumFeatures = {
        unlimitedAnalysis: false,
        advancedVisualization: false,
        dreamJournalExport: false,
        prioritySupport: false,
        adFree: false,
        customThemes: false,
        cloudSync: false
      };
    } else {
      this.premiumFeatures = {
        unlimitedAnalysis: true,
        advancedVisualization: true,
        dreamJournalExport: true,
        prioritySupport: true,
        adFree: true,
        customThemes: true,
        cloudSync: true
      };
    }
  }

  /**
   * 사용량 확인 (무료 플랜용)
   */
  async checkUsage(): Promise<{ used: number; limit: number }> {
    // 실제 구현에서는 서버에서 사용량 조회
    return {
      used: 3, // 현재 사용량
      limit: 10 // 무료 플랜 제한
    };
  }

  /**
   * 수익 통계 (관리자용)
   */
  async getRevenueStats(): Promise<{
    monthlyRevenue: number;
    subscriberCount: number;
    conversionRate: number;
  }> {
    // 실제 구현에서는 서버에서 통계 조회
    return {
      monthlyRevenue: 5800000, // 월 수익 (원)
      subscriberCount: 2000,   // 구독자 수
      conversionRate: 2.0      // 전환율 (%)
    };
  }
}
