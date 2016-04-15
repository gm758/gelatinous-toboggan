import {
  REQUEST_USER,
  RECEIVE_USER,
  REQUEST_NOTIFS,
  RECEIVE_NOTIFS,
  RECEIVE_POST_QUILT,
  REQUEST_POST_QUILT,
  REQUEST_ADD_QUILT,
  RESPONSE_ADD_QUILT,
  CREATE_QUILT,
  REVIEW_QUILT,
  ADD_TO_QUILT,
  WATCH_QUILT,
  LOGIN_OR_SIGNUP,
  INVITE_FRIENDS,
  REQUEST_CONTACTS,
  RECEIVE_CONTACTS,
} from '../constants/ActionTypes';

import ip from '../config';
import Keychain from 'react-native-keychain';
import Contacts from 'react-native-contacts'; // TODO: promisify
import _ from 'lodash';

export const selectLoginOrSignup = (selection) => ({
  type: LOGIN_OR_SIGNUP,
  payload: selection,
});

export const createQuilt = (data) => ({
  type: CREATE_QUILT,
  payload: data,
});

export const addToQuilt = (data) => ({
  type: ADD_TO_QUILT,
  payload: data,
});

export const watchQuilt = (data) => ({
  type: WATCH_QUILT,
  payload: data,
});

// dispatched at login to set the current user of the app
const requestUser = () => ({
  type: REQUEST_USER,
});

const receiveUser = (user) => ({
  type: RECEIVE_USER,
  payload: user,
});

export function isLoggedIn() {
  return (dispatch) => {
    dispatch(requestUser());
    return Keychain.getInternetCredentials(`${ip}`)
      .then(credentials => dispatch(receiveUser(JSON.parse(credentials.username))))
      .catch(() => dispatch(receiveUser()));
  };
}

export const reviewQuilt = (file) => ({
  type: REVIEW_QUILT,
  payload: file,
});

// begin post request to send quilt to server
const requestPostQuilt = () => ({
  type: REQUEST_POST_QUILT,
});

// receive response from the server relating to post request
// todo: format response data so that status code passed
const responsePostQuilt = (data) => ({
  type: RECEIVE_POST_QUILT,
  payload: data,
});

export function postQuilt(data) {
  return (dispatch) => {
    dispatch(requestPostQuilt());
    return fetch(`http://${ip}:8000/api/quilt?token=${data.token}`, {
      method: 'POST',
      body: data.video,
      headers: {
        'Content-Type': 'application/json',
        'Meta-Data': JSON.stringify({
          title: data.title,
          theme: data.theme,
          users: data.users,
          creator: data.creator,
        }),
      },
    })
    .then(response => dispatch(responsePostQuilt(response.status)))
    .catch(err => console.error('post quilt error', err));
  };
}

export const contributeToQuilt = (id) => ({
  type: REQUEST_ADD_QUILT,
  payload: id,
});

// begin post request to send quilt to server
const requestAddQuilt = () => ({
  type: REQUEST_ADD_QUILT,
});

// receive response from the server relating to post request
// todo: format response data so that status code passed
const responseAddQuilt = () => ({
  type: RESPONSE_ADD_QUILT,
});

export function postToExistingQuilt(data) {
  return (dispatch) => {
    dispatch(requestAddQuilt());
    return fetch(`http://${ip}:8000/api/quilt/${data.quiltId}?token=${data.token}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Meta-Data': JSON.stringify({
          creator: data.creator,
        }),
      },
      body: data.video,
    })
    .then(response => dispatch(responseAddQuilt(response.status)))
    .catch(err => console.error('post quilt error', err));
  };
}

const requestContacts = () => ({
  type: REQUEST_CONTACTS,
});

const receiveContacts = (data) => ({
  type: RECEIVE_CONTACTS,
  payload: data,
});

// TODO: clean up
export function getUserContacts(token, userId) {
  return (dispatch) => {
    dispatch(requestContacts());
    Contacts.getAll((err, contacts) => {
      if (err) {
        console.log('error', err);
      } else {
        const cleanContacts = contacts.reduce((acc, nxt) => {
          acc.push({
            fullName: `${nxt.givenName || ''} ${nxt.familyName || ''}`,
            emails: nxt.emailAddresses.map(obj => obj.email),
            phoneNumbers: nxt.phoneNumbers.map(obj => obj.number),
          });
          return acc;
        }, []);

        fetch(`http://${ip}:8000/api/cross?userId=${userId}&token=${token}`, {
          method: 'POST',
          body: JSON.stringify(cleanContacts),
        })
        .then(response => {
          const usersInContacts = _.uniq(JSON.parse(response._bodyInit), 'username');
          dispatch(receiveContacts(usersInContacts));
        });
      }
    });
  };
}

// TODO: remove from action creators into component
export function postFriends(userId, token, ...friendsId) {
  return () => fetch(`http://${ip}:8000/api/friends/${userId}?token=${token}`, {
    method: 'POST',
    body: JSON.stringify({ friends: friendsId }),
  });
}

const requestNotifs = () => ({
  type: REQUEST_NOTIFS,
});

const receiveNotifs = (notifs) => ({
  type: RECEIVE_NOTIFS,
  payload: notifs,
});

export function fetchNotifs(userId) {
  return (dispatch) => {
    dispatch(requestNotifs());
    return fetch(`http://${ip}:8000/api/notifications/${userId}`)
      .then((response) => response.json())
      .then((data) => dispatch(receiveNotifs(data)))
      .catch((error) => console.error('Error in getting user\'s notifications', error));
  };
}

export function inviteFriends(data) {
  return {
    type: INVITE_FRIENDS,
    payload: data,
  };
}
