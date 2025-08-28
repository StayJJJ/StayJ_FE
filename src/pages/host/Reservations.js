// 예약 관리

// src/pages/host/Reservations.js
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getReservationsByGuesthouse } from '../../api/hosts';
import './Reservations.css';

export default function Reservations() {
  const { guesthouseId } = useParams();
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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

  return (
    <div className="host-wrap">
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
        <h2 style={{ margin: 0 }}>예약 내역</h2>
      </div>
      {loading && <div className="muted">로딩 중…</div>}
      {error && <div className="error">{error}</div>}

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
          {rows.map((r) => {
            const checkIn = r.check_in_date;
            const checkOut = r.check_out_date;
            const people = r.people_count;
            const roomName = r.room_name;
            return (
              <tr key={r.id}>
                <td>{r.id}</td>
                <td>{r.guest?.username ?? '-'}</td>
                <td>{roomName ?? '-'}</td>
                <td>{checkIn}</td>
                <td>{checkOut}</td>
                <td>{people}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {rows.length === 0 && !loading && <div className="muted">예약이 없습니다.</div>}
    </div>
  );
}