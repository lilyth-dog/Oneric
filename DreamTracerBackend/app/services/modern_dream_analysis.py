"""
현대적 다학제적 꿈 분석 시스템
프로이트의 한계를 극복하고 현대 꿈 과학 기반의 분석 제공
"""
from sqlalchemy.orm import Session
from typing import Dict, List, Any, Optional
import logging
from datetime import datetime
import re

logger = logging.getLogger(__name__)

class CognitiveAnalyzer:
    """인지적 분석기 - 꿈의 인지적 측면 분석"""
    
    def __init__(self):
        self.keywords = {
            'problem_solving': ['해결', '찾다', '방법', '해답', '풀다', '고민'],
            'memory_processing': ['기억', '과거', '어릴때', '예전', '옛날', '기억나다'],
            'creativity': ['새로운', '다른', '특별한', '이상한', '신기한', '창의적'],
            'planning': ['계획', '준비', '미래', '다음', '앞으로', '준비하다'],
            'decision_making': ['선택', '결정', '고르다', '어떻게', '어느것'],
            'learning': ['배우다', '알다', '이해하다', '깨닫다', '학습']
        }
    
    def analyze(self, dream_text: str, user_profile: Dict[str, Any]) -> Dict[str, Any]:
        """꿈 텍스트의 인지적 측면 분석"""
        analysis = {
            'cognitive_functions': [],
            'processing_type': 'unknown',
            'insights': [],
            'confidence': 0.0
        }
        
        # 키워드 기반 분석
        found_functions = []
        for function, keywords in self.keywords.items():
            if any(keyword in dream_text for keyword in keywords):
                found_functions.append(function)
        
        analysis['cognitive_functions'] = found_functions
        
        # 처리 유형 결정
        if 'problem_solving' in found_functions:
            analysis['processing_type'] = 'problem_solving'
            analysis['insights'].append('현실의 문제를 꿈에서 해결하려는 시도가 보입니다')
            analysis['confidence'] = 0.8
        elif 'memory_processing' in found_functions:
            analysis['processing_type'] = 'memory_consolidation'
            analysis['insights'].append('과거 경험을 정리하고 통합하는 과정으로 보입니다')
            analysis['confidence'] = 0.7
        elif 'creativity' in found_functions:
            analysis['processing_type'] = 'creative_processing'
            analysis['insights'].append('창의적 사고와 새로운 아이디어 생성 과정입니다')
            analysis['confidence'] = 0.6
        elif 'planning' in found_functions:
            analysis['processing_type'] = 'future_planning'
            analysis['insights'].append('미래에 대한 계획과 준비 과정을 반영합니다')
            analysis['confidence'] = 0.7
        
        # 기본 인사이트
        if not analysis['insights']:
            analysis['insights'].append('인지적 처리 과정이 꿈에 반영되어 있습니다')
            analysis['confidence'] = 0.5
        
        return analysis

