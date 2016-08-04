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
  var query = {'user_id':req.user.user_id};

  User.findOneAndUpdate(query, { userPushId: req.user.userPushId }, function(err,doc) {
    if (err) return next(err);
    console.log('NEW DOC:',doc);
  });

  if (req.user.userPushId) {

    User.findOneAndUpdate(query, { userPushId: req.user.userPushId }, function(err,doc) {
      if (err) return next(err);
      console.log('NEW DOC:',doc);
      res.send({ token: tokenForUser(req.user),
        user_id: req.user.id,
        email: req.user.email,
        forename: req.user.firstName,
        surname: req.user.lastName,
        userPushId: req.user.userPushId
      });
    });


  } else {
    res.send({ token: tokenForUser(req.user),
      user_id: req.user.id,
      email: req.user.email,
      forename: req.user.firstName,
      surname: req.user.lastName
    });
  }

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
  const userPushId = req.body.userPushId;

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

    if (userPushId) {
      const user = new User({
        email: email,
        password: password,
        firstName: firstName,
        lastName: lastName,
        userPushId: userPushId
      });
    } else {
      //if no push id - dont include it
      const user = new User({
        email: email,
        password: password,
        firstName: firstName,
        lastName: lastName
      });
    }


    user.save( function(err,userObj) {
      if (err) { return next(err); }

      if (userObj.userPushId) {
        //respond to request indicating it was succesful
        res.json({token: tokenForUser(user),
          user_id: userObj.id,
          email: userObj.email,
          firstName: userObj.firstName,
          lastName: userObj.lastName,
          userPushId: userObj.userPushId
        });
      } else {
        //respond to request indicating it was succesful
        res.json({token: tokenForUser(user),
          user_id: userObj.id,
          email: userObj.email,
          firstName: userObj.firstName,
          lastName: userObj.lastName
        });
      }


    } );

  });
}
