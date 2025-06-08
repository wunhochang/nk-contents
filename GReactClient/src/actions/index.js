import axios from 'axios';
import cookie from 'react-cookie';
import { STATIC_ERROR, FETCH_USER } from './types';
import { logoutUser, successTokenAction } from './auth';

export const API_URL = process.env.API_URL;
//export const API_URL = 'http://10.0.1.145/api';

// export const CLIENT_ROOT_URL = 'http://localhost:5555';
export const CLIENT_ROOT_URL = process.env.CLIENT_ROOT_URL;

//= ===============================
// Utility actions
//= ===============================
/* export function init(){

if(process.env.NODE_ENV == 'production')
  API_URL
}
*/
export const pageSize = 20;
export const treeListWidth = 200;

export function paramsHandler(param) {
  //return "'" + JSON.stringify(param) + "'";
  return JSON.stringify(param);
}

export function paramsPostHandler(param) {
  return "'" + JSON.stringify(param) + "'";
}

export function fetchUser(uid) {
  return function (dispatch) {
    axios.get(`${API_URL}/user/${uid}`, {
      headers: { Authorization: cookie.load('token') },
    })
    .then((response) => {
      dispatch({
        type: FETCH_USER,
        payload: response.data.user,
      });
    })
    .catch(response => dispatch(errorHandler(response.data.error)));
  };
}
export function refreshToken(){
    const config = { headers: {
      'Authorization': cookie.load('token'),
      'Content-Type': 'application/json;charset=UTF-8;'
    } };
    const params = {};
    axios.post(`${API_URL}/TokenRefresh`, params, config)
    .then((response) => {
      console.log('refreshToken success');
      console.log(response);
      cookie.save('token', 'Bearer ' + response.data.access_token, { path: '/' });
      cookie.save('expires_in', response.data.expires_in, { path: '/' });
      //dispatch(successTokenAction('Token 재생성성공!!'));
      //this.successAction();
     successTokenAction(response, 'Token 재생성성공!!')

      return true;
    })
    .catch((error) => {
      dispatch(logoutUser('로그인시간 만료!!'));
      return false;
    });
}



export function errorHandler(dispatch, error, type) {
  console.log('Error type: ', type);
  console.log(error);

  let errorMessage = error.response ? error.response.data : error;
  console.log(this.props);
   // NOT AUTHENTICATED ERROR
  if (error.status === 401) {
    errorMessage = 'You are not authorized to do this.';
    return dispatch(logoutUser(errorMessage));
  }
  else if (error.status === 400) {
    errorMessage = error;
    return dispatch(logoutUser('aaaa'));
  }

  dispatch({
    type,
    payload: errorMessage,
  });
}

// Post Request
export function postData(action, errorType, isAuthReq, url, dispatch, data) {
  const requestUrl = API_URL + url;
  let headers = {};

  if (isAuthReq) {
    headers = { headers: { Authorization: cookie.load('token') } };
  }

  axios.post(requestUrl, data, headers)
  .then((response) => {
    dispatch({
      type: action,
      payload: response.data,
    });
  })
  .catch((error) => {
    errorHandler(dispatch, error.response, errorType);
  });
}

// Get Request
export function getData(action, errorType, isAuthReq, url, dispatch) {
  const requestUrl = API_URL + url;
  let headers = {};

  if (isAuthReq) {
    headers = { headers: { Authorization: cookie.load('token') } };
  }

  axios.get(requestUrl, headers)
  .then((response) => {
    dispatch({
      type: action,
      payload: response.data,
    });
  })
  .catch((error) => {
    errorHandler(dispatch, error.response, errorType);
  });
}

// Put Request
export function putData(action, errorType, isAuthReq, url, dispatch, data) {
  const requestUrl = API_URL + url;
  let headers = {};

  if (isAuthReq) {
    headers = { headers: { Authorization: cookie.load('token') } };
  }

  axios.put(requestUrl, data, headers)
  .then((response) => {
    dispatch({
      type: action,
      payload: response.data,
    });
  })
  .catch((error) => {
    errorHandler(dispatch, error.response, errorType);
  });
}

// Delete Request
export function deleteData(action, errorType, isAuthReq, url, dispatch) {
  const requestUrl = API_URL + url;
  let headers = {};

  if (isAuthReq) {
    headers = { headers: { Authorization: cookie.load('token') } };
  }

  axios.delete(requestUrl, headers)
  .then((response) => {
    dispatch({
      type: action,
      payload: response.data,
    });
  })
  .catch((error) => {
    errorHandler(dispatch, error.response, errorType);
  });
}

//= ===============================
// Static Page actions
//= ===============================
export function sendContactForm({ name, emailAddress, message }) {
  return function (dispatch) {
    axios.post(`${API_URL}/communication/contact`, { name, emailAddress, message })
    .then((response) => {
      dispatch({
        type: SEND_CONTACT_FORM,
        payload: response.data.message,
      });
    })
    .catch((error) => {
      errorHandler(dispatch, error.response, STATIC_ERROR);
    });
  };
}