class EmotionalAnalyzer:
    """감정적 분석기 - 꿈의 감정적 측면 분석"""
    
    def __init__(self):
        self.emotion_patterns = {
            'anxiety': ['불안', '걱정', '두려움', '떨림', '무서워', '불안해'],
            'joy': ['기쁨', '행복', '즐거움', '웃음', '신나', '기뻐'],
            'anger': ['화', '분노', '짜증', '억울', '화나', '성내'],
            'sadness': ['슬픔', '우울', '눈물', '아픔', '슬퍼', '우울해'],
            'fear': ['무서워', '두려워', '겁나', '무서움', '두려움'],
            'excitement': ['신나', '흥분', '기대', '설레', '흥미로워'],
            'peace': ['평화', '고요', '안정', '편안', '평온', '차분'],
            'confusion': ['혼란', '헷갈려', '모르겠어', '어려워', '복잡해']
        }
        
        self.emotion_intensity = {
            'high': ['매우', '정말', '너무', '엄청', '극도로'],
            'medium': ['꽤', '상당히', '어느정도'],
            'low': ['조금', '약간', '살짝']
        }
    
    def analyze(self, dream_text: str, user_profile: Dict[str, Any]) -> Dict[str, Any]:
        """꿈의 감정적 측면 분석"""
        emotions = []
        emotion_scores = {}
        
        # 감정 키워드 검색
        for emotion, keywords in self.emotion_patterns.items():
            score = 0
            for keyword in keywords:
                if keyword in dream_text:
                    score += 1
            if score > 0:
                emotions.append(emotion)
                emotion_scores[emotion] = score
        
        # 감정 강도 분석
        intensity = self.analyze_emotion_intensity(dream_text)
        
        # 주요 감정 결정
        primary_emotion = max(emotion_scores.items(), key=lambda x: x[1])[0] if emotion_scores else 'neutral'
        
        return {
            'primary_emotions': emotions,
            'primary_emotion': primary_emotion,
            'emotion_scores': emotion_scores,
            'intensity': intensity,
            'emotional_tone': self.determine_tone(emotions),
            'insights': self.generate_emotional_insights(emotions, primary_emotion, intensity),
            'confidence': min(0.9, 0.5 + len(emotions) * 0.1)
        }
    
    def analyze_emotion_intensity(self, dream_text: str) -> str:
        """감정 강도 분석"""
        for intensity, keywords in self.emotion_intensity.items():
            if any(keyword in dream_text for keyword in keywords):
                return intensity
        return 'medium'
    
    def determine_tone(self, emotions: List[str]) -> str:
        """전체적인 감정적 톤 결정"""
        positive_emotions = ['joy', 'excitement', 'peace']
        negative_emotions = ['anxiety', 'anger', 'sadness', 'fear', 'confusion']
        
        positive_count = sum(1 for e in emotions if e in positive_emotions)
        negative_count = sum(1 for e in emotions if e in negative_emotions)
        
        if positive_count > negative_count:
            return 'positive'
        elif negative_count > positive_count:
            return 'negative'
        else:
            return 'neutral'
    
    def generate_emotional_insights(self, emotions: List[str], primary_emotion: str, intensity: str) -> List[str]:
        """감정적 인사이트 생성"""
        insights = []
        
        if primary_emotion == 'anxiety':
            insights.append('불안감이 꿈에 반영되어 있습니다. 현실의 스트레스나 걱정이 영향을 미치고 있을 수 있습니다')
        elif primary_emotion == 'joy':
            insights.append('긍정적인 감정이 꿈에 나타나고 있습니다. 만족스러운 상태나 기대감을 반영합니다')
        elif primary_emotion == 'fear':
            insights.append('두려움이 꿈에 표현되고 있습니다. 새로운 도전이나 변화에 대한 불안감일 수 있습니다')
        elif primary_emotion == 'peace':
            insights.append('평온한 감정이 꿈에 나타나고 있습니다. 안정감이나 만족감을 반영합니다')
        
        if intensity == 'high':
            insights.append('감정의 강도가 높게 나타나고 있어, 이 감정이 현재 중요한 의미를 가지고 있을 수 있습니다')
        
        return insights

