// import logo from './logo.svg';
// import Home from './pages/Home';
// import Login from './pages/Login';
// import Register from './pages/Register';
// import './App.css';

// function App() {
//   return (
//     <div className="App">
//       {/* <Home /> */}
//       <Home />
//     </div>
//   );
// }

// export default App;

// src/App.js
import { Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';

// 호스트 페이지들 (내가 제공한 최소 버전)
import HostDashboard from './pages/host/HostDashboard';
import Reservations from './pages/host/Reservations';

import './App.css';

function App() {
  return (
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
      </Routes>
    </div>
  );
}

export default App;
