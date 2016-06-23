var AWS = require('aws-sdk');
var elastictranscoder = new AWS.ElasticTranscoder();

// return basename without extension
function basename(path) {
  return path.split('/').reverse()[0].split('.')[0];
}

function directory(path) {
  return path.split('/').slice(0, -1).join('');
}

// return output file name with timestamp and extension
function outputKey(name, ext) {
  return name + '.' + ext;
}

exports.handler = function(event, context) {
  console.log('Received event:', JSON.stringify(event, null, 2));
  // Get the object from the event and show its content type
  var key = event.Records[0].s3.object.key;
  var uploadDirectory = directory(key);

  var outputPrefix;
  if (uploadDirectory === 'upload_initial') {
    outputPrefix = 'quilts/';
  } else if (uploadDirectory === 'upload_next') {
    outputPrefix = 'tmp_next/';
  } else {
    return;
  }

  var params = {
    Input: {
      Key: key
    },
    PipelineId: '1462902665169-2926tw',
    OutputKeyPrefix: outputPrefix,
    Outputs: [
      {
        Key: outputKey(basename(key),'mp4'),
        PresetId: '1351620000001-100070', // web
      }
    ]
  };

  elastictranscoder.createJob(params, function(err, data) {
    if (err){
      console.log(err, err.stack); // an error occurred
      context.fail();
      return;
    }
    context.succeed();
  });
};
