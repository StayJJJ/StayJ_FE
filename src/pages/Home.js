// src/pages/Home.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserInfo } from '../util/auth';
import axios from 'axios';
import './Home.css';

const Home = () => {
  const navigate = useNavigate();
  useEffect(() => {
    const { user_id, role } = getUserInfo();
    if (!user_id) {
      navigate('/login');
    } else if (role === 'HOST') {
      navigate('/host');
    }
  }, [navigate]);
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

  // localStorage에서 검색 조건 불러오기
  const getInitialParams = () => {
    const saved = localStorage.getItem('stayj_search');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // 날짜 유효성 체크 (오늘 이전이면 오늘/내일로)
        const todayStr = formatDate(today);
        const tomorrowStr = formatDate(tomorrow);
        return {
          name: parsed.name || '',
          check_in: parsed.check_in >= todayStr ? parsed.check_in : todayStr,
          check_out: parsed.check_out >= todayStr ? parsed.check_out : tomorrowStr,
          people: parsed.people > 0 ? parsed.people : 1,
        };
      } catch {
        // 파싱 실패 시 기본값
        return {
          name: '',
          check_in: formatDate(today),
          check_out: formatDate(tomorrow),
          people: 1,
        };
      }
    }
    return {
      name: '',
      check_in: formatDate(today),
      check_out: formatDate(tomorrow),
      people: 1,
    };
  };

  const [searchParams, setSearchParams] = useState(getInitialParams);
  // 검색 버튼을 눌렀을 때의 값만 저장
  const [confirmedParams, setConfirmedParams] = useState(getInitialParams);

  const [sortTypes, setSortTypes] = useState({
    jeju: 'default',
    seogwipo: 'default',
    other: 'default',
  });

  const [sortedAccommodations, setSortedAccommodations] = useState(accommodations);

  useEffect(() => {
    fetchAccommodations();
  }, []);

  useEffect(() => {
    // 모든 지역 정렬
    const sortFunc = (list, type) => {
      let sorted = [...list];
      switch (type) {
        case 'rating':
          sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
          break;
        case 'review':
          sorted.sort((a, b) => (b.review_count || 0) - (a.review_count || 0));
          break;
        case 'price':
          sorted.sort((a, b) => (a.min_price || 0) - (b.min_price || 0));
          break;
        default:
          break; // default = 추천순
      }
      return sorted;
    };

    setSortedAccommodations({
      jeju: sortFunc(accommodations.jeju, sortTypes.jeju),
      seogwipo: sortFunc(accommodations.seogwipo, sortTypes.seogwipo),
      other: sortFunc(accommodations.other, sortTypes.other),
    });
  }, [accommodations, sortTypes]);

  const fetchAccommodations = async () => {
    try {
      const response = await axios.get('http://localhost:8080/guesthouse/search', {
        params: searchParams,
        headers: { 'user-id': 1 },
      });

      const jeju = [];
      const seogwipo = [];
      const other = [];

      response.data.forEach((item) => {
        if (item.address?.includes('제주시')) jeju.push(item);
        else if (item.address?.includes('서귀포시')) seogwipo.push(item);
        else other.push(item);
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
    const todayDate = new Date(formatDate(new Date()));
    if (Number(searchParams.people) < 1) {
      alert('인원수는 1명 이상이어야 합니다. \n다시 입력해주세요.');
      return;
    }
    if (checkInDate < todayDate || checkOutDate < todayDate) {
      alert('체크인과 체크아웃 날짜는 오늘 또는 오늘 이후만 선택할 수 있습니다.');
      return;
    }
    if (checkInDate >= checkOutDate) {
      alert('체크아웃 날짜는 체크인 날짜보다 반드시 늦어야 합니다.\n\n체크인/체크아웃 날짜를 다시 선택해 주세요.');
      return;
    }
    setConfirmedParams({ ...searchParams });
    // localStorage에 저장
    localStorage.setItem('stayj_search', JSON.stringify(searchParams));
    fetchAccommodations();
  };

  const handleCardClick = (id, roomAvailable) => {
    navigate(`/detail/${id}`, {
      state: {
        checkIn: confirmedParams.check_in,
        checkOut: confirmedParams.check_out,
        guests: confirmedParams.people,
        name: confirmedParams.name,
        roomAvailable: roomAvailable,
      },
    });
  };

  const handleSortChange = (region, type) => {
    setSortTypes((prev) => ({ ...prev, [region]: type }));
  };

  const renderCards = (list) => {
    if (list.length === 0) return <p className="no-result">검색 조건에 맞는 숙소가 없습니다.</p>;

    return (
      <div className="card-scroll-container">
        {list.map((item) => {
          const imagePath = `http://localhost:8080/images/guesthouses/${item.photo_id}.png`;
          return (
            <div className="card" key={item.id} onClick={() => handleCardClick(item.id, item.room_available)}>
              <img
                src={imagePath}
                alt={item.name}
                onError={(e) => (e.target.src = `http://localhost:8080/images/guesthouses/default.png`)}
              />
              {item.isGuestPick && <div className="guest-pick">게스트 선호</div>}
              <div className="card-info">
                <span className="card-title">{item.name}</span>
                <span className="card-rating">⭐ {item.rating ? item.rating.toFixed(1) : '평점 없음'}</span>
                <div className="card-meta">
                  <span className="card-price">
                    {item.room_available.length > 0 ? `💸 ₩${Number(item.min_price).toLocaleString()} ~` : '예약 불가'}
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

  const renderRegionSection = (title, regionKey, list) => (
    <section className="region-section">
      <div className="region-header">
        <h2>{title}</h2>
        <select value={sortTypes[regionKey]} onChange={(e) => handleSortChange(regionKey, e.target.value)}>
          <option value="default">추천순</option>
          <option value="rating">평점순</option>
          <option value="review">리뷰순</option>
          <option value="price">가격순</option>
        </select>
      </div>
      {renderCards(list)}
    </section>
  );

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
            bottom: '20px',
            color: 'white',
            textAlign: 'middle',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <h1 className="banner-title" style={{ fontFamily: 'Sweet' }}>낯선 제주에서 만나는 가장 따뜻한 집</h1>
          <p className="banner-subtitle" style={{ fontFamily: 'Sweet' }}>당신의 자리를 지금 여기서 준비하세요</p>

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
              <input
                type="date"
                name="check_in"
                value={searchParams.check_in}
                onChange={handleChange}
                min={formatDate(today)}
              />
              <input
                type="date"
                name="check_out"
                value={searchParams.check_out}
                onChange={handleChange}
                min={formatDate(today)}
              />
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
      {renderRegionSection('🏙 제주시', 'jeju', sortedAccommodations.jeju)}
      {renderRegionSection('🌊 서귀포시', 'seogwipo', sortedAccommodations.seogwipo)}
      {renderRegionSection('🏝 기타 지역', 'other', sortedAccommodations.other)}
    </div>
  );
};

export default Home;
