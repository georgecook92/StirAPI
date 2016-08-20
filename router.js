const Authentication = require('./controllers/authentication');
const Post = require('./controllers/post');
const passportService = require('./services/passport');
const passport = require('passport');

const requireAuth = passport.authenticate('jwt', { session: false });
const requireSignIn = passport.authenticate('local', {session: false});

module.exports = function(app) {
  app.get('/', requireAuth, function(req,res) {
    res.send({message: 'super secret code is ABC123'});
  });

  app.post('/signin', requireSignIn, Authentication.signin);

  app.post('/signup', Authentication.signup);

  app.get('/viewPost/:post_id', requireAuth, Post.getPost);
  app.get('/getPosts', requireAuth, Post.getPosts);
  app.put('/changeOfflineStatus', requireAuth, Post.changeOfflineStatus);

  app.post('/sendPost', requireAuth, Post.sendPost);
  app.post('/deletePost', requireAuth, Post.deletePost);

  app.post('/resetPassword', Authentication.resetPassword);
  //app.post('/forgotPassword', Authentication.forgotPassword);
}
