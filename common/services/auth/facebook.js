'use strict';

const passport = require('passport');
const FacebookTokenStrategy = require('passport-facebook-token');
const request = require('request');
const Promise = require('bluebird');
const app = require('../../../server/server.js');
facebookAuth();

function getFacebookAccessToken(code, redirectUri) {
  return new Promise((resolve, reject) => {
    const config = app.get('facebook');
    const queryStr = `client_id=${config.appId}&redirect_uri=${encodeURIComponent(redirectUri)}&client_secret=${config.appSecret}&code=${code}`;
    const url = `https://graph.facebook.com/v2.9/oauth/access_token?${queryStr}`;
    request(url, (error, response, body) => {
      if (error) reject(error);
      const jbody = JSON.parse(body);
      resolve(jbody.access_token);
    });
  });
}

function facebookPassport(req, res) {
  return new Promise((resolve, reject) => {
    passport.authenticate('facebook-auth', (err, user, info) => {
      if (err) return reject(err);
      if (!user) return reject(new Error('Unauthorized!'));
      user.createAccessToken(5000, (err, token) => {
        return resolve(token);
      });
    })(req, res);
  });
}

function facebookAuth() {
  const config = app.get('facebook');
  passport.use('facebook-auth', new FacebookTokenStrategy(
    {
      clientID: config.appId,
      clientSecret: config.appSecret,
      profileFields: ['id', 'first_name', 'email', 'last_name'],
    },
    (accessToken, refreshToken, profile, done) => {
      process.nextTick(() => {
        const params = {
          avatarUrl: `https://graph.facebook.com/${profile.id}/picture?type=normal`,
          email: profile._json.email,
          firstName: profile._json.first_name,
          lastName: profile._json.last_name,
          facebookId: profile.id,
        };
        return _findOrCreateUser(params, done);
      });
    }
  ));
}

function _findOrCreateUser(params, done) {
  var User = app.models.user;
  User.findOrCreate({
    'where': {
      'email': params.email,
    },
  }, params, (err, instance, created) => {
    if (err) return done(err);
    return done(null, instance);
  });
}

module.exports = (req, res) => {
  return new Promise((resolve, reject) => {
    const code = req.query.code;
    const redirectUri = req.query.redirectUri;
    return getFacebookAccessToken(code, redirectUri).then(token => {
      req.query['access_token'] = token;
      facebookPassport(req, res).then(response => {
        resolve(response);
      }).catch(reject);
    }).catch(reject);
  });
};
