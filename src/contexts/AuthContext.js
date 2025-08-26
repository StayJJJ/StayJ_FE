import { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie'; // js-cookie 임포트

// AuthContext를 생성합니다.
export const AuthContext = createContext({
  isLoggedIn: false,
  login: () => {},
  logout: () => {},
});

// AuthProvider 컴포넌트를 생성하여 로그인 상태와 함수들을 관리합니다.
export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Cookies에서 'authToken'을 확인하여 초기 로그인 상태를 설정합니다.
    const token = Cookies.get('authToken');
    if (token) {
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false);
    }
  }, []);

  // 로그인 함수: 로그인 성공 시 토큰을 쿠키에 저장하고 로그인 상태를 true로 변경합니다.
  const login = (token) => {
    // 백엔드에서 받은 실제 인증 토큰을 'authToken'이라는 이름으로 쿠키에 저장합니다.
    Cookies.set('authToken', token, { expires: 7, path: '/' }); // 7일 유효기간, 모든 경로에서 사용 가능
    setIsLoggedIn(true);
    navigate('/'); // 로그인 후 홈 페이지로 이동
  };

  // 로그아웃 함수: 토큰을 쿠키에서 제거하고 로그인 상태를 false로 변경합니다.
  const logout = () => {
    Cookies.remove('authToken', { path: '/' }); // 쿠키에서 토큰 제거
    setIsLoggedIn(false);
    navigate('/login'); // 로그아웃 후 로그인 페이지로 이동
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, setIsLoggedIn, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// 컨텍스트를 쉽게 사용하기 위한 커스텀 훅
export const useAuth = () => {
  return useContext(AuthContext);
};
