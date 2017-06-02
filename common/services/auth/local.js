'use strict';

const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const Promise = require('bluebird');
const app = require('../../../server/server.js');

localAuth();

function localAuth() {
  const User = app.models.user;
  passport.use('local', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    session: false,
  }, (email, password, done) => {
    email = email.trim().toLowerCase();
    password = password.trim();
    User.findOne({email: email}, (err, user) => {
      if (err) return done(err);
      if (!user) {
        return done(null, false, {message: 'Incorrect email.'});
      }
      user.validPassword(password).then(rs => {
        return done(null, user);
      }).catch(err => done(null, false, {message: err}));
    });
  }));
}

module.exports = (req, res) => {
  return new Promise((resolve, reject) => {
    passport.authenticate('local', (err, user, info) => {
      if (err) return reject(err);
      if (!user) return reject(new Error('Unauthorized!'));
      user.createAccessToken(5000, (err, token) => {
        return resolve(token);
      });
    })(req, res);
  });
};
