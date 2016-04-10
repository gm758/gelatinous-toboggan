import React, { Component, PropTypes, View } from 'react-native';
import { connect } from 'react-redux';
import { login } from '../assets/styles';


class Blank extends Component {
  componentWillReceiveProps(newProps) {
    if (!newProps.auth.isFetching && !newProps.auth.isAuthenticated) {
      this.props.navigator.replace({ name: 'loginOrSignup' });
    } else if (!newProps.auth.isFetching) {
      this.props.navigator.replace({ name: 'home' });
    }
  }

  render() {
    return (
      <View style={login.container} />
    );
  }
}

Blank.propTypes = {
  navigator: PropTypes.object,
};

function mapStateToProps(state) {
  return {
    auth: state.get('auth').toObject(),
  };
}

export default connect(mapStateToProps)(Blank);
