// src/pages/Home.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Home.css';

const Home = () => {
  const navigate = useNavigate();
  const [accommodations, setAccommodations] = useState({
    jeju: [],
    seogwipo: [],
    other: [],
  });

  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);

  const formatDate = (date) => {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const [searchParams, setSearchParams] = useState({
    name: '',
    check_in: formatDate(today),
    check_out: formatDate(tomorrow),
    people: 1,
  });
  // 검색 버튼을 눌렀을 때의 값만 저장
  const [confirmedParams, setConfirmedParams] = useState({
    name: '',
    check_in: formatDate(today),
    check_out: formatDate(tomorrow),
    people: 1,
  });

  useEffect(() => {
    fetchAccommodations();
  }, []);

  const fetchAccommodations = async () => {
    try {
      const response = await axios.get('http://localhost:8080/guesthouse/search', {
        params: searchParams,
        headers: { 'user-id': 1 },
      });

      // ✅ 지역별 분류
      const jeju = [];
      const seogwipo = [];
      const other = [];

      response.data.forEach((item) => {
        if (item.address?.includes('제주시')) {
          jeju.push(item);
        } else if (item.address?.includes('서귀포시')) {
          seogwipo.push(item);
        } else {
          other.push(item);
        }
      });

      setAccommodations({ jeju, seogwipo, other });
    } catch (error) {
      console.error('숙소 불러오기 실패:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSearchParams((prev) => ({ ...prev, [name]: value }));
  };

  const handleSearch = () => {
    const checkInDate = new Date(searchParams.check_in);
    const checkOutDate = new Date(searchParams.check_out);
    if (Number(searchParams.people) < 1) {
      alert('인원수는 1명 이상이어야 합니다. \n다시 입력해주세요.');
      return;
    }
    if (checkInDate >= checkOutDate) {
      alert('체크아웃 날짜는 체크인 날짜보다 반드시 늦어야 합니다.\n\n체크인/체크아웃 날짜를 다시 선택해 주세요.');
      return;
    }
    setConfirmedParams({ ...searchParams });
    fetchAccommodations();
  };

  const handleCardClick = (id) => {
    navigate(`/detail/${id}`, {
      state: {
        checkIn: confirmedParams.check_in,
        checkOut: confirmedParams.check_out,
        guests: confirmedParams.people,
        name: confirmedParams.name,
      },
    });
  };

  // ✅ 카드 UI (재사용)
  const renderCards = (list) => {
    if (list.length === 0) {
      return <p className="no-result">검색 조건에 맞는 숙소가 없습니다.</p>;
    }

    return (
      <div className="card-scroll-container">
        {list.map((item) => {
          const imagePath = `http://localhost:8080/images/guesthouses/${item.photo_id}.png`;
          return (
            <div className="card" key={item.id} onClick={() => handleCardClick(item.id)}>
              <img
                src={imagePath}
                alt={item.name}
                onError={(e) => {
                  e.target.src = `http://localhost:8080/images/guesthouses/default.png`;
                }}
              />
              {item.isGuestPick && <div className="guest-pick">게스트 선호</div>}
              <div className="card-info">
                <span className="card-title">{item.name}</span>
                <span className="card-rating">⭐ {item.rating ? item.rating.toFixed(1) : '평점 없음'}</span>
                <div className="card-meta">
                  <span className="card-price">
                    {item.room_available.length > 0 ? `💸 \\${Number(item.min_price).toLocaleString()} ~` : '예약 불가'}
                  </span>
                  <span className="card-room">🛏️ {item.room_count}개</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="home-container">
      {/* 🔹 배경 배너 */}
      <div
        className="search-banner"
        style={{
          backgroundImage: `url(/images/background3.jpg)`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          width: '100%',
          height: '500px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
        }}
      >
        <div
          className="banner-overlay"
          style={{
            position: 'absolute',
            left: '30px',
            bottom: '30px',
            color: 'white',
            textAlign: 'left',
            display: 'flex',
            flexDirection: 'column',
            gap: '15px',
          }}
        >
          <h1 className="banner-title">제주 게스트하우스 예약</h1>
          <p className="banner-subtitle">편리하고 간편한 예약 시스템</p>

          {/* 검색 박스 */}
          <div className="search-box-container">
            <form
              className="search-box"
              style={{ display: 'flex', gap: '10px' }}
              onSubmit={(e) => {
                e.preventDefault();
                handleSearch();
              }}
            >
              <input
                type="text"
                name="name"
                placeholder="게스트하우스 이름"
                value={searchParams.name}
                onChange={handleChange}
              />
              <input type="date" name="check_in" value={searchParams.check_in} onChange={handleChange} />
              <input type="date" name="check_out" value={searchParams.check_out} onChange={handleChange} />
              <input
                type="number"
                name="people"
                placeholder="인원수"
                value={searchParams.people}
                onChange={handleChange}
              />
              <button type="submit">
                <img src="/images/search.png" alt="검색" className="search-icon" />
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* 지역별 섹션 */}
      <section className="region-section">
        <h2>🏙 제주시</h2>
        {renderCards(accommodations.jeju)}
      </section>

      <section className="region-section">
        <h2>🌊 서귀포시</h2>
        {renderCards(accommodations.seogwipo)}
      </section>

      <section className="region-section">
        <h2>🏝 기타 지역</h2>
        {renderCards(accommodations.other)}
      </section>
    </div>
  );
};

export default Home;
