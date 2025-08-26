import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom'; // useLocation 추가
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ReviewModal from './pages/ReviewModal';
import ReservationInfo from './pages/reservationInfo';
import HostDashboard from './pages/host/HostDashboard';
import Reservations from './pages/host/Reservations';
import GuestPage from './pages/GuestPage';
import Header from './components/Header';
import './App.css';

function App() {
  const location = useLocation();

  // 로그인/회원가입 페이지일 때는 Header 숨김
  const hideHeaderPaths = ['/login', '/register'];
  const shouldHideHeader = hideHeaderPaths.includes(location.pathname);

  return (
    <div className="App">
      {!shouldHideHeader && <Header />}  {/* 로그인/회원가입 아니면 Header 보임 */}
      <Routes>
        {/* 기본 페이지들 */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* 게스트 전용 */}
        <Route path="/guest" element={<GuestPage />} />

        {/* 호스트 전용 */}
        <Route path="/host" element={<HostDashboard />} />
        <Route path="/host/:guesthouseId/reservations" element={<Reservations />} />

        {/* 게스트하우스 상세 */}
        <Route path="/detail/:id" element={<ReservationInfo />} />
        <Route path="/reservation" element={<ReservationInfo />} />

        {/* fallback */}
        <Route path="*" element={<Home />} />
      </Routes>
    </div>
  );
}

export default App;
