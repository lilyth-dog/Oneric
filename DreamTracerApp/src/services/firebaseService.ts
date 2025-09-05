/**
 * Firebase 인증 서비스
 */
import auth from '@react-native-firebase/auth';
// import { GoogleSignin } from '@react-native-google-signin/google-signin';
// import { LoginManager, AccessToken } from 'react-native-fbsdk-next';
import authService from './authService';

class FirebaseService {
  constructor() {
    this.initializeGoogleSignin();
  }

  private initializeGoogleSignin() {
    // GoogleSignin.configure({
    //   webClientId: 'YOUR_WEB_CLIENT_ID', // Firebase Console에서 가져와야 함
    // });
    console.log('Google Sign-in 초기화 (모듈 없음)');
  }

  /**
   * Firebase 이메일/비밀번호 로그인
   */
  async signInWithEmail(email: string, password: string) {
    try {
      const userCredential = await auth().signInWithEmailAndPassword(email, password);
      const idToken = await userCredential.user.getIdToken();
      
      // 백엔드에 Firebase 토큰 전송
      const result = await authService.firebaseAuth(idToken);
      return result;
    } catch (error) {
      console.error('Firebase email sign in error:', error);
      throw error;
    }
  }

  /**
   * Firebase 이메일/비밀번호 회원가입
   */
  async signUpWithEmail(email: string, password: string) {
    try {
      const userCredential = await auth().createUserWithEmailAndPassword(email, password);
      const idToken = await userCredential.user.getIdToken();
      
      // 백엔드에 Firebase 토큰 전송하여 사용자 생성
      const result = await authService.firebaseAuth(idToken);
      return result;
    } catch (error) {
      console.error('Firebase email sign up error:', error);
      throw error;
    }
  }

  /**
   * Google 로그인
   */
  async signInWithGoogle() {
    try {
      // Google 로그인 실행
      // await GoogleSignin.hasPlayServices();
      // const { idToken } = await GoogleSignin.signIn();
      throw new Error('Google Sign-in 모듈이 설치되지 않았습니다');
      
      // Firebase Google 인증
      // const googleCredential = auth.GoogleAuthProvider.credential(idToken);
      // const userCredential = await auth().signInWithCredential(googleCredential);
      // const firebaseToken = await userCredential.user.getIdToken();
      
      // 백엔드에 Firebase 토큰 전송
      // const result = await authService.firebaseAuth(firebaseToken);
      // return result;
    } catch (error) {
      console.error('Google sign in error:', error);
      throw error;
    }
  }

  /**
   * Apple 로그인
   */
  async signInWithApple() {
    try {
      // Apple 로그인 실행 (react-native-apple-authentication 필요)
      // const appleAuthRequestResponse = await appleAuth.performRequest({
      //   requestedOperation: appleAuth.Operation.LOGIN,
      //   requestedScopes: [appleAuth.Scope.EMAIL, appleAuth.Scope.FULL_NAME],
      // });

      // const { identityToken, nonce } = appleAuthRequestResponse;
      // const appleCredential = auth.AppleAuthProvider.credential(identityToken, nonce);
      // const userCredential = await auth().signInWithCredential(appleCredential);
      // const firebaseToken = await userCredential.user.getIdToken();
      
      // 백엔드에 Firebase 토큰 전송
      // const result = await authService.firebaseAuth(firebaseToken);
      // return result;
      
      throw new Error('Apple 로그인은 아직 구현되지 않았습니다');
    } catch (error) {
      console.error('Apple sign in error:', error);
      throw error;
    }
  }

  /**
   * Facebook 로그인
   */
  async signInWithFacebook() {
    try {
      // Facebook 로그인 실행
      // const result = await LoginManager.logInWithPermissions(['public_profile', 'email']);
      throw new Error('Facebook Sign-in 모듈이 설치되지 않았습니다');
      
      // if (result.isCancelled) {
      //   throw new Error('Facebook 로그인이 취소되었습니다');
      // }

      // const data = await AccessToken.getCurrentAccessToken();
      // if (!data) {
      //   throw new Error('Facebook 액세스 토큰을 가져올 수 없습니다');
      // }

      // Firebase Facebook 인증
      // const facebookCredential = auth.FacebookAuthProvider.credential(data.accessToken);
      // const userCredential = await auth().signInWithCredential(facebookCredential);
      // const firebaseToken = await userCredential.user.getIdToken();
      
      // 백엔드에 Firebase 토큰 전송
      // const result2 = await authService.firebaseAuth(firebaseToken);
      // return result2;
    } catch (error) {
      console.error('Facebook sign in error:', error);
      throw error;
    }
  }

  /**
   * 비밀번호 재설정
   */
  async resetPassword(email: string) {
    try {
      await auth().sendPasswordResetEmail(email);
    } catch (error) {
      console.error('Password reset error:', error);
      throw error;
    }
  }

  /**
   * 로그아웃
   */
  async signOut() {
    try {
      await auth().signOut();
      // await GoogleSignin.signOut();
      // await LoginManager.logOut();
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  }

  /**
   * 현재 사용자 정보 가져오기
   */
  getCurrentUser() {
    return auth().currentUser;
  }

  /**
   * 인증 상태 변경 리스너
   */
  onAuthStateChanged(callback: (user: any) => void) {
    return auth().onAuthStateChanged(callback);
  }
}

export default new FirebaseService();
