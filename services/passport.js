const passport = require('passport');
const User = require('../models/user');
const config = require('../config');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const LocalStrategy = require('passport-local');


//create local login strategy
//uses username as standard - have to change it to look for email
const localOptions = {usernameField: 'email'};
const localLogin = new LocalStrategy(localOptions,function(email,password,done) {
  //verify email and password
  //if correct call done with user
  //otherwise call done with false

  User.findOne( {email: email} , function(err,user) {
    if(err) { return done(err); }
    if (!user) { return done(null, false); }

    //compare passwords - are the passwords equal? Stored password is salted and hashed
    user.comparePassword(password, function(err,isMatch) {
      if(err) { return done(err); }

      if(!isMatch) { return done(null, false); }
      console.log(user);

      return done(null,user);

    });

  });

});


//setup options for jwt Strategy
const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromHeader('authorisation'),
  secretOrKey: config.secret
};

//create jwt strategy
//payload is decoded jwt token - will be user id and timestamp
const jwtLogin = new JwtStrategy(jwtOptions, function(payload,done){
  //see if the user id in the payload exists in db
  //if it does call done with the user
  //otherwise call done without user

  User.findById(payload.sub, function(err,user){
    if(err){ return done(err, false); }

    if(user) {
      done(null,user);
    } else {
      done(null, false);
    }

  });


});

//tell passport to use strategy
passport.use(jwtLogin);
passport.use(localLogin);
