import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './reservationInfo.css';
import { useLocation } from 'react-router-dom';
import axios from 'axios';

// 임시 API 데이터 (실제 구현시 fetch로 대체)
const mockApiData = {
  1: {
    guesthouse: {
      id: 1,
      name: "제주도의 한옥",
      description: "전통 한옥의 아름다움과 제주도의 자연이 어우러진 특별한 숙소입니다. 제주도 구좌읍에 위치한 전통 한옥 게스트하우스입니다. 아름다운 정원과 함께 한국의 전통미를 느낄 수 있는 특별한 공간입니다.",
      address: "제주시 구좌읍",
      rating: 4.5,
      photos_url: "/images/jeju.png",
      room_count: 3
    },
    rooms: [
      { id: 1, name: "대청마루방", capacity: 2, price: 100000 },
      { id: 2, name: "사랑채방", capacity: 4, price: 130000 },
      { id: 3, name: "별채방", capacity: 3, price: 120000 }
    ],
    reviews: [
      { id: 1, reservation_id: 101, rating: 5, comment: "정말 아름다운 한옥이었습니다. 정원도 잘 가꿔져 있고 조용해서 힐링하기 좋았어요.", created_at: "2023-08-15T10:30:00Z" },
      { id: 2, reservation_id: 102, rating: 4, comment: "전통 한옥의 매력을 느낄 수 있었습니다. 다만 화장실이 조금 불편했어요.", created_at: "2023-08-10T14:20:00Z" },
      { id: 3, reservation_id: 103, rating: 5, comment: "가족 여행으로 방문했는데 아이들도 너무 좋아했어요. 사장님도 친절하시고!", created_at: "2023-08-05T09:15:00Z" }
    ]
  },
  2: {
    guesthouse: {
      id: 2,
      name: "바닷가 전망 게스트하우스",
      description: "탁 트인 바다 전망과 함께하는 낭만적인 휴식 공간입니다. 제주도 서쪽 애월읍에 위치한 오션뷰 게스트하우스입니다. 객실에서 바로 보이는 아름다운 바다 전망과 함께 일몰을 감상할 수 있습니다.",
      address: "제주시 애월읍",
      rating: 4.7,
      photos_url: "/images/jeju.png",
      room_count: 3
    },
    rooms: [
      { id: 4, name: "오션뷰 더블룸", capacity: 2, price: 150000 },
      { id: 5, name: "오션뷰 패밀리룸", capacity: 4, price: 180000 },
      { id: 6, name: "스탠다드룸", capacity: 2, price: 120000 }
    ],
    reviews: [
      { id: 4, reservation_id: 104, rating: 5, comment: "바다 전망이 정말 환상적이었어요! 일몰도 너무 아름다웠습니다.", created_at: "2023-08-20T16:45:00Z" },
      { id: 5, reservation_id: 105, rating: 4, comment: "뷰는 좋았는데 방음이 조금 아쉬웠어요. 그래도 전반적으로 만족합니다.", created_at: "2023-08-18T11:30:00Z" }
    ]
  },
  3: {
    guesthouse: {
      id: 3,
      name: "도심 속 편안한 쉼터",
      description: "제주시 중심가에 위치한 접근성이 뛰어난 게스트하우스입니다. 제주시 중심가에 위치하여 관광지 접근이 용이한 게스트하우스입니다. 깔끔하고 모던한 인테리어로 편안한 휴식을 제공합니다.",
      address: "제주시 일도이동",
      rating: 4.3,
      photos_url: "/images/jeju.png",
      room_count: 3
    },
    rooms: [
      { id: 7, name: "스탠다드 싱글", capacity: 1, price: 80000 },
      { id: 8, name: "스탠다드 더블", capacity: 2, price: 110000 },
      { id: 9, name: "디럭스 트윈", capacity: 3, price: 130000 }
    ],
    reviews: [
      { id: 6, reservation_id: 106, rating: 4, comment: "위치가 정말 좋아요. 시내 중심가라 이동하기 편했습니다.", created_at: "2023-08-25T13:20:00Z" },
      { id: 7, reservation_id: 107, rating: 4, comment: "깔끔하고 직원분들이 친절해요. 다음에 또 이용하고 싶습니다.", created_at: "2023-08-22T08:45:00Z" },
      { id: 8, reservation_id: 108, rating: 5, comment: "가성비 최고! 시설도 깔끔하고 서비스도 좋았어요.", created_at: "2023-08-20T19:30:00Z" }
    ]
  }
};

