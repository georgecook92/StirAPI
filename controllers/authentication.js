const User = require('../models/user');
const jwt = require('jwt-simple');
const config = require('../config');

//sub refers to the subject fo the token (the user) - iat (issued at time)
function tokenForUser(user) {
  const timestamp = new Date().getTime();
  return jwt.encode({ sub: user.id , iat: timestamp },config.secret);
}

exports.signin = function(req,res,next) {
  //user has already had their email and password auth'd
  //just need to give them a token

  //req.user comes from the done method in passport local

  res.send({ token: tokenForUser(req.user) });
}


exports.signup = function(req,res,next) {
  const email = req.body.email;
  const password = req.body.password;
  const firstName = req.body.firstName;
  const lastName = req.body.lastName;

  if(!email || !password || !firstName || !lastName ) {
    return res.status(422).send( { error: "All fields must be provided" } );
  }

  //see if a user with the given email exists
  User.findOne({email: email}, function(err,existingUser){
    if (err) { return next(err); }

    //if a user exists, return an error
    if (existingUser) {
      //bad data
      return res.status(422).send( { error: "Email already in use"} );
    }

    //if no user exists - create and save the user
    const user = new User({
      email: email,
      password: password,
      firstName: firstName,
      lastName: lastName
    });

    user.save( function(err) {
      if (err) { return next(err); }

      //respond to request indicating it was succesful
      res.json({token: tokenForUser(user)});

    } );

  });







}
