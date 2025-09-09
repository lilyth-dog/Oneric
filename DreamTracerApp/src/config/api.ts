/**
 * API 설정
 * Vercel에서 호스팅되는 AI 서버 연결
 */

export const API_CONFIG = {
  // Vercel 도메인 (dreamtraer.space 또는 Vercel 자동 도메인)
  baseURL: 'https://dreamtraer.space', // 또는 Vercel에서 제공하는 도메인
  timeout: 30000,
  
  // 개발용 로컬 서버 (필요시)
  localURL: 'http://localhost:8000',
  
  // API 엔드포인트들
  endpoints: {
    health: '/health',
    analyzeDream: '/api/v1/dreams/analyze',
    visualizeDream: '/api/v1/dreams/visualize',
    getModels: '/api/v1/models',
  },
  
  // 헤더 설정
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
};

// API 호출 함수
export const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  const url = `${API_CONFIG.baseURL}${endpoint}`;
  
  const response = await fetch(url, {
    ...options,
    headers: {
      ...API_CONFIG.headers,
      ...options.headers,
    },
    timeout: API_CONFIG.timeout,
  });
  
  if (!response.ok) {
    throw new Error(`API 호출 실패: ${response.status} ${response.statusText}`);
  }
  
  return response.json();
};

// 꿈 분석 API 호출
export const analyzeDream = async (dreamText: string, model: string = 'dialogpt-small') => {
  return apiCall(API_CONFIG.endpoints.analyzeDream, {
    method: 'POST',
    body: JSON.stringify({
      dream_text: dreamText,
      model: model,
    }),
  });
};

// 꿈 시각화 API 호출
export const visualizeDream = async (dreamText: string, style: string = 'dreamy_artistic') => {
  return apiCall(API_CONFIG.endpoints.visualizeDream, {
    method: 'POST',
    body: JSON.stringify({
      dream_text: dreamText,
      style: style,
    }),
  });
};

// 사용 가능한 모델 조회
export const getAvailableModels = async () => {
  return apiCall(API_CONFIG.endpoints.getModels);
};

// 서버 상태 확인
export const checkServerHealth = async () => {
  return apiCall(API_CONFIG.endpoints.health);
};
