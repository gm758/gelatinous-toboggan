const {
  createUser,
  authenticateUser,
  addFriends, 
  getFriends,
} = require('./db')

const { tokenFromId } = require('./jwt')

const { JWT_SECRET } = require('./config')

const bodyParser = require('body-parser')
const morgan = require('morgan')
const jwt = require('express-jwt')

const express = require('express')
const app = express()

// middleware
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.use(jwt({
  secret: JWT_SECRET,
  credentialsRequired: true,
  getToken: function fromHeader(req) {
    if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
      return req.headers.authorization.split(' ')[1];
    }
    return null;
  }
}).unless({path: ['/user/signup', '/user/login']}))


// routes

// signup
app.post('/user/signup', (req, res) => {
  const { email, password } = req.body
  createUser(email, password)
    .then((user) => {
      if (user) {
        res.status(201)
           .json({
             id: user.id,
             token: tokenFromId(user.id),
           })
      } else {
        res.sendStatus(406)
      }
    })
    .catch(() => res.sendStatus(500))
})

// login
app.post('/user/login', (req, res) => {
  const { usernameOrEmail, password } = req.body
  authenticateUser(usernameOrEmail, password)
    .then((user) => {
      if (user) {
        res.status(201).json({
          id: user.id,
          token: tokenFromId(user.id),
        })
      } else {
        res.sendStatus(400)
      }
    })
    .catch(() => res.sendStatus(500))
})

// update user
app.put('/user/update', (req, res) => {
  const userId = req.user.id
})

// get friends
app.get('/user/friends', (req, res) => {
  const userId = req.user.id
  getFriends(userId)
    .then((friends) => {
      res.status(200).send(friends)
    })
    .catch(() => res.sendStatus(500))
})

// add friends
app.post('/user/friends', (req, res) => {
  const userId = req.user.id
  const friendIds = req.body.friends
  addFriends(userId, friendIds)
    .then(() => res.sendStatus(201))
    .catch(() => res.sendStatus(500))
})

module.exports = app
