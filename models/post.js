const mongoose = require('mongoose');
mongoose.Promise = global.Promise
const Schema = mongoose.Schema;

//define the model
const postSchema = new Schema({
  title: String,
  text: String,
  user_id: String,
  offline: Boolean
});

//create model class
const ModelClass = mongoose.model('post', postSchema);

//export the model
module.exports = ModelClass;
