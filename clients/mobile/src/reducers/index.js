import { combineReducers } from 'redux-immutable';
import user from './user_reducer';
import quilts from './quilts_reducer';
import currentQuilt from './current_quilt_reducer';
import notifs from './notifications_reducer';
import contacts from './contacts_reducer';
import auth from './auth_reducer';

const rootReducer = combineReducers({
  auth,
  contacts,
  currentQuilt,
  notifs,
  quilts,
  user,
});

export default rootReducer;
