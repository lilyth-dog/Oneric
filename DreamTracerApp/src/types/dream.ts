/**
 * 꿈 관련 타입 정의
 */

export interface Dream {
  id: string;
  user_id: string;
  dream_date: string;
  title?: string;
  body_text?: string;
  audio_file_path?: string;
  lucidity_level?: number; // 1-5
  emotion_tags: string[];
  analysis_status: 'pending' | 'processing' | 'completed' | 'failed';
  is_shared: boolean;
  dream_type?: string;
  sleep_quality?: number; // 1-5
  dream_duration?: number; // 분
  location?: string;
  characters: string[];
  symbols: string[];
  created_at: string;
  updated_at: string;
}

export interface DreamCreate {
  dream_date: string;
  title?: string;
  body_text?: string;
  audio_file_path?: string;
  lucidity_level?: number;
  emotion_tags: EmotionType[];
  is_shared: boolean;
  dream_type?: string;
  sleep_quality?: number;
  dream_duration?: number;
  location?: string;
  characters: string[];
  symbols: string[];
}

export interface DreamUpdate {
  title?: string;
  body_text?: string;
  audio_file_path?: string;
  lucidity_level?: number;
  emotion_tags?: EmotionType[];
  is_shared?: boolean;
  dream_type?: string;
  sleep_quality?: number;
  dream_duration?: number;
  location?: string;
  characters?: string[];
  symbols?: string[];
}

export enum EmotionType {
  HAPPY = 'happy',
  SAD = 'sad',
  ANGRY = 'angry',
  FEARFUL = 'fearful',
  PEACEFUL = 'peaceful',
  EXCITED = 'excited',
  CONFUSED = 'confused',
  NOSTALGIC = 'nostalgic',
  LONELY = 'lonely',
  LOVED = 'loved',
  ANXIOUS = 'anxious',
  CALM = 'calm',
}

export interface DreamListResponse {
  dreams: Dream[];
  total_count: number;
  total: number;
  page: number;
  page_size: number;
  has_next: boolean;
  has_previous: boolean;
}

export interface DreamStats {
  total_dreams: number;
  dreams_this_month: number;
  dreams_this_week: number;
  average_lucidity?: number;
  most_common_emotions: Array<{ emotion: string; count: number }>;
  most_common_symbols: Array<{ symbol: string; count: number }>;
  dream_types_distribution: Record<string, number>;
  sleep_quality_average?: number;
}

export interface AudioUploadResponse {
  audio_file_path: string;
  file_size: number;
  duration?: number;
  upload_url?: string;
}

export interface DreamAnalysis {
  id: string;
  dream_id: string;
  summary_text?: string;
  keywords?: string[];
  emotional_flow_text?: string;
  symbol_analysis?: Record<string, any>;
  reflective_question?: string;
  deja_vu_analysis?: Record<string, any>;
  created_at: string;
}

// 감정 태그 표시용
export const EMOTION_LABELS: Record<EmotionType, string> = {
  [EmotionType.HAPPY]: '행복',
  [EmotionType.SAD]: '슬픔',
  [EmotionType.ANGRY]: '화남',
  [EmotionType.FEARFUL]: '두려움',
  [EmotionType.PEACEFUL]: '평화로움',
  [EmotionType.EXCITED]: '흥분',
  [EmotionType.CONFUSED]: '혼란',
  [EmotionType.NOSTALGIC]: '그리움',
  [EmotionType.LONELY]: '외로움',
  [EmotionType.LOVED]: '사랑받음',
  [EmotionType.ANXIOUS]: '불안',
  [EmotionType.CALM]: '차분함',
};

// 꿈 타입 표시용
export const DREAM_TYPE_LABELS: Record<string, string> = {
  'lucid': '자각몽',
  'nightmare': '악몽',
  'normal': '일반 꿈',
  'recurring': '반복 꿈',
};

// 명료도 레벨 표시용
export const LUCIDITY_LABELS: Record<number, string> = {
  1: '매우 흐림',
  2: '흐림',
  3: '보통',
  4: '선명',
  5: '매우 선명',
};

// 수면 품질 표시용
export const SLEEP_QUALITY_LABELS: Record<number, string> = {
  1: '매우 나쁨',
  2: '나쁨',
  3: '보통',
  4: '좋음',
  5: '매우 좋음',
};
