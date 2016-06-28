const { AWS_ACCESS_KEY_ID, AWS_SECRET_ACESS_KEY } = require('./config')
AWS.config.accessKeyId = AWS_ACCESS_KEY_ID
AWS.config.secretAccessKey = AWS_SECRET_ACCESS_KEY

const s3 = new AWS.S3()

function getPutUrl(videoId) {
  return new Promise((resolve, reject) => {
    s3.getSignedUrl('putObject', {
      Bucket: 'quiltmobileapp-oregon',
      Key: `upload_initial/quilt_${videoId}.mov`,
      ContentType: 'video/quicktime',
    }, (err, url) => {
      if (err) {
        reject(err)
      } else {
        resolve(url)
      }
    })
  })
}

module.exports = {
  getPutUrl,

}

