import Cookies from 'js-cookie';

export const getUserIdFromCookie = () => Cookies.get('user_id');

export const isAuthed = () => Boolean(getUserIdFromCookie() || Cookies.get('accessToken'));
