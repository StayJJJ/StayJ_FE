// src/pages/host/GuesthouseForm.js
import { useState } from 'react';
import './GuesthouseForm.css';

const SIDO_LIST = ['제주특별자치도'];
const DUMMY_GUGUN = {
  '제주특별자치도': ['제주시', '서귀포시'],
};
const DUMMY_DONG = {
  '제주시': ['이도이동', '노형동', '연동'],
  '서귀포시': ['중문동', '대정읍', '남원읍'],
};

const EMPTY = {
  name: '',
  description: '',
  address: '',
  phone_number: '',
  rooms: [{ name: ''}],
  roomCount: 1,
};

export default function GuesthouseForm({ initialValues = EMPTY, onSubmit, onCancel }) {
  // 최초 생성 시에는 EMPTY, 수정 시에는 initialValues가 반영됨
  const [form, setForm] = useState(() => ({ ...EMPTY, ...initialValues }));
  // 주소 선택식 상태
  const [sido, setSido] = useState('');
  const [gugun, setGugun] = useState('');
  const [dong, setDong] = useState('');
  const [detail, setDetail] = useState('');
  const [addressType, setAddressType] = useState('select'); // select | manual

  const change = (e) => {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  };

  // 주소 선택 핸들러
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

  // 주소 입력 방식 변경
  const handleAddressType = (type) => {
    setAddressType(type);
    if (type === 'manual') {
      setSido(''); setGugun(''); setDong(''); setDetail('');
    }
  };

  const changeRoom = (idx, key, val) => {
    setForm((s) => {
      const rooms = s.rooms.slice();
      rooms[idx] = { ...rooms[idx], [key]: key === 'capacity' || key === 'price' || key === 'photo_id' ? Number(val) : val };
      return { ...s, rooms, roomCount: rooms.length };
    });
  };

  const addRoom = () => setForm((s) => ({ ...s, rooms: [...s.rooms, { name: '' }], roomCount: s.rooms.length + 1 }));
  const removeRoom = (idx) => setForm((s) => {
    const rooms = s.rooms.slice();
    rooms.splice(idx, 1);
    return { ...s, rooms, roomCount: rooms.length };
  });

  const submit = async (e) => {
    e.preventDefault();
    let hostIdRaw = localStorage.getItem('hostId');
    let hostId = hostIdRaw !== null && hostIdRaw !== '' ? Number(hostIdRaw) : null;
    console.log('hostId from localStorage:', hostIdRaw, '->', hostId);
    let address = form.address;
    if (addressType === 'select') {
      address = [sido, gugun, dong, detail].filter(Boolean).join(' ');
    }
    const payload = {
      name: form.name,
      description: form.description,
      address,
      rating: Number(form.rating) || 0,
      photo_id: Number(form.photo_id) || 0,
      phone_number: form.phone_number,
      room_count: form.rooms.length,
      rooms: form.rooms.map(r => ({
        name: r.name,
        capacity: Number(r.capacity) || 1,
        price: Number(r.price) || 0,
        photo_id: Number(r.photo_id) || 0
      })),
    };
    await onSubmit(payload);
  };

  return (
    <form className="gh-form" onSubmit={submit}>
      <div className="form-row">
        <label className="input-label input-row">
          <span>이름</span>
          <input name="name" value={form.name} onChange={change} required placeholder="게스트하우스 이름" className="gray-placeholder" />
        </label>
        <label className="input-label input-row">
          <span>연락처(전화)</span>
          <input name="phone_number" value={form.phone_number} onChange={change} placeholder="010-1234-5678" className="gray-placeholder" />
        </label>
      </div>

      <div className="form-row">
        <label className="input-label input-row" style={{width:'100%'}}>
          <span>주소</span>
          <div className="address-row-flex">
            <div className="address-selects-flex">
              {addressType === 'select' ? (
                <>
                  <select value={sido} onChange={handleSido} className="gray-placeholder sido-select" required>
                    <option value="">시/도</option>
                    {SIDO_LIST.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <select value={gugun} onChange={handleGugun} className="gray-placeholder" disabled={!sido} required style={{maxWidth:120}}>
                    <option value="">시/군/구</option>
                    {(DUMMY_GUGUN[sido]||[]).map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                  <select value={dong} onChange={handleDong} className="gray-placeholder" disabled={!gugun} required style={{maxWidth:120}}>
                    <option value="">동/읍/면</option>
                    {(DUMMY_DONG[gugun]||[]).map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </>
              ) : (
                <input name="address" value={form.address} onChange={change} placeholder="전체 주소를 직접 입력" className="gray-placeholder" required style={{flex:1}} />
              )}
            </div>
            <div className="address-type-toggle address-type-right">
              <button type="button" className={addressType==='select' ? 'primary' : 'outline'} onClick={()=>handleAddressType('select')}>선택식</button>
              <button type="button" className={addressType==='manual' ? 'primary' : 'outline'} onClick={()=>handleAddressType('manual')}>직접입력</button>
            </div>
          </div>
        </label>
      </div>
      {addressType === 'select' && (
        <div className="form-row">
          <label className="input-label input-row" style={{width:'100%'}}>
            <span>상세주소</span>
            <input value={detail} onChange={handleDetail} placeholder="상세주소" className="gray-placeholder" disabled={!dong} required style={{flex:1}} />
          </label>
        </div>
      )}



      <div className="form-row">
        <label className="input-label input-row">
          <span>대표 이미지 ID</span>
          <input name="photo_id" type="number" value={form.photo_id || ''} onChange={change} placeholder="게스트하우스 대표 이미지 ID" className="gray-placeholder" />
        </label>
        <label className="input-label input-row">
          <span>평점</span>
          <input name="rating" type="number" min="0" max="5" step="0.1" value={form.rating || ''} onChange={change} placeholder="0.0 ~ 5.0" className="gray-placeholder" />
        </label>
      </div>

      <div className="form-row">
        <label className="input-label input-row">
          <span>소개</span>
          <textarea name="description" value={form.description} onChange={change} rows={3} placeholder="간단한 소개를 입력하세요" className="gray-placeholder" />
        </label>
      </div>

  <div className="form-section" style={{ marginTop: 8, fontWeight: 600, color: '#0b2a3a' }}>방 정보</div>
      {form.rooms.map((r, i) => (
        <div key={i} className="room-row">
          <input placeholder="방 이름" value={r.name} onChange={(e)=>changeRoom(i,'name',e.target.value)} className="gray-placeholder" style={{width:110}} />
          <input placeholder="정원" type="number" min="1" value={r.capacity} onChange={(e)=>changeRoom(i,'capacity',e.target.value)} className="gray-placeholder" style={{width:60}} />
          <input placeholder="가격" type="number" min="0" value={r.price} onChange={(e)=>changeRoom(i,'price',e.target.value)} className="gray-placeholder" style={{width:80}} />
          <input placeholder="방 이미지 ID" type="number" min="0" value={r.photo_id || ''} onChange={e => changeRoom(i, 'photo_id', e.target.value)} className="gray-placeholder" style={{width:110}} />
          {form.rooms.length > 1 && <button type="button" className="remove room-remove-btn" onClick={()=>removeRoom(i)}>삭제</button>}
        </div>
      ))}
      <div className="actions" style={{ marginTop: 6 }}>
        <button type="button" className="add" onClick={addRoom}>+ 방 추가</button>
      </div>

      <div className="actions" style={{ marginTop: 16 }}>
        <button type="button" className="outline close-btn" onClick={onCancel}>닫기</button>
        <button className="primary" type="submit">저장</button>
      </div>
    </form>
  );
}
