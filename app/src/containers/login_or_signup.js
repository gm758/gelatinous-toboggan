/* eslint-disable react/prefer-stateless-function, no-use-before-define */
import React, { Component } from 'react-native';
import { connect } from 'react-redux';
import LoginOrSignup from '../components/login_or_signup';
import { selectLoginOrSignup } from '../actions/index';
import { bindActionCreators } from 'redux';

import Contacts from 'react-native-contacts';
import { crossReferenceContacts } from '../actions/index';

class LoginOrSignupContainer extends Component {
  constructor(props) {
    super(props);
    this.onLoginSelect = this.onLoginSelect.bind(this);
    this.onSignupSelect = this.onSignupSelect.bind(this);
  }

  // TODO: verify token
  componentWillReceiveProps(newProps) {
    if (newProps.token) {
      this.props.navigator.resetTo({ name: 'home' })
    }
  }

  onLoginSelect() {
    this.props.navigator.push({ name: 'login' });
  }

  onSignupSelect() {
    this.props.navigator.push({ name: 'signup'});
  }

  render() {
    return (
      <LoginOrSignup onLoginSelect={this.onLoginSelect} onSignupSelect={this.onSignupSelect} />
    );
  }
}

function mapStateToProps(state) {
  return {
    username: state.get('user').get('username'),
    token: state.get('user').get('token'),
  };
}

export default connect(mapStateToProps)(LoginOrSignupContainer);
