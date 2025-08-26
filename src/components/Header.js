// src/components/Header.js
import React from 'react';
import { Link } from 'react-router-dom';
import './Header.css';

const Header = () => {
  return (
    <header className="main-header">
        <div className="header-container">
            <div className="left-space" /> {/* 왼쪽 공간용 빈 div */}
            <img src="images/logo.png" alt="STAYJ 로고" className="logo" />
            <Link to="/guest" className="mypage-button">마이페이지</Link>
        </div>
    </header>

  );
};

export default Header;
