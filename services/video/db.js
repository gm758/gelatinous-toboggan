const mysql = require('mysql')

const {
  MYSQL_HOST,
  MYSQL_USERNAME,
  MYSQL_PASSWORD,
  MYSQL_DB
} = require('./config')

const db = mysql.createConnection({
  host: MYSQL_HOST,
  user: MYSQL_USERNAME,
  password: MYSQL_PASSWORD,
  database: MYSQL_DB,
});

function findOrCreateUser(uuid) {
  return new Promise((resolve, reject) => {
    db.query('SELECT * FROM `users` WHERE uuid = ?', [uuid], (err, results) => {
      if (err) {
        reject(err)
      } else {
        if (results.length > 0) {
          resolve(results[0])
        } else {
          db.query('INSERT INTO `users` (uuid) VALUES (?)', [uuid], (err, result) => {
            if (err) {
              reject(err)
            } else {
              resolve(result)
            }
          })
        }
      }
    })
  })
}

function createVideo(title) {
  return new Promise((resolve, reject) => {
    db.query('INSERT INTO `videos` (title) VALUES (?)', [title], (err, result) => {
      if (err) {
        reject(err)
      } else {
        resolve(result.insertId)
      }
    })
  }) 
}

function findVideo(id) {
  return new Promise((resolve, reject) => {
    db.query('SELECT * FROM `videos` WHERE id = ?', [id], (err, result) => {
      if (err) {
        reject(err)
      } else if (result.length === 0) {
        reject('Video not found') 
      } else {
        resolve(result[0])
      }
    })
  })
}

function associateUserWithVideo(uuid, video_id) {
  return new Promise((resolve, reject) => {
    db.query('INSERT INTO `users_videos` (user_id, video_id) VALUES (?, ?)',
             [uuid, video_id],
             (err, result) => {
               if (err) {
                 reject(err)
               } else {
                 resolve(result) 
               }
             }
    )
  })
}

function associateMultipleUsersWithVideo(videoId, userIds) {
  return Promise.all(
    userIds.map(
      uuid => findOrCreateUser(uuid).then(() => associateUserWithVideo(uuid, videoId))
    )
  )
}

function addVideoWithUsers(creatorId, inviteeIds) {
  return findOrCreateUser(creatorId)
    .then(() => createVideo('test'))
    .then(videoId =>
      associateMultipleUsersWithVideo(videoId, inviteeIds.concat(creatorId))
    )
}

function getUserVideos(uuid) {
  return new Promise((resolve, reject) => {
    db.query('SELECT * FROM `users` JOIN `users_videos` ' +
             'ON users.uuid = users_videos.user_id ' +
             'JOIN `videos` ON videos.id = users_videos.video_id ' +
             'WHERE users.uuid = ?',
             [uuid],
             (err, results) => {
               if (err) {
                 reject(err)
               } else {
                 resolve(results)
               }
             })
  })
}

module.exports = {
  db,
  findOrCreateUser,
  createVideo,
  associateUserWithVideo,
  findVideo,
  getUserVideos,
  addVideoWithUsers,
}
