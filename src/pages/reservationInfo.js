import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './reservationInfo.css';

// API 기본 URL 설정
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/';

// axios 인스턴스 생성
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// API 응답 인터셉터 (에러 처리)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API 에러:', error);
    return Promise.reject(error);
  }
);

const ReservationInfo = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [guestData, setGuestData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // 병렬로 API 호출
        const [guesthouseResponse, roomsResponse, reviewsResponse] = await Promise.all([
          api.get(`/guesthouse/${id}`),
          api.get(`/guesthouse/${id}/rooms`),
          api.get(`/guesthouse/${id}/reviews`)
        ]);

        // API 응답 데이터 구조화 및 검증
        console.log('API 응답 데이터:', {
          guesthouse: guesthouseResponse.data,
          rooms: roomsResponse.data,
          reviews: reviewsResponse.data
        });

        // rooms API는 특별한 구조: {"room_available": [1,2,...], "rooms": [{...}]}
        const roomsData = roomsResponse.data.rooms || []; // 🔹 rooms 배열 추출
        const availableRooms = Array.isArray(roomsData) ? roomsData : [];

        const guestData = {
          guesthouse: guesthouseResponse.data,
          rooms: availableRooms,
          reviews: Array.isArray(reviewsResponse.data) ? reviewsResponse.data : []
        };

        setGuestData(guestData);
        
        // 첫 번째 방을 기본 선택
        if (guestData.rooms && guestData.rooms.length > 0) {
          setSelectedRoom(guestData.rooms[0]);
        }
        
      } catch (error) {
        console.error('데이터 로딩 실패:', error);
        setError(error.message || '데이터를 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchData();
    }
  }, [id]);

  const handleBackClick = () => {
    navigate('/');
  };

  const handleRoomSelect = (room) => {
    setSelectedRoom(room);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const renderStars = (rating) => {
    return '★'.repeat(Math.floor(rating)) + '☆'.repeat(5 - Math.floor(rating));
  };

  // 예약 처리 함수 (필요시 추가)
  const handleReservation = async () => {
    try {
      // 예약 데이터 수집
      const reservationData = {
        guesthouse_id: id,
        room_id: selectedRoom.id,
        // 체크인/체크아웃 날짜 등 추가 데이터
      };

      // 예약 API 호출
      const response = await api.post('/reservations', reservationData);
      
      // 성공시 처리
      console.log('예약 성공:', response.data);
      // 예약 완료 페이지로 이동 등
      
    } catch (error) {
      console.error('예약 실패:', error);
      alert('예약 처리 중 오류가 발생했습니다.');
    }
  };

  // 로딩 상태
  if (loading) {
    return (
      <div className="reservation-container">
        <div className="loading">데이터를 불러오는 중...</div>
      </div>
    );
  }

  // 에러 상태
  if (error) {
    return (
      <div className="reservation-container">
        <div className="error">
          <h2>오류가 발생했습니다</h2>
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>다시 시도</button>
          <button onClick={handleBackClick}>홈으로 돌아가기</button>
        </div>
      </div>
    );
  }

  // 데이터가 없는 경우
  if (!guestData) {
    return (
      <div className="reservation-container">
        <div className="not-found">
          <h2>게스트하우스를 찾을 수 없습니다.</h2>
          <button onClick={handleBackClick}>홈으로 돌아가기</button>
        </div>
      </div>
    );
  }

  const { guesthouse, rooms, reviews } = guestData;

  return (
    <div className="reservation-container">
      {/* Header */}
      <header className="reservation-header">
        <button className="back-btn" onClick={handleBackClick}>
          ← 뒤로가기
        </button>
        <img src="/images/logo.png" alt="StayJ 로고" className="logo" />
      </header>

      {/* Main Image */}
      <div className="main-image-section">
        <img src={`/images/guesthouses/${guesthouse.photo_id}.png`} alt={guesthouse.name} className="main-image" />
      </div>

      {/* Content */}
      <div className="reservation-content">
        <div className="reservation-info">
          {/* Title Section */}
          <div className="title-section">
            <h1>{guesthouse.name}</h1>
            <div className="guesthouse-info">
              <span className="rating">⭐ {guesthouse.rating}</span>
              <span className="address">📍 {guesthouse.address}</span>
              <span className="room-count">🏠 {guesthouse.room_count}개 객실</span>
            </div>
          </div>

          {/* Room Selection */}
          <div className="rooms-section">
            <h2>객실 선택</h2>
            <div className="rooms-grid">
              {Array.isArray(rooms) && rooms.length > 0 ? (
                rooms.map((room) => (
                  <div
                    key={room.id}
                    className={`room-card ${selectedRoom?.id === room.id ? 'selected' : ''}`}
                    onClick={() => handleRoomSelect(room)}
                  >
                    <img src={`/images/rooms/${room.photo_id}.png`} alt={room.name} className="room-image" />
                    <div className="room-info">
                      <h3>{room.name}</h3>
                      <p className="room-capacity">👥 최대 {room.capacity}명</p>
                      <p className="room-price">₩{room.price.toLocaleString()}/박</p>
                    </div>
                    {selectedRoom?.id === room.id && <div className="selected-badge">선택됨</div>}
                  </div>
                ))
              ) : (
                <p className="no-rooms">사용 가능한 객실이 없습니다.</p>
              )}
            </div>
          </div>

          {/* Description Section */}
          <div className="description-section">
            <h2>숙소 소개</h2>
            <p className="guesthouse-description">{guesthouse.description}</p>
          </div>

          {/* Reviews Section */}
          <div className="reviews-section">
            <h2>후기 ({Array.isArray(reviews) ? reviews.length : 0}개)</h2>

            {/* Reviews List */}
            <div className="reviews-list">
              {!Array.isArray(reviews) || reviews.length === 0 ? (
                <p className="no-reviews">아직 작성된 후기가 없습니다.</p>
              ) : (
                reviews.map((review) => (
                  <div key={review.id} className="review-item">
                    <div className="review-header">
                      <span className="review-rating">{renderStars(review.rating)}</span>
                      <span className="review-date">{formatDate(review.created_at)}</span>
                    </div>
                    <p className="review-comment">{review.comment}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Booking Card */}
        <div className="booking-card">
          {selectedRoom && (
            <>
              <div className="selected-room-info">
                <h3>{selectedRoom.name}</h3>
                <p className="room-details">최대 {selectedRoom.capacity}명</p>
                <p className="room-price-large">₩{selectedRoom.price.toLocaleString()}</p>
                <small>1박 기준</small>
              </div>

              <div className="booking-form">
                <div className="date-inputs">
                  <div className="input-group">
                    <label>체크인</label>
                    <input type="date" />
                  </div>
                  <div className="input-group">
                    <label>체크아웃</label>
                    <input type="date" />
                  </div>
                </div>
                
                <div className="input-group">
                  <label>인원수</label>
                  <select>
                    {Array.from({length: selectedRoom.capacity}, (_, i) => (
                      <option key={i + 1} value={i + 1}>{i + 1}명</option>
                    ))}
                  </select>
                </div>

                <button className="reserve-btn" onClick={handleReservation}>
                  예약하기
                </button>
              </div>

              <div className="contact-info">
                <h4>문의사항이 있으신가요?</h4>
                <button className="contact-btn">호스트에게 문의하기</button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReservationInfo;