import s3StreamLib from 's3-upload-stream';
import { exec } from 'child_process'; // TODO: promisify
import {
  AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY,
  AWS_REGION,
  AWS_S3_BUCKET,
} from './config';

import AWS from 'aws-sdk';

const s3 = new AWS.S3({
  params: {
    Bucket: AWS_S3_BUCKET,
  },
});

const s3Stream = s3StreamLib(s3);

function getFileName(path) {
  return path.split('/').slice(-1);
}

function createDownloadStream(Key) {
  return s3.getObject({ Key })
    .createReadStream();
}

function writeStreamToDisk(readStream, filepath) {
  const writeStream = fs.createWriteStream(filePath);
  return readStream.pipe(writeStream);
}

function uploadVideo(filepath, Key) {
  const uploadBody = fs.createReadStream(filepath);
  const uploadStream = s3Stream.upload({ Key });
  return uploadBody.pipe(uploadStream);
}

function createTmpFileName(filename) {
  return filename.split('.').join('_tmp.')
}

function concatVideos(fromVideo, toVideo, callback) { // TODO: promisify
  const tmpFileName = createTmpFileName(toVideo);
  const concatCommand = 
    `ffmpeg -i ${toVideoFileName} ${fromVideoFileName} ` + 
    `-filter_complex concat=n=2:v=1:a=1 -f mp4 -y ` +
    `${tmpFileName}; mv ${tmpFileName} ${toVideoFileName}; ` +
    `rm ${fromVideoFileName}`;

  return exec(concatCommand, callback);
}


export default function downloadConcat(fromVideoKey, toVideoKey, callback) {
  const fromVideoDownStream = createDownloadStream(fromVideoKey);
  const toVideoDownStream = createDownloadStream(toVideoKey);
  const fromVideoFileName = getFileName(fromVideoKey);
  const toVideoFileName = getFileName(toVideoKey);
  // TODO: promisfy all
  writeStreamToDisk(fromVideoDownStream, fromVideoFileName)
    .on('finish', () => writeStreamToDisk(toVideoDownStream, toVideoFileName)
      .on('finish', () => {
        concatVideos(fromVideoFileName, toVideoFileName, callback);  
      });
    );
}

