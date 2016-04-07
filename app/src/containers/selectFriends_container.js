  /* eslint-disable
react/prefer-stateless-function,
no-use-before-define,
react/jsx-no-bind,
react/prop-types
*/
import React, { Component } from 'react-native';
import FriendEntry from '../components/friend_entry';
import { connect } from 'react-redux';
import Immutable from 'immutable'; // just for testing
import { inviteFriends } from '../actions/index';
import Button from '../components/button';
import ip from '../config';

import { selectFriends, login } from '../assets/styles';
import NavBar from '../components/navbar';
import BottomButton from '../components/button_bottom';

const {
  ListView,
  PropTypes,
  StyleSheet,
  Text,
  View,
  ActivityIndicatorIOS,
} = React;

// todo: consider factoring out view rendering into own component
class SelectFriendsContainer extends Component {
  constructor(props) {
    super(props);
    this.onCheck = this.onCheck.bind(this);
    this.onRenderRow = this.onRenderRow.bind(this);
    this.onInvitePress = this.onInvitePress.bind(this);

    const ds = new ListView.DataSource({
      rowHasChanged: (r1, r2) => r1 !== r2,
    });

    this.state = {
      dataSource: ds.cloneWithRows([]),
      db: [],
    };
  }

  componentWillMount() {
    fetch(`http://${ip}:8000/api/friends/${this.props.userId}?token=${this.props.token}`, {
      method: 'GET',
    })
    .then(response => response.json())
    .then((friends) => {
      const mappedFriends = friends.map((friend, index) => ({
        id: friend.id,
        username: friend.username,
        checked: false,
        rowId: index,
      }));

      this.setState({
        dataSource: this.state.dataSource.cloneWithRows(mappedFriends),
        db: mappedFriends,
      });
    });
  }

  onCheck(rowId) {
    const newArray = [...this.state.db];
    newArray[rowId] = Object.assign(
      {},
      newArray[rowId],
      { checked: !newArray[rowId].checked },
    );

    this.setState({
      dataSource: this.state.dataSource.cloneWithRows(newArray),
      db: newArray,
    });
  }

  onSubmitClick(quiltId, navigator) {
    navigator.push('video');
  }

  onInvitePress() {
    const checkedIds = this.state.db.reduce((acc, next) => {
      if (next.checked) {
        acc.push(next.id);
      }
      return acc;
    }, []);
    this.props.inviteFriends(checkedIds);
    this.props.navigator.push({ name: 'camera' });
  }

  onRenderRow(rowData) {
    return (
        <FriendEntry
          user={rowData}
          onCheck={this.onCheck}
          key={rowData.id}
        />
    );
  }

  render() {
    // if (this.props.friends.get('isFetching')) {
    //   return <ActivityIndicatorIOS
    //     animating={true}
    //     style={{height: 80}}
    //     size="large"
    //   />;
    // }
    console.log(this.state.dataSource);
    return (
      <View style={selectFriends.container}>
        <NavBar onPress={this.props.navigator.pop} />
        <ListView
          dataSource={this.state.dataSource}
          renderRow={this.onRenderRow}
        />
        <BottomButton buttonTextStyle={login.buttonText} buttonStyle={login.loginButton} text="Invite" onPress={this.onInvitePress} />
      </View>
    );
  }
}

SelectFriendsContainer.propTypes = {
  onPress: PropTypes.func,
  // quilts: PropTypes.object,
  friends: PropTypes.object,
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

const mapStateToProps = (state) => {
  const currentQuilt = state.get('currentQuilt');
  const user = state.get('user');
  return {
    currentQuilt,
    username: user.get('username'),
    token: user.get('token'),
    userId: user.get('id'),
  };
};

function mapDispatchToProps(dispatch) {
  return {
    inviteFriends: (data) => {
      dispatch(inviteFriends(data));
    },
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(SelectFriendsContainer);
