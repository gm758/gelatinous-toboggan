/* eslint-disable
no-use-before-define,
react/prefer-stateless-function */

import React from 'react-native';
import LoginContainer from '../containers/login_container';
import Home from '../components/home';
import CreateQuilt from '../components/create_quilt';
import SelectFriendsContainer from '../containers/selectFriends_container';
// todo: create seperate component/container for quilts
import ShowQuilts from './quilts';
import ShowCamera from './camera';
import WatchVideo from './video';
import LoginOrSignup from './login_or_signup';
import PhoneNumber from './phoneNumber';
import Username from './username';
import ContactsContainer from './contacts';
import NotifContainer from '../containers/notification';
import Blank from './blank';
import SignUp from './signup_container';
import FindFriends from './find_friends';
import { connect } from 'react-redux';
import { isLoggedIn } from '../actions/index';

const {
  Component,
  PropTypes,
  Navigator,
  View,
} = React;

// todo: refactor into redux-based navigation system
const ROUTES = {
  blank: Blank,
  camera: ShowCamera,
  contacts: ContactsContainer,
  create: CreateQuilt,
  findFriends: FindFriends,
  home: Home,
  login: LoginContainer,
  loginOrSignup: LoginOrSignup,
  notification: NotifContainer,
  phone: PhoneNumber,
  selectFriends: SelectFriendsContainer,
  signup: SignUp,
  username: Username,
  view: ShowQuilts,
  video: WatchVideo,
};

class App extends Component {
  componentWillMount() {
    this.props.isLoggedIn();
  }

  configScene() {
    return Navigator.SceneConfigs.FloatFromRight;
  }

  renderScene(route, navigator) {
    const NextComponent = ROUTES[route.name];
    return <NextComponent route={route} navigator={navigator} />;
  }

  render() {
    return (
      <View style={{ flex: 1 }}>
        <Navigator
          initialRoute={{ name: 'blank' }}
          renderScene={this.renderScene}
          configureScene={this.configScene}
        />
      </View>
    );
  }
}

App.propTypes = {
  isLoggedIn: PropTypes.func,
};

function mapDispatchToProps(dispatch) {
  return {
    isLoggedIn() {
      return dispatch(isLoggedIn());
    },
  };
}

export default connect(null, mapDispatchToProps)(App);
