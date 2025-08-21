import React, { useState } from 'react';
import './GuestPage.css';

// Mock 데이터
const mockUserData = {
  id: 1,
  username: "김제주",
  login_id: "jeju_lover",
  role: "GUEST",
  phone_number: "010-1234-5678"
};

const mockReservations = [
  {
    id: 1,
    room_id: 101,
    guesthouse: {
      id: 1,
      name: "제주도의 한옥"
    },
    check_in_date: "2025-09-18",
    check_out_date: "2025-09-21",
    people_count: 2,
    review: {
      id: 1,
      rating: 5,
      comment: "정말 편안하고 좋았습니다. 한옥의 정취를 제대로 느낄 수 있었어요!"
    }
  },
  {
    id: 2,
    room_id: 203,
    guesthouse: {
      id: 2,
      name: "바닷가 전망 게스트하우스"
    },
    check_in_date: "2025-12-15",
    check_out_date: "2025-12-17",
    people_count: 3,
    review: null
  },
  {
    id: 3,
    room_id: 105,
    guesthouse: {
      id: 3,
      name: "도심 속 편안한 쉼터"
    },
    check_in_date: "2024-10-05",
    check_out_date: "2024-10-07",
    people_count: 1,
    review: {
      id: 2,
      rating: 4,
      comment: "위치가 좋고 깨끗했습니다."
    }
  }
];

const GuestPage = () => {
  const [userData, setUserData] = useState(mockUserData);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    username: userData.username,
    phone_number: userData.phone_number,
    password: ""
  });

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

  const handleSave = () => {
    // API 호출 시뮬레이션
    setUserData(prev => ({
      ...prev,
      username: editForm.username,
      phone_number: editForm.phone_number
    }));
    setIsEditing(false);
    alert('정보가 수정되었습니다.');
  };

  const handleCancelReservation = (reservationId, checkInDate) => {
    const today = new Date();
    const checkIn = new Date(checkInDate);
    
    if (checkIn <= today) {
      alert('체크인 후에는 예약을 취소할 수 없습니다.');
      return;
    }

    const confirmCancel = window.confirm('정말로 예약을 취소하시겠습니까?');
    if (confirmCancel) {
      // API 호출 시뮬레이션 - DELETE /reservations/{reservation-id}
      alert(`예약 #${reservationId}이 취소되었습니다.`);
      // 실제로는 예약 목록을 다시 불러와야 함
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
        <h2 className="section-title">예약 내역</h2>
        
        {mockReservations.length === 0 ? (
          <div className="no-reservations">
            <p>아직 예약 내역이 없습니다.</p>
          </div>
        ) : (
          <div className="reservations-container">
            {mockReservations.map((reservation) => (
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
                      <p>{reservation.people_count}명</p>
                    </div>
                    <button
                      onClick={() => handleCancelReservation(reservation.id, reservation.check_in_date)}
                      className={`cancel-btn ${!isReservationCancelable(reservation.check_in_date) ? 'disabled' : ''}`}
                      disabled={!isReservationCancelable(reservation.check_in_date)}
                    >
                      {isReservationCancelable(reservation.check_in_date) ? '예약 취소' : '취소 불가'}
                    </button>
                  </div>
                </div>

                <div className="reservation-dates">
                  <div className="date-item">
                    <p>체크인</p>
                    <p>{formatDate(reservation.check_in_date)}</p>
                  </div>
                  <div className="date-item">
                    <p>체크아웃</p>
                    <p>{formatDate(reservation.check_out_date)}</p>
                  </div>
                </div>

                {/* 리뷰 섹션 */}
                {reservation.review ? (
                  <div className="review-section">
                    <div className="review-header">
                      <h4 className="review-title">내 리뷰</h4>
                      <span className="review-rating">
                        {renderStars(reservation.review.rating)} {reservation.review.rating}/5
                      </span>
                    </div>
                    <p className="review-comment">
                      {reservation.review.comment}
                    </p>
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