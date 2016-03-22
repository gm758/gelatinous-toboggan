/* eslint-disable no-use-before-define */
import React from 'react-native';
import Camera from 'react-native-camera';
import RNFS from 'react-native-fs';
import { connect } from 'react-redux';
import { postQuilt } from '../actions/index';

const {
  Component,
  Dimensions,
  PropTypes,
  StyleSheet,
  Text,
  View,
} = React;

class ShowCamera extends Component {
  constructor(props) {
    super(props);
    this.cameraRef = this.cameraRef.bind(this);
    this._onStartCapture = this._onStartCapture.bind(this);
    this._onStopCapture = this._onStopCapture.bind(this);
    this.onCapturePress = this.onCapturePress.bind(this);

    // refactor into redux?
    this.state = {
      isCapturing: false,
    };
  }

  // testing video posting, should be moved into action creator in future
  // also, add spinners,
  // add catches
  onCapturePress() {
    if (!this.state.isCapturing) {
      this._onStartCapture();
    } else {
      this._onStopCapture();
    }
  }


  onCapturePress() {
    if (!this.state.isCapturing) {
      this._onStartCapture();
    } else {
      this._onStopCapture();
    }
  }

  _onStartCapture() {
    this.setState({
      isCapturing: true,
    });

    this.camera.capture()
      .then(file => RNFS.readFile(file, 'base64'))
      .then((data) => {
        this.props.postQuilt(Object.assign(this.props.buildQuilt, {
          creator: this.props.creator,
          video: data,
        }));
    });
  }

  _onStopCapture() {
    this.setState({
      isCapturing: false,
    });
    this.camera.stopCapture();
  }

  cameraRef(cam) {
    // not sure the reason for this function yet
    this.camera = cam;
  }

  render() {
    return (
      <View style={styles.container}>
        <Camera
          ref={this.cameraRef}
          style={styles.preview}
          aspect={'fill'}
          captureTarget={Camera.constants.CaptureTarget.temp}
          captureMode={Camera.constants.CaptureMode.video}
        >
          <Text style={styles.capture} onPress={this.onCapturePress}>
            [CAPTURE]
          </Text>
        </Camera>
      </View>
    );
  }
}

ShowCamera.propTypes = {
  postQuilt: PropTypes.func,
  buildQuilt: PropTypes.object,
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  preview: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    height: Dimensions.get('window').height,
    width: Dimensions.get('window').width,
  },
  capture: {
    flex: 0,
    backgroundColor: '#fff',
    borderRadius: 5,
    color: '#000',
    padding: 10,
    margin: 40,
  },
});

// get the state of the current quilt
// which will be passed with the video
// to action creator to post data
function mapStateToProps(state) {
  const buildQuilt = state.get('buildQuilt').toObject();
  buildQuilt.users = buildQuilt.users.toArray();

  const creator = state.get('user');

  return {
    buildQuilt,
    creator: {
      id: creator.get('id'),
      username: creator.get('username'),
    },
  };
}

// dispatch postQuilt with previous current quilt state plus video data
function mapDispatchToProps(dispatch) {
  return {
    postQuilt: (data) => {
      dispatch(postQuilt(data));
    },
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(ShowCamera);