class PatternAnalyzer:
    """패턴 분석기 - 사용자 히스토리 기반 패턴 분석"""
    
    def __init__(self):
        self.common_symbols = ['물', '집', '길', '사람', '동물', '차', '비행', '떨어짐']
        self.common_locations = ['집', '학교', '직장', '길', '산', '바다', '숲']
        self.common_emotions = ['기쁨', '슬픔', '두려움', '화남', '놀람', '평온']
    
    def analyze(self, dream_text: str, user_profile: Dict[str, Any]) -> Dict[str, Any]:
        """사용자의 과거 꿈과 비교한 패턴 분석"""
        user_dreams = user_profile.get('dream_history', [])
        
        if len(user_dreams) < 3:
            return {
                'status': 'insufficient_data',
                'message': '패턴 분석을 위해서는 최소 3개의 꿈 기록이 필요합니다',
                'confidence': 0.0
            }
        
        # 반복되는 요소 찾기
        recurring_elements = self.find_recurring_elements(dream_text, user_dreams)
        
        # 변화 패턴 분석
        change_patterns = self.analyze_changes(user_dreams)
        
        # 현재 꿈의 특징
        current_features = self.extract_current_features(dream_text)
        
        return {
            'recurring_elements': recurring_elements,
            'change_patterns': change_patterns,
            'current_features': current_features,
            'insights': self.generate_pattern_insights(recurring_elements, change_patterns, current_features),
            'confidence': min(0.9, 0.3 + len(user_dreams) * 0.05)
        }
    
    def find_recurring_elements(self, current_dream: str, dream_history: List[Dict]) -> Dict[str, Any]:
        """반복되는 요소 찾기"""
        recurring = {
            'symbols': [],
            'emotions': [],
            'locations': [],
            'themes': []
        }
        
        # 현재 꿈에서 나타나는 요소들
        current_symbols = [symbol for symbol in self.common_symbols if symbol in current_dream]
        current_emotions = [emotion for emotion in self.common_emotions if emotion in current_dream]
        current_locations = [location for location in self.common_locations if location in current_dream]
        
        # 과거 꿈들과 비교
        for dream in dream_history[-10:]:  # 최근 10개 꿈만 비교
            dream_text = dream.get('body_text', '')
            
            for symbol in current_symbols:
                if symbol in dream_text:
                    recurring['symbols'].append(symbol)
            
            for emotion in current_emotions:
                if emotion in dream_text:
                    recurring['emotions'].append(emotion)
            
            for location in current_locations:
                if location in dream_text:
                    recurring['locations'].append(location)
        
        # 중복 제거
        for key in recurring:
            recurring[key] = list(set(recurring[key]))
        
        return recurring
    
    def analyze_changes(self, dream_history: List[Dict]) -> Dict[str, Any]:
        """변화 패턴 분석"""
        if len(dream_history) < 5:
            return {'status': 'insufficient_data'}
        
        recent_dreams = dream_history[-5:]  # 최근 5개
        older_dreams = dream_history[-10:-5] if len(dream_history) >= 10 else dream_history[:-5]
        
        changes = {
            'emotion_trend': self.analyze_emotion_trend(recent_dreams, older_dreams),
            'theme_evolution': self.analyze_theme_evolution(recent_dreams, older_dreams),
            'lucidity_change': self.analyze_lucidity_change(recent_dreams, older_dreams)
        }
        
        return changes
    
    def extract_current_features(self, dream_text: str) -> Dict[str, Any]:
        """현재 꿈의 특징 추출"""
        return {
            'length': len(dream_text),
            'has_dialogue': '"' in dream_text or "'" in dream_text,
            'has_movement': any(word in dream_text for word in ['걷다', '뛰다', '비행', '떨어지다']),
            'has_people': any(word in dream_text for word in ['사람', '친구', '가족', '모르는']),
            'has_animals': any(word in dream_text for word in ['개', '고양이', '동물', '새'])
        }
    
    def generate_pattern_insights(self, recurring: Dict, changes: Dict, current: Dict) -> List[str]:
        """패턴 기반 인사이트 생성"""
        insights = []
        
        if recurring['symbols']:
            insights.append(f"'{', '.join(recurring['symbols'])}' 상징이 반복적으로 나타나고 있습니다")
        
        if recurring['emotions']:
            insights.append(f"'{', '.join(recurring['emotions'])}' 감정이 자주 나타나는 패턴을 보입니다")
        
        if changes.get('emotion_trend') == 'improving':
            insights.append('최근 꿈의 감정적 톤이 개선되고 있는 경향을 보입니다')
        elif changes.get('emotion_trend') == 'declining':
            insights.append('최근 꿈의 감정적 톤이 부정적으로 변하고 있습니다')
        
        return insights

