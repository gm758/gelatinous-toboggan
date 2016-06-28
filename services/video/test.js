const test = require('tape')
const app = require('./app')
const request = require('supertest')(app)
const { exec } = require('child_process')
const { MYSQL_USERNAME, MYSQL_PASSWORD } = require('./config')

const {
  db,
  findOrCreateUser,
  findVideo,
  createVideo,
  associateUserWithVideo,
  getUserVideos,
  addVideoWithUsers,
} = require('./db')

const before = test
const after = test


before('clear the test database', (t) => {
    exec(`mysql -u ${MYSQL_USERNAME} -p${MYSQL_PASSWORD} < create_db.sql`, (err) => {
    t.error(err)
    t.end() 
  })
})

before('connect to test database', (t) => {
  t.pass('create db connection')
  db.connect()
  t.end()
})


test('findOrCreate creates or finds user by uuid', (t) => {
  const uuid = 1
  findOrCreateUser(uuid)
    .then(() => findOrCreateUser(1))
    .then((found) => {
      t.equal(found.uuid, uuid)
      t.end()
    })
})

test('createVideo inserts a video into db by title', (t) => {
  createVideo('TestVideo')
    .then(findVideo)
    .then((video) => {
      t.equal(video.title, 'TestVideo')
      t.equal(video.id, 1)
      t.end()
    })
})

test('associateUserWithVideo creates M-N relation b/w video + user', (t) => {
  const uuid = 2
  findOrCreateUser(uuid)
    .then(() => createVideo('AnotherTest'))
    .then(video_id =>
      associateUserWithVideo(uuid, video_id)
        .then(() => getUserVideos(uuid))
        .then((results) => {
          const videoIds = results.map(entry => entry.id)
          t.equal(videoIds.includes(video_id), true)
          t.equal(videoIds.length, 1)
          t.end()
        })
    )
})

test('addVideoWithUsers should add a video w/ creator and invitees', (t) => {
  const creatorId = 3
  const invitee1 = 4
  const invitee2 = 5
  const invitee3 = 6
  const inviteeIds = [invitee1, invitee2, invitee3]

  addVideoWithUsers(creatorId, inviteeIds)
    .then(() => getUserVideos(creatorId))
    .then((results) => {
      t.equals(results.length, 1)
      return getUserVideos(invitee1)
    })
    .then((results) => {
      t.equals(results.length, 1)
      t.end()
    })
})

after('disconnect from db', (t) => {
  t.pass('Close the db connection')
  db.end()
  t.end()
})

