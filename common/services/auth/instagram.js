'use strict';

const passport = require('passport');
const InstagramTokenStrategy = require('passport-instagram-token');
const request = require('request');
const Promise = require('bluebird');
const random = require('randomstring');
const app = require('../../../server/server.js');

instagramAuth();

function getInstagramAccessToken(code, redirectUri) {
  return new Promise((resolve, reject) => {
    const config = app.get('instagram');
    const url = 'https://api.instagram.com/oauth/access_token';
    request.post({
      url: url,
      form: {
        'client_id': config.clientId,
        'client_secret': config.clientSecret,
        'redirect_uri': redirectUri,
        'code': code,
        'grant_type': 'authorization_code',
      },
    }, (error, response, body) => {
      if (error) reject(error);
      const jbody = JSON.parse(body);
      resolve(jbody.access_token);
    });
  });
}

function instagramPassport(req, res) {
  return new Promise((resolve, reject) => {
    passport.authenticate('instagram-auth', (err, user, info) => {
      if (err) return reject(err);
      if (!user) return reject(new Error('Unauthorized!'));
      user.createAccessToken(5000, (err, token) => {
        return resolve(token);
      });
    })(req, res);
  });
}

function instagramAuth() {
  const config = app.get('instagram');
  passport.use('instagram-auth', new InstagramTokenStrategy({
    clientID: config.clientId,
    clientSecret: config.clientSecret,
    passReqToCallback: true,
  }, (req, accessToken, refreshToken, profile, next) => {
    const params = {
      instagramId: profile.id,
      email: profile.emails[0] || `${profile.id}@instagram.goldenowl.asia`,
      firstName: profile.name.familyName,
      lastName: profile.name.givenName,
      avatarUrl: profile._json.data.profile_picture,
      password: random.generate(),
    };
    return findOrCreateUser(params, next);
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
    return getInstagramAccessToken(code, redirectUri).then(token => {
      req.query['access_token'] = token;
      instagramPassport(req, res).then(response => {
        resolve(response);
      }).catch(reject);
    }).catch(reject);
  });
};
