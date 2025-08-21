import React, { useState } from 'react';
import './Login.css'; // CSS 파일 임포트

// API 모듈을 임포트한다고 가정
// import { login } from '../../api/authApi';

const LoginPage = () => {
  // 아이디와 비밀번호 상태 관리
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');

  // 로그인 버튼 클릭 핸들러
  const handleLogin = async () => {
    // API 통신 로직 (주석 처리)
    /*
    try {
      const result = await login(loginId, password);
      if (result.token) {
        // 로그인 성공 시 로직
        alert('로그인 성공!');
        // 예: 토큰 저장, 페이지 이동
      } else {
        // 로그인 실패 시 로직
        alert('로그인 실패: 아이디 또는 비밀번호를 확인해주세요.');
      }
    } catch (error) {
      alert('로그인 중 오류가 발생했습니다.');
    }
    */
    
    // 개발 테스트를 위한 임시 알림
    console.log('로그인 시도:', { loginId, password });
    alert('로그인 시도 중입니다. (API 연동 필요)');
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="logo-section">
          <img src="/images/logo.png" alt="StayJ 로고" className="stayj-logo" />
          <p className="slogan1">스테이제이, 제주를 담다</p>
          <p className="slogan2">오늘의 쉼을 가장 제주답게</p>
        </div>
        
        <div className="form-section">
          <input
            type="text"
            placeholder="아이디"
            value={loginId}
            onChange={(e) => setLoginId(e.target.value)}
            className="login-input"
          />
          <input
            type="password"
            placeholder="비밀번호"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="login-input"
          />
          <button className="login-button" onClick={handleLogin}>
            로그인
          </button>
        </div>
        
        <div className="links-section">
          <a href="/register-host" className="link-text">호스트 회원가입</a>
          <span className="divider"></span>
          <a href="/register-guest" className="link-text">게스트 회원가입</a>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;