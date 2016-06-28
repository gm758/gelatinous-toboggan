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
}))


// routes

// create a new video
app.post('/video', (req, res) => {
})

// contribute to existing video
app.put('/video/:id', (req, res) => {
})

// get all user videos
app.get('/video', (req, res) => {
})

// get url for specific user video
app.get('/video/:id', (req, res) => {
})

module.exports = app

