// src/api/hosts.js
import Cookies from 'js-cookie';
const BASE_URL = 'http://localhost:8080';

// 게스트하우스 상세 조회
export async function getGuesthouseDetail(id) {
  const res = await fetch(`${BASE_URL}/guesthouse/${id}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  });
  if (!res.ok) throw new Error('게스트하우스 상세 조회 실패');
  return await res.json();
}

// 게스트하우스 방 목록 조회
export async function getGuesthouseRooms(id) {
  const res = await fetch(`${BASE_URL}/guesthouse/${id}/rooms`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  });
  if (!res.ok) throw new Error('게스트하우스 방 목록 조회 실패');
  return await res.json();
}

// 내 게스트하우스 목록 조회
export async function getMyGuesthouses() {
  const user_id = Cookies.get('user_id');
  const res = await fetch(`${BASE_URL}/guesthouse/mylist`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'user-id': user_id,
    },
    credentials: 'include',
  });
  if (!res.ok) throw new Error('게스트하우스 목록 조회 실패');
  return await res.json();
}

// 게스트하우스 생성
export async function createGuesthouse(payload) {
  // hostId는 localStorage에서 가져와 user-id 헤더로 보냄
  const hostId = Cookies.get('user_id');

  console.log('hostId from localStorage:', hostId, ' / payload: ', payload);
  console.log(JSON.stringify(payload));

  const res = await fetch(`${BASE_URL}/guesthouse`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'user-id': hostId,
    },
    credentials: 'include',
    body: JSON.stringify(payload),
  });

  if (!res.ok) throw new Error('게스트하우스 생성 실패');
  return await res.json();
}

// 게스트하우스 수정 (후순위)
export async function updateGuesthouse(id, payload) {
  // PATCH /guesthouse/{guesthouse-id}  body: {name, description, phone_number}
  const res = await fetch(`${BASE_URL}/guesthouse/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('게스트하우스 수정 실패');
  return await res.json();
}

// 게스트하우스 삭제
export async function deleteGuesthouse(id) {
  const user_id = Cookies.get('user_id');
  const res = await fetch(`${BASE_URL}/guesthouse/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'user-id': user_id,
    },
    credentials: 'include',
  });
  if (!res.ok) throw new Error('게스트하우스 삭제 실패');
  return await res.json();
}

// 게스트하우스 예약 리스트 조회
export async function getReservationsByGuesthouse(guesthouseId) {
  const user_id = Cookies.get('user_id');
  const res = await fetch(`${BASE_URL}/guesthouse/${guesthouseId}/reservations`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'user-id': user_id,
    },
    credentials: 'include',
  });
  if (!res.ok) throw new Error('예약 목록 조회 실패');
  return await res.json();
}
