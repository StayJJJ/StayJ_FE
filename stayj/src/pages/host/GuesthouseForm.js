// src/pages/host/GuesthouseForm.js
import { useState } from 'react';
import './GuesthouseForm.css';


const EMPTY = {
  name: '', description: '', address: '',
  phone_number: '', rating: 0,
  // rooms 최소 1개
  rooms: [{ name: '', capacity: 2, price: 100000 }],
  photo_id: 0, roomCount: 1,
};

export default function GuesthouseForm({ initialValues = EMPTY, onSubmit, onCancel }) {
  const [form, setForm] = useState({ ...EMPTY, ...initialValues });

  const change = (e) => {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: name === 'rating' ? Number(value) : value }));
  };

  const changeRoom = (idx, key, val) => {
    setForm((s) => {
      const rooms = s.rooms.slice();
      rooms[idx] = { ...rooms[idx], [key]: key === 'capacity' || key === 'price' ? Number(val) : val };
      return { ...s, rooms, roomCount: rooms.length };
    });
  };

  const addRoom = () => setForm((s) => ({ ...s, rooms: [...s.rooms, { name: '', capacity: 2, price: 100000 }], roomCount: s.rooms.length + 1 }));
  const removeRoom = (idx) => setForm((s) => {
    const rooms = s.rooms.slice();
    rooms.splice(idx, 1);
    return { ...s, rooms, roomCount: rooms.length };
  });

  const submit = async (e) => {
    e.preventDefault();
    const hostId = Number(localStorage.getItem('hostId')) || undefined; // 필요시 저장해두고 씀
    const payload = {
      name: form.name,
      description: form.description,
      address: form.address,
      rating: Number(form.rating) || 0,
      photo_id: Number(form.photo_id) || 0,
      phone_number: form.phone_number,
      roomCount: form.rooms.length,
      hostId, // 백엔드가 토큰으로 처리하면 undefined로 넘어가도 무방
      rooms: form.rooms.map(r => ({
        name: r.name, capacity: Number(r.capacity) || 1, price: Number(r.price) || 0
      })),
    };
    await onSubmit(payload);
  };

  return (
    <form className="gh-form" onSubmit={submit}>
      <label>이름<input name="name" value={form.name} onChange={change} required /></label>
      <label>소개<textarea name="description" value={form.description} onChange={change} rows={3} /></label>
      <label>주소<input name="address" value={form.address} onChange={change} /></label>
      <label>연락처(전화)<input name="phone_number" value={form.phone_number} onChange={change} /></label>
      <label>초기 평점<input name="rating" type="number" step="0.1" min="0" max="5" value={form.rating} onChange={change} /></label>
      <label>사진 ID<input name="photo_id" type="number" value={form.photo_id} onChange={change} /></label>

      <div style={{ marginTop: 8, fontWeight: 600 }}>방 정보</div>
      {form.rooms.map((r, i) => (
        <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 100px 120px auto', gap: 8, alignItems: 'center' }}>
          <input placeholder="방 이름" value={r.name} onChange={(e)=>changeRoom(i,'name',e.target.value)} />
          <input placeholder="정원" type="number" min="1" value={r.capacity} onChange={(e)=>changeRoom(i,'capacity',e.target.value)} />
          <input placeholder="가격" type="number" min="0" value={r.price} onChange={(e)=>changeRoom(i,'price',e.target.value)} />
          {form.rooms.length > 1 && <button type="button" onClick={()=>removeRoom(i)}>삭제</button>}
        </div>
      ))}
      <div className="actions" style={{ marginTop: 6 }}>
        <button type="button" onClick={addRoom}>+ 방 추가</button>
      </div>

      <div className="actions" style={{ marginTop: 8 }}>
        <button type="button" onClick={onCancel}>취소</button>
        <button className="primary">저장</button>
      </div>
    </form>
  );
}
