// src/api/hosts.js
// ✅ 백엔드 없이도 동작하는 로컬스토리지 기반 더미 API
//    (명세 필드 이름을 가급적 유지: id, name, room_count, rating 등)

const LS_KEY_GH = 'stayj_host_guesthouses';
const LS_KEY_RS = 'stayj_host_reservations';
const delay = (ms = 200) => new Promise(r => setTimeout(r, ms));

function readLS(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; }
  catch { return fallback; }
}
function writeLS(key, value) { localStorage.setItem(key, JSON.stringify(value)); }

function seedIfEmpty() {
  const gh = readLS(LS_KEY_GH, null);
  if (!gh) {
    const seeded = [
      { id: 1, name: '제주 오션뷰 하우스', room_count: 3, rating: 4.5, phone_number: '010-1111-2222' },
      { id: 2, name: '한라산 게스트하우스', room_count: 5, rating: 4.2, phone_number: '010-3333-4444' },
    ];
    writeLS(LS_KEY_GH, seeded);
  }
  const rs = readLS(LS_KEY_RS, null);
  if (!rs) {
    const seededR = [
      { id: 101, room_id: 1, guest: { id: 11, username: '홍길동' }, check_in_date: '2025-08-21', check_out_date: '2025-08-23', people_count: 2, guesthouse_id: 1 },
      { id: 102, room_id: 2, guest: { id: 12, username: '이순신' }, check_in_date: '2025-08-22', check_out_date: '2025-08-24', people_count: 3, guesthouse_id: 2 },
    ];
    writeLS(LS_KEY_RS, seededR);
  }
}
seedIfEmpty();

function nextId(list) { return list.length ? Math.max(...list.map(x => x.id)) + 1 : 1; }

// ---------- 명세 기반 더미 API ----------
export async function getMyGuesthouses() {
  await delay();
  const list = readLS(LS_KEY_GH, []);
  // 응답: [{id, name, room_count, rating}]
  return list.map(({ id, name, room_count, rating }) => ({ id, name, room_count, rating }));
}

export async function createGuesthouse(payload) {
  await delay();
  const list = readLS(LS_KEY_GH, []);
  const id = nextId(list);

  // roomCount / rooms 처리: 목록에선 room_count만 쓰므로 반영
  const room_count = Array.isArray(payload?.rooms) ? payload.rooms.length : (payload?.roomCount ?? 0);
  const rating = Number(payload?.rating ?? 0);

  const item = {
    id,
    name: payload?.name ?? `게스트하우스 ${id}`,
    room_count,
    rating,
    phone_number: payload?.phone_number ?? '',
    address: payload?.address ?? '',
    description: payload?.description ?? '',
    photo_id: payload?.photo_id ?? 0,
  };
  list.push(item);
  writeLS(LS_KEY_GH, list);
  return { success: true, id };
}

export async function updateGuesthouse(id, payload) {
  await delay();
  const list = readLS(LS_KEY_GH, []);
  const idx = list.findIndex(x => x.id === Number(id));
  if (idx === -1) return { success: false };

  // 명세: name / description / phone_number (후순위), rating/room_count도 있으면 반영
  const cur = list[idx];
  const next = {
    ...cur,
    ...(payload?.name !== undefined ? { name: payload.name } : {}),
    ...(payload?.description !== undefined ? { description: payload.description } : {}),
    ...(payload?.phone_number !== undefined ? { phone_number: payload.phone_number } : {}),
    ...(payload?.rating !== undefined ? { rating: Number(payload.rating) } : {}),
    ...(payload?.rooms ? { room_count: payload.rooms.length } : {}),
    ...(payload?.roomCount !== undefined ? { room_count: payload.roomCount } : {}),
  };
  list[idx] = next;
  writeLS(LS_KEY_GH, list);
  return { success: true };
}

export async function deleteGuesthouse(id) {
  await delay();
  let list = readLS(LS_KEY_GH, []);
  list = list.filter(x => x.id !== Number(id));
  writeLS(LS_KEY_GH, list);

  // 연결 예약도 정리
  let rs = readLS(LS_KEY_RS, []);
  rs = rs.filter(r => r.guesthouse_id !== Number(id));
  writeLS(LS_KEY_RS, rs);

  return { success: true };
}

export async function getReservationsByGuesthouse(guesthouseId) {
  await delay();
  const rs = readLS(LS_KEY_RS, []);
  return rs.filter(r => r.guesthouse_id === Number(guesthouseId))
           .map(({ id, room_id, guest, check_in_date, check_out_date, people_count }) => ({
             id, room_id, guest, check_in_date, check_out_date, people_count
           }));
}
