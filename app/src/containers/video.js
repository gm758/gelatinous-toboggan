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

  _sendVideo() {
    fetch(`http://${ip}:8000/api/putVideo`, {
      method: 'POST',
      body: JSON.stringify({
        id: 1,
        userIds: [2,3,4,5],
      }),
    })
    .then(res => res.text())
    .then((url) => {
      return RNFS.readFile(this.props.currentQuilt.file, 'base64')
        .then((base64Video) => {
          console.log(base64Video)
          if (this.props.currentQuilt.status === 'create') {
            fetch(url, {
              body: base64Video,
              method: 'PUT',
              headers: {
                'Content-Type': 'base64',
              }
            })
            // this.props.postQuilt(Object.assign(this.props.currentQuilt, {
            //   creator: this.props.creator,
            //   video: data,
            //   token: this.props.token,
            // }));
          } else {
            fetch(url, {
              body: base64Video,
              method: 'PUT',
              headers: {
                'Content-Type': 'base64',
              }
            })
            // this.props.postToExistingQuilt({
            //   quiltId: this.props.currentQuilt.id,
            //   creator: this.props.creator,
            //   video: data,
            //   token: this.props.token,
            // });
          }
          this.props.navigator.replace({ name: 'home' });
        });
      // fetch(`http://${ip}:8000/api/test`, {
      //   method: 'PUT',
      //   body: 'test',
      //   headers: {
      //     'Content-Type': 'video/quicktime',
      //   }
      // })

    })
    // .then(url => {
    //   const body = new FormData();
    //   body.append('file', this.props.currentQuilt.file);
    //   return fetch(url, {
    //     method: 'PUT',
    //     body,
    //   })
    //   .then(r => console.log('response', r))
    //   .then(e => console.log('e', e))
    // })

  }

  _replayVideo() {
    this.refs.video.seek(0);
  }

  render() {
    let acceptText;
    let rejectText;
    let repeat = true;
    if (this.props.currentQuilt.status === 'watch') {
      acceptButton = <Icon name="play" style={video.check} size={40} />;
      rejectButton = <Icon name="undo" style={video.check} size={40} />;
      repeat = false;
    } else if (this.props.currentQuilt.status === 'watchAdd') {
      acceptText = 'Contribute';
      rejectText = 'Back';
    } else {
      acceptButton = <Icon name="check" style={video.check} size={40} />;
      rejectButton = <Icon name="close" style={video.close} size={40} />;
    }
    return (
      <View style={video.container}>
        <Video
          ref="video"
          source={{ uri: this.url }}
          style={video.backgroundVideo}
          repeat={repeat}
          resizeMode="cover"
        />
        <View style={login.containerHead}></View>
        <View style={video.buttonContainer}>
          <TouchableHighlight style={video.iconContainerA} onPress={this.onAccept}>
            {acceptButton}
          </TouchableHighlight>
          <TouchableHighlight style={video.iconContainerB} onPress={this.onReject}>
            {rejectButton}
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
