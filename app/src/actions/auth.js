import {
  LOGIN_REQUEST,
  LOGIN_SUCCESS,
  LOGIN_FAILURE,
} from '../constants/ActionTypes';
import ip from '../config';
import Keychain from 'react-native-keychain';

function requestLogin() {
  return {
    type: LOGIN_REQUEST,
  };
}

function receiveLogin(user) {
  return {
    type: LOGIN_SUCCESS,
    payload: user,
  };
}

function loginError(message) {
  return {
    type: LOGIN_FAILURE,
    payload: { message }
  };
}

export function loginUser(usernameOrEmail, password) {
  return (dispatch, getState) => {
    dispatch(requestLogin());
    return fetch(`http://${ip}:8000/api/auth?usernameOrEmail=${usernameOrEmail}&password=${password}`)
    .then(response => response.json().then(user => ({ user, response })))
    .then(({user, response}) => {
      if (response.ok) {
        dispatch(receiveLogin(user))
        Keychain.setInternetCredentials(ip, JSON.stringify(getState().get('auth')), '')
      } else {
        dispatch(loginError(user.message))
      }
    })
    .catch(error => dispatch(loginError('Unknown Error')));
  };
}

export function signupUser(email, password) {
  return (dispatch, getState) => {
    dispatch(requestLogin());
    return fetch(`http://${ip}:8000/api/auth?email=${email}&password=${password}`, {
      method: 'POST',
    })
    .then(response => response.json().then(user => ({ user, response })))
    .then(({user, response}) => {
      if (response.ok) {
        dispatch(receiveLogin(user))
        Keychain.setInternetCredentials(ip, JSON.stringify(getState().get('auth')), '')
      } else {
        dispatch(loginError(user.message))
      }
    })
    .catch(error => dispatch(loginError('Unknown Error')));
  };
}
