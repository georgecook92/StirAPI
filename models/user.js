const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt-nodejs');

//define the model
const userSchema = new Schema({
  email: { type: String, unique: true, lowercase: true},
  password: String
});

//on save hook, encrypt password

//before a model is saved, this function is run
userSchema.pre('save', function(next) {
  //get access to user model
  const user = this;

  //generate a salt then run callback
  bcrypt.genSalt(10,function(err,salt){
    if(err) { return next(err); }

    //hash/encrypt the password using a salt - then runs another callback once done
    bcrypt.hash(user.password, salt, null, function(err,hash) {
      if(err) { return next(err); }

      //overide the plain text password with encrypted version
      user.password = hash;

      //saves model
      next();
    });
  });
});

//create model class
const ModelClass = mongoose.model('user', userSchema);

//export the model
module.exports = ModelClass;
