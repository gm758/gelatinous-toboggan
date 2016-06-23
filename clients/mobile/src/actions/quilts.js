import {
  REQUEST_QUILTS,
  RECEIVE_QUILTS,
  REVIEW_QUILT,
  SELECT_WATCH_QUILT,
} from '../constants/ActionTypes';
import ip from '../config';

export const reviewQuilt = (file) => ({
  type: REVIEW_QUILT,
  payload: file,
});

const requestQuilts = () => ({
  type: REQUEST_QUILTS,
});

const receiveQuilts = (quilts) => ({
  type: RECEIVE_QUILTS,
  payload: quilts,
});

export function fetchQuilts(token) {
  return (dispatch) => {
    dispatch(requestQuilts());
    return fetch(`http://${ip}:8000/api/quilt?token=${token}`)
      .then(response => response.json())
      .then(data => dispatch(receiveQuilts(data)))
      .catch(error => console.error('Error in getting user\'s quilts', error));
  };
}

export function selectWatchQuilt(data) {
  return {
    type: SELECT_WATCH_QUILT,
    payload: data,
  };
}
