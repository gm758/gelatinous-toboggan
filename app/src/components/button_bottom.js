/* eslint-disable no-use-before-define */
import React from 'react-native';
const {
  PropTypes,
  Text,
  TouchableHighlight,
} = React;

// this is our button style that should be reused across the app
const BottomButton = ({ onPress, text, buttonStyle, buttonTextStyle }) => (
    <TouchableHighlight
      style={buttonStyle}
      underlayColor={'gray'}
      onPress={onPress}
    >
      <Text style={buttonTextStyle}>{text}</Text>
    </TouchableHighlight>
);

BottomButton.propTypes = {
  buttonStyle: PropTypes.number,
  buttonTextStyle: PropTypes.number,
  onPress: PropTypes.func,
  text: PropTypes.string,
};

export default BottomButton;
