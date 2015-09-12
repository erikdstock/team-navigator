var _ = require('lodash');
var request = require('request');
var passport = require('passport');
var OAuth2Strategy = require('passport-oauth2');

passport.use('artsy', new OAuth2Strategy({
  authorizationURL: process.env.ARTSY_URL + '/oauth2/authorize',
  tokenURL: process.env.ARTSY_URL + '/oauth2/access_token',
  clientID: process.env.ARTSY_ID,
  clientSecret: process.env.ARTSY_SECRET,
  callbackURL: process.env.APP_URL + '/auth/artsy/callback'
}, function(accessToken, refreshToken, profile, done) {
  request({
    url: process.env.ARTSY_URL + '/api/v1/me',
    headers: { 'X-Access-Token': accessToken }
  }, function(error, response, body) {
    done(null, JSON.parse(body));
  });
}));

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});

var requireArtsy = function(req, res, next) {
  if (req.user && (
    /@artsymail.com$/.test(req.user.email) ||
    /@artsy.net$/.test(req.user.email)
  )) return next();

  res.redirect('/login');
};

var logout = function(req, res) {
  req.logout();
  res.redirect(process.env.ARTSY_URL + '/users/sign_out');
};

var localUser = function(req, res, next) {
  res.locals.user = req.user;
  next();
};

var deemPrivileged = function(req, res, next) {
  req.user.privileged = _.contains(
    process.env.PRIVILEGED_USER_IDS.split(','),
    req.user.id
  );
  next();
};

module.exports = function(app) {
  app.use(passport.initialize());
  app.use(passport.session());
  app.get('/login', passport.authenticate('artsy'));
  app.get('/auth/artsy/callback', passport.authenticate('artsy', {
    successRedirect: '/',
    failureRedirect: '/logout'
  }));
  app.get('/logout', logout);
  app.use(requireArtsy);
  app.use(localUser);
  app.use(deemPrivileged);
};