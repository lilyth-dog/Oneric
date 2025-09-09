/**
 * 서비스 이용약관 화면
 * 디자인 가이드에 따른 "고요한 탐험" 컨셉 구현
 */
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useNavigationStore } from '../../stores/navigationStore';

const TermsOfServiceScreen: React.FC = () => {
  const { goBack } = useNavigationStore();

  return (
    <View style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={goBack}>
          <Text style={styles.backButtonText}>← 뒤로</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>서비스 이용약관</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>제1조 (목적)</Text>
          <Text style={styles.sectionContent}>
            본 약관은 꿈결(이하 "회사")이 제공하는 꿈 기록 및 분석 서비스(이하 "서비스")의 이용과 관련하여 회사와 이용자 간의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>제2조 (정의)</Text>
          <Text style={styles.sectionContent}>
            1. "서비스"란 꿈 기록, AI 분석, 시각화, 커뮤니티 기능을 포함한 모든 서비스를 의미합니다.{'\n\n'}
            2. "이용자"란 서비스에 접속하여 본 약관에 따라 서비스를 이용하는 회원 및 비회원을 의미합니다.{'\n\n'}
            3. "회원"이란 서비스에 개인정보를 제공하여 회원등록을 한 자로서, 서비스의 정보를 지속적으로 제공받으며 서비스를 계속적으로 이용할 수 있는 자를 의미합니다.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>제3조 (약관의 효력 및 변경)</Text>
          <Text style={styles.sectionContent}>
            1. 본 약관은 서비스 화면에 게시하거나 기타의 방법으로 이용자에게 공지함으로써 효력이 발생합니다.{'\n\n'}
            2. 회사는 합리적인 사유가 발생할 경우에는 본 약관을 변경할 수 있으며, 약관이 변경되는 경우 변경된 약관의 내용과 시행일을 정하여 시행일로부터 최소 7일 이전에 공지합니다.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>제4조 (서비스의 제공 및 변경)</Text>
          <Text style={styles.sectionContent}>
            1. 회사는 다음과 같은 업무를 수행합니다:{'\n'}
            - 꿈 기록 및 저장 서비스{'\n'}
            - AI 기반 꿈 분석 서비스{'\n'}
            - 꿈 시각화 서비스{'\n'}
            - 커뮤니티 서비스{'\n\n'}
            2. 회사는 서비스의 기술적 사양의 변경 등의 경우에는 장차 체결되는 계약에 의해 제공할 서비스의 내용을 변경할 수 있습니다.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>제5조 (서비스의 중단)</Text>
          <Text style={styles.sectionContent}>
            1. 회사는 컴퓨터 등 정보통신설비의 보수점검, 교체 및 고장, 통신의 두절 등의 사유가 발생한 경우에는 서비스의 제공을 일시적으로 중단할 수 있습니다.{'\n\n'}
            2. 회사는 제1항의 사유로 서비스의 제공이 일시적으로 중단됨으로 인하여 이용자 또는 제3자가 입은 손해에 대하여 배상합니다. 단, 회사가 고의 또는 과실이 없음을 입증하는 경우에는 그러하지 아니합니다.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>제6조 (회원가입)</Text>
          <Text style={styles.sectionContent}>
            1. 이용자는 회사가 정한 가입 양식에 따라 회원정보를 기입한 후 이 약관에 동의한다는 의사표시를 함으로서 회원가입을 신청합니다.{'\n\n'}
            2. 회사는 제1항과 같이 회원으로 가입할 것을 신청한 이용자 중 다음 각 호에 해당하지 않는 한 회원으로 등록합니다:{'\n'}
            - 가입신청자가 이 약관에 의하여 이전에 회원자격을 상실한 적이 있는 경우{'\n'}
            - 등록 내용에 허위, 기재누락, 오기가 있는 경우{'\n'}
            - 기타 회원으로 등록하는 것이 회사의 기술상 현저히 지장이 있다고 판단되는 경우
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>제7조 (개인정보보호)</Text>
          <Text style={styles.sectionContent}>
            1. 회사는 이용자의 개인정보 수집시 서비스제공을 위하여 필요한 범위에서 최소한의 개인정보를 수집합니다.{'\n\n'}
            2. 회사는 회원가입시 구매계약이행에 필요한 정보를 미리 수집하지 않습니다.{'\n\n'}
            3. 회사는 이용자의 개인정보를 수집, 이용하는 때에는 당해 이용자에게 그 목적을 고지하고 동의를 받습니다.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>제8조 (회사의 의무)</Text>
          <Text style={styles.sectionContent}>
            1. 회사는 법령과 본 약관이 금지하거나 공서양속에 반하는 행위를 하지 않으며 본 약관이 정하는 바에 따라 지속적이고, 안정적으로 서비스를 제공하는데 최선을 다하여야 합니다.{'\n\n'}
            2. 회사는 이용자가 안전하게 인터넷 서비스를 이용할 수 있도록 이용자의 개인정보(신용정보 포함)보호를 위한 보안 시스템을 구축하여야 합니다.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>제9조 (회원의 의무)</Text>
          <Text style={styles.sectionContent}>
            1. 회원은 다음 행위를 하여서는 안 됩니다:{'\n'}
            - 신청 또는 변경시 허위 내용의 등록{'\n'}
            - 타인의 정보 도용{'\n'}
            - 회사가 게시한 정보의 변경{'\n'}
            - 회사가 정한 정보 이외의 정보(컴퓨터 프로그램 등) 등의 송신 또는 게시{'\n'}
            - 회사 기타 제3자의 저작권 등 지적재산권에 대한 침해{'\n'}
            - 회사 기타 제3자의 명예를 손상시키거나 업무를 방해하는 행위{'\n'}
            - 외설 또는 폭력적인 메시지, 화상, 음성, 기타 공서양속에 반하는 정보를 서비스에 공개 또는 게시하는 행위
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>제10조 (손해배상)</Text>
          <Text style={styles.sectionContent}>
            회사는 무료로 제공되는 서비스와 관련하여 회원에게 어떠한 손해가 발생하더라도 동 손해가 회사의 고의 또는 중대한 과실에 의한 경우를 제외하고는 이에 대하여 책임을 부담하지 아니합니다.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>제11조 (면책조항)</Text>
          <Text style={styles.sectionContent}>
            1. 회사는 천재지변 또는 이에 준하는 불가항력으로 인하여 서비스를 제공할 수 없는 경우에는 서비스 제공에 관한 책임이 면제됩니다.{'\n\n'}
            2. 회사는 이용자의 귀책사유로 인한 서비스 이용의 장애에 대하여는 책임을 지지 않습니다.{'\n\n'}
            3. 회사는 이용자가 서비스를 이용하여 기대하는 수익을 상실한 것에 대하여 책임을 지지 않으며 그 밖에 서비스를 통하여 얻은 자료로 인한 손해에 관하여는 책임을 지지 않습니다.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>제12조 (준거법 및 관할법원)</Text>
          <Text style={styles.sectionContent}>
            1. 서비스 이용으로 발생한 분쟁에 대해 소송이 제기되는 경우 회사의 본사 소재지를 관할하는 법원을 전속 관할 법원으로 합니다.{'\n\n'}
            2. 본 약관은 대한민국 법령에 따라 규율되고 해석됩니다.
          </Text>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            본 약관은 2024년 1월 1일부터 시행됩니다.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#191D2E', // Night Sky Blue
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: '#4A4063', // Dawn Purple
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    color: '#FFDDA8', // Starlight Gold
    fontSize: 16,
    fontWeight: '600',
  },
  headerTitle: {
    color: '#FFDDA8', // Starlight Gold
    fontSize: 20,
    fontWeight: 'bold',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFDDA8', // Starlight Gold
    marginBottom: 12,
  },
  sectionContent: {
    fontSize: 14,
    color: '#EAE8F0', // Warm Grey 100
    lineHeight: 22,
  },
  footer: {
    marginTop: 32,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: '#4A4063', // Dawn Purple
  },
  footerText: {
    fontSize: 12,
    color: '#8F8C9B', // Warm Grey 400
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default TermsOfServiceScreen;
