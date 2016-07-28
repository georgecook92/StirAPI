const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//define the model
const postSchema = new Schema({
  title: String,
  text: String,
  user_id: Schema.Types.ObjectId,
  offline: Boolean
});

//create model class
const ModelClass = mongoose.model('post', postSchema);

//export the model
module.exports = ModelClass;
