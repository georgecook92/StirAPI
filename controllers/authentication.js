const User = require('../models/user');
const Post = require('../models/post');
const jwt = require('jwt-simple');
const config = require('../config');
var randomstring = require("randomstring");
const nodemailer = require('nodemailer');

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
    if(err) { console.log(err); }
    if (!user) { return next(null, false); }

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

exports.forgotPassword = function(req,res) {

  const email = req.body.email;

  User.findOne( {email: email} , function(err,user) {

    if (!user) {
      res.json( {error: 'Email Not Found'} );
    } else {
      var token = randomstring.generate({
      length: 20,
      charset: 'hex'
      });

      user.resetPasswordToken = token;
      user.resetPasswordExpires = Date.now() + 3600000; // 1 hour to reset

      user.save().then( function(user) {
        console.log('user',user);

        var smtpTransport = nodemailer.createTransport('SMTP', {
        service: 'SendGrid',
        auth: {
          user: 'Georgecook92',
          pass: 'osc5Gne^s9tAd25n'
        }
      });

      var mailOptions = {
        to: user.email,
        from: 'passwordreset@stir.com',
        subject: 'Stir Password Reset',
        text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
          'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
          'http://' + req.headers.host + '/reset/' + token + '\n\n' +
          'If you did not request this, please ignore this email and your password will remain unchanged.\n'
      };

      smtpTransport.sendMail(mailOptions, function(err) {
        res.json({'success': 'Email sent'});
      });



      } ).catch( function(err) {
        console.log('err', err);
        res.json( {'error': err} );
      } )
    }



  }



}
