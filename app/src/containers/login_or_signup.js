/* eslint-disable react/prefer-stateless-function, no-use-before-define */
import React, { Component, PropTypes } from 'react-native';
import { connect } from 'react-redux';
import LoginOrSignup from '../components/login_or_signup';

class LoginOrSignupContainer extends Component {
  constructor(props) {
    super(props);
    this.onLoginSelect = this.onLoginSelect.bind(this);
    this.onSignupSelect = this.onSignupSelect.bind(this);
  }

  // TODO: verify token
  componentWillReceiveProps(newProps) {
    if (newProps.token) {
      this.props.navigator.resetTo({ name: 'home' });
    }
  }

  onLoginSelect() {
    this.props.navigator.push({ name: 'login' });
  }

  onSignupSelect() {
    this.props.navigator.push({ name: 'signup' });
  }

  render() {
    return (
      <LoginOrSignup onLoginSelect={this.onLoginSelect} onSignupSelect={this.onSignupSelect} />
    );
  }
}

LoginOrSignupContainer.propTypes = {
  navigator: PropTypes.object,
};

function mapStateToProps(state) {
  return {
    username: state.get('user').get('username'),
    token: state.get('user').get('token'),
  };
}

export default connect(mapStateToProps)(LoginOrSignupContainer);