const ReservationInfo = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  // 🔥 수정된 부분: location.state에서 검색 정보 받아오기
  const { checkIn, checkOut, guests } = location.state || {};
  
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [guestData, setGuestData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reservationLoading, setReservationLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const data = mockApiData[parseInt(id)];
        if (data) {
          setGuestData(data);
          setSelectedRoom(data.rooms[0]); 
        }

        setLoading(false);
      } catch (error) {
        console.error("데이터 로딩 실패:", error);
        setLoading(false);
      }
    };

    fetchData();
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
      console.log("selectedRoom:", selectedRoom);
      console.log("checkIn:", checkIn);     
      console.log("checkOut:", checkOut);
      console.log("guests:", guests);

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
        user_id: parseInt(userId), // 쿠키에서 가져온 user_id 사용
        room_id: selectedRoom.id,
        check_in_date: checkIn,
        check_out_date: checkOut,
        people_count: guests
      };

      console.log("예약 요청 데이터:", reservationData);

      const response = await axios.post(
        'http://localhost:8080/reservation',
        reservationData,
        {
          headers: {
            'Content-Type': 'application/json',
            'user-id': userId // 쿠키에서 가져온 user_id를 헤더로 전송
          }
        }
      );

      console.log("예약 성공:", response.data);

      // 예약 성공 시 확인 메시지와 함께 홈으로 이동
      alert(`예약이 완료되었습니다!\n예약 번호: ${response.data.reservation_id || 'N/A'}`);
      navigate('/', { 
        state: { 
          message: '예약이 성공적으로 완료되었습니다.' 
        }
      });

    } catch (error) {
      console.error("예약 실패:", error);
      
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

  // 🔥 추가된 부분: 총 숙박일수 계산
  const calculateNights = () => {
    if (!checkIn || !checkOut) return 0;
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // 🔥 추가된 부분: 총 가격 계산
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
      day: 'numeric'
    });
  };

  const renderStars = (rating) => {
    return '★'.repeat(rating) + '☆'.repeat(5 - rating);
  };

  if (loading) {
    return (
      <div className="reservation-container">
        <div className="loading">데이터를 불러오는 중...</div>
      </div>
    );
  }

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
        <img src={guesthouse.photos_url} alt={guesthouse.name} className="main-image" />
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
              {rooms.map((room) => (
                <div
                  key={room.id}
                  className={`room-card ${selectedRoom?.id === room.id ? 'selected' : ''}`}
                  onClick={() => handleRoomSelect(room)}
                >
                  <img src={guesthouse.photos_url} alt={room.name} className="room-image" />
                  <div className="room-info">
                    <h3>{room.name}</h3>
                    <p className="room-capacity">👥 최대 {room.capacity}명</p>
                    <p className="room-price">₩{room.price.toLocaleString()}/박</p>
                  </div>
                  {selectedRoom?.id === room.id && <div className="selected-badge">선택됨</div>}
                </div>
              ))}
            </div>
          </div>

          {/* Description Section */}
          <div className="description-section">
            <h2>숙소 소개</h2>
            <p className="guesthouse-description">{guesthouse.description}</p>
          </div>

          {/* Reviews Section */}
          <div className="reviews-section">
            <h2>후기 ({reviews.length}개)</h2>
            <div className="reviews-list">
              {reviews.length === 0 ? (
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

              {/* 🔥 추가된 부분: 총 가격 표시 */}
              {checkIn && checkOut && (
                <div className="total-price-section">
                  <div className="price-breakdown">
                    <p>₩{selectedRoom.price.toLocaleString()} × {calculateNights()}박</p>
                    <p className="total-price">총 합계: ₩{calculateTotalPrice().toLocaleString()}</p>
                  </div>
                </div>
              )}

              <div className="booking-form">
                <button 
                  className="reserve-btn" 
                  onClick={handleReserve}
                  disabled={reservationLoading}
                >
                  {reservationLoading ? '예약 중...' : '예약하기'}
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