// src/components/Header.js
import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './Header.css';
import Cookies from 'js-cookie';

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const isHome = location.pathname === '/';
  const isHostPage = location.pathname === '/host';

  const handleBackClick = () => {
    navigate(-1); // 이전 페이지로 이동
  };

  const logout = () => {
    const keys = ['user_id', 'username', 'login_id', 'role', 'phone_number'];
    keys.forEach((k) => Cookies.remove(k, { path: '/' }));
    navigate('/login');
  };

  // 🔹 로고 클릭 시 조건부 이동
  const handleLogoClick = (e) => {
    e.preventDefault(); // <Link> 기본 동작 방지
    const role = Cookies.get('role'); // 쿠키에서 role 값 가져오기

    if (role === 'HOST') {
      navigate('/host'); // HOST이면 HostDashboard로 이동
    } else {
      navigate('/'); // 그 외는 Home으로 이동
    }
  };

  return (
    <header className="main-header">
      <div className="header-container">
        {/* 왼쪽 영역 */}
        <div className="left-space">
          {!isHome && !isHostPage &&(
            <button className="back-btn" onClick={handleBackClick}>
              ←
            </button>
          )}
        </div>

        {/* 중앙 이미지 */}
        <Link to="/" onClick={handleLogoClick}>
          <img src="/images/logo_r.png" alt="STAYJ Logo" className="center-logo"/>
        </Link>

        {/* 오른쪽 영역: 로그아웃 + 마이페이지 */}
        <div className="right-space">
          <button className="logout-btn" onClick={logout}>
            로그아웃
          </button>
          <Link to="/guest" className="mypage-button">
            <img src="/images/profile.png" alt="프로필" className="guest-profile-icon" />
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;
