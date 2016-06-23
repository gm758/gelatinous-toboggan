/* eslint-disable no-use-before-define */
import React from 'react-native';
import { MKButton } from 'react-native-material-kit';
import { login } from '../assets/styles';
import EmailInput from './email_input';
import PasswordInput from './password_input';
import NavBar from './navbar';

const {
  Component,
  PropTypes,
  View,
  Text,
  ActivityIndicatorIOS,
} = React;

const CustomButton = new MKButton.Builder()
  .withStyle(login.button)
  .build();

class Login extends Component {
  constructor(props) {
    super(props);

    this.onPress = this.onPress.bind(this);
    this.onBack = this.onBack.bind(this);
    this.onTypeEmail = this.onTypeEmail.bind(this);
    this.onTypePassword = this.onTypePassword.bind(this);

    this.state = {
      email: '',
      password: '',
    };
  }

  componentWillReceiveProps(newProps) {
    if (newProps.isAuthenticated) {
      this.props.navigator.replace({ name: 'home' });
    }
  }

  onPress() {
    const emailToLowercase = this.state.email.toLowerCase();
    this.props.loginUser(emailToLowercase, this.state.password);
  }

  onBack() {
    this.props.navigator.pop();
  }

  onTypeEmail(email) {
    return this.setState({ email });
  }

  onTypePassword(password) {
    this.setState({ password });
  }

  render() {
    return (
      <View style={login.container}>
        <NavBar onPress={this.onBack} text={'Login'} />
        <View style={login.containerBody}>
          <EmailInput
            value={this.state.email}
            onChangeText={this.onTypeEmail}
            placeholder={'Username or Email'}
            autoFocus
          />
          <PasswordInput
            value={this.state.password}
            onChangeText={this.onTypePassword}
            placeholder={'Password'}
          />
          <CustomButton onPress={this.onPress}>
            <Text style={login.buttonText}>Login</Text>
          </CustomButton>
          <ActivityIndicatorIOS
            animating={this.props.isFetching}
            style={{ height: 80 }}
            size="large"
          />
        </View>
      </View>
    );
  }
}

// todo: double check this
Login.propTypes = {
  navigator: PropTypes.object,
  fetchUser: PropTypes.func,
  isFetching: PropTypes.bool,
  token: PropTypes.string,
  loginOrSignup: PropTypes.string,
  loginUser: PropTypes.func,
  signupUser: PropTypes.func,
};


export default Login;
