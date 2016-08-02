const Post = require('../models/post');
const axios = require('axios');

exports.sendPost = function(req,res,next) {
  const title = req.body.title;
  const user_id = req.body.user_id;
  const content = req.body.text;
  const offline = req.body.offline;

  if(!title || !user_id || !content  ) {
    console.log('title', title);
    console.log('id', user_id);
    console.log('text', content);
    console.log('offline', offline);
    return res.status(422).send( { error: "All fields must be provided" } );
  }

  const post = new Post({
    title: title,
    user_id: user_id,
    text: content,
    offline: offline
  });

  post.save( function(err) {
    if (err) { return next(err); }

    //respond to request indicating it was succesful
    res.json({success: true});

  } );

}

exports.getPosts = function(req,res,next) {
  const user_id = req.query.user_id;
  console.log('user id is', user_id);
  Post.find({"user_id": user_id}, function(err,result) {
    if(err) { return next(err); }
    const posts = [];
    for (var i = 0; i < result.length; i++) {
      var obj = {};
      obj.title = result[i].title;
      obj._id = result[i]._id;
      obj.offline = result[i].offline;
      obj.user_id = result[i].user_id;
      obj.text = result[i].text;
      posts.push(obj);
    }
    console.log('posts sent back from server: ', posts);
    res.send(posts);
  });
}

exports.getPost = function(req,res,next) {
  const post_id = req.params.post_id;
  Post.find({"_id": post_id}, function(err,result) {
    if(err) { return next(err); }
    res.send(result);
  });
}

exports.changeOfflineStatus = function(req,res,next) {
  const post_id = req.body.post_id;
  const offlineStatus = req.body.offlineStatus;
  const query = { "_id": post_id };

  Post.findOneAndUpdate(query, { "offline": offlineStatus  }, {new:true}, function(err,doc) {
    if(err) return next(err);

    Post.find({"user_id": doc.user_id}, function(err,result) {
      if(err) { return next(err); }
      const posts = [];
      for (var i = 0; i < result.length; i++) {
        var obj = {};
        obj.title = result[i].title;
        obj._id = result[i]._id;
        obj.offline = result[i].offline;
        posts.push(obj);
      }
      console.log('posts sent back from server: ', posts);
      res.send(posts);
    });

  });
}

exports.deletePost = function(req,res,next) {
  var post_id = req.body.post_id;
  const query = { "_id": post_id };
  console.log(req.body);
  Post.remove( query, function(err){
    if(err) return next(err);
    res.json({success: true});
  });
}
