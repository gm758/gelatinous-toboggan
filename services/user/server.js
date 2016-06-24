const {
  createUser,
  authenticateUser,
  addFriends, 
  getFriends,
} = require('./db')
const bodyParser = require('body-parser')
const express = require('express')
const app = express()

// middleware
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

// routes

// signup
app.post('/api/auth', (req, res) => {
  const { email, password } = req.body
  createUser(email, password)
    .then((user) => {
      if (user) {
        res.status(201)
           .send({
             id: user.id,
             token: tokenForUser(user.id),
           })
      } else {
        res.sendStatus(406)
      }
    })
    .catch(() => res.sendStatus(500))
});

// login
app.get('/api/auth', (req, res) => {
  const { usernameOrEmail, password } = req.body
  authenticateUser(usernameOrEmail, password)
    .then((user) => {
      if (user) {
        res.status(201).send({
          id: user.id,
          token: tokenForUser(user.id),
        })
      } else {
        res.sendStatus(400)
      }
    })
    .catch(() => res.sendStatus(500))
})

// update user by id
app.put('/api/user/:id', (req, res) => {

});

// get friends by id
app.get('/api/friends/:id', (req, res) => {

});

// create friends by id
app.post('/api/friends/:id', (req, res) => {

})

