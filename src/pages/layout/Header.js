// src/pages/layout/Header.js
import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom'; // ⬅️ Outlet 추가
import Cookies from 'js-cookie';
import './Header.css';

export default function Header() {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const userId = Cookies.get('id') || Cookies.get('Id');
    if (!userId) return;

    const controller = new AbortController();
    (async () => {
      try {
        const res = await fetch(`http://localhost:8080/user/${userId}`, {
          headers: { Accept: 'application/json' },
          signal: controller.signal,
        });
        if (!res.ok) throw new Error(`요청 실패: ${res.status}`);
        const data = await res.json();
        setUserData({
          id: data.id,
          username: data.username,
          loginId: data.login_id ?? data.loginId,
          role: data.role,
          phoneNumber: data.phone_number ?? data.phoneNumber,
        });
      } catch (e) {
        if (e.name !== 'AbortError') console.error(e);
      }
    })();
    return () => controller.abort();
  }, []);

  const logout = () => {
    ['id','Id','username','loginId','login_id','role','phoneNumber','phone_number']
      .forEach(k => Cookies.remove(k, { path: '/' }));
    navigate('/login', { replace: true });
  };

  return (
    <>
      <header className="guest-header">
        <img
          src="/images/logo.png"
          alt="StayJ 로고"
          className="guest-logo"
          onClick={() => navigate('/')}
        />
        <div className="guest-header-right">
          {userData?.username && <span className="guest-username">{userData.username}님</span>}
          <button className="logout-btn" onClick={logout}>로그아웃</button>
          <img src="/images/profile.png" alt="프로필" className="guest-profile-icon" />
        </div>
      </header>

      {/* 헤더 아래에 각 페이지가 렌더링됨 */}
      <main className="page-container">{/* 필요시 상단 패딩을 CSS로 */} 
        <Outlet />
      </main>
    </>
  );
}
