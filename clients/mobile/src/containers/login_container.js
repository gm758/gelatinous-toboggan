/* eslint-disable react/prefer-stateless-function, no-use-before-define */
import React, { Component } from 'react-native';
import { connect } from 'react-redux';
import Login from '../components/login';
import { loginUser } from '../actions/auth';

class LoginContainer extends Component {
  render() {
    return (
      <Login {...this.props} />
    );
  }
}

function mapStateToProps(state) {
  const auth = state.get('auth');
  return {
    isFetching: auth.get('isFetching'),
    isAuthenticated: auth.get('isAuthenticated'),
    token: auth.get('token'),
  };
}

function mapDispatchToProps(dispatch) {
  return {
    loginUser: (usernameOrEmail, password) => {
      dispatch(loginUser(usernameOrEmail, password));
    },
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(LoginContainer);
