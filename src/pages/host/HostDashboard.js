// 내 게스트하우스 리스트
// src/pages/host/HostDashboard.js
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getMyGuesthouses, createGuesthouse, updateGuesthouse, deleteGuesthouse } from '../../api/hosts';
import GuesthouseForm from './GuesthouseForm';
import './HostDashboard.css';

export default function HostDashboard() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null); // {id, name, ...}

  const load = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getMyGuesthouses();
      setList(data || []);
    } catch (e) {
      setError('목록을 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const onCreate = async (values) => {
    await createGuesthouse(values);
    setShowForm(false);
    await load();
  };

  const onUpdate = async (id, values) => {
    await updateGuesthouse(id, values);
    setEditing(null);
    await load();
  };

  const onDelete = async (id) => {
    if (!window.confirm('정말 삭제하시겠어요?')) return;
    await deleteGuesthouse(id);
    await load();
  };

  return (
    <div className="host-wrap">
      <div className="host-header">
        <h1>내 게스트하우스</h1>
        <button className="primary" onClick={() => setShowForm(true)}>+ 새로 만들기</button>
      </div>

      {loading && <div className="muted">로딩 중…</div>}
      {error && <div className="error">{error}</div>}

      <ul className="gh-grid">
        {list.map((gh) => (
          <li key={gh.id} className="gh-card">
            <div className="gh-title">{gh.name}</div>
            <div className="gh-meta">
              <span className="badge">⭐ {gh.rating ?? '-'}</span>
              <span className="badge">🛏️ {gh.room_count ?? 0} rooms</span>
            </div>
            <div className="gh-actions">
              <button className="btn soft" onClick={() => setEditing(gh)}>수정</button>
              <button className="btn danger" onClick={() => onDelete(gh.id)}>삭제</button>
              <Link className="btn primary" to={`/host/${gh.id}/reservations`}>
                예약 관리
              </Link>
            </div>
          </li>
        ))}
      </ul>

      {/* 생성 모달 */}
      {showForm && (
        <div className="modal">
          <div className="modal-body">
            <div className="modal-head">
              <h2>게스트하우스 생성</h2>
              <button onClick={() => setShowForm(false)}>닫기</button>
            </div>
            <GuesthouseForm
              onSubmit={onCreate}
              onCancel={() => setShowForm(false)}
            />
          </div>
        </div>
      )}

      {/* 수정 모달 */}
      {editing && (
        <div className="modal">
          <div className="modal-body">
            <div className="modal-head">
              <h2>게스트하우스 수정</h2>
              <button onClick={() => setEditing(null)}>닫기</button>
            </div>
            <GuesthouseForm
              initialValues={editing}
              onSubmit={(values) => onUpdate(editing.id, values)}
              onCancel={() => setEditing(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
}