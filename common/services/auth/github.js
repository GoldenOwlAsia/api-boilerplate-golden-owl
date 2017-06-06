'use strict';

const passport = require('passport');
const GithubTokenStrategy = require('passport-github-token');
const request = require('request');
const Promise = require('bluebird');
const random = require('randomstring');
const app = require('../../../server/server.js');

githubAuth();

function getGithubAccessToken(code, redirectUri, state) {
  return new Promise((resolve, reject) => {
    const config = app.get('github');
    const url = 'https://github.com/login/oauth/access_token';
    request.post({
      url: url,
      form: {
        'client_id': config.clientId,
        'client_secret': config.clientSecret,
        'redirect_uri': redirectUri,
        'code': code,
        'state': state,
      },
    }, (error, response, body) => {
      if (error) reject(error);
      const arrBody = body.split('&');
      arrBody.forEach(item => {
        const result = item.split('=');
        if (result[0] === 'access_token') {
          resolve(result[1]);
        }
      });
    });
  });
}

function githubPassport(req, res) {
  return new Promise((resolve, reject) => {
    passport.authenticate('github-auth', (err, user, info) => {
      if (err) return reject(err);
      if (!user) return reject(new Error('Unauthorized!'));
      user.createAccessToken(5000, (err, token) => {
        return resolve(token);
      });
    })(req, res);
  });
}

function githubAuth() {
  const config = app.get('github');
  passport.use('github-auth', new GithubTokenStrategy({
    clientID: config.clientId,
    clientSecret: config.clientSecret,
  }, (accessToken, refreshToken, profile, done) => {
    const params = {
      githubId: profile.id,
      firstName: profile.name.familyName,
      lastName: profile.name.givenName,
      avatarUrl: profile._json.avatar_url,
      email: profile.emails[0].value || `${profile.id}@github.goldenowl.asia`,
      password: random.generate(),
    };
    return findOrCreateUser(params, done);
  }));
}

function findOrCreateUser(params, done) {
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
    const state = req.query.state;
    return getGithubAccessToken(code, redirectUri, state).then(token => {
      req.query['access_token'] = token;
      githubPassport(req, res).then(response => {
        resolve(response);
      }).catch(reject);
    }).catch(reject);
  });
};
