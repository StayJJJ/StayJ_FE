import React, { useState, useEffect } from 'react';
import './GuestPage.css';

// API 기본 URL 설정
const API_BASE_URL = 'http://localhost:8080';

// 공통 에러 처리 함수
const handleApiError = async (response) => {
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API 요청 실패: ${response.status} ${errorText}`);
  }
  return response;
};

// 공통 요청 헤더 생성
const getHeaders = (userId) => ({
  'Content-Type': 'application/json',
  'user-id': userId.toString()
});

// API 서비스 객체
const apiService = {
  // 예약 생성
  createReservation: async (userId, reservationData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/reservation`, {
        method: 'POST',
        headers: getHeaders(userId),
        body: JSON.stringify({
          user_id: userId,
          room_id: reservationData.room_id,
          check_in_date: reservationData.check_in_date,
          check_out_date: reservationData.check_out_date,
          people_count: reservationData.people_count
        })
      });
      
      await handleApiError(response);
      return true;
    } catch (error) {
      console.error('예약 생성 오류:', error);
      throw error;
    }
  },

  // 내 예약 목록 조회
  getMyReservations: async (userId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/reservation/my`, {
        method: 'GET',
        headers: getHeaders(userId)
      });
      
      await handleApiError(response);
      return await response.json();
    } catch (error) {
      console.error('예약 목록 조회 오류:', error);
      throw error;
    }
  },

  // 예약 취소
  cancelReservation: async (userId, reservationId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/${reservationId}`, {
        method: 'DELETE',
        headers: getHeaders(userId)
      });
      
      await handleApiError(response);
      const result = await response.json();
      return result.success;
    } catch (error) {
      console.error('예약 취소 오류:', error);
      throw error;
    }
  },

  // 사용자 정보 조회
  getUserInfo: async (userId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/user/${userId}`, {
        method: 'GET',
        headers: getHeaders(userId)
      });

      // 먼저 상태 확인
      console.log('Response status:', response.status);

      // 텍스트로 확인 (JSON 문자열 그대로)
      const text = await response.text();
      console.log('Raw response text:', text);

      // 에러 처리
      if (!response.ok) {
        throw new Error(`API 요청 실패: ${response.status} ${text}`);
      }

      // JSON으로 파싱
      const data = JSON.parse(text);
      console.log('Parsed JSON:', data);

      return data;
    } catch (error) {
      console.error('사용자 정보 조회 오류:', error);
      throw error;
    }
  },

  // 사용자 정보 수정
  updateUserInfo: async (userId, userInfo) => {
    try {
      const response = await fetch(`${API_BASE_URL}/user-info`, {
        method: 'PUT',
        headers: getHeaders(userId),
        body: JSON.stringify(userInfo), 
        credentials: 'include' // ✅ 쿠키 전송용
      });
      
      await handleApiError(response);
      return await response.json();
    } catch (error) {
      console.error('사용자 정보 수정 오류:', error);
      throw error;
    }
  }
};

// 쿠키에서 값을 가져오는 함수
const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
};

const GuestPage = () => {
  // 쿠키에서 userId 가져오기
  const userId = getCookie('userId') ? parseInt(getCookie('userId')) : null;

  console.log('GuestPage userId:', userId);
  
  const [userData, setUserData] = useState({
    id: userId,
    username: "",
    login_id: "",
    role: "GUEST",
    phone_number: ""
  });
  
  const [reservations, setReservations] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [editForm, setEditForm] = useState({
    username: "",
    phone_number: "",
    password: ""
  });

  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    // userId가 없으면 로그인 페이지로 리다이렉트하거나 에러 처리
    if (!userId) {
      setError('로그인이 필요합니다.');
      return;
    }
    
    loadReservations();
    loadUserData(); // async 함수로 변경됨
  }, [userId]);

  const loadUserData = async () => {
    try {
      const userInfo = await apiService.getUserInfo(userId);

      // API 필드명(camelCase) → 상태 필드명(snake_case) 맞춰서 저장
      setUserData({
        id: userInfo.id,
        username: userInfo.username,
        login_id: userInfo.loginId,      // ✅ loginId → login_id
        role: userInfo.role,
        phone_number: userInfo.phoneNumber // ✅ phoneNumber → phone_number
      });
    } catch (error) {
      console.error('사용자 정보 로드 실패:', error);
      // 실패 시 기본값
      setUserData({
        id: userId,
        username: "사용자",
        login_id: "",
        role: "GUEST",
        phone_number: ""
      });
    }
  };

  const loadReservations = async () => {
    try {
      setLoading(true);
      setError(null);
      const reservationsData = await apiService.getMyReservations(userId);
      setReservations(reservationsData);
    } catch (err) {
      setError(err.message);
      console.error('예약 목록 로드 실패:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    if (!isEditing) {
      setEditForm({
        username: userData.username,
        phone_number: userData.phone_number,
        password: ""
      });
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    try {
      const updateData = {
        username: editForm.username,
        phone_number: editForm.phone_number
      };
      
      // 비밀번호가 입력된 경우에만 포함
      if (editForm.password.trim()) {
        updateData.password = editForm.password;
      }

      await apiService.updateUserInfo(userId, updateData);
      
      // 로컬 상태 업데이트
      setUserData(prev => ({
        ...prev,
        username: editForm.username,
        phone_number: editForm.phone_number
      }));
      
      setIsEditing(false);
      alert('정보가 수정되었습니다.');
    } catch (error) {
      alert('정보 수정에 실패했습니다: ' + error.message);
    }
  };

  const handleCancelReservation = async (reservationId, checkInDate) => {
    const today = new Date();
    const checkIn = new Date(checkInDate);
    
    if (checkIn <= today) {
      alert('체크인 후에는 예약을 취소할 수 없습니다.');
      return;
    }

    const confirmCancel = window.confirm('정말로 예약을 취소하시겠습니까?');
    if (!confirmCancel) return;

    try {
      const success = await apiService.cancelReservation(userId, reservationId);
      
      if (success) {
        alert(`예약 #${reservationId}이 취소되었습니다.`);
        // 예약 목록 다시 로드
        await loadReservations();
      } else {
        alert('예약 취소에 실패했습니다. 체크인 후에는 취소할 수 없습니다.');
      }
    } catch (error) {
      alert('예약 취소 중 오류가 발생했습니다: ' + error.message);
    }
  };

  const isReservationCancelable = (checkInDate) => {
    const today = new Date();
    const checkIn = new Date(checkInDate);
    return checkIn > today;
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ko-KR');
  };

  const renderStars = (rating) => {
    return '⭐'.repeat(Math.floor(rating)) + (rating % 1 ? '⭐' : '');
  };

  // 로딩 상태 처리
  if (loading) {
    return (
      <div className="guest-page-container">
        <div className="loading-container">
          <p>데이터를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  // 에러 상태 처리 (로그인 필요 포함)
  if (error) {
    return (
      <div className="guest-page-container">
        <div className="error-container">
          <p>오류가 발생했습니다: {error}</p>
          {error.includes('로그인') ? (
            <button onClick={() => window.location.href = '/login'} className="login-btn">
              로그인하기
            </button>
          ) : (
            <button onClick={loadReservations} className="retry-btn">
              다시 시도
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="guest-page-container">
      {/* Header */}
      <header className="guest-header">
        <img src="/images/logo.png" alt="StayJ 로고" className="guest-logo" />
        
        <div className="guest-header-right">
          <button className="logout-btn">로그아웃</button>
          <img src="/images/profile.png" alt="프로필" className="guest-profile-icon" />
        </div>
      </header>

      {/* 페이지 제목 */}
      <div className="page-title">
        <h1>게스트 페이지</h1>
        <p>회원 정보와 예약 내역을 확인하세요</p>
      </div>

      {/* 회원 정보 섹션 */}
      <div className="info-section">
        <div className="section-header">
          <h2 className="section-title">회원 정보</h2>
          <button
            onClick={handleEditToggle}
            className={`edit-btn ${isEditing ? 'cancel' : ''}`}
          >
            {isEditing ? '취소' : '수정'}
          </button>
        </div>

        {isEditing ? (
          <div className="user-info-grid">
            <div className="info-item">
              <label>이름</label>
              <input
                type="text"
                name="username"
                value={editForm.username}
                onChange={handleInputChange}
              />
            </div>
            <div className="info-item">
              <label>전화번호</label>
              <input
                type="text"
                name="phone_number"
                value={editForm.phone_number}
                onChange={handleInputChange}
              />
            </div>
            <div className="info-item">
              <label>새 비밀번호</label>
              <input
                type="password"
                name="password"
                value={editForm.password}
                onChange={handleInputChange}
                placeholder="변경하지 않으려면 비워두세요"
              />
            </div>
            <div className="save-btn-container">
              <button onClick={handleSave} className="save-btn">
                저장
              </button>
            </div>
          </div>
        ) : (
          <div className="user-info-grid">
            <div className="info-item">
              <p className="label">이름</p>
              <p className="value">{userData.username}</p>
            </div>
            <div className="info-item">
              <p className="label">로그인 ID</p>
              <p className="value">{userData.login_id}</p>
            </div>
            <div className="info-item">
              <p className="label">전화번호</p>
              <p className="value">{userData.phone_number}</p>
            </div>
            <div className="info-item">
              <p className="label">회원 유형</p>
              <p className="value">
                <span className="role-badge">
                  {userData.role === 'GUEST' ? '게스트' : '호스트'}
                </span>
              </p>
            </div>
          </div>
        )}
      </div>

      {/* 예약 내역 섹션 */}
      <div className="info-section">
        <div className="section-header">
          <h2 className="section-title">예약 내역</h2>
          <button onClick={loadReservations} className="refresh-btn">
            새로고침
          </button>
        </div>
        
        {reservations.length === 0 ? (
          <div className="no-reservations">
            <p>아직 예약 내역이 없습니다.</p>
          </div>
        ) : (
          <div className="reservations-container">
            {reservations.map((reservation) => (
              <div key={reservation.id} className="reservation-card">
                <div className="reservation-header">
                  <div>
                    <h3 className="reservation-title">
                      {reservation.guesthouse.name}
                    </h3>
                    <p className="reservation-id">
                      예약 번호: #{reservation.id}
                    </p>
                  </div>
                  <div className="reservation-actions">
                    <div className="people-count">
                      <p>인원</p>
                      <p>{reservation.peopleCount}명</p>
                    </div>
                    <button
                      onClick={() => handleCancelReservation(reservation.id, reservation.checkInDate)}
                      className={`cancel-btn ${!isReservationCancelable(reservation.checkInDate) ? 'disabled' : ''}`}
                      disabled={!isReservationCancelable(reservation.checkInDate)}
                    >
                      {isReservationCancelable(reservation.checkInDate) ? '예약 취소' : '취소 불가'}
                    </button>
                  </div>
                </div>

                <div className="reservation-dates">
                  <div className="date-item">
                    <p>체크인</p>
                    <p>{formatDate(reservation.checkInDate)}</p>
                  </div>
                  <div className="date-item">
                    <p>체크아웃</p>
                    <p>{formatDate(reservation.checkOutDate)}</p>
                  </div>
                </div>

                {/* 리뷰 섹션 */}
                {reservation.reviewed ? (
                  <div className="review-section">
                    <div className="review-header">
                      <h4 className="review-title">리뷰 작성됨</h4>
                      <span className="review-status">✅ 완료</span>
                    </div>
                  </div>
                ) : (
                  <div className="no-review">
                    <p>아직 리뷰를 작성하지 않았습니다.</p>
                    <button className="write-review-btn">
                      리뷰 작성하기
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default GuestPage;