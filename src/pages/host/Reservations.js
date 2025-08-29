// src/pages/host/Reservations.js
import { useEffect, useState } from 'react';
import { getUserInfo } from '../../util/auth';
import { useParams, useNavigate } from 'react-router-dom';
import { getReservationsByGuesthouse } from '../../api/hosts';
import './Reservations.css';

export default function Reservations() {
  const navigate = useNavigate();

  // 로그인 및 권한 체크
  useEffect(() => {
    const { user_id, role } = getUserInfo();
    if (!user_id) {
      navigate('/login');
    } else if (role !== 'HOST') {
      navigate('/');
    }
  }, [navigate]);

  const { guesthouseId } = useParams();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('upcoming'); // upcoming | past

  // 데이터 불러오기
  useEffect(() => {
    if (!guesthouseId) return;
    (async () => {
      try {
        setLoading(true);
        setError('');
        const data = await getReservationsByGuesthouse(guesthouseId);
        setRows(data || []);
      } catch (e) {
        setError('예약을 불러오지 못했습니다.');
      } finally {
        setLoading(false);
      }
    })();
  }, [guesthouseId]);

  if (!guesthouseId) return <div className="muted">guesthouseId가 필요합니다.</div>;

  // 오늘 날짜 (yyyy-mm-dd)
  const today = new Date().toISOString().split('T')[0];

  // 예정된 예약: 체크인 빠른 순
  const upcoming = rows
    .filter(r => r.check_out_date >= today)
    .sort((a, b) => new Date(a.check_in_date) - new Date(b.check_in_date));

  // 지난 예약: 체크아웃 최근 순
  const past = rows
    .filter(r => r.check_out_date < today)
    .sort((a, b) => new Date(b.check_out_date) - new Date(a.check_out_date));

  const currentRows = activeTab === 'upcoming' ? upcoming : past;

  return (
    <div className="host-wrap">
      <div style={{ marginBottom: '20px' }}>
        <h2 style={{ margin: '0 0 12px 0' }}>예약 내역</h2>

        {/* 탭 버튼 */}
        <div className="tabs">
          <button
            className={`tab-btn ${activeTab === 'upcoming' ? 'active' : ''}`}
            onClick={() => setActiveTab('upcoming')}
          >
            예정된 예약
          </button>
          <button
            className={`tab-btn ${activeTab === 'past' ? 'active' : ''}`}
            onClick={() => setActiveTab('past')}
          >
            지난 예약
          </button>
        </div>
      </div>

      {loading && <div className="muted">로딩 중…</div>}
      {error && <div className="error">{error}</div>}

      {/* PC: 테이블 */}
      <table className="table">
        <thead>
          <tr>
            <th>ID</th>
            <th>게스트</th>
            <th>방 이름</th>
            <th>체크인</th>
            <th>체크아웃</th>
            <th>인원</th>
          </tr>
        </thead>
        <tbody>
          {currentRows.map((r) => (
            <tr key={r.id}>
              <td>{r.id}</td>
              <td>{r.guest?.username ?? '-'}</td>
              <td>{r.room_name ?? '-'}</td>
              <td>{r.check_in_date}</td>
              <td>{r.check_out_date}</td>
              <td>{r.people_count}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* 모바일: 카드 */}
      <div className="res-list">
        {currentRows.map((r) => (
          <div className="res-card" key={r.id}>
            <div className="title">{r.room_name ?? '-'}</div>
            <div className="row">게스트: {r.guest?.username ?? '-'}</div>
            <div className="row">체크인: {r.check_in_date}</div>
            <div className="row">체크아웃: {r.check_out_date}</div>
            <div className="row">인원: {r.people_count}</div>
          </div>
        ))}
      </div>

      {!loading && currentRows.length === 0 && (
        <div className="muted">예약이 없습니다.</div>
      )}
    </div>
  );
}
