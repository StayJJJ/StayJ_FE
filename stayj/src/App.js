import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Review from './pages/ReviewModal';
import ReservationInfo from './pages/reservationInfo';
import './App.css';
import ReviewModal from './pages/ReviewModal';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* 홈 페이지 */}
          <Route path="/" element={<Home />} />
          
          {/* 게스트하우스 상세 페이지 (예약 정보) */}
          <Route path="/detail/:id" element={<ReservationInfo />} />
          
          {/* 로그인 페이지 */}
          <Route path="/login" element={<Login />} />
          
          {/* 회원가입 페이지 */}
          <Route path="/register" element={<Register />} />
          
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

// // src/App.js

// import React from 'react';
// import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// import LoginPage from './pages/Auth/LoginPage'; // LoginPage 컴포넌트 임포트

// // 나중에 만들 페이지들
// import Home from './pages/Home';
// import RegisterPage from './pages/Auth/RegisterPage';

// function App() {
//   return (
//     <Router>
//       <Routes>
//         {/* '/' 경로로 접속하면 Home가 보입니다. */}
//         <Route path="/" element={<Home />} />
        
//         {/* '/login' 경로로 접속하면 LoginPage가 보입니다. */}
//         <Route path="/login" element={<LoginPage />} />
        
//         {/* '/register' 경로로 접속하면 RegisterPage가 보입니다. */}
//         <Route path="/register" element={<RegisterPage />} />

//         {/* 경로가 일치하지 않을 경우 404 페이지를 보여줄 수 있습니다. */}
//         {/* <Route path="*" element={<NotFoundPage />} /> */}
//       </Routes>
//     </Router>
//   );
// }

// export default App;
