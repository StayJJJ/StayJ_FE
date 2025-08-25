import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Home.css";

const Home = () => {
  const navigate = useNavigate();
  const [accommodations, setAccommodations] = useState([]);
  const [searchParams, setSearchParams] = useState({
    name: "",
    check_in: "",
    check_out: "",
    people: 1,
  });

  // 검색 API 호출
  const fetchAccommodations = async () => {
    try {
      const response = await axios.get(
        "http://localhost:8080/guesthouse/search",
        {
          params: searchParams,
          headers: { "user-id": 1 },
        }
      );

      console.log("API 응답:", response.data); // 🔹 API 응답 확인
      setAccommodations(response.data);
    } catch (error) {
      console.error("숙소 불러오기 실패:", error);
    }
  };

  useEffect(() => {
    fetchAccommodations();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSearchParams((prev) => ({ ...prev, [name]: value }));
  };

  const handleSearch = () => {
    console.log("검색 클릭:", searchParams);
    fetchAccommodations();
  };

  const handleCardClick = (id) => {
    navigate(`/reservation/${id}`, {
      state: {
        checkIn: searchParams.check_in,
        checkOut: searchParams.check_out,
        guests: searchParams.people
      }
    }); 
  };

  return (
    <div className="home-container">
      {/* Header */}
      <header className="header">
        <img src="/images/logo.png" alt="StayJ 로고" className="logo" />
        <div className="header-right">
          <button className="signup-btn">회원가입</button>
          <img
            src="/images/profile.png"
            alt="프로필"
            className="profile-icon"
            onClick={() => navigate("/guest")}
          />
        </div>
      </header>

      {/* Search Banner */}
      <div
        className="search-banner"
        style={{
          backgroundImage: "url(/images/jeju.png)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          height: "300px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div className="search-box">
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
          />
          <input
            type="date"
            name="check_out"
            value={searchParams.check_out}
            onChange={handleChange}
          />
          <input
            type="number"
            name="people"
            placeholder="인원수"
            value={searchParams.people}
            onChange={handleChange}
          />
          <button onClick={handleSearch}>
            <img src="/images/search.png" alt="검색" className="search-icon" />
          </button>
        </div>
      </div>

      {/* 숙소 카드 리스트 */}
      <div className="card-list">
        {accommodations.length === 0 && (
          <p style={{ textAlign: "center", marginTop: "50px" }}>
            검색 조건에 맞는 숙소가 없습니다.
          </p>
        )}

        {accommodations.map((item) => {
          // 🔹 사진 경로 디버깅
          const imagePath = `/images/guesthouses/${item.photo_id}.png`;
          console.log(`숙소: ${item.name}, 사진 경로: ${imagePath}`);

          return (
            <div
              className="card"
              key={item.id}
              onClick={() => handleCardClick(item.id)}
            >
              <img
                src={imagePath}
                alt={item.name}
                onError={(e) => {
                  // 이미지 없으면 기본 이미지
                  e.target.src = "/images/guesthouses/default.png";
                }}
              />
              {item.isGuestPick && (
                <div className="guest-pick">게스트 선호</div>
              )}
              <div className="card-info">
                <h3>{item.name}</h3>
                <p>⭐ {item.rating ? item.rating.toFixed(1) : "평점 없음"}</p>
                <p>
                  가격:{" "}
                  {item.room_available.length > 0
                    ? `${item.room_available[0]}원~`
                    : "예약 불가"}
                </p>
                <p>방 개수: {item.room_count}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Home;
