import Cookies from 'js-cookie';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserInfo } from '../util/auth';
import './MyPage.css';

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

const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
};

const MyPage = () => {
  const navigate = useNavigate();
  useEffect(() => {
    const { user_id, role } = getUserInfo();
    if (!user_id) {
      alert('로그인이 필요합니다.');
      navigate('/login');
    } else if (role !== 'GUEST') {
      navigate('/host');
    }
  }, [navigate]);
  const userId = Cookies.get('user_id') ? parseInt(Cookies.get('user_id')) : null;

  const [userData, setUserData] = useState({
    id: userId,
    username: '',
    login_id: '',
    role: 'GUEST',
    phone_number: '',
  });

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const isGuest = userData.role === 'GUEST';

  const [editForm, setEditForm] = useState({
    username: '',
    phone_number: '',
    password: '',
  });

  useEffect(() => {
    if (!userId) {
      setError('로그인이 필요합니다.');
      return;
    }
    loadUserData();
  }, [userId]);

  const loadUserData = async () => {
    try {
      setLoading(true);
      const data = await apiService.getUserInfo(userId);
      setUserData({
        id: data.user_id,
        username: data.username,
        login_id: data.login_id,
        role: data.role,
        phone_number: data.phone_number,
      });
    } catch (err) {
      console.error('사용자 정보 로드 실패:', err);
      setError('사용자 정보를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const subMessage = isEditing
    ? '회원정보를 수정합니다.'
    : isGuest
    ? `${userData.username}님, 환영합니다!`
    : `${userData.username}님, 성공적인 숙소 운영을 응원합니다!`;

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    if (!isEditing) {
      setEditForm({
        username: userData.username,
        phone_number: userData.phone_number,
        password: '',
      });
    }
  };

  // ✅ 저장: HTML5 검증(패턴/길이)이 통과된 후에만 호출됨
  const handleSave = async (e) => {
    e.preventDefault(); // 기본 제출 막고 커스텀 저장 실행(검증은 이미 통과됨)
    try {
      const updateData = {
        username: editForm.username,
        phone_number: editForm.phone_number,
      };
      if (editForm.password.trim()) updateData.password = editForm.password;

      await apiService.updateUserInfo(userId, updateData);
      setUserData((prev) => ({ ...prev, ...updateData }));
      setIsEditing(false);
      alert('정보가 수정되었습니다.');
    } catch (err) {
      alert('정보 수정 실패: ' + err.message);
    }
  };

  // ✅ 입력 핸들러 (전화번호 자동 하이픈 적용)
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === 'phone_number') {
      // 숫자만 추출
      let onlyNums = value.replace(/\D/g, '');

      // 010-1234-5678 또는 010-123-4567 형식 적용
      if (onlyNums.length <= 3) {
        // 010
        onlyNums = onlyNums;
      } else if (onlyNums.length <= 7) {
        // 010-1234
        onlyNums = onlyNums.replace(/(\d{3})(\d{1,4})/, '$1-$2');
      } else {
        // 010-1234-5678
        onlyNums = onlyNums.replace(/(\d{3})(\d{3,4})(\d{1,4})/, '$1-$2-$3');
      }

      setEditForm((prev) => ({ ...prev, [name]: onlyNums }));
    } else if (name === 'username') {
      // 허용 문자만 유지(한글/영문/공백), 최대 10자
      const filtered = value.replace(/[^가-힣a-zA-Z\s]/g, '').slice(0, 10);
      setEditForm((prev) => ({ ...prev, username: filtered }));
    } else {
      setEditForm((prev) => ({ ...prev, [name]: value }));
    }
  };

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

  if (loading) return <p>로딩 중...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="guest-page-container">
      <div className="card">
        <div className="profile-container">
                        <img
                            className='profile-image'
                            src={userData.role === 'GUEST' ? '../images/guest.png' : '../images/host.png'}
                            alt={userData.role === 'GUEST' ? '게스트 프로필' : '호스트 프로필'}
                        />          
                              <p className="role_badge">{userData.role === 'GUEST' ? '게스트' : '호스트'}</p>
        </div>
        <h3 className="welcome-msg">{subMessage}</h3>

        <div className="card-body">
          {isEditing ? (
            // 🔸 폼으로 감싸고 onSubmit 사용 -> HTML5 검증 활성화
            <form className="card-body" onSubmit={handleSave}>
              <div className="input-group">
                <label>이름</label>
                <input
                  type="text"
                  name="username"
                  value={editForm.username}
                  onChange={handleInputChange}
                  maxLength={10}
                  pattern="^[가-힣a-zA-Z\s]+$"
                  title="한글 또는 영어만 입력 가능합니다"
                  required
                />
              </div>

              <div className="input-group">
                <label>전화번호</label>
                <input
                  type="text"
                  name="phone_number"
                  value={editForm.phone_number}
                  onChange={handleInputChange}
                  placeholder="010-1234-5678"
                  pattern="^01[016789]-\d{3,4}-\d{4}$"
                  title="전화번호 형식: 010-1234-5678"
                  maxLength={13}
                  required
                />
              </div>

              <div className="input-group">
                <label>새 비밀번호</label>
                <input
                  type="password"
                  name="password"
                  value={editForm.password}
                  onChange={handleInputChange}
                  placeholder="변경하지 않으려면 비워두세요"
                  minLength={4} // 비어있으면 통과, 입력 시 8자 이상 필요
                  maxLength={20}
                  autoComplete="new-password"
                />
              </div>

              <div className="button-group">
                <button className="savebt">저장</button>
                <button className="cancelbt">취소</button>
              </div>
            </form>
          ) : (
            <div className="info-body">
              <div className="info-item">
                <p className="label">이름</p>
                <p className="value">{userData.username}</p>
              </div>
              <div className="info-item">
                <p className="label">ID</p>
                <p className="value">{userData.login_id}</p>
              </div>
              <div className="info-item">
                <p className="label">전화번호</p>
                <p className="value">{userData.phone_number}</p>
              </div>
              <button onClick={handleEditToggle} className="button">
                변경하기
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyPage;