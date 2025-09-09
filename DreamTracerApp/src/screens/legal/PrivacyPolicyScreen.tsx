/**
 * 개인정보 처리방침 화면
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

const PrivacyPolicyScreen: React.FC = () => {
  const { goBack } = useNavigationStore();

  return (
    <View style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={goBack}>
          <Text style={styles.backButtonText}>← 뒤로</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>개인정보 처리방침</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. 개인정보의 처리목적</Text>
          <Text style={styles.sectionContent}>
            꿈결은 다음의 목적을 위하여 개인정보를 처리합니다. 처리하고 있는 개인정보는 다음의 목적 이외의 용도로는 이용되지 않으며, 이용 목적이 변경되는 경우에는 개인정보보호법 제18조에 따라 별도의 동의를 받는 등 필요한 조치를 이행할 예정입니다.{'\n\n'}
            • 회원 가입 및 관리{'\n'}
            • 서비스 제공 및 계약 이행{'\n'}
            • 꿈 기록 및 분석 서비스 제공{'\n'}
            • 고객 상담 및 불만 처리{'\n'}
            • 서비스 개선 및 신규 서비스 개발
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. 개인정보의 처리 및 보유기간</Text>
          <Text style={styles.sectionContent}>
            1. 꿈결은 법령에 따른 개인정보 보유·이용기간 또는 정보주체로부터 개인정보를 수집시에 동의받은 개인정보 보유·이용기간 내에서 개인정보를 처리·보유합니다.{'\n\n'}
            2. 각각의 개인정보 처리 및 보유 기간은 다음과 같습니다:{'\n\n'}
            • 회원 정보: 회원 탈퇴시까지{'\n'}
            • 꿈 기록 데이터: 회원 탈퇴시까지{'\n'}
            • 서비스 이용 기록: 3년{'\n'}
            • 고객 상담 기록: 3년
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. 처리하는 개인정보의 항목</Text>
          <Text style={styles.sectionContent}>
            꿈결은 다음의 개인정보 항목을 처리하고 있습니다:{'\n\n'}
            <Text style={styles.boldText}>필수항목:</Text>{'\n'}
            • 이메일 주소, 비밀번호, 이름{'\n'}
            • 꿈 기록 내용 (텍스트, 음성){'\n'}
            • 서비스 이용 기록{'\n\n'}
            <Text style={styles.boldText}>선택항목:</Text>{'\n'}
            • 프로필 사진{'\n'}
            • 생년월일{'\n'}
            • 관심사{'\n\n'}
            <Text style={styles.boldText}>자동 수집 항목:</Text>{'\n'}
            • IP주소, 쿠키, MAC주소, 서비스 이용 기록, 방문 기록, 불량 이용 기록 등
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>4. 개인정보의 제3자 제공</Text>
          <Text style={styles.sectionContent}>
            꿈결은 개인정보를 제1조(개인정보의 처리목적)에서 명시한 범위 내에서만 처리하며, 정보주체의 동의, 법률의 특별한 규정 등 개인정보보호법 제17조에 해당하는 경우에만 개인정보를 제3자에게 제공합니다.{'\n\n'}
            꿈결은 다음과 같이 개인정보를 제3자에게 제공하고 있습니다:{'\n\n'}
            • Google (AI 분석 서비스 제공을 위한 데이터 처리){'\n'}
            • Amazon Web Services (데이터 저장 및 처리){'\n'}
            • 기타 서비스 제공업체 (서비스 운영을 위한 최소한의 정보)
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>5. 개인정보처리의 위탁</Text>
          <Text style={styles.sectionContent}>
            꿈결은 원활한 개인정보 업무처리를 위하여 다음과 같이 개인정보 처리업무를 위탁하고 있습니다:{'\n\n'}
            • 위탁받는 자: Amazon Web Services{'\n'}
            • 위탁하는 업무의 내용: 데이터 저장 및 관리{'\n\n'}
            • 위탁받는 자: Google Cloud{'\n'}
            • 위탁하는 업무의 내용: AI 분석 서비스{'\n\n'}
            꿈결은 위탁계약 체결시 개인정보보호법 제26조에 따라 위탁업무 수행목적 외 개인정보 처리금지, 기술적·관리적 보호조치, 재위탁 제한, 수탁자에 대한 관리·감독, 손해배상 등에 관한 사항을 계약서 등 문서에 명시하고, 수탁자가 개인정보를 안전하게 처리하는지를 감독하고 있습니다.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>6. 정보주체의 권리·의무 및 행사방법</Text>
          <Text style={styles.sectionContent}>
            정보주체는 꿈결에 대해 언제든지 다음 각 호의 개인정보 보호 관련 권리를 행사할 수 있습니다:{'\n\n'}
            • 개인정보 처리현황 통지요구{'\n'}
            • 개인정보 열람요구{'\n'}
            • 개인정보 정정·삭제요구{'\n'}
            • 개인정보 처리정지요구{'\n\n'}
            제1항에 따른 권리 행사는 꿈결에 대해 서면, 전화, 전자우편, 모사전송(FAX) 등을 통하여 하실 수 있으며 꿈결은 이에 대해 지체없이 조치하겠습니다.{'\n\n'}
            정보주체가 개인정보의 오류 등에 대한 정정 또는 삭제를 요구한 경우에는 꿈결은 정정 또는 삭제를 완료할 때까지 당해 개인정보를 이용하거나 제공하지 않습니다.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>7. 개인정보의 안전성 확보조치</Text>
          <Text style={styles.sectionContent}>
            꿈결은 개인정보의 안전성 확보를 위해 다음과 같은 조치를 취하고 있습니다:{'\n\n'}
            • 관리적 조치: 내부관리계획 수립·시행, 정기적 직원 교육 등{'\n'}
            • 기술적 조치: 개인정보처리시스템 등의 접근권한 관리, 접근통제시스템 설치, 고유식별정보 등의 암호화, 보안프로그램 설치{'\n'}
            • 물리적 조치: 전산실, 자료보관실 등의 접근통제
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>8. 개인정보 보호책임자</Text>
          <Text style={styles.sectionContent}>
            꿈결은 개인정보 처리에 관한 업무를 총괄해서 책임지고, 개인정보 처리와 관련한 정보주체의 불만처리 및 피해구제 등을 위하여 아래와 같이 개인정보 보호책임자를 지정하고 있습니다:{'\n\n'}
            <Text style={styles.boldText}>개인정보 보호책임자</Text>{'\n'}
            • 성명: 김꿈결{'\n'}
            • 연락처: privacy@dreamtracer.com{'\n'}
            • 전화번호: 02-1234-5678{'\n\n'}
            정보주체께서는 꿈결의 서비스를 이용하시면서 발생한 모든 개인정보 보호 관련 문의, 불만처리, 피해구제 등에 관한 사항을 개인정보 보호책임자 및 담당부서로 문의하실 수 있습니다.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>9. 개인정보 처리방침의 변경</Text>
          <Text style={styles.sectionContent}>
            이 개인정보 처리방침은 시행일로부터 적용되며, 법령 및 방침에 따른 변경내용의 추가, 삭제 및 정정이 있는 경우에는 변경사항의 시행 7일 전부터 공지사항을 통하여 고지할 것입니다.
          </Text>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            본 개인정보 처리방침은 2024년 1월 1일부터 시행됩니다.
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
  boldText: {
    fontWeight: 'bold',
    color: '#FFDDA8', // Starlight Gold
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

export default PrivacyPolicyScreen;
