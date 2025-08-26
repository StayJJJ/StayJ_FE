// src/pages/Register.js

import React, { useState } from 'react';
import axios from 'axios';
import './Register.css';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    login_id: '',
    password: '',
    phone_number: '',
    role: 'HOST', // 기본값을 HOST로 설정
  });

  const { username, login_id, password, phone_number, role } = formData;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // 아이디 중복 확인 (임시)
  const handleCheckId = () => {
    if (!login_id) {
      alert('아이디를 입력해주세요.');
      return;
    }
    alert(`아이디 '${login_id}'는 사용 가능합니다.`); // TODO: 실제 API 호출 필요
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 간단한 유효성 검사
    if (!username || !login_id || !password || !phone_number) {
      alert('모든 필드를 입력해주세요.');
      return;
    }

    try {
      const response = await axios.post('http://localhost:8080/user/sign-up', {
        username,
        login_id,
        password,
        role,
        phone_number,
      });

      if (response.status === 200) {
        alert('회원가입이 완료되었습니다.');
        // 회원가입 성공 후 로그인 페이지 이동
        window.location.href = '/login';
      } else {
        alert('회원가입에 실패했습니다: ' + (response.data.message || ''));
      }
    } catch (error) {
      console.error('회원가입 오류:', error);
      alert('회원가입 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="register-container">
      <h1 className="register-title">호스트 정보 등록하기</h1>
      <form className="register-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="login_id">아이디</label>
          <div className="input-with-button">
            <input
              type="text"
              id="login_id"
              name="login_id"
              value={login_id}
              onChange={handleChange}
              placeholder="예) jylee0619"
              required
            />
            <button type="button" className="check-id-button" onClick={handleCheckId}>
              중복확인
            </button>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="password">비밀번호</label>
          <input
            type="password"
            id="password"
            name="password"
            value={password}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="username">이름</label>
          <input
            type="text"
            id="username"
            name="username"
            value={username}
            onChange={handleChange}
            placeholder="예) 이준영"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="phone_number">연락처</label>
          <input
            type="tel"
            id="phone_number"
            name="phone_number"
            value={phone_number}
            onChange={handleChange}
            placeholder="예) 010-1234-5678"
            required
          />
        </div>

        <div className="form-group">
          <label>역할</label>
          <div className="role-selector">
            <label>
              <input
                type="radio"
                name="role"
                value="GUEST"
                checked={role === 'GUEST'}
                onChange={handleChange}
              />
              게스트
            </label>
            <label>
              <input
                type="radio"
                name="role"
                value="HOST"
                checked={role === 'HOST'}
                onChange={handleChange}
              />
              호스트
            </label>
          </div>
        </div>

        <button type="submit" className="submit-button">
          회원가입
        </button>
      </form>
    </div>
  );
};

export default Register;
