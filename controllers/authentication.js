const User = require('../models/user');
const Post = require('../models/post');
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

  console.log(req.user);

  res.send({ token: tokenForUser(req.user),
    user_id: req.user.id,
    email: req.user.email,
    forename: req.user.firstName,
    surname: req.user.lastName
  });
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

    user.save( function(err,userObj) {
      if (err) { return next(err); }

      //respond to request indicating it was succesful
      res.json({token: tokenForUser(user),
        user_id: userObj.id,
        email: userObj.email,
        firstName: userObj.firstName,
        lastName: userObj.lastName
      });

    } );

  });
}

exports.resetPassword = function(req,res,next) {
  const oldPassword = req.body.oldPw;
  const newPassword = req.body.newPw;
  const email = req.body.email;

  User.findOne( {email: email} , function(err,user) {
    if(err) { return done(err); }
    if (!user) { return done(null, false); }

    //compare passwords - are the passwords equal? Stored password is salted and hashed
    user.comparePassword(oldPassword, function(err,isMatch) {

      if(!isMatch) {
        res.json( { 'error' : 'Incorrect password' } );
      } else {
        user.password = newPassword;
        user.save( function(err) {
          if (err) {
            console.log('error with saving new password', err);
            res.json( { 'success' : 'false' });
          } else {
            res.json( { 'success' : 'true' });
          }

        } )
      }

    });

  });



}
