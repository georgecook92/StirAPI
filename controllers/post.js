const Post = require('../models/post');

exports.sendPost = function(req,res,next) {
  const title = req.body.title;
  const user_id = req.body.user_id;
  const content = req.body.text;
  const offline = req.body.offline;

  if(!title || !user_id || !content || !offline ) {
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
  Post.find({"user_id": user_id}, function(err,result) {
    res.send(result);
  });
}
