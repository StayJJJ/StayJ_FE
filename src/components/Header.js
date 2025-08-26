// src/components/Header.js
import React from 'react';

import { Link, useLocation, useNavigate } from 'react-router-dom';
import './Header.css';

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const isHome = location.pathname === "/";

  const handleBackClick = () => {
    navigate(-1); // 이전 페이지로 이동
  };

  return (
    <header className="main-header">
      <div className="header-container">
        {/* 왼쪽 영역 */}
        <div className="left-space">
          {!isHome && (
            <button className="back-btn" onClick={handleBackClick}>
              ←
            </button>
          )}
        </div>

        {/* 중앙 텍스트 */}
        <h1 className="center-text">STAYJ</h1>

        {/* 오른쪽 마이페이지 */}
        <Link to="/guest" className="mypage-button">
          마이페이지
        </Link>
      </div>
    </header>
  );
};

export default Header;
