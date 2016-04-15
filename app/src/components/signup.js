/* eslint-disable no-use-before-define */
import React from 'react-native';
import { MKButton } from 'react-native-material-kit';
import { login } from '../assets/styles';
import EmailInput from './email_input';
import PasswordInput from './password_input';
import NavBar from './navbar';
import Validator from 'email-validator';
import owasp from 'owasp-password-strength-test';
import Keychain from 'react-native-keychain';
import ip from '../config';

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

class SignUp extends Component {
  constructor(props) {
    super(props);

    this.state = {
      email: '',
      password: '',
    };

    owasp.config({
      allowPassphrases: true,
      maxLength: 128,
      minLength: 6,
      minPhraseLength: 10,
      minOptionalTestsToPass: 3,
    });

    this.onPress = this.onPress.bind(this);
    this.onBack = this.onBack.bind(this);
    this.onTypeEmail = this.onTypeEmail.bind(this);
    this.onTypePassword = this.onTypePassword.bind(this);
  }

  componentWillReceiveProps(newProps) {
    console.log(this.props.token);

    // TODO: move setting sign up credentials to final phase of signup
    if (newProps.isAuthenticated) {
      Keychain.setInternetCredentials(ip, newProps.token, '')
        .then(() => {
          this.props.navigator.replace({ name: 'username' });
        });
    }
  }

  onPress() {
    const emailToLowercase = this.state.email.toLowerCase();
    if (!Validator.validate(this.state.email)) {
      console.log(this.state.email, ' is invalid, please try again.');
    } else if (!owasp.test(this.state.password)) {
      console.log('Weak password');
    } else {
      this.props.signupUser(emailToLowercase, this.state.password);
    }
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
        <NavBar onPress={this.onBack} text={'Sign Up'} />
        <View style={login.containerBody}>
          <EmailInput
            value={this.state.email}
            onChangeText={this.onTypeEmail}
            placeholder={'Email Address'}
            autoFocus
          />
          <PasswordInput
            value={this.state.password}
            onChangeText={this.onTypePassword}
            placeholder={'Password'}
          />
          <CustomButton onPress={this.onPress}>
            <Text style={login.buttonText}>Sign Up</Text>
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
SignUp.propTypes = {
  navigator: PropTypes.object,
  fetchUser: PropTypes.func,
  isFetching: PropTypes.bool,
  token: PropTypes.string,
  loginOrSignup: PropTypes.string,
  loginUser: PropTypes.func,
  signupUser: PropTypes.func,
};


export default SignUp;
