// 예약 관리

// src/pages/host/Reservations.js
import { useEffect, useState } from 'react';
import { getReservationsByGuesthouse } from '../../api/hosts';
import './Reservations.css';

export default function Reservations({ guesthouseId: propId }) {
  // 라우터를 쓰면 useParams()로 가져오면 됩니다.
  const [guesthouseId] = useState(propId || null);
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
      <h2>예약 내역</h2>
      {loading && <div className="muted">로딩 중…</div>}
      {error && <div className="error">{error}</div>}

      <table className="table">
        <thead>
          <tr>
            <th>ID</th>
            <th>게스트</th>
            <th>체크인</th>
            <th>체크아웃</th>
            <th>인원</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id}>
              <td>{r.id}</td>
              <td>{r.guest?.username ?? '-'}</td>
              <td>{r.check_in_date}</td>
              <td>{r.check_out_date}</td>
              <td>{r.people_count}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {rows.length === 0 && !loading && <div className="muted">예약이 없습니다.</div>}
    </div>
  );
}