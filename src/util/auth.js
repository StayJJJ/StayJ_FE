import Cookies from 'js-cookie';

export const getUserIdFromCookie = () =>
  Cookies.get('id') || Cookies.get('Id');

export const isAuthed = () =>
  Boolean(getUserIdFromCookie() || Cookies.get('accessToken'));
