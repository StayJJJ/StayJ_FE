import React, { useState, useRef } from 'react';
import styles from './ReviewModal.module.css';

const ReviewModal = ({ isOpen, onClose }) => {
  const [rating, setRating] = useState(0);
  const titleRef = useRef(null);
  const contentRef = useRef(null);

  const handleOverlayClick = (e) => {
    if (e.target.classList.contains(styles.modalOverlay)) {
      onClose();
    }
  };

  const handleStarClick = (value) => {
    setRating(value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("별점:", rating);
    console.log("제목:", titleRef.current.value);
    console.log("내용:", contentRef.current.value);
    onClose(); // 모달 닫기
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={handleOverlayClick}>
      <div className={styles.modalBox} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>리뷰 작성하기</h2>
          <button className={styles.closeBtn} onClick={onClose}>×</button>
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

        <form className={styles.reviewForm} onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="리뷰 제목"
            className={styles.input}
            ref={titleRef}
          />
          <textarea
            placeholder="리뷰 내용을 입력하세요"
            className={styles.textarea}
            ref={contentRef}
          ></textarea>
          <button type="submit" className={styles.submitBtn}>저장하기</button>
        </form>
      </div>
    </div>
  );
};

export default ReviewModal;
