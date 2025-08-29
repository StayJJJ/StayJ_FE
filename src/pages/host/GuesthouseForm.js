// src/pages/host/GuesthouseForm.js
import { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserInfo } from '../../util/auth';
import axios from 'axios';
import './GuesthouseForm.css';

const phoneRegex = /^\d{2,3}-\d{4}-\d{4}$/;
const formatPhone = (value) => {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length === 0) return '';
  if (digits.length <= 3) return digits;
  if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7, 11)}`;
};

const SIDO_LIST = ['제주특별자치도'];
const DUMMY_GUGUN = {
  제주특별자치도: ['제주시', '서귀포시'],
};
const DUMMY_DONG = {
  제주시: ['이도이동', '노형동', '연동'],
  서귀포시: ['중문동', '대정읍', '남원읍'],
};

const EMPTY = {
  name: '',
  description: '',
  address: '',
  phone_number: '',
  rooms: [{ name: '' }],
  roomCount: 1,
  photo_id: null,
  rating: 0, // 항상 0
};

export default function GuesthouseForm({ initialValues = EMPTY, onSubmit, onCancel }) {
  const navigate = useNavigate();
  useEffect(() => {
    const { user_id, role } = getUserInfo();
    if (!user_id) {
      navigate('/login');
    } else if (role !== 'HOST') {
      navigate('/');
    }
  }, [navigate]);
  const [form, setForm] = useState(() => ({ ...EMPTY, ...initialValues, rating: 0 }));

  // input refs
  const nameRef = useRef(null);
  const phoneRef = useRef(null);
  const descRef = useRef(null);
  // 주소 상태
  const [sido, setSido] = useState('');
  const [gugun, setGugun] = useState('');
  const [dong, setDong] = useState('');
  const [detail, setDetail] = useState('');
  const [addressType, setAddressType] = useState('select'); // select | manual
  // 주소 관련 ref
  const sidoRef = useRef(null);
  const gugunRef = useRef(null);
  const dongRef = useRef(null);
  const detailRef = useRef(null);
  const addressInputRef = useRef(null);
  const [phoneValid, setPhoneValid] = useState(false);
  const [clickButton, setClickButton] = useState(false);
  // 파일 & 미리보기 (제출 전까지 서버 업로드 X)
  const initialRoomsLen = useMemo(
    () => initialValues.rooms?.length ?? form.rooms.length,
    [initialValues, form.rooms.length]
  );

  const [coverFile, setCoverFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);

  const [roomFiles, setRoomFiles] = useState(() => Array.from({ length: initialRoomsLen }, () => null));
  const [roomPreviews, setRoomPreviews] = useState(() => Array.from({ length: initialRoomsLen }, () => null));

  const [submitting, setSubmitting] = useState(false);
  // 에러 상태를 입력별로 분리
  const [errorState, setErrorState] = useState({
    name: '',
    phone: '',
    address: '',
    room: '',
    cover: '',
    roomImage: '',
    description: '',
    global: '',
  });
  // 대표 이미지 버튼 ref
  const coverBtnRef = useRef(null);

  // 라이트박스(확대보기)
  const [lightbox, setLightbox] = useState({ open: false, src: '', alt: '' });
  const openLightbox = (src, alt) => setLightbox({ open: true, src, alt });
  const closeLightbox = () => setLightbox({ open: false, src: '', alt: '' });

  const change = (e) => {
    const { name, value } = e.target;

    if (name === 'phone_number') {
      const formatted = formatPhone(value);
      setForm((prev) => ({ ...prev, phone_number: formatted }));
      setPhoneValid(phoneRegex.test(formatted));

      setErrorState((prev) => ({ ...prev, phone: '' }));
      return;
    }
    setForm((s) => ({ ...s, [name]: value }));
    // 소개(description) 입력 시 에러 메시지 제거
    if (name === 'description') {
      setErrorState((prev) => ({ ...prev, description: '' }));
    }
    // 이름 입력 시 에러 메시지 제거
    if (name === 'name') {
      setErrorState((prev) => ({ ...prev, name: '' }));
    }
  };

  // 주소 입력 핸들러
  const handleSido = (e) => {
    setSido(e.target.value);
    setGugun('');
    setDong('');
    setDetail('');
    setErrorState((prev) => ({ ...prev, address: '' }));
  };
  const handleGugun = (e) => {
    setGugun(e.target.value);
    setDong('');
    setDetail('');
    setErrorState((prev) => ({ ...prev, address: '' }));
  };
  const handleDong = (e) => {
    setDong(e.target.value);
    setDetail('');
    setErrorState((prev) => ({ ...prev, address: '' }));
  };
  const handleDetail = (e) => {
    setDetail(e.target.value);
    setErrorState((prev) => ({ ...prev, address: '' }));
  };

  const handleAddressType = (type) => {
    setAddressType(type);
    if (type === 'manual') {
      setSido('');
      setGugun('');
      setDong('');
      setDetail('');
    }
  };

  const changeRoom = (idx, key, val) => {
    setForm((s) => {
      const rooms = s.rooms.slice();
      rooms[idx] = {
        ...rooms[idx],
        [key]: key === 'capacity' || key === 'price' || key === 'photo_id' ? Number(val) : val,
      };
      return { ...s, rooms, roomCount: rooms.length };
    });
    setErrorState((prev) => ({ ...prev, room: '' }));
  };

  const addRoom = () => {
    setForm((s) => ({ ...s, rooms: [...s.rooms, { name: '' }], roomCount: s.rooms.length + 1 }));
    setRoomFiles((p) => [...p, null]);
    setRoomPreviews((p) => [...p, null]);
  };

  const removeRoom = (idx) => {
    setForm((s) => {
      const rooms = s.rooms.slice();
      rooms.splice(idx, 1);
      return { ...s, rooms, roomCount: rooms.length };
    });
    setRoomFiles((p) => {
      const n = p.slice();
      n.splice(idx, 1);
      return n;
    });
    setRoomPreviews((p) => {
      const n = p.slice();
      n.splice(idx, 1);
      return n;
    });
  };

  // 파일 선택
  const onCoverPick = (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) {
      // 사용자가 '취소'를 눌렀으므로 기존 상태 유지
      return;
    }
    const f = files[0];
    setCoverFile(f);
    setCoverPreview(URL.createObjectURL(f));
    setErrorState((prev) => ({ ...prev, cover: '' }));
  };
  const onRoomPick = (idx, e) => {
    const files = e.target.files;
    if (!files || files.length === 0) {
      // 취소 → 기존 상태 유지
      return;
    }
    const f = files[0];
    setRoomFiles((arr) => {
      const n = arr.slice();
      n[idx] = f;
      return n;
    });
    setRoomPreviews((arr) => {
      const n = arr.slice();
      n[idx] = URL.createObjectURL(f);
      return n;
    });
    setErrorState((prev) => ({ ...prev, roomImage: '' }));
  };

  // 멀티 업로드
  const uploadAllImages = async () => {
    const files = [];
    const keys = [];
    if (coverFile) {
      files.push(coverFile);
      keys.push('cover');
    }
    roomFiles.forEach((f, i) => {
      if (f) {
        files.push(f);
        keys.push(`room-${i}`);
      }
    });
    if (files.length === 0) return [];

    const fd = new FormData();
    files.forEach((f) => fd.append('files', f));
    keys.forEach((k) => fd.append('keys', k));
    const res = await axios.post('http://127.0.0.1:8080/api/images/upload-multi', fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  };

  const submit = async (e) => {
    e.preventDefault();
    setClickButton(true);
    setSubmitting(true);

    // 1. 이름
    if (!form.name) {
      setErrorState((prev) => ({ ...prev, name: '이름을 입력해 주세요.' }));
      if (nameRef.current) {
        nameRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        nameRef.current.focus();
      }
      setSubmitting(false);
      return;
    }
    // 2. 연락처
    if (!form.phone_number) {
      setErrorState((prev) => ({ ...prev, phone: '연락처를 입력해 주세요.' }));
      if (phoneRef.current) {
        phoneRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        phoneRef.current.focus();
      }
      setSubmitting(false);
      return;
    }
    if (!phoneValid) {
      setErrorState((prev) => ({ ...prev, phone: '연락처 형식을 확인해 주세요. (예: 012-3456-7890)' }));
      if (phoneRef.current) {
        phoneRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        phoneRef.current.focus();
      }
      setSubmitting(false);
      return;
    }
    // 3. 주소
    let address = form.address;
    if (addressType === 'select') {
      address = [sido, gugun, dong, detail].filter(Boolean).join(' ');
      if (!sido || !gugun || !dong || !detail) {
        setErrorState((prev) => ({ ...prev, address: '주소를 모두 선택하고 상세주소를 입력해 주세요.' }));
        setTimeout(() => {
          if (!sido && sidoRef.current) {
            sidoRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
            sidoRef.current.focus();
          } else if (!gugun && gugunRef.current) {
            gugunRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
            gugunRef.current.focus();
          } else if (!dong && dongRef.current) {
            dongRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
            dongRef.current.focus();
          } else if (!detail && detailRef.current) {
            detailRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
            detailRef.current.focus();
          }
        }, 100);
        setSubmitting(false);
        return;
      }
    } else {
      if (!form.address) {
        setErrorState((prev) => ({ ...prev, address: '주소를 입력해 주세요.' }));
        setTimeout(() => {
          if (addressInputRef.current) {
            addressInputRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
            addressInputRef.current.focus();
          }
        }, 100);
        setSubmitting(false);
        return;
      }
    }
    // 4. 대표 이미지
    if (!coverFile) {
      setErrorState((prev) => ({ ...prev, cover: '대표 이미지를 업로드해 주세요.' }));
      if (coverBtnRef.current) {
        coverBtnRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        coverBtnRef.current.focus();
      }
      setSubmitting(false);
      return;
    }
    // 5. 소개
    if (!form.description) {
      setErrorState((prev) => ({ ...prev, description: '소개를 입력해 주세요.' }));
      if (descRef.current) {
        descRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        descRef.current.focus();
      }
      setSubmitting(false);
      return;
    }
    // 6. 방 정보
    for (let i = 0; i < form.rooms.length; i++) {
      const r = form.rooms[i];
      if (!r.name || !r.capacity || !r.price) {
        setErrorState((prev) => ({ ...prev, room: `모든 방의 이름, 정원, 가격을 입력해 주세요. (방 ${i + 1})` }));
        setSubmitting(false);
        return;
      }
    }
    // 7. 방 이미지
    for (let i = 0; i < roomFiles.length; i++) {
      if (!roomFiles[i]) {
        setErrorState((prev) => ({ ...prev, roomImage: `모든 방의 이미지를 업로드해 주세요. (방 ${i + 1})` }));
        setSubmitting(false);
        return;
      }
    }
    try {
      // 4) 이미지 업로드
      const uploaded = await uploadAllImages();
      if (!Array.isArray(uploaded)) {
        console.error('upload API returned non-array:', uploaded);
        // setErrorMsg('이미지 업로드 응답 형식이 올바르지 않습니다.');
        setSubmitting(false);
        return;
      }
      const uploadedMap = new Map(uploaded.map((item) => [item.key, item]));

      // 5) payload 생성 (rating=0 고정)
      const payload = {
        name: form.name,
        description: form.description,
        address,
        rating: 0,
        photo_id: uploadedMap.get('cover')?.id ?? (Number(form.photo_id) || 0),
        phone_number: form.phone_number,
        room_count: form.rooms.length,
        rooms: form.rooms.map((r, i) => ({
          name: r.name,
          capacity: Number(r.capacity) || 1,
          price: Number(r.price) || 0,
          photo_id: uploadedMap.get(`room-${i}`)?.id ?? (Number(r.photo_id) || 0),
        })),
      };

      // 6) 생성 API 호출(부모에서 주는 onSubmit 사용)
      await onSubmit(payload);
      alert('게스트하우스가 생성되었습니다.');
    } catch (err) {
      console.error(err);
      // setErrorMsg('저장 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <h2 style={{ textAlign: 'center', marginTop: 10, marginBottom: 25 }}>게스트하우스 생성</h2>
      <form className="gh-form" onSubmit={submit}>
        {/* 글로벌 에러 배너 제거, 개별 에러만 표시 */}

        {/* 1) 이름 / 연락처 */}
        <div className="form-row" style={{ marginBottom: 0 }}>
          <label className="input-label input-column" style={{ position: 'relative' }}>
            <span>이름</span>
            <input
              name="name"
              value={form.name}
              onChange={change}
              ref={nameRef}
              placeholder="게스트하우스 이름"
              className="gray-placeholder"
            />
            {errorState.name && (
              <span
                style={{
                  position: 'absolute',
                  right: 10,
                  top: 0,
                  fontSize: 13,
                  fontWeight: 600,
                  color: '#e74c3c',
                  transition: 'color 0.2s',
                }}
              >
                {errorState.name}
              </span>
            )}
          </label>
          <label className="input-label input-column" style={{ position: 'relative' }}>
            <span>연락처(전화)</span>
            <input
              name="phone_number"
              value={form.phone_number}
              onChange={change}
              ref={phoneRef}
              placeholder="012-3456-7890"
              className="gray-placeholder"
              maxLength={13}
              style={{ paddingRight: 110 }}
              type="tel"
            />
            {errorState.phone ? (
              <span
                style={{ position: 'absolute', right: 10, top: 0, fontSize: 13, fontWeight: 600, color: '#e74c3c' }}
              >
                {errorState.phone}
              </span>
            ) : form.phone_number ? (
              <span
                style={{
                  position: 'absolute',
                  right: 10,
                  top: 0,
                  fontSize: 13,
                  fontWeight: 600,
                  color: phoneValid ? '#1bc900' : '#e74c3c',
                }}
              >
                {phoneValid ? '형식 확인됨' : '형식: 012-3456-7890'}
              </span>
            ) : null}
          </label>
        </div>

        {/* 2) 주소 / 상세주소 (이름/연락처 '바로 아래'로 이동) */}
        <div className="form-row" style={{ marginBottom: 0 }}>
          <label className="input-label input-column" style={{ width: '100%', position: 'relative' }}>
            <span>주소</span>
            <div className="address-row-flex">
              <div className="address-selects-flex">
                {addressType === 'select' ? (
                  <>
                    <select ref={sidoRef} value={sido} onChange={handleSido} className="gray-placeholder sido-select">
                      <option value="">시/도</option>
                      {SIDO_LIST.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                    <select
                      ref={gugunRef}
                      value={gugun}
                      onChange={handleGugun}
                      className="gray-placeholder"
                      disabled={!sido}
                      style={{ maxWidth: 120 }}
                    >
                      <option value="">시/군/구</option>
                      {(DUMMY_GUGUN[sido] || []).map((g) => (
                        <option key={g} value={g}>
                          {g}
                        </option>
                      ))}
                    </select>
                    <select
                      ref={dongRef}
                      value={dong}
                      onChange={handleDong}
                      className="gray-placeholder"
                      disabled={!gugun}
                      style={{ maxWidth: 120 }}
                    >
                      <option value="">동/읍/면</option>
                      {(DUMMY_DONG[gugun] || []).map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                  </>
                ) : (
                  <input
                    ref={addressInputRef}
                    name="address"
                    value={form.address}
                    onChange={(e) => {
                      change(e);
                      setErrorState((prev) => ({ ...prev, address: '' }));
                    }}
                    placeholder="전체 주소를 직접 입력"
                    className="gray-placeholder"
                    style={{ flex: 1 }}
                  />
                )}
              </div>
              <div className="address-type-toggle address-type-right">
                <button
                  type="button"
                  className={addressType === 'select' ? 'primary' : 'outline'}
                  onClick={() => handleAddressType('select')}
                >
                  선택식
                </button>
                <button
                  type="button"
                  className={addressType === 'manual' ? 'primary' : 'outline'}
                  onClick={() => handleAddressType('manual')}
                >
                  직접입력
                </button>
              </div>
            </div>
            {/* 주소 에러 메시지 */}
            {errorState.address && (
              <span
                style={{
                  position: 'absolute',
                  right: 10,
                  top: 0,
                  fontSize: 13,
                  fontWeight: 600,
                  color: '#e74c3c',
                  transition: 'color 0.2s',
                }}
              >
                {errorState.address}
              </span>
            )}
          </label>
        </div>

        {addressType === 'select' && (
          <div className="form-row" style={{ marginBottom: 0 }}>
            <label className="input-label input-column" style={{ width: '100%', position: 'relative' }}>
              <span>상세주소</span>
              <input
                ref={detailRef}
                value={detail}
                onChange={handleDetail}
                placeholder="상세주소"
                className="gray-placeholder"
                disabled={!dong}
              />
              {/* 상세주소 에러 메시지 (주소 전체 에러와 동일하게 처리) */}
              {errorState.address && (
                <span
                  style={{
                    position: 'absolute',
                    right: 10,
                    top: 0,
                    fontSize: 13,
                    fontWeight: 600,
                    color: '#e74c3c',
                    transition: 'color 0.2s',
                  }}
                >
                  {errorState.address}
                </span>
              )}
            </label>
          </div>
        )}

        {/* 3) 대표 이미지(왼쪽) | 소개(오른쪽) - 라벨을 각 입력 '위'에 배치 */}
        <div className="form-row two-col" style={{ alignItems: 'flex-start', gap: 16 }}>
          <div className="input-label input-column" style={{ flex: '0 0 340px', position: 'relative' }}>
            <span>대표 이미지</span>
            <div className="file-and-preview" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 0, marginTop: 10 }}>
                <input
                  id="cover-file"
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onClick={(e) => {
                    e.currentTarget.value = '';
                  }}
                  onChange={onCoverPick}
                />
                <button
                  type="button"
                  ref={coverBtnRef}
                  onClick={() => document.getElementById('cover-file').click()}
                  style={{
                    padding: '8px 16px',
                    background: '#f5f6fa',
                    borderRadius: 6,
                    border: '1px solid #dbe2ef',
                    color: '#222',
                    cursor: 'pointer',
                    fontWeight: 500,
                  }}
                >
                  {coverFile ? '사진 재업로드' : '사진 업로드'}
                </button>
                <span className="file-placeholder" style={{ color: '#666', fontSize: 14 }}>
                  {coverFile ? coverFile.name : '선택된 파일 없음'}
                </span>
              </div>
              {coverPreview && (
                <img
                  src={coverPreview}
                  alt="대표 미리보기"
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    openLightbox(coverPreview, '대표 이미지');
                  }}
                  style={{
                    width: 340,
                    height: 220,
                    objectFit: 'cover',
                    borderRadius: 10,
                    boxShadow: '0 1px 6px rgba(0,0,0,0.1)',
                    cursor: 'zoom-in',
                  }}
                />
              )}
              {form.photo_id ? <span className="muted">현재 photo_id: {form.photo_id}</span> : null}
            </div>
            {/* 대표 이미지 에러 메시지 */}
            {errorState.cover && (
              <span
                style={{
                  position: 'absolute',
                  right: 10,
                  top: 0,
                  fontSize: 13,
                  fontWeight: 600,
                  color: '#e74c3c',
                  transition: 'color 0.2s',
                }}
              >
                {errorState.cover}
              </span>
            )}
          </div>

          <label className="input-label input-column" style={{ flex: 1, position: 'relative' }}>
            <span>소개</span>
            <textarea
              name="description"
              value={form.description}
              onChange={change}
              ref={descRef}
              rows={8}
              placeholder="간단한 소개를 입력하세요"
              className="gray-placeholder"
              style={{ minHeight: 220 }}
            />
            {errorState.description && (
              <span
                style={{
                  position: 'absolute',
                  right: 10,
                  top: 0,
                  fontSize: 13,
                  fontWeight: 600,
                  color: '#e74c3c',
                  transition: 'color 0.2s',
                }}
              >
                {errorState.description}
              </span>
            )}
          </label>
        </div>

        {/* 4) 방 정보: 이미지 클릭 확대 + 삭제 버튼 항상 보이도록 정렬 */}
        <div className="form-section" style={{ marginTop: 8, fontWeight: 600, color: '#0b2a3a' }}>
          방 정보
        </div>
        {form.rooms.map((r, i) => (
          <div
            key={i}
            className="room-row"
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 12,
              flexWrap: 'wrap',
              border: '1px solid #eef1f3',
              borderRadius: 10,
              padding: 10,
              marginBottom: 0,
            }}
          >
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', position: 'relative' }}>
              <input
                placeholder="방 이름"
                value={r.name}
                onChange={(e) => changeRoom(i, 'name', e.target.value)}
                className="gray-placeholder"
                style={{ width: 140 }}
              />
              <input
                placeholder="정원"
                type="number"
                min="1"
                value={r.capacity || ''}
                onChange={(e) => changeRoom(i, 'capacity', e.target.value)}
                className="gray-placeholder"
                style={{ width: 80 }}
              />
              <input
                placeholder="가격"
                type="number"
                min="0"
                value={r.price || ''}
                onChange={(e) => changeRoom(i, 'price', e.target.value)}
                className="gray-placeholder"
                style={{ width: 110 }}
              />
            </div>

            {errorState.room && errorState.room.includes(`방 ${i + 1}`) && (
              <div style={{ width: '100%', marginTop: 0 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#e74c3c' }}>{errorState.room}</span>
              </div>
            )}

            {/* 이미지 업로드 & 미리보기 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginLeft: 'auto' }}>
              <div
                className="file-and-preview"
                // ⛳️ 기존: alignItems:'center', position:'relative'
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 8, minWidth: 260 }}
              >
                <input
                  id={`room-file-${i}`}
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onClick={(e) => {
                    e.currentTarget.value = '';
                  }}
                  onChange={(e) => onRoomPick(i, e)}
                />

                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <button
                    type="button"
                    onClick={() => document.getElementById(`room-file-${i}`).click()}
                    style={{
                      padding: '6px 14px',
                      background: '#f5f6fa',
                      borderRadius: 6,
                      border: '1px solid #dbe2ef',
                      color: '#222',
                      cursor: 'pointer',
                      fontWeight: 500,
                    }}
                  >
                    {roomFiles[i] ? '사진 재업로드' : '사진 업로드'}
                  </button>
                  <span className="file-placeholder" style={{ color: '#666', fontSize: 14 }}>
                    {roomFiles[i] ? roomFiles[i].name : '선택된 파일 없음'}
                  </span>

                  {roomPreviews[i] && (
                    <img
                      src={roomPreviews[i]}
                      alt={`방${i + 1} 미리보기`}
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        openLightbox(roomPreviews[i], `방 ${i + 1} 이미지`);
                      }}
                      style={{
                        width: 200,
                        height: 100,
                        objectFit: 'cover',
                        borderRadius: 8,
                        boxShadow: '0 1px 6px rgba(0,0,0,0.1)',
                        cursor: 'zoom-in',
                      }}
                    />
                  )}
                </div>

                {/* ✅ 절대 위치(absolute) 삭제, 아래쪽 블록으로 노출 */}
                {errorState.roomImage && errorState.roomImage.includes(`방 ${i + 1}`) && (
                  <div style={{ marginTop: 2 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#e74c3c' }}>{errorState.roomImage}</span>
                  </div>
                )}

                {r.photo_id ? <span className="muted">photo_id: {r.photo_id}</span> : null}
              </div>

              {form.rooms.length > 1 && (
                <button
                  type="button"
                  className="remove room-remove-btn"
                  onClick={() => removeRoom(i)}
                  style={{ alignSelf: 'center' }}
                >
                  삭제
                </button>
              )}
            </div>
          </div>
        ))}

        <div className="actions" style={{ marginTop: 6 }}>
          <button type="button" className="add" onClick={addRoom}>
            + 방 추가
          </button>
        </div>

        <div className="actions" style={{ marginTop: 16 }}>
          <button type="button" className="outline close-btn" onClick={onCancel}>
            닫기
          </button>
          <button className="primary" type="submit" disabled={submitting}>
            {submitting ? '저장 중...' : '저장'}
          </button>
        </div>

        {/* 라이트박스(이미지 확대) */}
        {lightbox.open && (
          <div
            onClick={closeLightbox}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 9999,
              cursor: 'zoom-out',
            }}
          >
            <img
              src={lightbox.src}
              alt={lightbox.alt}
              style={{
                maxWidth: '90vw',
                maxHeight: '85vh',
                borderRadius: 10,
                boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
              }}
            />
          </div>
        )}
      </form>
    </>
  );
}
