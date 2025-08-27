// src/pages/host/HostDashboard.js
import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import {
  getMyGuesthouses,
  createGuesthouse,
  updateGuesthouse,
  deleteGuesthouse,
  getGuesthouseDetail,
  getGuesthouseRooms,
} from '../../api/hosts';
import GuesthouseForm from './GuesthouseForm';
import './HostDashboard.css';

export default function HostDashboard() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [editingRooms, setEditingRooms] = useState([]);
  const [editingLoading, setEditingLoading] = useState(false);
  const navigate = useNavigate();

  const logout = () => {
    const keys = ['user_id', 'username', 'login_id', 'role', 'phoneNumber'];
    keys.forEach((key) => Cookies.remove(key, { path: '/' }));
    console.log('로그아웃 되었습니다. 쿠키가 삭제되었습니다.');
    navigate('/login');
  };

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

  const handleEdit = async (gh) => {
    setEditingLoading(true);
    try {
      const detail = await getGuesthouseDetail(gh.id);
      const rooms = await getGuesthouseRooms(gh.id);
      // setEditing({ ...detail });
      // setEditingRooms(Array.isArray(rooms) ? rooms : (rooms.rooms || []));
    } catch (e) {
      alert('게스트하우스 상세 정보를 불러오지 못했습니다.');
    } finally {
      setEditingLoading(false);
    }
  };

  return (
    <div className="host-wrap">
      <div className="host-header">
        <h1>내 게스트하우스</h1>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button className="btn primary" onClick={() => setShowForm(true)}>
            + 새로 만들기
          </button>
          <button className="logout-btn" onClick={logout}>
            로그아웃
          </button>
        </div>
      </div>

      {loading && <div className="muted">로딩 중…</div>}
      {error && <div className="error">{error}</div>}

      {list.length === 0 && !loading && !error ? (
        <div
          className="muted"
          style={{ textAlign: 'center', margin: '30px 0 20px 0', fontSize: '1.15rem', lineHeight: '2.2' }}
        >
          등록된 게스트하우스가 없습니다.
          <br />
          <span
            style={{
              display: 'inline-block',
              marginTop: '10px',
              color: 'var(--primary)',
              fontWeight: 700,
              fontSize: '1.25rem',
            }}
          >
            게스트하우스를 추가해주세요!
          </span>
        </div>
      ) : (
        <ul className="gh-grid">
          {list.map((gh) => {
            const imagePath = `http://localhost:8080/images/guesthouses/${gh.photo_id}.png`;
            // const imagePath = `/images/guesthouses/${gh.photo_id}.png`;
            return (
              <li key={gh.id} className="gh-card">
                {/* 카드 이미지 */}
                <div className="gh-media">
                  <img
                    src={imagePath}
                    alt={gh.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '12px' }}
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                </div>

                {/* 카드 정보 */}
                <div className="gh-title">{gh.name}</div>
                <div className="gh-meta">
                  <span className="badge">⭐ {gh.rating ?? '-'}</span>
                  <span className="badge">🛏️ {gh.room_count ?? 0}개</span>
                </div>
                <div className="gh-actions">
                  {/* <button className="btn soft" onClick={() => handleEdit(gh)}>수정</button> */}
                  <button className="btn soft" onClick={() => onDelete(gh.id)}>
                    삭제
                  </button>
                  <Link className="btn soft" to={`/host/${gh.id}/reservations`}>
                    예약 관리
                  </Link>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {/* 생성 모달 */}
      {showForm && (
        <div className="modal">
          <div className="modal-body">
            <div className="modal-head">
              <h2>게스트하우스 생성</h2>
            </div>
            <GuesthouseForm onSubmit={onCreate} onCancel={() => setShowForm(false)} />
          </div>
        </div>
      )}

      {/* 수정 모달 */}
      {editing && (
        <div className="modal">
          <div className="modal-body">
            <div className="modal-head">
              <h2>게스트하우스 수정</h2>
              <button
                onClick={() => {
                  setEditing(null);
                  setEditingRooms([]);
                }}
              >
                닫기
              </button>
            </div>
            {editingLoading ? (
              <div style={{ padding: '30px', textAlign: 'center' }}>불러오는 중...</div>
            ) : (
              <GuesthouseForm
                initialValues={{ ...editing, rooms: editingRooms }}
                onSubmit={(values) => onUpdate(editing.id, values)}
                onCancel={() => {
                  setEditing(null);
                  setEditingRooms([]);
                }}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

//<button className="logout-btn" onClick={logout}>로그아웃</button>
