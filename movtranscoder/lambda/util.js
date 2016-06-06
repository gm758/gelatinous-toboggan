import fs from 'fs';
import { exec } from 'child_process';
import base64 from 'base64-stream';
import { promisify } from 'bluebird';
import path from 'path';

import { AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY } from './config';
import AWS from 'aws-sdk';
AWS.config.accessKeyId = AWS_ACCESS_KEY_ID;
AWS.config.secretAccessKey = AWS_SECRET_ACCESS_KEY;

const s3 = new AWS.S3();
const sqs = new AWS.SQS();

import streamPackage from 's3-upload-stream';
const s3Stream = streamPackage(s3);

const execPromise = promisify(exec)
const s3UploadPromise = promisify(s3.upload);

const receiveMessage = promisify(sqs.receiveMessage);
const deleteMessage = promisify(sqs.deleteMessage);


function createDownloadStream(key) {
  return s3.getObject({Bucket: 'quiltmobileapp', Key: key})
    .createReadStream();
}

function writeStreamToDisk(base64Stream, filepath) {
  const file = fs.createWriteStream(filepath);
  return base64Stream
    .pipe(base64.decode())
    .pipe(file);
}

function convertMOVToMp4(toTranscodeFilePath, targetFilePath) {
  return exec(`ffmpeg -i ${toTranscodeFilePath} ${targetFilePath}`, (e, r) => {
    uploadMp4(targetFilePath);
  });
}

function uploadMp4(filepath) {
  const uploadBody = fs.createReadStream(filepath);
  const uploadStream = s3Stream.upload({
    Bucket: 'quiltmobileapp',
    Key: 'test.mp4',
  });

  return uploadBody.pipe(uploadStream);
}

function downloadTranscodeUpload(key) {
  const movFilePath = '/tmp/tmp.mov';
  const mp4FilePath = '/tmp/tmp.mp4';
  const downloadStream = createDownloadStream(key);
  const writeStream = writeStreamToDisk(downloadStream, movFilePath);
  writeStream.on('finish', () => {
    convertMOVToMp4(movFilePath, mp4FilePath)
  });
}
