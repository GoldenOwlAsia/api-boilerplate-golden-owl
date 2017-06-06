'use strict';

const local = require('./local');
const facebook = require('./facebook');
const google = require('./google');
const signout = require('./signout');
const github = require('./github');
const instagram = require('./instagram');
const twitter = require('./twitter');
const linkedin = require('./linkedin');

module.exports = {
  authenticateLocal: local,
  authenticateFacebook: facebook,
  authenticateGoogle: google,
  authenticateGithub: github,
  authenticateInstagram: instagram,
  authenticateTwitter: twitter,
  authenticateLinkedin: linkedin,
  signout: signout,
};
