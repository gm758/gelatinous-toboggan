var AWS = require('aws-sdk');
var sqs = new AWS.SQS({
  region: 'us-west-2',
});

// return basename without extension
function basename(path) {
  return path.split('/').reverse()[0].split('.')[0];
}

function directory(path) {
  return path.split('/').slice(0, -1).join('');
}

function findConcatTarget(path) {
  var name = path.split('/').slice(-2, -1);
  return 'quilts/' + name + '.mp4';
}

// return output file name with timestamp and extension
function outputKey(name, ext) {
  return name + '.' + ext;
}

exports.handler = function(event, context) {
  console.log('Received event:', JSON.stringify(event, null, 2));
  // Get the object from the event and show its content type
  var fileToConcat = event.Records[0].s3.object.key;
  var concatTarget = findConcatTarget(fileToConcat);
  var MessageBody = JSON.stringify({
    target: concatTarget,
    newFile: fileToConcat
  });

  sqs.sendMessage({
    MessageBody: MessageBody,
    QueueUrl: 'https://sqs.us-west-2.amazonaws.com/434341646041/concatQueue'
  }, function(err, data) {
    if (err) {
      console.log('error: ', err);
      context.fail();
      return;
    }
    console.log('message added to queue: ', MessageBody)      
    context.succeed()
  });

};
