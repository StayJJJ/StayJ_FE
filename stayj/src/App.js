import logo from './logo.svg';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Review from './pages/ReviewModal';

import './App.css';
import ReviewModal from './pages/ReviewModal';

function App() {
  return (
    <div className="App">
      {/* <Home /> */}
      <Home />
    </div>
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