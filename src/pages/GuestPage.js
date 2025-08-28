import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserInfo } from '../util/auth';
import Cookies from 'js-cookie';
import './GuestPage.css';
import ReviewModal from './ReviewModal';
import MyPage from './MyPage';

const API_BASE_URL = 'http://localhost:8080';

const handleApiError = async (response) => {
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API 요청 실패: ${response.status} ${errorText}`);
  }
  return response;
};

const getHeaders = (userId) => {
  if (!userId) {
    throw new Error('사용자 ID가 없습니다. 로그인이 필요합니다.');
  }
  return {
    'Content-Type': 'application/json',
    'user-id': userId.toString(),
  };
};

const apiService = {
  createReservation: async (userId, reservationData) => {
    // userId가 없으면 에러 발생
    if (!userId) {
      throw new Error('인증되지 않은 사용자입니다.');
    }
    const response = await fetch(`${API_BASE_URL}/reservation`, {
      method: 'POST',
      headers: getHeaders(userId),
      body: JSON.stringify({
        user_id: userId,
        room_id: reservationData.room_id,
        check_in_date: reservationData.check_in_date,
        check_out_date: reservationData.check_out_date,
        people_count: reservationData.people_count,
      }),
    });
    await handleApiError(response);
    return true;
  },

  getMyReservations: async (userId) => {
    // userId가 없으면 에러 발생
    if (!userId) {
      throw new Error('인증되지 않은 사용자입니다.');
    }
    const response = await fetch(`${API_BASE_URL}/reservation/my`, {
      method: 'GET',
      headers: getHeaders(userId),
    });
    await handleApiError(response);
    return await response.json();
  },

  cancelReservation: async (userId, reservationId) => {
    const response = await fetch(`${API_BASE_URL}/reservation/${reservationId}`, {
      method: 'DELETE',
      headers: getHeaders(userId),
    });
    await handleApiError(response);
    const result = await response.json();
    return result.success;
  },

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

const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
};

const GuestPage = () => {
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
  // 체크아웃이 오늘 이전인지 확인
  const isAfterCheckout = (checkOutDate) => {
    if (!checkOutDate) return false;
    const today = new Date();
    const checkout = new Date(checkOutDate);
    // 체크아웃 날짜가 오늘보다 이전이어야 리뷰 작성 가능
    return checkout < today;
  };
  const userId = getCookie('user_id') ? parseInt(getCookie('user_id')) : null;

  const [userData, setUserData] = useState({
    user_id: userId,
    username: '',
    login_id: '',
    role: 'GUEST',
    phone_number: '',
  });

  const [reservations, setReservations] = useState([]);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewModalReservationId, setReviewModalReservationId] = useState(null);
  const [reviewModalMode, setReviewModalMode] = useState('create');
  const [reviewModalReviewId, setReviewModalReviewId] = useState(null);
  // 리뷰 작성 모달 열기
  const handleOpenReviewModal = (reservationId) => {
    setReviewModalReservationId(reservationId);
    setReviewModalMode('create');
    setReviewModalReviewId(null);
    setReviewModalOpen(true);
  };

  // 리뷰 삭제 모달 열기
  const handleOpenDeleteReviewModal = (reviewId) => {
    setReviewModalMode('delete');
    setReviewModalReviewId(reviewId);
    setReviewModalOpen(true);
  };

  // 리뷰 모달 닫기 핸들러
  const handleCloseReviewModal = (success) => {
    setReviewModalOpen(false);
    setReviewModalReservationId(null);
    setReviewModalMode('create');
    setReviewModalReviewId(null);
    if (success) loadReservations();
  };
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [editForm, setEditForm] = useState({
    username: '',
    phone_number: '',
    password: '',
  });

  useEffect(() => {
    if (!userId) {
      setError('로그인이 필요합니다.');
      setLoading(false);
      return;
    }
    loadUserData();
    loadReservations();
  }, [userId]);

  const loadUserData = async () => {
    try {
      setLoading(true);
      const data = await apiService.getUserInfo(userId);

      // 백엔드 response를 userData로 세팅
      setUserData({
        user_id: data.user_id,
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

  const loadReservations = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.getMyReservations(userId);
      // 새로운 응답 구조에 맞게 데이터 가공
      // snake_case -> camelCase 변환
      console.log('예약 응답 데이터:', data);
      const normalizedData = data.map((r) => ({
        id: r.id ?? '',
        roomId: r.room_id ?? '',
        guesthouseId: r.guesthouse_id ?? '',
        guesthouseName: r.guesthouse_name ?? '숙소 정보 없음',
        checkInDate: r.check_in_date ?? '',
        checkOutDate: r.check_out_date ?? '',
        peopleCount: r.people_count ?? 0,
        reviewId: r.review_id,
        reviewComment: r.review_comment ?? '',
      }));
      console.log('가공된 예약 데이터:', normalizedData);
      setReservations(normalizedData);
    } catch (err) {
      console.error('예약 목록 로드 실패:', err);
      setError('예약 정보를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    if (!isEditing) {
      // userData로 초기값 설정
      setEditForm({
        username: userData.username,
        phone_number: userData.phone_number,
        password: '',
      });
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
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

  const handleCancelReservation = async (reservationId, checkInDate) => {
    const today = new Date();
    const checkIn = new Date(checkInDate);
    if (checkIn <= today) {
      alert('체크인 후에는 예약을 취소할 수 없습니다.');
      return;
    }
    if (!window.confirm('정말로 예약을 취소하시겠습니까?')) return;
    try {
      const success = await apiService.cancelReservation(userId, reservationId);
      if (success) {
        alert(`예약 #${reservationId} 취소 완료`);
        loadReservations();
      } else {
        alert('예약 취소 실패');
      }
    } catch (err) {
      alert('예약 취소 오류: ' + err.message);
    }
  };

  const isReservationCancelable = (checkInDate) => {
    return new Date(checkInDate) > new Date();
  };

  const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString('ko-KR');

  const logout = () => {
    const keys = ['user_id', 'username', 'login_id', 'role', 'phone_number'];
    keys.forEach((k) => Cookies.remove(k, { path: '/' }));
    navigate('/login');
  };

  if (loading)
    return (
      <div className="guest-page-container">
        <p>데이터를 불러오는 중...</p>
      </div>
    );
  if (error)
    return (
      <div className="guest-page-container">
        <p>오류: {error}</p>
        {error.includes('로그인') ? (
          <button onClick={() => navigate('/login')}>로그인하기</button>
        ) : (
          <button onClick={loadReservations}>다시 시도</button>
        )}
      </div>
    );

  return (
    <div className="guest-page-container">
      {/* 리뷰 작성 모달 */}
      <ReviewModal
        isOpen={reviewModalOpen}
        onClose={handleCloseReviewModal}
        mode={reviewModalMode}
        userId={userId}
        reservationId={reviewModalReservationId}
        existingReview={reviewModalMode === 'delete' ? { id: reviewModalReviewId } : null}
      />
      <MyPage />

      {/* 예약 내역 섹션 */}
      <div className="info-section">
        <div className="section-header">
          <h2 className="section-title">예약 내역</h2>
        </div>
        {reservations.length === 0 ? (
          <div className="no-reservations">
            <p>아직 예약 내역이 없습니다.</p>
          </div>
        ) : (
          <div className="reservations-container">
            {reservations.map((r) => (
              <div key={r.id || Math.random()} className="reservation-card">
                <div className="reservation-header">
                  <div>
                    <h3 className="reservation-title">{r.guesthouseName || '숙소 정보 없음'}</h3>
                    <p className="reservation-id">예약 번호: #{r.id || '-'}</p>
                  </div>
                  <div className="reservation-actions">
                    <div className="people-count">
                      <p>인원</p>
                      <p>{r.peopleCount ? `${r.peopleCount}명` : '-'}</p>
                    </div>
                    <button
                      onClick={() => handleCancelReservation(r.id, r.checkInDate)}
                      className={`cancel-btn ${!isReservationCancelable(r.checkInDate) ? 'disabled' : ''}`}
                      disabled={!isReservationCancelable(r.checkInDate)}
                    >
                      {isReservationCancelable(r.checkInDate) ? '예약 취소' : '취소 불가'}
                    </button>
                  </div>
                </div>
                <div className="reservation-dates">
                  <div className="date-item">
                    <p>체크인</p>
                    <p>{r.checkInDate ? formatDate(r.checkInDate) : '-'}</p>
                  </div>
                  <div className="date-item">
                    <p>체크아웃</p>
                    <p>{r.checkOutDate ? formatDate(r.checkOutDate) : '-'}</p>
                  </div>
                </div>
                {r.reviewId ? (
                  <div className="review-section">
                    <div className="review-header">
                      <h4 className="review-title">리뷰 작성됨</h4>
                      <span className="review-status">✅ 완료</span>
                    </div>
                    <div className="review-comment">{r.reviewComment || ''}</div>
                    <button className="delete-review-btn" onClick={() => handleOpenDeleteReviewModal(r.reviewId)}>
                      리뷰 삭제
                    </button>
                  </div>
                ) : isAfterCheckout(r.checkOutDate) ? (
                  <div className="no-review">
                    <p>아직 리뷰를 작성하지 않았습니다.</p>
                    <button className="write-review-btn" onClick={() => handleOpenReviewModal(r.id)}>
                      리뷰 작성하기
                    </button>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default GuestPage;
