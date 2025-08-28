import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './reservationInfo.css';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import { getUserInfo } from '../util/auth';

// API 기본 URL 설정
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/';

// axios 인스턴스 생성
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
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
  const navigate = useNavigate();
  useEffect(() => {
    const { user_id, role } = getUserInfo();
    if (!user_id) {
      navigate('/login');
    } else if (role !== 'GUEST') {
      navigate('/host');
    }
  }, [navigate]);
  const { id } = useParams();
  const location = useLocation();
  useEffect(() => {
    const { user_id, role } = getUserInfo();
    if (!user_id) {
      navigate('/login');
    } else if (role !== 'GUEST') {
      navigate('/host');
    }
  }, [navigate]);

  const { checkIn, checkOut, guests, roomAvailable } = location.state || {};

  const [selectedRoom, setSelectedRoom] = useState(null);
  const [guestData, setGuestData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reservationLoading, setReservationLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // 병렬로 API 호출
        // roomAvailable이 있으면 쿼리로 넘김
        const roomsUrl =
          roomAvailable && Array.isArray(roomAvailable) && roomAvailable.length > 0
            ? `/guesthouse/${id}/rooms?` + roomAvailable.map((rid) => `room_available=${rid}`).join('&')
            : `/guesthouse/${id}/rooms`;
        const [guesthouseResponse, roomsResponse, reviewsResponse] = await Promise.all([
          api.get(`/guesthouse/${id}`),
          api.get(roomsUrl),
          api.get(`/guesthouse/${id}/reviews`),
        ]);

        // API 응답 데이터 구조화 및 검증
        console.log('API 응답 데이터:', {
          guesthouse: guesthouseResponse.data,
          rooms: roomsResponse.data,
          reviews: reviewsResponse.data,
        });

        // rooms API는 특별한 구조: {"room_available": [1,2,...], "rooms": [{...}]}
        const roomsData = roomsResponse.data.rooms || []; // 🔹 rooms 배열 추출
        const availableRooms = Array.isArray(roomsData) ? roomsData : [];

        const guestData = {
          guesthouse: guesthouseResponse.data,
          rooms: availableRooms,
          reviews: Array.isArray(reviewsResponse.data) ? reviewsResponse.data : [],
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

  // 🔥 쿠키에서 user_id 가져오는 함수
  const getCookieValue = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
  };

  // 🔥 수정된 부분: 예약 API 호출
  const handleReserve = async () => {
    // 쿠키에서 user_id 가져오기
    const userId = getCookieValue('user_id');

    if (!userId) {
      alert('로그인이 필요합니다. 로그인 후 다시 시도해주세요.');
      // 로그인 페이지로 리다이렉트하거나 로그인 모달 띄우기
      return;
    }

    // 필수 정보 검증
    if (!selectedRoom || !checkIn || !checkOut || !guests) {
      console.log('selectedRoom:', selectedRoom);
      console.log('checkIn:', checkIn);
      console.log('checkOut:', checkOut);
      console.log('guests:', guests);

      alert('예약에 필요한 정보가 부족합니다. 다시 검색해주세요.');
      return;
    }

    // 인원수 검증
    if (guests > selectedRoom.capacity) {
      alert(`선택하신 객실의 최대 수용 인원은 ${selectedRoom.capacity}명입니다.`);
      return;
    }

    // 날짜 검증
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (checkInDate < today) {
      alert('체크인 날짜는 오늘 이후로 선택해주세요.');
      return;
    }

    if (checkInDate >= checkOutDate) {
      alert('체크아웃 날짜는 체크인 날짜보다 늦어야 합니다.');
      return;
    }

    try {
      setReservationLoading(true);

      const reservationData = {
        room_id: selectedRoom.id,
        check_in_date: checkIn,
        check_out_date: checkOut,
        people_count: guests,
      };

      console.log('예약 요청 데이터:', reservationData);

      const response = await axios.post('http://localhost:8080/reservation', reservationData, {
        headers: {
          'Content-Type': 'application/json',
          'user-id': userId, // 쿠키에서 가져온 user_id를 헤더로 전송
        },
      });

      console.log('예약 성공:', response.data);

      // 예약 성공 시 상세 정보 안내 메시지와 함께 홈으로 이동
      const nights = calculateNights();
      const infoMsg =
        `예약이 완료되었습니다!\n\n` +
        `체크인: ${formatDate(checkIn)}\n` +
        `체크아웃: ${formatDate(checkOut)}\n` +
        `투숙객: ${guests}명\n` +
        `숙박일수: ${nights}박`;
      alert(infoMsg);
      navigate('/', {
        state: {
          message: '예약이 성공적으로 완료되었습니다.',
        },
      });
    } catch (error) {
      console.error('예약 실패:', error);

      // 에러 메시지 처리
      let errorMessage = '예약 중 오류가 발생했습니다.';

      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.status === 400) {
        errorMessage = '예약 정보가 올바르지 않습니다. 다시 확인해주세요.';
      } else if (error.response?.status === 401) {
        errorMessage = '로그인이 만료되었습니다. 다시 로그인해주세요.';
      } else if (error.response?.status === 409) {
        errorMessage = '선택하신 날짜에 이미 예약이 있습니다. 다른 날짜를 선택해주세요.';
      } else if (error.response?.status === 500) {
        errorMessage = '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
      }

      alert(errorMessage);
    } finally {
      setReservationLoading(false);
    }
  };

  // 총 숙박일수 계산
  const calculateNights = () => {
    if (!checkIn || !checkOut) return 0;
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // 총 가격 계산
  const calculateTotalPrice = () => {
    if (!selectedRoom) return 0;
    const nights = calculateNights();
    return selectedRoom.price * nights;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const renderStars = (rating) => {
    return '★'.repeat(Math.floor(rating)) + '☆'.repeat(5 - Math.floor(rating));
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
      {/* Main Image */}
      <div className="main-image-section">
        <img
          src={`http://localhost:8080/images/guesthouses/${guesthouse.photo_id}.png`}
          alt={guesthouse.name}
          className="main-image"
        />
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

          {/* 🔥 추가된 부분: 검색 정보 표시 */}
          {(checkIn || checkOut || guests) && (
            <div className="search-info-display">
              <h3>예약 정보</h3>
              <div className="booking-details">
                {checkIn && <p>체크인: {formatDate(checkIn)}</p>}
                {checkOut && <p>체크아웃: {formatDate(checkOut)}</p>}
                {guests && <p>투숙객: {guests}명</p>}
                {checkIn && checkOut && <p>숙박일수: {calculateNights()}박</p>}
              </div>
            </div>
          )}

          {/* Room Selection */}
          <div className="rooms-section">
            <h2>객실 선택</h2>
            <div className="rooms-grid">
              {Array.isArray(rooms) && rooms.length > 0 ? (
                rooms.map((room) => {
                  // 예약 불가 여부: roomAvailable이 있고, room.id가 포함되어 있지 않으면 불가
                  const isAvailable = !roomAvailable || roomAvailable.includes(room.id);
                  return (
                    <div
                      key={room.id}
                      className={`room-card ${selectedRoom?.id === room.id ? 'selected' : ''} ${
                        !isAvailable ? 'unavailable' : ''
                      }`}
                      onClick={() => isAvailable && handleRoomSelect(room)}
                      style={{ cursor: isAvailable ? 'pointer' : 'not-allowed', position: 'relative' }}
                    >
                      <img
                        src={`http://localhost:8080/images/rooms/${room.photo_id}.png`}
                        alt={room.name}
                        className="room-image"
                        style={{ filter: isAvailable ? 'none' : 'grayscale(80%)', opacity: isAvailable ? 1 : 0.5 }}
                      />
                      <div className="room-info">
                        <h3>{room.name}</h3>
                        <p className="room-capacity">👥 최대 {room.capacity}명</p>
                        <p className="room-price">₩{room.price.toLocaleString()}/박</p>
                      </div>
                      {!isAvailable && (
                        <div
                          style={{
                            position: 'absolute',
                            top: 8,
                            right: 8,
                            color: 'red',
                            fontWeight: 'bold',
                            background: 'white',
                            padding: '2px 8px',
                            borderRadius: '8px',
                            fontSize: '0.9em',
                            border: '1px solid #f55',
                          }}
                        >
                          예약 불가
                        </div>
                      )}
                      {selectedRoom?.id === room.id && isAvailable && <div className="selected-badge">선택됨</div>}
                    </div>
                  );
                })
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

              {/* 총 가격 표시 */}
              {checkIn && checkOut && (
                <div className="total-price-section">
                  <div className="price-breakdown">
                    <p>
                      ₩{selectedRoom.price.toLocaleString()} × {calculateNights()}박
                    </p>
                    <p className="total-price">총 합계: ₩{calculateTotalPrice().toLocaleString()}</p>
                  </div>
                </div>
              )}

              <div className="booking-form">
                <button className="reserve-btn" onClick={handleReserve} disabled={reservationLoading}>
                  {reservationLoading ? '예약 중...' : '예약하기'}
                </button>
              </div>

              <div className="contact-info">
                <h4>문의사항이 있으신가요?</h4>
                <button className="contact-btn" onClick={() => alert('문의는 인스타그램 @bswbsw_00으로 DM 주세요 !')}>
                  호스트에게 문의하기
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReservationInfo;
