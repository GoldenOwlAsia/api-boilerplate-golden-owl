'use strict';

const passport = require('passport');
const LinkedInStrategy = require('passport-linkedin-token-oauth2').Strategy;
const request = require('request');
const Promise = require('bluebird');
const app = require('../../../server/server.js');

linkedinAuth();

function getLinkedinAccessToken(code, redirectUri) {
  return new Promise((resolve, reject) => {
    const config = app.get('linkedin');
    const url = 'https://www.linkedin.com/oauth/v2/accessToken';
    const _options = {
      url: url,
      form: {
        'grant_type': 'authorization_code',
        'code': code,
        'redirect_uri': redirectUri,
        'client_id': config.clientId,
        'client_secret': config.clientSecret,
      },
      headers: {
        'Accept': 'application/json',
      },
    };
    request.post(_options, (err, response, body) => {
      if (err) reject(err);
      const jbody = JSON.parse(body);
      resolve(jbody.access_token);
    });
  });
}

function linkedinPassport(req, res) {
  return new Promise((resolve, reject) => {
    passport.authenticate('linkedin-auth', (err, user, info) => {
      if (err) return reject(err);
      if (!user) return reject(new Error('Unauthorized!'));
      user.createAccessToken(5000, (err, token) => {
        return resolve(token);
      });
    })(req, res);
  });
}

function linkedinAuth() {
  const config = app.get('linkedin');
  passport.use('linkedin-auth', new LinkedInStrategy({
    clientID: config.clientId,
    clientSecret: config.clientSecret,
    scope: ['r_emailaddress', 'r_basicprofile'],
    profileURL: 'https://api.linkedin.com/v1/people/~:(id,first-name,last-name,email-address,picture-url)?format=json',
  },
  (accessToken, refreshToken, profile, done) => {
    process.nextTick(() => {
      const params = {
        linkedId: profile.id,
        email: profile._json.emailAddress,
        firstName: profile._json.firstName,
        lastName: profile._json.lastName,
        avatarUrl: profile._json.pictureUrl,
      };
      return this._findOrCreateUser(params, done);
    });
  }));
}

function findOrCreateUser(params, done) {
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
    return getLinkedinAccessToken(code, redirectUri).then(token => {
      req.query['access_token'] = token;
      linkedinPassport(req, res).then(response => {
        resolve(response);
      }).catch(reject);
    }).catch(reject);
  });
};
