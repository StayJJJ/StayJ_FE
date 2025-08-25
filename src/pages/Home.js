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

  // 날짜를 YYYY-MM-DD 형식으로 포맷팅하는 함수
  const getFormattedDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // 컴포넌트 마운트 시 오늘, 내일 날짜로 기본값 세팅
  useEffect(() => {
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);

    setSearchParams((prev) => ({
      ...prev,
      check_in: getFormattedDate(today),
      check_out: getFormattedDate(tomorrow),
    }));

    fetchAccommodations();
  }, []);

  const fetchAccommodations = async () => {
    try {
      const response = await axios.get(
        "http://localhost:8080/guesthouse/search",
        {
          params: searchParams,
          headers: { "user-id": 1 },
        }
      );
      setAccommodations(response.data);
    } catch (error) {
      console.error("숙소 불러오기 실패:", error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSearchParams((prev) => ({ ...prev, [name]: value }));
  };

  const handleSearch = () => {
    fetchAccommodations();
  };

  const handleCardClick = (id) => {
    navigate(`/detail/${id}`);
  };

  return (
    <div className="home-container">
      {/* 🔹 배경 배너 (문구만 표시) */}
      <div
        className="search-banner"
        style={{
          backgroundImage: `url(/images/jeju.png)`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          width: "100%",
          height: "500px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
        }}
      >
        <div
          className="banner-overlay"
          style={{
            position: "absolute",
            left: "30px",
            bottom: "30px",
            color: "white",
            textAlign: "left",
            display: "flex",
            flexDirection: "column",
            gap: "20px", // 제목과 검색박스 간 간격 조절
            width: "400px", // 적절한 너비 조절 가능
          }}
        >
          <h1 className="banner-title">제주 게스트하우스 예약</h1>
          <p className="banner-subtitle">편리하고 간편한 예약 시스템</p>

          {/* 여기에 search box 넣기 */}
          <div className="search-box-container" style={{ width: "100%" }}>
            <div className="search-box" style={{ display: "flex", gap: "10px" }}>
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
          const imagePath = `/images/guesthouses/${item.photo_id}.png`;

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
                  e.target.src = "/images/guesthouses/default.png";
                }}
              />
              {item.isGuestPick && <div className="guest-pick">게스트 선호</div>}
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
