/**
 * 꿈 커뮤니티 공유 화면
 * 글자 수 제한 및 플랜별 차등 적용
 */
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigationStore } from '../../stores/navigationStore';
import { useAuthStore } from '../../stores/authStore';
import hybridDataManager from '../../services/hybridDataManager';
import { 
  EmotionalTitleStyle, 
  EmotionalSubtitleStyle, 
  ButtonFontStyle, 
  BodyFontStyle, 
  SmallFontStyle,
  PersonalGreetingStyle
} from '../../styles/fonts';
import { SubscriptionPlan } from '../../types/storage';

interface ShareDreamScreenProps {
  dreamId: string;
  dreamTitle?: string;
  dreamText: string;
}

const ShareDreamScreen: React.FC<ShareDreamScreenProps> = ({ 
  dreamId, 
  dreamTitle, 
  dreamText 
}) => {
  const { goBack } = useNavigationStore();
  const { user } = useAuthStore();
  
  const [sharedText, setSharedText] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [userPlan, setUserPlan] = useState<SubscriptionPlan>(SubscriptionPlan.FREE);
  const [isSharing, setIsSharing] = useState(false);
  const [charCount, setCharCount] = useState(0);

  // 플랜별 제한사항
  const getPlanLimits = (plan: SubscriptionPlan) => {
    const limits = {
      [SubscriptionPlan.FREE]: { textLimit: 200, imageLimit: 3 },
      [SubscriptionPlan.PLUS]: { textLimit: 500, imageLimit: 10 },
      [SubscriptionPlan.PREMIUM]: { textLimit: 1000, imageLimit: -1 }
    };
    return limits[plan];
  };

  const limits = getPlanLimits(userPlan);

  useEffect(() => {
    // 사용자 플랜 정보 로드
    loadUserPlan();
    
    // 기본 공유 텍스트 설정 (원본 텍스트의 일부)
    const defaultText = dreamText.length > limits.textLimit 
      ? dreamText.substring(0, limits.textLimit - 10) + '...'
      : dreamText;
    setSharedText(defaultText);
    setCharCount(defaultText.length);
  }, []);

  const loadUserPlan = async () => {
    try {
      // 실제 구현에서는 서버에서 플랜 정보를 가져와야 함
      // 임시로 FREE 플랜으로 설정
      setUserPlan(SubscriptionPlan.FREE);
    } catch (error) {
      console.error('플랜 정보 로드 실패:', error);
    }
  };

  const handleTextChange = (text: string) => {
    if (text.length <= limits.textLimit) {
      setSharedText(text);
      setCharCount(text.length);
    }
  };

  const handleImageSelect = () => {
    // 이미지 선택 로직 (실제 구현 필요)
    Alert.alert('이미지 선택', '이미지 선택 기능은 구현 예정입니다.');
  };

  const handleShare = async () => {
    if (!sharedText.trim()) {
      Alert.alert('오류', '공유할 내용을 입력해주세요.');
      return;
    }

    if (charCount > limits.textLimit) {
      Alert.alert('오류', `글자 수 제한을 초과했습니다. (${limits.textLimit}자 이하)`);
      return;
    }

    setIsSharing(true);
    try {
      await hybridDataManager.shareDreamToCommunity(
        dreamId,
        sharedText.trim(),
        selectedImage || undefined
      );
      
      Alert.alert(
        '공유 완료',
        '꿈이 커뮤니티에 성공적으로 공유되었습니다!',
        [{ text: '확인', onPress: () => goBack() }]
      );
    } catch (error) {
      Alert.alert('오류', error instanceof Error ? error.message : '공유에 실패했습니다.');
    } finally {
      setIsSharing(false);
    }
  };

  const getCharCountColor = () => {
    const percentage = (charCount / limits.textLimit) * 100;
    if (percentage >= 90) return '#e94560';
    if (percentage >= 70) return '#FFDDA8';
    return '#8F8C9B';
  };

  const getPlanDisplayName = (plan: SubscriptionPlan) => {
    const names = {
      [SubscriptionPlan.FREE]: '무료',
      [SubscriptionPlan.PLUS]: '플러스',
      [SubscriptionPlan.PREMIUM]: '프리미엄'
    };
    return names[plan];
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* 헤더 */}
        <View style={styles.header}>
          <Text style={styles.title}>꿈 공유하기</Text>
          <Text style={styles.subtitle}>커뮤니티에 꿈을 공유해보세요</Text>
        </View>

        {/* 플랜 정보 */}
        <View style={styles.planInfo}>
          <Text style={styles.planTitle}>현재 플랜: {getPlanDisplayName(userPlan)}</Text>
          <Text style={styles.planDetails}>
            글자 수: {limits.textLimit}자 | 이미지: {limits.imageLimit === -1 ? '무제한' : `${limits.imageLimit}개`}
          </Text>
        </View>

        {/* 원본 꿈 정보 */}
        <View style={styles.originalDream}>
          <Text style={styles.sectionTitle}>원본 꿈</Text>
          <View style={styles.originalDreamCard}>
            <Text style={styles.originalTitle}>{dreamTitle || '제목 없음'}</Text>
            <Text style={styles.originalText} numberOfLines={3}>
              {dreamText}
            </Text>
          </View>
        </View>

        {/* 공유 텍스트 입력 */}
        <View style={styles.shareSection}>
          <Text style={styles.sectionTitle}>공유할 내용</Text>
          <TextInput
            style={styles.textInput}
            value={sharedText}
            onChangeText={handleTextChange}
            placeholder="커뮤니티에 공유할 내용을 입력하세요..."
            multiline
            numberOfLines={6}
            textAlignVertical="top"
            maxLength={limits.textLimit}
          />
          <View style={styles.charCountContainer}>
            <Text style={[styles.charCount, { color: getCharCountColor() }]}>
              {charCount} / {limits.textLimit}
            </Text>
          </View>
        </View>

        {/* 이미지 선택 */}
        <View style={styles.imageSection}>
          <Text style={styles.sectionTitle}>이미지 추가 (선택사항)</Text>
          <TouchableOpacity style={styles.imageButton} onPress={handleImageSelect}>
            <Text style={styles.imageButtonText}>
              {selectedImage ? '이미지 변경' : '이미지 선택'}
            </Text>
          </TouchableOpacity>
          {selectedImage && (
            <View style={styles.selectedImageContainer}>
              <Image source={{ uri: selectedImage }} style={styles.selectedImage} />
              <TouchableOpacity 
                style={styles.removeImageButton}
                onPress={() => setSelectedImage(null)}
              >
                <Text style={styles.removeImageText}>×</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* 공유 옵션 */}
        <View style={styles.shareOptions}>
          <Text style={styles.sectionTitle}>공유 옵션</Text>
          <View style={styles.optionItem}>
            <Text style={styles.optionText}>익명으로 공유</Text>
            <Text style={styles.optionDescription}>
              개인정보를 보호하며 익명으로 공유됩니다
            </Text>
          </View>
        </View>

        {/* 공유 버튼 */}
        <TouchableOpacity
          style={[styles.shareButton, isSharing && styles.disabledButton]}
          onPress={handleShare}
          disabled={isSharing}
        >
          <Text style={styles.shareButtonText}>
            {isSharing ? '공유 중...' : '커뮤니티에 공유하기'}
          </Text>
        </TouchableOpacity>

        {/* 하단 여백 */}
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#191D2E', // Night Sky Blue
  },
  scrollView: {
    flex: 1,
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
    paddingTop: 20,
  },
  title: {
    ...EmotionalTitleStyle,
    color: '#FFDDA8', // Starlight Gold
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    ...EmotionalSubtitleStyle,
    color: '#8F8C9B', // Warm Grey 400
    textAlign: 'center',
  },
  planInfo: {
    backgroundColor: '#4A4063', // Dawn Purple
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  planTitle: {
    ...PersonalGreetingStyle,
    color: '#FFDDA8',
    marginBottom: 4,
  },
  planDetails: {
    ...SmallFontStyle,
    color: '#8F8C9B',
  },
  originalDream: {
    marginBottom: 24,
  },
  sectionTitle: {
    ...EmotionalSubtitleStyle,
    color: '#FFDDA8',
    marginBottom: 16,
  },
  originalDreamCard: {
    backgroundColor: '#2d2d44',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#3d3d5c',
  },
  originalTitle: {
    ...BodyFontStyle,
    fontWeight: '600',
    color: '#EAE8F0',
    marginBottom: 8,
  },
  originalText: {
    ...SmallFontStyle,
    color: '#8F8C9B',
    lineHeight: 20,
  },
  shareSection: {
    marginBottom: 24,
  },
  textInput: {
    backgroundColor: '#4A4063',
    borderRadius: 12,
    padding: 16,
    ...BodyFontStyle,
    color: '#EAE8F0',
    borderWidth: 1,
    borderColor: '#595566',
    minHeight: 120,
  },
  charCountContainer: {
    alignItems: 'flex-end',
    marginTop: 8,
  },
  charCount: {
    ...SmallFontStyle,
    fontWeight: '500',
  },
  imageSection: {
    marginBottom: 24,
  },
  imageButton: {
    backgroundColor: '#4A4063',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#595566',
  },
  imageButtonText: {
    ...ButtonFontStyle,
    color: '#FFDDA8',
  },
  selectedImageContainer: {
    position: 'relative',
    marginTop: 12,
  },
  selectedImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
  },
  removeImageButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#e94560',
    borderRadius: 15,
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeImageText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  shareOptions: {
    marginBottom: 32,
  },
  optionItem: {
    backgroundColor: '#2d2d44',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#3d3d5c',
  },
  optionText: {
    ...BodyFontStyle,
    color: '#EAE8F0',
    marginBottom: 4,
  },
  optionDescription: {
    ...SmallFontStyle,
    color: '#8F8C9B',
  },
  shareButton: {
    backgroundColor: '#FFDDA8',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#FFDDA8',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  disabledButton: {
    backgroundColor: '#595566',
    shadowOpacity: 0,
    elevation: 0,
  },
  shareButtonText: {
    ...ButtonFontStyle,
    color: '#191D2E',
    fontSize: 18,
  },
  bottomSpacer: {
    height: 40,
  },
});

export default ShareDreamScreen;
