import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserRoleFromCookie } from '../util/auth';
import axios from 'axios';
import './Register.css';

const Register = () => {
  const navigate = useNavigate();
  useEffect(() => {
    const role = getUserRoleFromCookie();
    if (role === 'GUEST') {
      navigate('/');
    } else if (role === 'HOST') {
      navigate('/host');
    }
  }, [navigate]);
  const [formData, setFormData] = useState({
    username: '',
    login_id: '',
    password: '',
    phone_number: '',
    role: 'HOST',
  });
  const [passwordCheck, setPasswordCheck] = useState('');
  const [passwordMatch, setPasswordMatch] = useState(null); // null | true | false
  const [passwordValid, setPasswordValid] = useState(true); // 비밀번호 길이 검증
  const [idAvailable, setIdAvailable] = useState(false);
  const [idChecked, setIdChecked] = useState(false);
  const [idInputError, setIdInputError] = useState('');
  const [phoneValid, setPhoneValid] = useState(false);
  const [phoneStartError, setPhoneStartError] = useState(false);

  const { username, login_id, password, phone_number, role } = formData;

  const phoneRegex = /^010-\d{4}-\d{4}$/;

  const formatPhone = (value) => {
    const digits = value.replace(/\D/g, '').slice(0, 11);
    if (digits.length === 0) return '';
    if (digits.length <= 3) return digits;
    if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
    return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7, 11)}`;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'phone_number') {
      const formatted = formatPhone(value);
      setFormData((prev) => ({ ...prev, phone_number: formatted }));
      setPhoneValid(phoneRegex.test(formatted));
      setPhoneStartError(formatted.length > 0 && !formatted.startsWith('010'));
      return;
    }

    setFormData({ ...formData, [name]: value });

    if (name === 'login_id') {
      setIdAvailable(false);
      setIdChecked(false);
    }

    if (name === 'password') {
      setPasswordValid(value.length >= 4 && value.length <= 10); // 길이 검증
      setPasswordMatch(value === passwordCheck && passwordCheck.length > 0);
    }
  };

  const handlePasswordCheck = (e) => {
    const value = e.target.value;
    setPasswordCheck(value);
    setPasswordMatch(formData.password === value && value.length > 0);
  };

  const handleCheckId = async () => {
    if (!login_id) {
      setIdInputError('아이디를 입력해주세요.');
      setIdAvailable(false);
      setIdChecked(false);
      return;
    } else {
      setIdInputError('');
    }
    try {
      const response = await axios.get('http://localhost:8080/user/check-id', {
        params: { login_id },
      });
      if (response.data.available) {
        setIdAvailable(true);
        setIdChecked(true);
      } else {
        setIdAvailable(false);
        setIdChecked(true);
      }
    } catch (error) {
      setIdInputError('중복 확인 중 오류가 발생했습니다.');
      setIdAvailable(false);
      setIdChecked(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !login_id || !password || !phone_number) {
      alert('모든 필드를 입력해주세요.');
      return;
    }
    if (!idAvailable) {
      alert('아이디 중복확인을 해주세요.');
      return;
    }
    if (!passwordValid) {
      alert('비밀번호는 4자 이상 10자 이하로 입력해주세요.');
      return;
    }
    if (!passwordMatch) {
      alert('비밀번호가 일치하지 않습니다.');
      return;
    }
    if (!phoneValid) {
      alert('연락처 형식을 확인해주세요. (010-1234-5678)');
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
      <h1 className="register-title">회원가입</h1>
      <form className="register-form" onSubmit={handleSubmit}>
        {/* 아이디 */}
        <div className="form-group">
          <div className="form-row">
            <label htmlFor="login_id">아이디</label>
            <span className={`right-hint ${idInputError ? 'err' : idChecked ? (idAvailable ? 'ok' : 'err') : ''}`}>
              {idInputError
                ? idInputError
                : idChecked
                ? idAvailable
                  ? '사용 가능한 아이디입니다.'
                  : '이미 사용 중인 아이디입니다.'
                : ''}
            </span>
          </div>
          <div className="input-with-button">
            <input
              type="text"
              id="login_id"
              name="login_id"
              value={login_id}
              onChange={(e) => {
                handleChange(e);
                if (e.target.value) setIdInputError('');
              }}
              placeholder="예) host123"
              required
            />
            <button type="button" className="check-id-button" onClick={handleCheckId}>
              중복확인
            </button>
          </div>
        </div>

        {/* 비밀번호 */}
        <div className="form-group">
          <div className="form-row">
            <label htmlFor="password">비밀번호</label>
            <span className={`right-hint ${password.length > 0 ? (passwordValid ? 'ok' : 'err') : ''}`}>
              {password.length > 0
                ? passwordValid
                  ? '사용 가능한 비밀번호입니다.'
                  : '4~10자 사이로 입력해주세요.'
                : ''}
            </span>
          </div>
          <input
            type="password"
            id="password"
            name="password"
            value={password}
            onChange={handleChange}
            minLength={4}
            maxLength={10}
            required
          />
        </div>

        {/* 비밀번호 확인 */}
        <div className="form-group">
          <div className="form-row">
            <label htmlFor="passwordCheck">비밀번호 확인</label>
            <span
              className={`right-hint ${
                password.length > 0 && passwordCheck.length > 0 ? (passwordMatch ? 'ok' : 'err') : ''
              }`}
            >
              {password.length > 0 && passwordCheck.length > 0
                ? passwordMatch
                  ? '비밀번호가 일치합니다.'
                  : '비밀번호가 일치하지 않습니다.'
                : ''}
            </span>
          </div>
          <input
            type="password"
            id="passwordCheck"
            name="passwordCheck"
            value={passwordCheck}
            onChange={handlePasswordCheck}
            minLength={4}
            maxLength={10}
            required
          />
        </div>

        {/* 이름 */}
        <div className="form-group">
          <div className="form-row">
            <label htmlFor="username">이름</label>
            <span className="right-hint">&nbsp;</span>
          </div>
          <input
            type="text"
            id="username"
            name="username"
            value={username}
            onChange={handleChange}
            placeholder="예) 김삼성"
            required
          />
        </div>

        {/* 연락처 */}
        <div className="form-group">
          <div className="form-row">
            <label htmlFor="phone_number">연락처</label>
            <span className={`right-hint ${phone_number ? (phoneValid && !phoneStartError ? 'ok' : 'err') : ''}`}>
              {phone_number
                ? phoneStartError
                  ? '010으로 시작해야 합니다.'
                  : phoneValid
                  ? '형식 확인됨'
                  : '형식: 010-1234-5678'
                : ''}
            </span>
          </div>
          <input
            type="tel"
            id="phone_number"
            name="phone_number"
            value={phone_number}
            onChange={handleChange}
            placeholder="010-1234-5678"
            maxLength={13}
            required
          />
        </div>

        {/* 역할 */}
        <div className="form-group">
          <div className="form-row">
            <label>역할</label>
            <span className="right-hint">&nbsp;</span>
          </div>
          <div className="role-selector">
            <label>
              <input type="radio" name="role" value="GUEST" checked={role === 'GUEST'} onChange={handleChange} />
              게스트
            </label>
            <label>
              <input type="radio" name="role" value="HOST" checked={role === 'HOST'} onChange={handleChange} />
              호스트
            </label>
          </div>
        </div>

        <button
          type="submit"
          className="submit-button"
          disabled={!(idAvailable && passwordMatch && passwordValid && phoneValid)}
        >
          회원가입
        </button>
      </form>
    </div>
  );
};

export default Register;
