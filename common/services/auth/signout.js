'use strict';

const Promise = require('bluebird');
const app = require('../../../server/server.js');

module.exports = (req) => {
  return new Promise((resolve, reject) => {
    const User = app.models.user;
    const accessToken = req.query.accessToken;
    if (!accessToken) {
      const error = new Error('access token is required!');
      error.status = 400;
      return reject(error);
    }
    User.logout(accessToken, function(err) {
      if (err) {
        // Log.error({
        //   error: err,
        //   timestamp: new Date.getTime(),
        // });
        const error = new Error('logout failed!');
        error.status = 404;
        return reject(error);
      }
      return resolve();
    });
  });
};
