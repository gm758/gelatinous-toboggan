import fs from 'fs';
import { exec } from 'child_process';
import base64 from 'base64-stream';
import Q from 'q';
import path from 'path';

import downloadConcat from './util';

import {
  AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY,
  AWS_REGION,
  AWS_SQS_URL,
} from './config';

import AWS from 'aws-sdk';
AWS.config.accessKeyId = AWS_ACCESS_KEY_ID;
AWS.config.secretAccessKey = AWS_SECRET_ACCESS_KEY;

const s3 = new AWS.S3();

const sqs = new AWS.SQS({
  region: AWS_REGION,
  params: {
    QueueUrl: AWS_SQS_URL,
  },
});

const receiveMessage = Q.nbind(sqs.receiveMessage, sqs);
const deleteMessage = Q.nbind(sqs.deleteMessage, sqs);

const EmptyQueueError = 'EmptyQueue';
// When pulling messages from Amazon SQS, we can open up a long-poll which will hold open
// until a message is available, for up to 20-seconds. If no message is returned in that
// time period, the request will end "successfully", but without any Messages. At that
// time, we'll want to re-open the long-poll request to listen for more messages. To
// kick off this cycle, we can create a self-executing function that starts to invoke
// itself, recursively.
(function pollQueueForMessages() {
  console.log("Begin long polling");
  receiveMessage({
      WaitTimeSeconds: 5, // 5 second long poll
      VisibilityTimeout: 60,
      MaxNumberOfMessages: 1,
  })
  .then((data) => {
    if (!data.Messages) {
      throw workflowError(EmptyQueueError, new Error('No messages'));
    }

    const message = JSON.parse(data.Messages[0].Body);
    

    console.log('Deleting:', data.Messages[0].MessageId);

    return deleteMessage({
      ReceiptHandle: data.Messages[0].ReceiptHandle,
    });
  })
  .then(_ => console.log('Message Deleted Successfully'))
  .catch((error) => {
    if (error.type === EmptyQueueError) {
      console.log('ExpectedError:', error.message);
    } else {
      console.log('Unexpected Error:', error.message);
    }
  })
  .finally(pollQueueForMessages);
})();

function workflowError(type, error) {
  error.type = type;
  return error;
}
