// src/pages/host/HostDashboard.js
import { Link, useNavigate } from 'react-router-dom';
import { getUserInfo } from '../../util/auth';
import { useEffect, useState } from 'react';
import MyPage from '../MyPage';

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
  const navigate = useNavigate();
  useEffect(() => {
    const { user_id, role } = getUserInfo();
    if (!user_id) {
      navigate('/login');
    } else if (role !== 'HOST') {
      navigate('/');
    }
  }, [navigate]);
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [editingRooms, setEditingRooms] = useState([]);
  const [editingLoading, setEditingLoading] = useState(false);

  const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
  };

  const API_BASE_URL = 'http://localhost:8080';

  const handleApiError = async (response) => {
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API 요청 실패: ${response.status} ${errorText}`);
    }
    return response;
  };

  const getHeaders = (userId) => ({
    'Content-Type': 'application/json',
    'user-id': userId.toString(),
  });

  const apiService = {
    getUserInfo: async (userId) => {
      const response = await fetch(`${API_BASE_URL}/user/${userId}`, {
        method: 'GET',
        headers: getHeaders(userId),
      });
      await handleApiError(response);
      return await response.json();
    },
    updateUserInfo: async (userId, userInfo) => {
      const response = await fetch(`${API_BASE_URL}/user-info`, {
        method: 'PATCH',
        headers: getHeaders(userId),
        body: JSON.stringify(userInfo),
        credentials: 'include',
      });
      await handleApiError(response);
      return await response.json();
    },
  };

  const userId = getCookie('user_id') ? parseInt(getCookie('user_id')) : null;

  const [userData, setUserData] = useState({
    user_id: userId,
    username: '',
    login_id: '',
    role: 'GUEST',
    phone_number: '',
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    username: '',
    phone_number: '',
    password: '',
  });

  const loadUserData = async () => {
    try {
      const data = await apiService.getUserInfo(userId);
      setUserData({
        user_id: data.user_id,
        username: data.username,
        login_id: data.login_id,
        role: data.role,
        phone_number: data.phone_number,
      });
    } catch (err) {
      alert('사용자 정보 로딩 실패: ' + err.message);
    }
  };

  useEffect(() => {
    if (!userId) {
      alert('로그인이 필요합니다.');
      return;
    }
    loadUserData();
  }, [userId]);

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
      <MyPage />
      <div className="host-header">
        <h1>내 게스트하우스</h1>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button className="btn primary" onClick={() => setShowForm(true)}>
            + 새로 만들기
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
              <Link key={gh.id} to={`/host/${gh.id}/reservations`} className="gh-card-link">
                <li className="gh-card">
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
                    <button
                      className="btn soft"
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        onDelete(gh.id);
                      }}
                    >
                      삭제
                    </button>
                  </div>
                </li>
              </Link>
            );
          })}
        </ul>
      )}

      {/* 생성 모달 */}
      {showForm && (
        <div className="modal">
          <div className="modal-body">
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
