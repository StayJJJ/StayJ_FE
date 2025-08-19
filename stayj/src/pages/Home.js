import React from 'react';
import './Home.css';

const accommodations = [
  {
    id: 1,
    imageUrl: "/images/jeju.png",
    title: "제주도의 한옥",
    date: "2023-08-18 ~ 2023-08-21",
    price: "₩100,000 ~ ₩150,000",
    rating: 4.5,
    isGuestPick: true,
  },
  {
    id: 2,
    imageUrl: "/images/jeju.png",
    title: "바닷가 전망 게스트하우스",
    date: "2023-08-20 ~ 2023-08-23",
    price: "₩120,000 ~ ₩180,000",
    rating: 4.7,
    isGuestPick: false,
  },
  {
    id: 3,
    imageUrl: "/images/jeju.png",
    title: "도심 속 편안한 쉼터",
    date: "2023-08-25 ~ 2023-08-28",
    price: "₩80,000 ~ ₩130,000",
    rating: 4.3,
    isGuestPick: true,
  },
];

const Home = () => {
  return (
    <div className="home-container">
      {/* Header */}
      <header className="header">
        <img src="/images/logo.png" alt="StayJ 로고" className="logo" />
        <div className="profile-icon">👤</div>
      </header>

      {/* Search Banner */}
      <div
        className="search-banner"
        style={{
          backgroundImage: 'url(/images/jeju.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          height: '300px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div className="search-box">
          <input type="text" placeholder="체크인" />
          <input type="text" placeholder="체크아웃" />
          <input type="text" placeholder="인원수" />
          <button>🔍</button>
        </div>
      </div>

      {/* Accommodation Cards */}
      <div className="card-list">
        {accommodations.map((item) => (
          <div className="card" key={item.id}>
            <img src={item.imageUrl} alt={item.title} />
            {item.isGuestPick && <div className="guest-pick">게스트 선호</div>}
            <div className="card-info">
              <h3>{item.title}</h3>
              <p>{item.date}</p>
              <p>{item.price}</p>
              <p>⭐ {item.rating}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Home;
