아키텍처 다이어그램 (계층 구조)
RootNavigator (인증 상태에 따라 분기)
├── 1. AuthStackNavigator (로그인/가입 플로우)
│   ├── SplashScreen (초기 로딩 및 인증 확인)
│   ├── LoginScreen (소셜/이메일 로그인)
│   ├── OnboardingScreen (서비스 소개 및 가이드)
│   └── NotificationSetupScreen (초기 알림 설정)
│
└── 2. MainTabNavigator (로그인 후 메인 앱)
    ├── Tab 1: 홈 (HomeStackNavigator)
    │   └── HomeScreen (오늘의 마음 상태 대시보드)
    │
    ├── Tab 2: 꿈 일기 (JournalStackNavigator)
    │   ├── DreamListScreen (전체 꿈 목록)
    │   └── DreamDetailScreen (꿈 분석 리포트)
    │
    ├── Tab 3: 패턴 (PatternStackNavigator)
    │   └── PatternDashboardScreen (꿈 패턴 시각화)
    │
    ├── Tab 4: 탐험 (ExploreStackNavigator)
    │   └── SeaOfDreamsScreen (익명 꿈 공유의 바다)
    │
    └── (+) Global FAB (Floating Action Button) -> JournalWriteModalNavigator
        └── JournalWriteScreen (꿈 기록 작성/수정)

        
Global Modals (어디서든 호출 가능)
└── SettingsModalNavigator (설정 플로우)
    ├── SettingsScreen (메인 설정 메뉴)
    ├── ProfileScreen (프로필 관리)
    ├── NotificationSettingsScreen (알림 상세 설정)
    └── DataExportScreen (데이터 내보내기)
1. 루트 네비게이터 (RootNavigator)
역할: 앱의 최상위 관제탑. 사용자의 로그인 상태(JWT 토큰 유무)를 확인하여 AuthStackNavigator 또는 MainTabNavigator 중 하나를 렌더링합니다.

흐름:

SplashScreen에서 로컬 저장소의 토큰 유효성 검사.

유효하면 MainTabNavigator로 즉시 전환.

유효하지 않으면 AuthStackNavigator의 LoginScreen으로 전환.

2. 인증 플로우 (AuthStackNavigator)
역할: 신규 사용자의 온보딩과 기존 사용자의 로그인을 담당하는 스택.

페이지 상세:

SplashScreen: 앱 로고 애니메이션(Lottie)과 함께 비동기 로직(토큰 확인, 기본 설정 로드)을 처리합니다.

LoginScreen: 브랜드 아이덴티티가 담긴 로그인 화면.

OnboardingScreen: 좌우 스와이프로 넘기는 4단계의 온보딩. 완료 후에는 다시 보지 않습니다.

NotificationSetupScreen: 온보딩 마지막 단계. 설정 완료 후 RootNavigator가 MainTabNavigator로 전환하며, 이 스택은 메모리에서 제거되어 뒤로 가기가 불가능해집니다.

3. 메인 앱 플로우 (MainTabNavigator)
역할: 로그인 후 사용자가 경험하게 될 앱의 핵심 기능들을 담는 4개의 탭. 각 탭은 자체적인 이동 경로를 가질 수 있도록 스택 네비게이터로 구성됩니다.

공통 UI: 하단에 4개의 탭 아이콘과 중앙에 꿈 기록을 위한 **플로팅 액션 버튼(FAB)**이 위치합니다.

Tab 1: 홈 (HomeStackNavigator)
컨셉: '하루를 시작하는 명상의 공간'

아이콘: 초승달 아이콘

구조: 단일 페이지 스택.

HomeScreen: 앱의 메인 대시보드. '오늘의 성찰 질문' 카드, 간단한 통계, 헤더에 **설정 아이콘(톱니바퀴)**이 위치합니다. 설정 아이콘 클릭 시 SettingsModalNavigator가 전체 화면 모달로 열립니다.

Tab 2: 꿈 일기 (JournalStackNavigator)
컨셉: '나의 무의식 서재'

아이콘: 펼쳐진 책 아이콘

구조: 목록 -> 상세 페이지로 이어지는 전형적인 스택.

DreamListScreen: 모든 꿈 기록을 최신순으로 보여주는 무한 스크롤 리스트. 각 항목에는 날짜, 제목, 주요 감정 아이콘이 표시됩니다. 항목 클릭 시 DreamDetailScreen으로 이동.

DreamDetailScreen: '꿈 분석 리포트' 페이지. dream_id를 파라미터로 받아 해당 꿈의 상세 분석 내용을 보여줍니다. 분석이 pending 상태일 경우, 로딩 애니메이션을 표시합니다.

Tab 3: 패턴 (PatternStackNavigator)
컨셉: '내면의 지도를 그리다'

아이콘: 별자리 또는 연결된 점 아이콘

구조: 단일 페이지 스택.

PatternDashboardScreen: '감정 달력', '상징 구름' 등 월별/주별 데이터 시각화 차트를 제공합니다. 상징 구름의 태그 클릭 시, 해당 태그가 포함된 꿈 목록을 보여주는 검색 결과 페이지로 이동할 수 있습니다. (향후 확장)

Tab 4: 탐험 (ExploreStackNavigator)
컨셉: '타인과 연결되는 익명의 공간'

아이콘: 나침반 아이콘

구조: 단일 페이지 스택.

SeaOfDreamsScreen: PRD의 '꿈의 바다' 기능. 익명으로 공유된 꿈 조각들이 카드 형태로 무한 스크롤됩니다. 필터링 기능(상징 태그 기준)을 제공하며, PRD 원칙에 따라 '좋아요'나 '댓글' 같은 소셜 기능은 일체 배제합니다.

4. 글로벌 모달 플로우 (Global Modals)
역할: 특정 탭에 종속되지 않고, 앱의 어느 곳에서나 필요할 때 호출되는 기능들을 담당합니다. 주로 화면 전체를 덮는 모달 형태로 제공됩니다.

꿈 기록하기 (JournalWriteModalNavigator)
호출 방식: MainTabNavigator 중앙의 플로팅 액션 버튼(FAB) 클릭.

페이지:

JournalWriteScreen: 꿈을 새로 기록하거나, 기존 꿈(DreamDetailScreen에서 '수정' 버튼 클릭)을 편집하는 페이지. dream_id 유무에 따라 '새 기록' 모드와 '수정' 모드로 분기됩니다. 저장 완료 시 모달이 닫히고, '꿈 일기' 탭으로 이동하여 방금 작성한 기록을 확인할 수 있도록 유도합니다.

설정 (SettingsModalNavigator)
호출 방식: HomeScreen 헤더의 설정 아이콘 클릭.

페이지:

SettingsScreen: '프로필 관리', '알림 설정', '데이터 내보내기' 등 주요 설정 메뉴 리스트.

ProfileScreen, NotificationSettingsScreen, DataExportScreen: 각 메뉴에 해당하는 상세 설정 페이지.