import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';
import { getUserRoleFromCookie } from '../util/auth';
import './Login.css';

const LoginPage = () => {
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  useEffect(() => {
    const role = getUserRoleFromCookie();
    if (role === 'GUEST') {
      navigate('/');
    } else if (role === 'HOST') {
      navigate('/host');
    }
  }, [navigate]);

  const handleLogin = async () => {
    try {
      const url = 'http://localhost:8080/user/login';
      const bodyData = {
        login_id: loginId,
        password: password,
      };

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bodyData),
      });

      console.log('Hello world:', response);
      if (response.ok) {
        const result = await response.json();
        console.log('Hello world:', result);
        // 모든 필드를 각각 쿠키로 저장 (id -> user_id로 변경)
        Object.entries(result).forEach(([key, value]) => {
          const cookieKey = key === 'id' ? 'user_id' : key;
          Cookies.set(cookieKey, value, { expires: 7, path: '/' });
        });

        // 로그인 성공 후 role에 따라 페이지 이동
        if (result.role === 'GUEST' || result.role === 'guest') {
          navigate('/');
        } else {
          navigate('/host');
        }
      } else {
        alert('로그인 실패: 아이디 또는 비밀번호를 확인해주세요.');
      }
    } catch (error) {
      console.error('로그인 중 오류 발생:', error);
      alert('로그인 중 오류가 발생했습니다. 네트워크 상태를 확인해주세요.');
    }
  };

  // 폼(form) 제출 이벤트 핸들러
  const handleFormSubmit = (e) => {
    e.preventDefault(); // 페이지 새로고침 방지
    handleLogin();
  };

  return (
    <div
      className="login-container"
      style={{
        backgroundImage: 'url("/images/background2.jpg")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        position: 'relative',
      }}
    >
      <div className="login-box">
        <div className="logo-section">
          <img src="/images/logo.png" alt="StayJ 로고" className="stayj-logo" />
          <p className="slogan1">스테이제이, 제주를 담다</p>
          <p className="slogan2">오늘의 쉼을 가장 제주답게</p>
        </div>

        {/* onSubmit 이벤트를 추가한 form 태그로 감싸기 */}
        <form className="form-section" onSubmit={handleFormSubmit}>
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
          <button className="login-button" type="submit">
            {' '}
            {/* type="submit" 설정 */}
            로그인
          </button>
        </form>

        <div className="links-section">
          <a href="/register" className="link-text">
            아직 회원이 아니신가요?
          </a>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
