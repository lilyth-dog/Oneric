/**
 * 하이브리드 저장 시스템 타입 정의
 * 로컬 저장 vs 서버 저장 분리
 */

// 플랜 타입 정의
export enum SubscriptionPlan {
  FREE = 'free',
  PLUS = 'plus',
  PREMIUM = 'premium'
}

// 플랜별 제한사항
export interface PlanLimits {
  // 커뮤니티 공유 글자 수 제한
  communityTextLimit: number;
  // 이미지 업로드 제한
  imageUploadLimit: number;
  // AI 분석 횟수 제한
  aiAnalysisLimit: number;
  // 꿈 시각화 제한
  visualizationLimit: number;
}

// 플랜별 제한사항 설정
export const PLAN_LIMITS: Record<SubscriptionPlan, PlanLimits> = {
  [SubscriptionPlan.FREE]: {
    communityTextLimit: 200,      // 무료: 200자
    imageUploadLimit: 3,          // 무료: 3개
    aiAnalysisLimit: 5,           // 무료: 월 5회
    visualizationLimit: 2,        // 무료: 월 2회
  },
  [SubscriptionPlan.PLUS]: {
    communityTextLimit: 500,      // 플러스: 500자
    imageUploadLimit: 10,         // 플러스: 10개
    aiAnalysisLimit: 20,          // 플러스: 월 20회
    visualizationLimit: 10,       // 플러스: 월 10회
  },
  [SubscriptionPlan.PREMIUM]: {
    communityTextLimit: 1000,     // 프리미엄: 1000자
    imageUploadLimit: -1,         // 프리미엄: 무제한
    aiAnalysisLimit: -1,          // 프리미엄: 무제한
    visualizationLimit: -1,       // 프리미엄: 무제한
  }
};

// 로컬 저장 데이터 (개인 기기에만 저장)
export interface LocalDreamData {
  id: string;
  user_id: string;
  dream_date: string;
  title?: string;
  body_text: string;              // 원본 텍스트 (로컬에만 저장)
  audio_file_path?: string;       // 음성 파일 (로컬에만 저장)
  lucidity_level?: number;
  emotion_tags: string[];
  dream_type?: string;
  sleep_quality?: number;
  dream_duration?: number;
  location?: string;
  characters: string[];
  symbols: string[];
  created_at: string;
  updated_at: string;
  // 로컬 전용 필드
  is_synced: boolean;             // 서버 동기화 여부
  sync_error?: string;            // 동기화 오류 메시지
}

// 서버 저장 데이터 (분석 결과, 통계, 공유 데이터)
export interface ServerDreamData {
  id: string;
  user_id: string;
  dream_date: string;
  title?: string;
  // body_text는 서버에 저장하지 않음 (프라이버시 보호)
  lucidity_level?: number;
  emotion_tags: string[];
  analysis_status: 'pending' | 'processing' | 'completed' | 'failed';
  is_shared: boolean;
  dream_type?: string;
  sleep_quality?: number;
  dream_duration?: number;
  location?: string;
  characters: string[];
  symbols: string[];
  created_at: string;
  updated_at: string;
  // 서버 전용 필드
  analysis_result?: DreamAnalysisResult;
  community_shared_text?: string; // 공유용 요약 텍스트 (글자 수 제한 적용)
  community_shared_image?: string; // 공유용 이미지
}

// 꿈 분석 결과 (서버에만 저장)
export interface DreamAnalysisResult {
  id: string;
  dream_id: string;
  summary_text: string;
  keywords: string[];
  emotional_flow_text: string;
  symbol_analysis: Record<string, any>;
  reflective_question: string;
  deja_vu_analysis?: Record<string, any>;
  created_at: string;
}

// 커뮤니티 공유 데이터
export interface CommunityPost {
  id: string;
  user_id: string;
  dream_id: string;
  shared_text: string;            // 글자 수 제한 적용된 텍스트
  shared_image?: string;          // 공유 이미지
  emotion_tags: string[];
  symbols: string[];
  is_anonymous: boolean;
  created_at: string;
  updated_at: string;
  // 커뮤니티 전용 필드
  like_count: number;
  comment_count: number;
  view_count: number;
}

// 사용자 플랜 정보
export interface UserPlan {
  plan: SubscriptionPlan;
  expires_at?: string;
  features_used: {
    community_posts: number;
    image_uploads: number;
    ai_analyses: number;
    visualizations: number;
  };
  monthly_reset_date: string;
}

// 저장 위치 구분
export enum StorageLocation {
  LOCAL_ONLY = 'local_only',      // 로컬에만 저장
  SERVER_ONLY = 'server_only',    // 서버에만 저장
  HYBRID = 'hybrid'               // 로컬 + 서버 동기화
}

// 데이터 동기화 상태
export enum SyncStatus {
  PENDING = 'pending',            // 동기화 대기
  SYNCING = 'syncing',            // 동기화 중
  SYNCED = 'synced',              // 동기화 완료
  FAILED = 'failed',              // 동기화 실패
  CONFLICT = 'conflict'           // 동기화 충돌
}
