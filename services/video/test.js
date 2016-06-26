const test = require('tape')
const app = require('./server')
const request = require('supertest')(app)

const before = test

before('before', (t) => {

})
