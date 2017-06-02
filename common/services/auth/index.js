'use strict';

const local = require('./local');
const facebook = require('./facebook');
const google = require('./google');
const signout = require('./signout');

module.exports = {
  authenticateLocal: local,
  authenticateFacebook: facebook,
  authenticateGoogle: google,
  signout: signout,
};
