'use strict';

const Promise = require('bluebird');
const AuthService = require('../services/auth');
const disableAllMethods = require('../utils/helpers').disableAllMethods;
const setupOauth2Method = require('../utils/helpers').setupOauth2Method;

module.exports = function(Auth) {
  disableAllMethods(Auth);

  Auth.local = (req, res, cb) => {
    AuthService.authenticateLocal(req, res).then(token => {
      cb(null, token);
    }).catch(cb);
  };

  Auth.facebook = (code, redirectUri, state, req, res, cb) => {
    AuthService.authenticateFacebook(req, res).then(token => {
      cb(null, token);
    }).catch(cb);
  };

  Auth.google = (code, redirectUri, state, req, res, cb) => {
    AuthService.authenticateGoogle(req, res).then(token => {
      cb(null, token);
    }).catch(cb);
  };

  Auth.linkedin = (code, redirectUri, state, req, res, cb) => {
    AuthService.authenticateLinkedin(req, res).then(token => {
      cb(null, token);
    }).catch(cb);
  };

  Auth.github = (code, redirectUri, state, req, res, cb) => {
    AuthService.authenticateGithub(req, res).then(token => {
      cb(null, token);
    }).catch(cb);
  };

  Auth.twitter = (code, redirectUri, state, req, res, cb) => {
    AuthService.authenticateTwitter(req, res).then(token => {
      cb(null, token);
    }).catch(cb);
  };

  Auth.instagram = (code, redirectUri, state, req, res, cb) => {
    AuthService.authenticateInstagram(req, res).then(token => {
      cb(null, token);
    }).catch(cb);
  };

  Auth.logout = (accessToken, req, cb) => {
    AuthService.signout(req).then(_ => {
      cb();
    }).catch(cb);
  };

  Auth.remoteMethod('local', {
    http: {path: '/local', verb: 'post'},
    accepts: [
      {arg: 'req', type: 'object', 'http': {source: 'req'}},
      {arg: 'res', type: 'object', 'http': {source: 'res'}},
    ],
    returns: [
      {arg: 'token', type: 'object'},
    ],
  });

  Auth.remoteMethod('logout', {
    http: {path: '/logout', verb: 'get', status: '204'},
    accepts: [
      {arg: 'accessToken', type: 'string', 'http': {source: 'query'}},
      {arg: 'req', type: 'object', 'http': {source: 'req'}},
    ],
  });

  setupOauth2Method(Auth, [
    'facebook',
    'google',
    'linkedin',
    'github',
    'instagram',
    'twitter',
  ]);
};
