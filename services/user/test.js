const test = require('tape')
const { db, createUser, authenticateUser, addFriends } = require('./db')

const before = test

before('before', (t) => {
  t.pass('Delte nodes and relations for testing')
  db.cypher({
    query: 'MATCH (n) DETACH DELETE n',
  }, (err, result) => {
    if (err) {
      throw err
    } else {
      t.end()
    }
  })
})

test('create and authenticate users', (t) => {
  t.plan(3)

  createUser('test@example.com', 'mypassword')
    .then(() => {
      authenticateUser('test@example.com', 'notmypassword')
        .then(authenticated => t.equal(authenticated, false))
    })
    .then(() => {
      authenticateUser('test@example.com', 'mypassword')
        .then(authenticated => t.equal(authenticated, true))
    })
    .then(() => {
      authenticateUser('doesntexist@example.com', 'doesntmatter')
        .then(authenticated => t.equal(authenticated, false))
    })
})

test('add and query friendships', (t) => {
  const users = [
    'griffin@griffin.com',
    'grant@grant.com',
    'kendall@kendall.com',
    'kristin@kristin.com'
  ]

  Promise.all(users.map(email => createUser(email, 'password')))
    .then((data) => {
      const createdIds = data.map(datum => datum._id)
      addFriends(createdIds[0], createdIds.slice(1))
        .then(() => {
          getFriends(createdIds[0])
            .then(friends => {
              const friendIds = friends.map(friend => friend._id)
              createdIds.slice(1).forEach((id) => {
                t.ok(friendIds.contains(id))
              })
              t.end()
            })
        })
    })
})




