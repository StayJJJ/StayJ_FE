// src/pages/host/GuesthouseForm.js
import { useState, useMemo } from 'react';
import axios from 'axios';
import './GuesthouseForm.css';

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
  const [form, setForm] = useState(() => ({ ...EMPTY, ...initialValues, rating: 0 }));

  // 주소 상태
  const [sido, setSido] = useState('');
  const [gugun, setGugun] = useState('');
  const [dong, setDong] = useState('');
  const [detail, setDetail] = useState('');
  const [addressType, setAddressType] = useState('select'); // select | manual

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
  const [errorMsg, setErrorMsg] = useState('');

  // 라이트박스(확대보기)
  const [lightbox, setLightbox] = useState({ open: false, src: '', alt: '' });
  const openLightbox = (src, alt) => setLightbox({ open: true, src, alt });
  const closeLightbox = () => setLightbox({ open: false, src: '', alt: '' });

  const change = (e) => {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  };

  // 주소 입력 핸들러
  const handleSido = (e) => {
    setSido(e.target.value);
    setGugun('');
    setDong('');
    setDetail('');
  };
  const handleGugun = (e) => {
    setGugun(e.target.value);
    setDong('');
    setDetail('');
  };
  const handleDong = (e) => {
    setDong(e.target.value);
    setDetail('');
  };
  const handleDetail = (e) => setDetail(e.target.value);

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
    // 같은 파일을 다시 선택할 수 있게 하려면(선택 완료 뒤에만 초기화)
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
    setSubmitting(true);
    setErrorMsg('');
    try {
      let address = form.address;
      if (addressType === 'select') {
        address = [sido, gugun, dong, detail].filter(Boolean).join(' ');
      }

      // 1) 이미지 업로드
      const uploaded = await uploadAllImages();
      if (!Array.isArray(uploaded)) {
        console.error('upload API returned non-array:', uploaded);
        setErrorMsg('이미지 업로드 응답 형식이 올바르지 않습니다.');
        setSubmitting(false);
        return;
      }

      const uploadedMap = new Map(uploaded.map((item) => [item.key, item]));

      // 2) payload 생성 (rating=0 고정)
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

      // 3) 생성 API 호출(부모에서 주는 onSubmit 사용)
      await onSubmit(payload);
    } catch (err) {
      console.error(err);
      setErrorMsg('저장 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="gh-form" onSubmit={submit}>
      {errorMsg && <div className="error-banner">{errorMsg}</div>}

      {/* 1) 이름 / 연락처 */}
      <div className="form-row">
        <label className="input-label input-column">
          <span>이름</span>
          <input
            name="name"
            value={form.name}
            onChange={change}
            required
            placeholder="게스트하우스 이름"
            className="gray-placeholder"
          />
        </label>
        <label className="input-label input-column">
          <span>연락처(전화)</span>
          <input
            name="phone_number"
            value={form.phone_number}
            onChange={change}
            placeholder="010-1234-5678"
            className="gray-placeholder"
          />
        </label>
      </div>

      {/* 2) 주소 / 상세주소 (이름/연락처 '바로 아래'로 이동) */}
      <div className="form-row">
        <label className="input-label input-column" style={{ width: '100%' }}>
          <span>주소</span>
          <div className="address-row-flex">
            <div className="address-selects-flex">
              {addressType === 'select' ? (
                <>
                  <select value={sido} onChange={handleSido} className="gray-placeholder sido-select" required>
                    <option value="">시/도</option>
                    {SIDO_LIST.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                  <select
                    value={gugun}
                    onChange={handleGugun}
                    className="gray-placeholder"
                    disabled={!sido}
                    required
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
                    value={dong}
                    onChange={handleDong}
                    className="gray-placeholder"
                    disabled={!gugun}
                    required
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
                  name="address"
                  value={form.address}
                  onChange={change}
                  placeholder="전체 주소를 직접 입력"
                  className="gray-placeholder"
                  required
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
        </label>
      </div>

      {addressType === 'select' && (
        <div className="form-row">
          <label className="input-label input-column" style={{ width: '100%' }}>
            <span>상세주소</span>
            <input
              value={detail}
              onChange={handleDetail}
              placeholder="상세주소"
              className="gray-placeholder"
              disabled={!dong}
              required
            />
          </label>
        </div>
      )}

      {/* 3) 대표 이미지(왼쪽) | 소개(오른쪽) - 라벨을 각 입력 '위'에 배치 */}
      <div className="form-row two-col" style={{ alignItems: 'flex-start', gap: 16 }}>
        <div className="input-label input-column" style={{ flex: '0 0 340px' }}>
          <span>대표 이미지</span>
          <div className="file-and-preview" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
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
              <span style={{ color: '#666', fontSize: 14 }}>{coverFile ? coverFile.name : '선택된 파일 없음'}</span>
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
        </div>

        <label className="input-label input-column" style={{ flex: 1 }}>
          <span>소개</span>
          <textarea
            name="description"
            value={form.description}
            onChange={change}
            rows={8}
            placeholder="간단한 소개를 입력하세요"
            className="gray-placeholder"
            style={{ minHeight: 220 }}
          />
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
            marginBottom: 8,
          }}
        >
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
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

          {/* 이미지 업로드 & 미리보기 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginLeft: 'auto' }}>
            <div className="file-and-preview" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
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
              <span style={{ color: '#666', fontSize: 14 }}>
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
                    width: 96,
                    height: 96,
                    objectFit: 'cover',
                    borderRadius: 8,
                    boxShadow: '0 1px 6px rgba(0,0,0,0.1)',
                    cursor: 'zoom-in',
                  }}
                />
              )}
              {r.photo_id ? <span className="muted">photo_id: {r.photo_id}</span> : null}
            </div>

            {/* 삭제 버튼: 항상 보이도록 컨테이너 오른쪽에 배치 */}
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
            style={{ maxWidth: '90vw', maxHeight: '85vh', borderRadius: 10, boxShadow: '0 10px 30px rgba(0,0,0,0.3)' }}
          />
        </div>
      )}
    </form>
  );
}
