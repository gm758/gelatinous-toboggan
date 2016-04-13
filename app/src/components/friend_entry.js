/* eslint-disable no-use-before-define */
import React from 'react-native';
import CheckBox from './checkbox';
import { friendEntry, colors } from '../assets/styles';

const {
  PropTypes,
  StyleSheet,
  TouchableOpacity,
} = React;

// todo: make these behave like check boxes (edit style=)
const FriendEntry = ({ user, onCheck, checked }) => (
  <CheckBox
    label={user.username}
    id={user.id}
    checked={checked}
    onCheck={() => onCheck(user.id)}
  />
);


FriendEntry.propTypes = {
  user: PropTypes.object,
  onCheck: PropTypes.func,
  checked: PropTypes.bool,
};

export default FriendEntry;
