const Post = require('../models/post');

exports.sendPost = function(req,res,next) {
  const title = req.body.title;
  const user_id = req.body.user_id;
  const content = req.body.text;
  const offline = req.body.offline;

  if(!title || !user_id || !content || !offline ) {
    return res.status(422).send( { error: "All fields must be provided" } );
  }

  const post = new Post({
    title: title,
    user_id: user_id,
    test: content,
    offline: offline
  });

  post.save( function(err) {
    if (err) { return next(err); }

    //respond to request indicating it was succesful
    res.json({success: true});

  } );

}
