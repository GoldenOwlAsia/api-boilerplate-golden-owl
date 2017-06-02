'use strict';

const passport = require('passport');
const GoogleTokenStrategy = require('passport-google-token').Strategy;
const request = require('request');
const Promise = require('bluebird');
const app = require('../../../server/server.js');

googleAuth();

function getGoogleAccessToken(code, redirectUri) {
  return new Promise((resolve, reject) => {
    const config = app.get('google');
    const url = 'https://www.googleapis.com/oauth2/v4/token';
    request.post({
      url: url,
      form: {
        'client_id': config.clientId,
        'client_secret': config.clientSecret,
        'redirect_uri': redirectUri,
        'grant_type': 'authorization_code',
        'code': code,
      },
    }, (error, response, body) => {
      if (error) reject(error);
      const jbody = JSON.parse(body);
      resolve(jbody.access_token);
    });
  });
}

function googlePassport(req, res) {
  return new Promise((resolve, reject) => {
    passport.authenticate('google-auth', (err, user, info) => {
      if (err) return reject(err);
      if (!user) return reject(new Error('Unauthorized!'));
      user.createAccessToken(5000, (err, token) => {
        return resolve(token);
      });
    })(req, res);
  });
}

function googleAuth() {
  const config = app.get('google');
  passport.use('google-auth', new GoogleTokenStrategy({
    clientID: config.clientId,
    clientSecret: config.clientSecret,
  }, (AccessToken, refreshToken, profile, done) => {
    const params = {
      googleId: profile.id,
      email: profile._json.email,
      lastName: profile._json.given_name,
      firstName: profile._json.family_name,
      avatarUrl: profile._json.picture,
      gender: profile._json.gender,
    };
    return _findOrCreateUser(params, done);
  }));
}

function _findOrCreateUser(params, done) {
  const User = app.models.user;
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
    return getGoogleAccessToken(code, redirectUri).then(token => {
      req.query['access_token'] = token;
      googlePassport(req, res).then(response => {
        resolve(response);
      }).catch(reject);
    }).catch(reject);
  });
};
