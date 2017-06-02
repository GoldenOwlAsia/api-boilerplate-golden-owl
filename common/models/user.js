'use strict';

module.exports = function(User) {
  User.disableRemoteMethodByName('login', true);
  User.disableRemoteMethodByName('logout', true);
};
