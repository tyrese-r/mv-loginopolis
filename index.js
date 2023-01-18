const express = require('express');
const app = express();
const { User } = require('./db');
const bcrypt = require("bcrypt")

const saltRounds = 2;

app.use(express.json());
app.use(express.urlencoded({extended:true}));


app.get('/', async (req, res, next) => {
  try {
    res.send('<h1>Welcome to Loginopolis!</h1><p>Log in via POST /login or register via POST /register</p>');
  } catch (error) {
    console.error(error);
    next(error)
  }
});

// POST /register
// TODO - takes req.body of {username, password} and creates a new user with the hashed password
app.post("/register", async (req, res, next) => {
  console.log(req.body)
  const hash = await bcrypt.hash(req.body.password, saltRounds)
  const userDuplicate = await User.findOne({where: {
    username: req.body.username
  }})
  console.log(userDuplicate)

  if(userDuplicate !== null) {
    // User already exists
    res.send(400)
    return
  }

  try {
    const newUser = await User.create({
      username: req.body.username,
      password: hash,
    })
    res.send('User created')
  } catch (e) {
    console.error(e)
    res.send(500)
  }
  
})

// POST /login
// TODO - takes req.body of {username, password}, finds user by username, and compares the password with the hashed version from the DB
app.post("/login", async (req, res, next) => {
  const user = await User.findOne({
    where: {
      username: req.body.username
    }
  })

  if(user == null) {
    // Not found
    res.send(404)
    return;
  }

  //get password
  const hash = user.password
  const isCorrect = await bcrypt.compare(req.body.password, hash);
  if(!isCorrect) {
    res.send(401);
    return;
  }
  res.send(200)
})

// we export the app, not listening in here, so that we can run tests
module.exports = app;