class SymbolicAnalyzer:
    """상징적 분석기 - 꿈의 상징적 의미 분석"""
    
    def __init__(self):
        self.symbol_database = {
            'flying': {
                'meanings': ['자유', '해방', '성취감', '통제감'],
                'contexts': {
                    'high_altitude': '높은 목표, 야망',
                    'low_altitude': '현실적 제약, 불안',
                    'falling_while_flying': '실패에 대한 두려움'
                }
            },
            'water': {
                'meanings': ['감정', '무의식', '변화', '정화'],
                'contexts': {
                    'calm_water': '평온, 안정감',
                    'rough_water': '감정적 혼란, 스트레스',
                    'deep_water': '깊은 감정, 무의식',
                    'drowning': '감정에 압도당함'
                }
            },
            'house': {
                'meanings': ['자아', '정신 상태', '안전', '개인 공간'],
                'contexts': {
                    'childhood_house': '과거, 어린 시절',
                    'new_house': '새로운 시작, 변화',
                    'dark_house': '무의식, 숨겨진 부분',
                    'house_on_fire': '변화, 정화, 위험'
                }
            },
            'car': {
                'meanings': ['인생의 방향', '통제감', '자율성'],
                'contexts': {
                    'driving': '인생을 주도적으로 이끌어감',
                    'passenger': '타인에 의존, 통제력 부족',
                    'car_accident': '방향성 상실, 충돌'
                }
            }
        }
        
        self.korean_symbols = {
            '산': ['도전', '성장', '목표', '고난'],
            '바다': ['무한함', '감정', '미지의 세계'],
            '꽃': ['아름다움', '성장', '새로운 시작'],
            '비': ['정화', '새로운 시작', '감정의 표현']
        }
    
    def analyze(self, dream_text: str, user_profile: Dict[str, Any]) -> Dict[str, Any]:
        """꿈의 상징적 의미 분석"""
        found_symbols = []
        symbol_interpretations = {}
        
        # 상징 검색
        for symbol, data in self.symbol_database.items():
            if self.check_symbol_presence(symbol, dream_text):
                found_symbols.append(symbol)
                symbol_interpretations[symbol] = {
                    'meanings': data['meanings'],
                    'context': self.analyze_symbol_context(symbol, dream_text, data)
                }
        
        # 한국적 상징 검색
        korean_symbols = self.analyze_korean_symbols(dream_text)
        
        return {
            'symbols_found': found_symbols,
            'symbol_interpretations': symbol_interpretations,
            'korean_symbols': korean_symbols,
            'insights': self.generate_symbolic_insights(symbol_interpretations, korean_symbols),
            'confidence': min(0.9, 0.4 + len(found_symbols) * 0.15)
        }
    
    def check_symbol_presence(self, symbol: str, dream_text: str) -> bool:
        """상징의 존재 여부 확인"""
        symbol_keywords = {
            'flying': ['비행', '날다', '하늘', '공중'],
            'water': ['물', '바다', '강', '호수', '비'],
            'house': ['집', '집안', '방', '문'],
            'car': ['차', '자동차', '운전', '타다']
        }
        
        keywords = symbol_keywords.get(symbol, [])
        return any(keyword in dream_text for keyword in keywords)
    
    def analyze_symbol_context(self, symbol: str, dream_text: str, symbol_data: Dict) -> str:
        """상징의 맥락 분석"""
        contexts = symbol_data.get('contexts', {})
        for context_key, context_keywords in contexts.items():
            if any(keyword in dream_text for keyword in context_keywords.split(', ')):
                return context_key
        return 'general'
    
    def analyze_korean_symbols(self, dream_text: str) -> Dict[str, List[str]]:
        """한국적 상징 분석"""
        found_korean_symbols = {}
        for symbol, meanings in self.korean_symbols.items():
            if symbol in dream_text:
                found_korean_symbols[symbol] = meanings
        return found_korean_symbols
    
    def generate_symbolic_insights(self, interpretations: Dict, korean_symbols: Dict) -> List[str]:
        """상징적 인사이트 생성"""
        insights = []
        
        for symbol, data in interpretations.items():
            meanings = data['meanings']
            context = data['context']
            insights.append(f"'{symbol}' 상징은 {', '.join(meanings[:2])}을 의미할 수 있습니다")
        
        for symbol, meanings in korean_symbols.items():
            insights.append(f"'{symbol}'는 한국 문화에서 {', '.join(meanings[:2])}을 상징합니다")
        
        return insights

