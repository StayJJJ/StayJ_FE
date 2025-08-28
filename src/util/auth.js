import Cookies from 'js-cookie';

export const getUserIdFromCookie = () => Cookies.get('user_id');
export const getUserRoleFromCookie = () => Cookies.get('role');

export const isAuthed = () => Boolean(getUserIdFromCookie() || Cookies.get('accessToken'));

// user_id, role 모두 반환
export const getUserInfo = () => {
  return {
    user_id: Cookies.get('user_id'),
    role: Cookies.get('role'),
  };
};
