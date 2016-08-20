const User = require('../models/user');
const Post = require('../models/post');
const jwt = require('jwt-simple');
const config = require('../config');
const nodemailer = require('nodemailer');
const sgTransport = require('nodemailer-sendgrid-transport');
const randomstring = require('randomstring');

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

exports.resetForgottenPassword = function(req,res,next) {
  const newPw = req.body.newPw;
  const token = req.body.token;

  console.log('newPW',newPw);

  User.findOne( {resetPasswordToken: token }, function(err,user){
    if (err) {
      if (err) return res.send(500, { error: err });
      console.log('err from resetForgottenPassword', err);
      return res.json({ 'error': err });
    } else {

      if (user) {
        user.password = newPw;
        user.resetPasswordToken = undefined;
        user.save(function(err){
          if (err) {
            console.log('error with saving new password', err);
            return res.json( { 'success' : 'false' });
          } else {
            return res.json( { 'success' : 'true' });
          }
        });
      } else {
        return res.send(404, { error: 'No user found' })
      }

    }

  });

}

exports.forgotPassword = function(req,res,next) {
  const email = req.body.email;

  console.log('email', email);

  const query = { email: email};
  const token = randomstring.generate({
    length: 20,
    charset: 'hex'
  });
  const newData = {resetPasswordToken: token};

  User.findOneAndUpdate(query, newData, {new: true}, function(err, doc){
    if (err) return res.send(500, { error: err });

    var options = {
      //need ENV
      auth: {
          api_user: 'Georgecook92',
          api_key: 'osc5Gne^s9tAd25n'
      }
    }

    var mailer = nodemailer.createTransport(sgTransport(options));

    //var url = 'https://stir-recipe.herokuapp.com';
    var url = 'http://localhost:8080';

    var mailOptions = {
      to: doc.email,
      from: 'passwordreset@stir.com',
      subject: 'Stir Password Reset',
      text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
        'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
        url + '/resetForgottenPassword/' + token + '\n\n' +
        'If you did not request this, please ignore this email and your password will remain unchanged.\n'
    };

    mailer.sendMail(mailOptions, function(err) {
      if (err) {
        return console.log('err', err);
      }
      return res.json( { 'success': 'Email has been sent' } );

    });
});

  // User.findOne( {email: email} , function(err,user) {
  //   console.log('user', user);
  //   if (!user) {
  //     return res.json({'error': 'Email Does Not Exist'});
  //   }
  //   const token = randomstring.generate({
  //     length: 20,
  //     charset: 'hex'
  //   });
  //   user.resetPasswordToken = token;
  //
  //   user.save( function() {
  //     var options = {
  //       //need ENV
  //       auth: {
  //           api_user: 'Georgecook92',
  //           api_key: 'osc5Gne^s9tAd25n'
  //       }
  //     }
  //
  //     var mailer = nodemailer.createTransport(sgTransport(options));
  //
  //     //var url = 'https://stir-recipe.herokuapp.com';
  //     var url = 'http://localhost:8080';
  //
  //     var mailOptions = {
  //       to: user.email,
  //       from: 'passwordreset@stir.com',
  //       subject: 'Stir Password Reset',
  //       text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
  //         'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
  //         url + '/resetForgottenPassword/' + token + '\n\n' +
  //         'If you did not request this, please ignore this email and your password will remain unchanged.\n'
  //     };
  //
  //     mailer.sendMail(mailOptions, function(err) {
  //       if (err) {
  //         return console.log('err', err);
  //       }
  //       return res.json( { 'success': 'Email has been sent' } );
  //
  //     });
  //
  //   } )
  // })
}
