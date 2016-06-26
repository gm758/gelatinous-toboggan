const test = require('tape')
const app = require('./server')
const request = require('supertest')(app)

const {
  db,
  createUser,
  authenticateUser,
  addFriends,
  getFriends
} = require('./db')


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
  t.plan(4)
  const user1 = 'griffin@griffin.com'
  const user2 = 'grant@grant.com'

  createUser(user1, 'password')
    .then((u1) => {
      const id1 = u1.id
      createUser(user2, 'password')
        .then((u2) => {
          const id2 = u2.id
          getFriends(id1).then(friends => t.deepEqual(friends, []))
          getFriends(id2).then(friends => t.deepEqual(friends, []))

          addFriends(id1, [id2]).then(() => {
            getFriends(id1).then(friends => t.deepEqual(friends, [id2]))
            getFriends(id2).then(friends => t.deepEqual(friends, [id1]))
          })
        })
    })
})

test('signup and login routes', (t) => {
  function createUser() {
    request
      .post('/user/signup')
      .send(userSignup)
      .expect(201, loginUser)
  }

  function loginUser(err) {
    t.error(err, 'No error')
    request
      .post('/user/login')
      .send(userLogin)
      .expect(201)
      .end((err, res) => {
        t.error(err, 'No error')
        t.end()
      })
  }

  const userSignup = {
    email: 'kendall@kendall.com',
    password: 'password',
  }

  const userLogin = {
    usernameOrEmail: 'kendall@kendall.com',
    password: 'password',
  }

  createUser()
})

