import React from 'react-native';
import { login } from '../assets/styles';
const {
  Component,
  Text,
  View,
} = React;
import BottomButton from './button_bottom';

const LoginOrSignup = ({ onLoginSelect, onSignupSelect }) => (
  <View style={login.container}>
    <View style={login.containerHead}>
      <Text style={login.title}>Quilt</Text>
    </View>
    <BottomButton buttonTextStyle={login.buttonText} buttonStyle={login.loginButton} text="Login" onPress={onLoginSelect} />
    <BottomButton buttonTextStyle={login.buttonText} buttonStyle={login.signupButton} text="Signup" onPress={onSignupSelect} />
  </View>
);

export default LoginOrSignup;
