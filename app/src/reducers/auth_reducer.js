/* eslint-disable new-cap */
import { Map } from 'immutable';
import {
  LOGIN_REQUEST,
  LOGIN_SUCCESS,
  LOGIN_FAILURE,
} from '../constants/ActionTypes';

const initialState = Map({
  isFetching: false,
  isAuthenticated: false,
  token: null,
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
    default:
      return state;
  }
}
