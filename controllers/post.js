const Post = require('../models/post');

var sendNotification = function(data) {
  var headers = {
    "Content-Type": "application/json",
    "Authorization": "Basic ZGE1YTJmOWItOTk3My00Y2IzLWI3YzEtODQzMDJiZGZhN2Nh"
  };

  var options = {
    host: "onesignal.com",
    port: 443,
    path: "/api/v1/notifications",
    method: "POST",
    headers: headers
  };

  var https = require('https');
  var req = https.request(options, function(res) {
    res.on('data', function(data) {
      console.log("Response:");
      console.log(JSON.parse(data));
    });
  });

  req.on('error', function(e) {
    console.log("ERROR:");
    console.log(e);
  });

  req.write(JSON.stringify(data));
  req.end();
};


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

    var message = {
      app_id: '04954d84-8b33-4124-98cb-ac53f5abcf1d',
      contents: {"en": "Recipe has been created"},
      headings: { "en" : "Stir Notification" },
      include_player_ids: ['f30be904-34c2-4d5d-8cc0-942806715c98']
    };

    sendNotification(message);

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
        obj.user_id = result[i].user_id;
        obj.text = result[i].text;
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
