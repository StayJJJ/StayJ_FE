import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Review from './pages/ReviewModal';
import ReservationInfo from './pages/reservationInfo';

import HostDashboard from './pages/host/HostDashboard';
import Reservations from './pages/host/Reservations';
import './App.css';
import ReviewModal from './pages/ReviewModal';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* 기본 페이지들 */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* 호스트 전용 (우선 가드 없이 연결만) */}
          <Route path="/host" element={<HostDashboard />} />
          <Route path="/host/:guesthouseId/reservations" element={<Reservations />} />

          {/* 없는 경로는 홈으로 */}
          <Route path="*" element={<Navigate to="/" replace />} />

          {/* 게스트하우스 상세 페이지 (예약 정보) */}
          <Route path="/detail/:id" element={<ReservationInfo />} />
          {/* 예약 정보 페이지 (다른 용도로 사용할 경우) */}
          <Route path="/reservation" element={<ReservationInfo />} />

          {/* 404 페이지 - 일치하는 경로가 없을 때 홈으로 리다이렉트 */}
          <Route path="*" element={<Home />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
