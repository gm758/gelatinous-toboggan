/* eslint-disable react/prefer-stateless-function, no-use-before-define */
import React, { Component } from 'react-native';
import { connect } from 'react-redux';
import SignUp from '../components/signup';
import { signupUser } from '../actions/auth';

class SignupContainer extends Component {
  render() {
    return (
      <SignUp {...this.props} />
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
    signupUser: (email, password) => {
      dispatch(signupUser(email, password));
    },
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(SignupContainer);
