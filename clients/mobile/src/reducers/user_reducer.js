/* eslint-disable new-cap */
import { Map } from 'immutable';
import {
  LOGIN_REQUEST,
  LOGIN_SUCCESS,
  LOGIN_FAILURE,
  SET_USERNAME,
  SET_PHONE_NUMBER,
} from '../constants/ActionTypes';

const initialState = Map({
  isFetching: false,
  isAuthenticated: false,
  id: null,
  username: null,
  token: null,
  phoneNumber: null,
  email: null,
});

export default function (state = initialState, action) {
  switch (action.type) {
    case LOGIN_REQUEST:
      return state.merge({
        isFetching: true,
        isAuthenticated: false,
      });
    case LOGIN_SUCCESS:
      return state.merge(Object.assign({
        isFetching: false,
        isAuthenticated: true,
      }, action.payload));
    case LOGIN_FAILURE:
      return state.merge({
        isFetching: false,
        isAuthenticated: false,
      });


    case SET_USERNAME:
      return state.set('username', action.payload);
    case SET_PHONE_NUMBER:
      return state.set('phoneNumber', action.payload);

    default:
      return state;
  }
}