class PersonalizationEngine:
    """개인화 엔진 - 사용자별 맞춤화"""
    
    def __init__(self):
        self.cultural_contexts = {
            'korean': KoreanCulturalContext(),
            'western': WesternCulturalContext(),
            'eastern': EasternCulturalContext()
        }
    
    def apply(self, analysis_results: Dict[str, Any], user_profile: Dict[str, Any]) -> Dict[str, Any]:
        """사용자 프로필에 맞게 분석 결과 개인화"""
        personalized = {}
        
        # 문화적 맥락 적용
        cultural_context = self.get_cultural_context(user_profile)
        
        for analyzer_name, result in analysis_results.items():
            personalized[analyzer_name] = cultural_context.adapt(result, user_profile)
        
        # 사용자 선호도 반영
        personalized = self.apply_user_preferences(personalized, user_profile)
        
        return personalized
    
    def get_cultural_context(self, user_profile: Dict[str, Any]):
        """사용자의 문화적 배경에 맞는 컨텍스트 선택"""
        culture = user_profile.get('cultural_background', 'korean')
        return self.cultural_contexts.get(culture, self.cultural_contexts['korean'])
    
    def apply_user_preferences(self, results: Dict[str, Any], user_profile: Dict[str, Any]) -> Dict[str, Any]:
        """사용자 선호도 반영"""
        preferences = user_profile.get('preferences', {})
        
        # 선호하는 분석 유형 강조
        preferred_analysis = preferences.get('preferred_analysis_type', 'balanced')
        
        if preferred_analysis == 'psychological':
            # 심리적 해석 강조
            results = self.emphasize_psychological_interpretation(results)
        elif preferred_analysis == 'practical':
            # 실용적 조언 강조
            results = self.emphasize_practical_advice(results)
        
        return results
    
    def emphasize_psychological_interpretation(self, results: Dict[str, Any]) -> Dict[str, Any]:
        """심리적 해석 강조"""
        for analyzer_name, result in results.items():
            if 'insights' in result:
                result['insights'] = [insight + " (심리적 관점에서)" for insight in result['insights']]
        return results
    
    def emphasize_practical_advice(self, results: Dict[str, Any]) -> Dict[str, Any]:
        """실용적 조언 강조"""
        for analyzer_name, result in results.items():
            if 'insights' in result:
                result['insights'] = [insight + " (실용적 관점에서)" for insight in result['insights']]
        return results

class KoreanCulturalContext:
    """한국 문화적 맥락"""
    
    def adapt(self, analysis_result: Dict[str, Any], user_profile: Dict[str, Any]) -> Dict[str, Any]:
        """한국 문화에 맞게 분석 결과 조정"""
        adapted = analysis_result.copy()
        
        # 한국적 감정 표현 반영
        if 'emotional' in adapted:
            adapted['emotional']['korean_emotions'] = self.get_korean_emotions()
        
        # 한국적 상징 해석 추가
        if 'symbolic' in adapted:
            adapted['symbolic']['korean_interpretations'] = self.get_korean_symbols()
        
        return adapted
    
    def get_korean_emotions(self) -> Dict[str, str]:
        """한국적 감정 표현"""
        return {
            '한': '깊은 슬픔과 원한',
            '정': '따뜻한 정과 사랑',
            '눈치': '상황 파악과 배려',
            '체면': '자존심과 위신'
        }
    
    def get_korean_symbols(self) -> Dict[str, str]:
        """한국적 상징 해석"""
        return {
            '산': '고난과 성장의 상징',
            '바다': '무한한 가능성',
            '꽃': '아름다움과 순수함',
            '비': '정화와 새로운 시작'
        }

