/* eslint-disable no-use-before-define */
import React from 'react-native';
import { quiltEntry, colors } from '../assets/styles';
import Icon from 'react-native-vector-icons/FontAwesome';

const {
  PropTypes,
  Text,
  TouchableHighlight,
  View,
} = React;

// todo: make these behave like check boxes (edit style=)
const FriendEntry = (props) => (
  <TouchableHighlight
    underlayColor={colors.gray}
    style={quiltEntry.highlight}
    onPress={() => props.onCheck(props.user.rowId)}
  >
    <View>
      <Icon name={props.user.checked ? 'check-square-o' :'square-o'} size={30} />
      <Text>{props.user.username}</Text>
    </View>
  </TouchableHighlight>
);

FriendEntry.propTypes = {
  user: PropTypes.object,
  onCheck: PropTypes.func,
  checked: PropTypes.bool,
};

export default FriendEntry;
