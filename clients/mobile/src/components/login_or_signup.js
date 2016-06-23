import React from 'react-native';
import { login } from '../assets/styles';
import BottomButton from './button_bottom';

const {
  PropTypes,
  Text,
  View,
} = React;

const LoginOrSignup = ({ onLoginSelect, onSignupSelect }) => (
  <View style={login.container}>
    <View style={login.containerHead}>
      <Text style={login.title}>Quilt</Text>
    </View>
    <BottomButton
      buttonTextStyle={login.buttonText}
      buttonStyle={login.loginButton}
      text="Login"
      onPress={onLoginSelect}
    />
    <BottomButton
      buttonTextStyle={login.buttonText}
      buttonStyle={login.signupButton}
      text="Signup"
      onPress={onSignupSelect}
    />
  </View>
);

LoginOrSignup.propTypes = {
  onLoginSelect: PropTypes.func,
  onSignupSelect: PropTypes.func,
};

export default LoginOrSignup;