class WesternCulturalContext:
    """서구 문화적 맥락"""
    
    def adapt(self, analysis_result: Dict[str, Any], user_profile: Dict[str, Any]) -> Dict[str, Any]:
        """서구 문화에 맞게 분석 결과 조정"""
        adapted = analysis_result.copy()
        # 서구적 해석 추가
        return adapted

class EasternCulturalContext:
    """동양 문화적 맥락"""
    
    def adapt(self, analysis_result: Dict[str, Any], user_profile: Dict[str, Any]) -> Dict[str, Any]:
        """동양 문화에 맞게 분석 결과 조정"""
        adapted = analysis_result.copy()
        # 동양적 해석 추가
        return adapted

class ConfidenceEvaluator:
    """신뢰도 평가 시스템"""
    
    def evaluate(self, analysis_results: Dict[str, Any], user_profile: Dict[str, Any]) -> Dict[str, float]:
        """각 분석의 신뢰도 평가"""
        confidence_scores = {}
        
        for analyzer_name, result in analysis_results.items():
            base_confidence = result.get('confidence', 0.5)
            
            # 데이터 품질에 따른 조정
            data_quality_factor = self.assess_data_quality(user_profile)
            
            # 분석 결과의 일관성에 따른 조정
            consistency_factor = self.assess_consistency(result)
            
            # 최종 신뢰도 계산
            final_confidence = base_confidence * data_quality_factor * consistency_factor
            confidence_scores[analyzer_name] = min(0.95, max(0.1, final_confidence))
        
        return confidence_scores
    
    def assess_data_quality(self, user_profile: Dict[str, Any]) -> float:
        """데이터 품질 평가"""
        dream_count = len(user_profile.get('dream_history', []))
        
        if dream_count >= 20:
            return 1.0
        elif dream_count >= 10:
            return 0.8
        elif dream_count >= 5:
            return 0.6
        else:
            return 0.4
    
    def assess_consistency(self, result: Dict[str, Any]) -> float:
        """분석 결과의 일관성 평가"""
        insights = result.get('insights', [])
        if len(insights) >= 2:
            return 1.0
        elif len(insights) == 1:
            return 0.7
        else:
            return 0.5

