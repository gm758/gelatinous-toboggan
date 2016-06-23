import express from 'express';
const app = express();

// middleware
app.use(morgan('dev'));


// routes

// signup
app.post('/api/auth', (req, res) => {
  
});

// login
app.get('/api/auth', (req, res) => {

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

