/* eslint-disable no-use-before-define */
import React from 'react-native';
import { connect } from 'react-redux';
const {
  ActivityIndicatorIOS,
  Component,
  PropTypes,
  Text,
  View,
} = React;
import UsernameInput from '../components/username_input';
import { login } from '../assets/styles';
import { MKButton } from 'react-native-material-kit';
import Icon from 'react-native-vector-icons/FontAwesome';

import ip from '../config';
import _ from 'lodash';

const CustomButton = new MKButton.Builder()
  .withStyle(login.button)
  .build();

class Username extends Component {
  constructor(props) {
    super(props);
    this.onType = this.onType.bind(this);
    this.onEnter = this.onEnter.bind(this);
    this.checkUsername = _.debounce(this.checkUsername.bind(this), 500);

    this.state = {
      username: '',
      duplicate: false,
      isChecking: false,
    };
  }


  onType(username) {
    this.setState({ username, isChecking: true });
    this.checkUsername();
  }

  onEnter() {
    if (!this.state.duplicate) {
      const usernameToLowercase = this.state.username.toLowerCase();
      fetch(`http://${ip}:8000/api/auth?token=${this.props.token}`, {
        method: 'PUT',
        body: JSON.stringify({ username: usernameToLowercase }),
      })
      .then(() => this.props.navigator.replace({ name: 'phone' }))
      .catch(error => console.error('error updating user:', error));
    }
  }

  checkUsername() {
    // TODO: revisit status codes, make more robust
    fetch(`http://${ip}:8000/api/user/${this.state.username.toLowerCase()}`)
    .then(response => {
      if (response.status === 200) {
        this.setState({ duplicate: true, isChecking: false });
      } else {
        this.setState({ duplicate: false, isChecking: false });
      }
    })
    .catch(error => console.error('error retreiving user:', error));
  }

  render() {
    let icon;
    if (this.state.isChecking) {
      icon = (<ActivityIndicatorIOS
        animating
        size="small"
      />);
    } else if (this.state.duplicate) {
      icon = <Icon name="close" color="red" size={16} />;
    } else if (this.state.username) {
      icon = <Icon name="check" color="green" size={16} />;
    }

    return (
      <View style={login.container}>
        <View style={login.containerBody}>
          <Text>Select a Username</Text>
          <UsernameInput
            value={this.state.username}
            onChangeText={this.onType}
          />
          {icon}
          <CustomButton onPress={this.onEnter}>
            <Text style={login.buttonText}>Continue</Text>
          </CustomButton>
        </View>
      </View>
    );
  }
}

Username.propTypes = {
  navigator: PropTypes.object,
  updateUser: PropTypes.func,
  userId: PropTypes.number,
  token: PropTypes.string,
  duplicateUsername: PropTypes.bool,
  loginOrSignup: PropTypes.func,
};

function mapStateToProps(state) {
  return {
    token: state.get('auth').get('token'),
  };
}

export default connect(mapStateToProps)(Username);