class ModernDreamAnalysisSystem:
    """현대적 다학제적 꿈 분석 시스템"""
    
    def __init__(self):
        self.analyzers = {
            'cognitive': CognitiveAnalyzer(),
            'emotional': EmotionalAnalyzer(),
            'pattern': PatternAnalyzer(),
            'symbolic': SymbolicAnalyzer()
        }
        
        self.personalization = PersonalizationEngine()
        self.confidence = ConfidenceEvaluator()
    
    def analyze_dream(self, dream_text: str, user_profile: Dict[str, Any]) -> Dict[str, Any]:
        """현실적으로 구현 가능한 꿈 분석"""
        logger.info(f"현대적 꿈 분석 시작: 사용자 {user_profile.get('user_id', 'unknown')}")
        
        results = {}
        
        # 각 분석기로 분석
        for name, analyzer in self.analyzers.items():
            try:
                results[name] = analyzer.analyze(dream_text, user_profile)
                logger.info(f"{name} 분석 완료")
            except Exception as e:
                logger.error(f"{name} 분석 실패: {e}")
                results[name] = self.get_default_analysis(name)
        
        # 개인화 적용
        personalized_results = self.personalization.apply(results, user_profile)
        
        # 신뢰도 평가
        confidence_scores = self.confidence.evaluate(personalized_results, user_profile)
        
        # 종합 인사이트 생성
        comprehensive_insights = self.generate_comprehensive_insights(personalized_results)
        
        # 개인화된 추천 생성
        recommendations = self.generate_recommendations(personalized_results, user_profile)
        
        return {
            'analyses': personalized_results,
            'confidence': confidence_scores,
            'comprehensive_insights': comprehensive_insights,
            'recommendations': recommendations,
            'analysis_metadata': {
                'timestamp': datetime.utcnow(),
                'analysis_version': '1.0',
                'total_analyzers': len(self.analyzers)
            }
        }
    
    def get_default_analysis(self, analyzer_name: str) -> Dict[str, Any]:
        """분석 실패 시 기본값 제공"""
        defaults = {
            'cognitive': {
                'cognitive_functions': [],
                'processing_type': 'unknown',
                'insights': ['인지적 분석을 위해 더 많은 정보가 필요합니다'],
                'confidence': 0.3
            },
            'emotional': {
                'primary_emotions': [],
                'emotional_tone': 'neutral',
                'insights': ['감정적 분석을 위해 더 많은 정보가 필요합니다'],
                'confidence': 0.3
            },
            'pattern': {
                'status': 'insufficient_data',
                'insights': ['패턴 분석을 위해 더 많은 꿈 기록이 필요합니다'],
                'confidence': 0.2
            },
            'symbolic': {
                'symbols_found': [],
                'insights': ['상징적 분석을 위해 더 많은 정보가 필요합니다'],
                'confidence': 0.3
            }
        }
        return defaults.get(analyzer_name, {'insights': ['분석 결과를 가져올 수 없습니다'], 'confidence': 0.1})
    
    def generate_comprehensive_insights(self, analyses: Dict[str, Any]) -> List[str]:
        """종합 인사이트 생성"""
        insights = []
        
        # 각 분석기에서 주요 인사이트 추출
        for analyzer_name, analysis in analyses.items():
            if 'insights' in analysis and analysis['insights']:
                insights.extend(analysis['insights'][:2])  # 최대 2개씩
        
        # 중복 제거 및 정리
        unique_insights = list(dict.fromkeys(insights))
        
        return unique_insights[:5]  # 최대 5개 인사이트
    
    def generate_recommendations(self, analyses: Dict[str, Any], user_profile: Dict[str, Any]) -> List[str]:
        """개인화된 추천 생성"""
        recommendations = []
        
        # 감정적 분석 기반 추천
        emotional_analysis = analyses.get('emotional', {})
        if emotional_analysis.get('primary_emotion') == 'anxiety':
            recommendations.append('불안감이 높을 때는 명상이나 깊은 호흡을 시도해보세요')
            recommendations.append('규칙적인 운동이 스트레스 해소에 도움이 될 수 있습니다')
        
        # 패턴 분석 기반 추천
        pattern_analysis = analyses.get('pattern', {})
        if pattern_analysis.get('status') != 'insufficient_data':
            if pattern_analysis.get('change_patterns', {}).get('emotion_trend') == 'declining':
                recommendations.append('최근 감정적 톤이 부정적으로 변하고 있습니다. 전문가 상담을 고려해보세요')
        
        # 상징적 분석 기반 추천
        symbolic_analysis = analyses.get('symbolic', {})
        if 'water' in symbolic_analysis.get('symbols_found', []):
            recommendations.append('물과 관련된 꿈은 감정의 정화를 의미할 수 있습니다. 감정을 표현하는 시간을 가져보세요')
        
        # 기본 추천
        if not recommendations:
            recommendations.append('꿈을 더 자세히 기록해보세요. 패턴 분석에 도움이 됩니다')
            recommendations.append('규칙적인 수면 패턴을 유지해보세요')
        
        return recommendations[:3]  # 최대 3개 추천
