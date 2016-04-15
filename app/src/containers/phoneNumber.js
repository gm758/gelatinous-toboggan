import React from 'react-native';
import { connect } from 'react-redux';
const {
  Component,
  PropTypes,
  Text,
  View,
} = React;
import PhoneInput from '../components/phone_input';
import { MKButton } from 'react-native-material-kit';
import { login } from '../assets/styles';
import ip from '../config';

const CustomButton = new MKButton.Builder()
  .withStyle(login.button)
  .build();

class PhoneNumber extends Component {
  constructor(props) {
    super(props);
    this.onType = this.onType.bind(this);
    this.onEnter = this.onEnter.bind(this);

    this.state = {
      phoneNumber: '',
    };
  }

  onType(phoneNumber) {
    this.setState({ phoneNumber });
  }

  onEnter() {
    fetch(`http://${ip}:8000/api/auth?token=${this.props.token}`, {
      method: 'PUT',
      body: JSON.stringify({ phoneNumber: this.state.phoneNumber }),
    })
    .then(() => this.props.navigator.replace({ name: 'contacts' }))
    .catch(error => console.error('error updating user:', error));
  }

  render() {
    return (
      <View style={login.container}>
        <View style={login.containerBody}>
          <Text>Please Enter Your Phone Number</Text>
          <PhoneInput
            value={this.state.phoneNumber}
            onChangeText={this.onType}
          />
          <CustomButton onPress={this.onEnter}>
            <Text style={login.buttonText}>Continue</Text>
          </CustomButton>
        </View>
      </View>
    );
  }
}

PhoneNumber.propTypes = {
  navigator: PropTypes.object,
  token: PropTypes.string,
};

function mapStateToProps(state) {
  return {
    token: state.get('auth').get('token'),
  };
}

export default connect(mapStateToProps)(PhoneNumber);
