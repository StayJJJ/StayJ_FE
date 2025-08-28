import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserInfo } from '../util/auth';
import styles from './ReviewModal.module.css';

const ReviewModal = ({
  isOpen,
  onClose,
  mode = 'create', // 'create', 'edit', 'delete'
  userId: userId,
  reservationId,
  existingReview = null, // 수정 시 기존 리뷰 데이터
}) => {
  const [rating, setRating] = useState(existingReview?.rating || 0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const titleRef = useRef(null);
  const contentRef = useRef(null);
  const navigate = useNavigate();
  useEffect(() => {
    const { user_id, role } = getUserInfo();
    if (!user_id) {
      navigate('/login');
    } else if (role === 'HOST') {
      navigate('/host');
    }
  }, [navigate]);

  // 수정 모드일 때 기존 데이터로 초기화
  useEffect(() => {
    if (mode === 'edit' && existingReview) {
      setRating(existingReview.rating);
      if (titleRef.current) titleRef.current.value = existingReview.title || '';
      if (contentRef.current) contentRef.current.value = existingReview.comment || '';
    }
  }, [mode, existingReview]);

  const handleOverlayClick = (e) => {
    if (e.target.classList.contains(styles.modalOverlay)) {
      onClose();
    }
  };

  const handleStarClick = (value) => {
    setRating(value);
  };

  const API_BASE_URL = 'http://localhost:8080';

  // 리뷰 작성 API 호출
  const createReview = async (reviewData) => {
    const response = await fetch(`${API_BASE_URL}/review`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'user-id': userId,
      },
      body: JSON.stringify({
        reservation_id: reservationId,
        rating: reviewData.rating,
        comment: reviewData.comment,
      }),
    });

    if (!response.ok) {
      throw new Error('리뷰 작성에 실패했습니다.');
    }

    return response.json();
  };

  // 리뷰 수정 API 호출
  const updateReview = async (reviewData) => {
    const response = await fetch(`/review/${existingReview.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'user-id': userId,
      },
      body: JSON.stringify({
        rating: reviewData.rating,
        comment: reviewData.comment,
      }),
    });

    if (!response.ok) {
      throw new Error('리뷰 수정에 실패했습니다.');
    }

    return response.json();
  };

  // 리뷰 삭제 API 호출
  const deleteReview = async () => {
    const response = await fetch(`${API_BASE_URL}/review/${existingReview.id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'user-id': userId,
      },
      // DELETE는 body 없이 헤더만 전달
    });

    if (!response.ok) {
      throw new Error('리뷰 삭제에 실패했습니다.');
    }

    return response.json();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      if (mode === 'delete') {
        await deleteReview();
        console.log('리뷰가 삭제되었습니다.');
      } else {
        const reviewData = {
          rating,
          comment: contentRef.current.value,
          title: titleRef.current?.value || '', // 제목이 필요한 경우
        };

        // 별점 유효성 검사
        if (rating === 0) {
          setError('별점을 선택해주세요.');
          return;
        }

        // 내용 유효성 검사
        if (!reviewData.comment.trim()) {
          setError('리뷰 내용을 입력해주세요.');
          return;
        }

        let result;
        if (mode === 'create') {
          result = await createReview(reviewData);
          console.log('리뷰가 작성되었습니다:', result);
        } else if (mode === 'edit') {
          result = await updateReview(reviewData);
          console.log('리뷰가 수정되었습니다:', result);
        }
      }

      onClose(); // 모달 닫기

      // 성공 시 부모 컴포넌트에 알림 (선택사항)
      if (typeof onClose === 'function') {
        onClose(true); // true를 전달하여 성공을 알림
      }
    } catch (err) {
      console.error('API 오류:', err);
      setError(err.message || '오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('정말로 이 리뷰를 삭제하시겠습니까?')) {
      setError('');
      setIsSubmitting(true);
      try {
        await deleteReview();
        console.log('리뷰가 삭제되었습니다.');
        onClose(true); // 모달 닫기 & 성공 알림
      } catch (err) {
        console.error('삭제 중 오류:', err);
        setError(err.message || '삭제에 실패했습니다.');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  if (!isOpen) return null;

  // 삭제 모드일 때는 다른 UI 표시
  if (mode === 'delete') {
    return (
      <div className={styles.modalOverlay} onClick={handleOverlayClick}>
        <div className={styles.modalBox} onClick={(e) => e.stopPropagation()}>
          <div className={styles.modalHeader}>
            <h2>리뷰 삭제</h2>
            <div className={styles.modalHeader}>
              <button
                type="button"
                className={styles.closeBtn}
                onClick={(e) => {
                  e.preventDefault(); // ✅ 새로고침 방지
                  onClose();
                }}
              >
                ×
              </button>
            </div>
          </div>
          <div className={styles.deleteConfirm}>
            <p>정말로 이 리뷰를 삭제하시겠습니까?</p>
            <div className={styles.deleteButtons}>
              <button type="button" className={styles.deleteBtn} onClick={handleDelete} disabled={isSubmitting}>
                {isSubmitting ? '삭제 중...' : '삭제'}
              </button>
            </div>
          </div>
          {error && <div className={styles.error}>{error}</div>}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.modalOverlay} onClick={handleOverlayClick}>
      <div className={styles.modalBox} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>{mode === 'edit' ? '리뷰 수정하기' : '리뷰 작성하기'}</h2>
          <button
            type="button" // 이걸 꼭 넣어야 기본 제출버튼이 아니게 됨
            className={styles.closeBtn}
            onClick={(e) => {
              e.preventDefault(); // 기본 동작 막기
              onClose(); // 모달 닫기 함수 호출
            }}
          >
            ×
          </button>
        </div>

        <div className={styles.starRating}>
          {[1, 2, 3, 4, 5].map((num) => (
            <span
              key={num}
              className={num <= rating ? styles.starFilled : styles.starEmpty}
              onClick={() => handleStarClick(num)}
            >
              ★
            </span>
          ))}
        </div>

        {error && <div className={styles.error}>{error}</div>}

        <form className={styles.reviewForm} onSubmit={handleSubmit}>
          <textarea
            placeholder="리뷰 내용을 입력하세요"
            className={styles.textarea}
            ref={contentRef}
            disabled={isSubmitting}
            required
          ></textarea>
          <button type="submit" className={styles.submitBtn} disabled={isSubmitting || rating === 0}>
            {isSubmitting ? (mode === 'edit' ? '수정 중...' : '저장 중...') : mode === 'edit' ? '수정하기' : '저장하기'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ReviewModal;
