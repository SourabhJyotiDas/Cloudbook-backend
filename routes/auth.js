const express = require('express');
const router = express.Router();  // express.Router() is also a function insight express
const User = require('../Models/User');
const { body, validationResult } = require('express-validator');  // express validator for valid name,email,password 
const bcrypt = require('bcryptjs');   // for creating hash and salt for password protection
const jwt = require('jsonwebtoken');  // "json web token" is a way of varification to a regular user
const fetchuser = require('../middleware/fetchuser');
// const JWTSECRET = "sourabhisagoodboy";


// Route1: create a user using: POST "/api/auth/createuser" No login Required
router.post('/createuser', [
  body('name', 'Enter a valid Name').isLength({ min: 5 }),
  body('email', 'Enter a valid Email').isEmail(),
  body('password', 'Password must be 5 character').isLength({ min: 5 }),
],
  async (req, res) => {
    //if there are errors, return bad request and the errors  
    let success = false;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success, errors: errors.array() });
    }
    try {
      // check whether the users with  email exist already
      let user = await User.findOne({ "email": req.body.email });
      if (user) { return res.status(404).json({ success, error: "Sorry a user with this email already exists" }) }

      const salt = await bcrypt.genSalt(10);  // first create a salt
      const securePassword = await bcrypt.hash(req.body.password, salt); // after creating salt and hash

      // create a new user
      user = await User.create({
        name: req.body.name,
        password: securePassword,
        email: req.body.email,
      })
      // Jwt data ---->
      const data = {
        user: {
          id: user._id
        }
      }
      // jwt sign take data and secret  // and this return a token
      const authToken = jwt.sign(data, process.env.JWTSECRET);

      // res.json(user)
      success = true
      res.json({ success, authToken })
    }
    catch (error) {
      // console.log(error.message);
      res.status(500).send("internal server error")
    }
  });

// ROute2 : Authenticate a user using: POST "/api/auth/login" No login Required

router.post('/login', [
  body('email', 'Enter a valid Email').isEmail(),
  body('password', 'cannot be blank').exists(),
], async (req, res) => {
  //if there are errors, returns bad request and the errors  
  let success = false
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;
  try {
    let user = await User.findOne({ email })
    // console.log(user);
    if (!user) {
      success = false
      return res.status(400).json({ error: "please try to login with valid informations" })
    }
    const passwordCompare = await bcrypt.compare(password, user.password)
    if (!passwordCompare) {
      success = false
      return res.status(400).json({ success, error: "please try to login with valid informations" })
    }
    const data = {
      user: {
        id: user._id
      }
    }
    // jwt sign take data and secret  // and this return a token
    const authToken = jwt.sign(data, process.env.JWTSECRET);
    success = true
    res.json({ success, authToken })
  } catch (error) {
    // console.log(error.message);
    res.status(500).send("Internal server Error")
  }
})

////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Route 3: get user details using POST "api/auth/getuser". login required

router.post('/getuser',fetchuser,
  async (req, res) => {
    try {
      // console.log(req.user);
      const userId = req.user.id
      // console.log(req.user);

      const user = await User.findById(userId).select("-password")
      res.send(user)
    } catch (error) {
      // console.log(error.message);
      res.status(500).send("Internal server Error")
    }
  })



module.exports = router