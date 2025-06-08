import axios from 'axios';
//import { browserHistory } from 'react-router';
import cookie from 'react-cookie';
import "babel-polyfill";
import { API_URL, CLIENT_ROOT_URL, paramsHandler, paramsPostHandler, errorHandler } from './index';
import { AUTH_USER, AUTH_ERROR, UNAUTH_USER, FORGOT_PASSWORD_REQUEST, RESET_PASSWORD_REQUEST, PROTECTED_TEST } from './types';

//= ===============================
// Authentication actions
//= ===============================

// TO-DO: Add expiration to cookie
export function loginUser({ user_id, password }) {
  return function (dispatch) {
    //const config = { headers: {'Access-Control-Request-Headers':'application/json;charset=UTF-8;','Access-Control-Request-Method':'POST', 'Content-Type': 'application/json;charset=UTF-8;' } };
    const config = { headers: {'Content-Type': 'application/json;charset=UTF-8;' } };
    const params = paramsPostHandler({"user_id":user_id, "password":password});
    console.log(params);
    axios.post(`${API_URL}/Token`, params, config)
    .then((response) => {
      console.log(response);
      cookie.save('token', 'Bearer ' + response.data.access_token, { path: '/' });
      cookie.save('expires_in', response.data.expires_in, { path: '/' });
      dispatch({ type: AUTH_USER });

      //browserHistory.push(`${CLIENT_ROOT_URL}/`);
      window.location.href = `${CLIENT_ROOT_URL}/`;


      //routie(`${CLIENT_ROOT_URL}/`);

    })
    .catch((error) => {
      dispatch({
        type: UNAUTH_USER,
        payload: '입력하신 아이디 및 비밀번호를 다시 확인해주세요.',
      });
      //errorHandler(dispatch, error.response, AUTH_ERROR);
      $("#getCode").html(error.response.data);
      $("#getCodeModal").modal('show');
    });
  };

}

export function registerUser({ email, firstName, lastName, password }) {
  return function (dispatch) {
    axios.post(`${API_URL}/auth/register`, { email, firstName, lastName, password })
    .then((response) => {
      cookie.save('token', response.data.token, { path: '/' });
      cookie.save('user', response.data.user, { path: '/' });
      dispatch({ type: AUTH_USER });
      window.location.href = `${CLIENT_ROOT_URL}/dashboard`;
    })
    .catch((error) => {
      errorHandler(dispatch, error.response, AUTH_ERROR);
    });
  };
}

export function successTokenAction(response, msg){
  console.log('successTokenAction.....');
  window.location.reload();

  return true;
}

export function logoutUser(error) {
  return function (dispatch) {
    dispatch({ type: UNAUTH_USER, payload: error || '' });
    cookie.remove('token', { path: '/' });
    cookie.remove('user', { path: '/' });

    window.location.href = `${CLIENT_ROOT_URL}/login`;
  };
}

export function getForgotPasswordToken({ email }) {
  return function (dispatch) {
    axios.post(`${API_URL}/auth/forgot-password`, { email })
    .then((response) => {
      dispatch({
        type: FORGOT_PASSWORD_REQUEST,
        payload: response.data.message,
      });
    })
    .catch((error) => {
      errorHandler(dispatch, error.response, AUTH_ERROR);
    });
  };
}

export function resetPassword(token, { password }) {
  return function (dispatch) {
    axios.post(`${API_URL}/auth/reset-password/${token}`, { password })
    .then((response) => {
      dispatch({
        type: RESET_PASSWORD_REQUEST,
        payload: response.data.message,
      });
      // Redirect to login page on successful password reset
      //browserHistory.push('/login');
    })
    .catch((error) => {
      errorHandler(dispatch, error.response, AUTH_ERROR);
    });
  };
}

export function protectedTest() {
  return function (dispatch) {
    axios.get(`${API_URL}/protected`, {
      headers: { Authorization: cookie.load('token') },
    })
    .then((response) => {
      dispatch({
        type: PROTECTED_TEST,
        payload: response.data.content,
      });
    })
    .catch((error) => {
      errorHandler(dispatch, error.response, AUTH_ERROR);
    });
  };
}
