/* eslint-disable no-use-before-define */
import React, { Component } from 'react-native';
import { connect } from 'react-redux';
import Video from 'react-native-video';
import { postQuilt, postToExistingQuilt } from '../actions/index';
import Button from '../components/button';
import RNFS from 'react-native-fs';
import ip from '../config';
import { video, login } from '../assets/styles';
import NavBar from '../components/navbar';
import Icon from 'react-native-vector-icons/FontAwesome';
import { FileUpload } from 'NativeModules';
const {
  View,
  StyleSheet,
  Text,
  PropTypes,
  TouchableHighlight,
} = React;

class WatchVideo extends Component {
  constructor(props) {
    super(props);
    this.onAccept = this.onAccept.bind(this);
    this.onReject = this.onReject.bind(this);

    if (this.props.currentQuilt.status === 'watchAdd'
     || this.props.currentQuilt.status === 'watch') {
      this.url = `http://${ip}:8000/api/quilt/${this.props.currentQuilt.id}?token=${this.props.token}`;
    } else {
      this.url = this.props.currentQuilt.file;
    }
  }

  componentDidMount() {
    fetch(`http://${ip}:8000/api/quilt/${this.props.currentQuilt.id}?token=${this.props.token}`)
      .then(res => res.json())
      .then(({ url }) => this.setState({ url }))
  }

  onAccept() {
    if (this.props.currentQuilt.status === 'add' || this.props.currentQuilt.status === 'create') {
      this._sendVideo();
    } else if (this.props.currentQuilt.status === 'watchAdd') {
      this.props.navigator.replace({ name: 'camera' });
    } else {
      this._replayVideo();
    }
  }

  onReject() {
    if (this.props.currentQuilt.status === 'add' || this.props.currentQuilt.status === 'create') {
      this.props.navigator.replace({ name: 'camera' });
    } else {
      this.props.navigator.pop();
    }
  }

  _readFile(filePath) {
    // this.props.currentQuilt.file
    return RNFS.readFile(filePath, 'base64')
  }

  _createQuilt(id, userIds) {
    return fetch(`http://${ip}:8000/api/createQuilt`, {
      method: 'POST',
      body: JSON.stringify({
        id: id,
        userIds: userIds,
      }),
    });
  }

  _updateQuilt(userId, quiltId) {
    return fetch(`http://${ip}:8000/api/updateQuilt/${quiltId}`, {
      method: 'PUT',
      body: JSON.stringify({
        userId,
      }),
    })
  }

  _sendToS3(presignedUrl, uri) {
    const xhr = new XMLHttpRequest();
    xhr.onreadystatechange = (e) => {
      if (xhr.readyState !== 4) {
        return;
      }

      if (xhr.status === 200) {
        console.log('success', xhr.responseText);
      } else {
        console.warn('error');
        console.log(xhr)
      }
    };

    xhr.open('PUT', presignedUrl);
    xhr.send({ uri: uri, type: 'video/quicktime'});
  }

  _enqueueCreate(key) {
    return fetch(`http://${ip}:8000/api/enqueueCreate`, {
      method: 'POST',
      body: key,
    });
  }

  _enqueueUpdate(key) {
    return fetch(`http://${ip}:8000/api/enqueueUpdate`, {
      method: 'PUT',
      body: key,
    });
  }

  _sendVideo() {
    if (this.props.currentQuilt.status === 'create') {
      this._createQuilt(this.props.creator.id, this.props.currentQuilt.users.toArray())
        .then(res => res.json())
        .then(({url, key}) =>
          this._sendToS3(url, this.props.currentQuilt.file)
        )
        .then(() => console.log('uploaded'));
    } else {
      this._updateQuilt(this.props.creator.id, this.props.currentQuilt.id)
        .then(res => res.json())
        .then(({ url, key }) => 
          this._sendToS3(url, this.props.currentQuilt.file)
        )
        .then(s => console.log('uploaded subsequent', s))
        .catch(e => console.log('error', e));
    }
  }

  _replayVideo() {
    this.refs.video.seek(0);
  }

  render() {
    let acceptText;
    let rejectText;
    let repeat = true;
    if (this.props.currentQuilt.status === 'watch') {
      acceptText = <Icon name="play" style={video.check} size={40} />;
      rejectText = <Icon name="undo" style={video.check} size={40} />;
      repeat = false;
    } else if (this.props.currentQuilt.status === 'watchAdd') {
      acceptText = <Text>'Contribute'</Text>;
      rejectText = <Text>'Back'</Text>;
    } else {
      acceptText = <Icon name="check" style={video.check} size={40} />;
      rejectText = <Icon name="close" style={video.close} size={40} />;
    }
    let mainComponent = (<View style={video.backgroundVideo}></View>)

    if (this.url) {
      mainComponent = (
        <Video
          ref="video"
          source={{ uri: this.url }}
          style={video.backgroundVideo}
          repeat={repeat}
          resizeMode="cover"
        />)
    }

    return (
      <View style={video.container}>
        {mainComponent}
        <View style={login.containerHead}></View>
        <View style={video.buttonContainer}>
          <TouchableHighlight style={video.iconContainerA} onPress={this.onAccept}>
            {acceptText}
          </TouchableHighlight>
          <TouchableHighlight style={video.iconContainerB} onPress={this.onReject}>
            {rejectText}
          </TouchableHighlight>
        </View>
      </View>
    );
  }
}

WatchVideo.propTypes = {
  addToQuilt: PropTypes.func,
  currentQuilt: PropTypes.object,
  postToExistingQuilt: PropTypes.func,
  creator: PropTypes.object,
  navigator: PropTypes.object,
  postQuilt: PropTypes.func,
  watchQuiltId: PropTypes.number,
  token: PropTypes.string,
};

function mapStateToProps(state) {
  const user = state.get('user');

  return {
    currentQuilt: state.get('currentQuilt').toObject(),
    creator: {
      id: user.get('id'),
      username: user.get('username'),
    },
    token: user.get('token'),
  };
}

function mapDispatchToProps(dispatch) {
  return {
    postQuilt: (data) => {
      dispatch(postQuilt(data));
    },
    postToExistingQuilt: (data) => {
      dispatch(postToExistingQuilt(data));
    },
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(WatchVideo);
