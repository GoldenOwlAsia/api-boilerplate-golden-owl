'use strict';

module.exports.disableAllMethods = (model, methodsToExpose) => {
  if (model && model.sharedClass) {
    methodsToExpose = methodsToExpose || [];

    var modelName = model.sharedClass.name;
    var methods = model.sharedClass.methods();
    var relationMethods = [];
    var hiddenMethods = [];

    try {
      Object.keys(model.definition.settings.relations).forEach(relation => {
        relationMethods.push({name: 'prototype.__findById__' + relation});
        relationMethods.push({name: 'prototype.__destroyById__' + relation});
        relationMethods.push({name: 'prototype.__updateById__' + relation});
        relationMethods.push({name: 'prototype.__replaceAttributes__' + relation});
        relationMethods.push({name: 'prototype.__exists__' + relation});
        relationMethods.push({name: 'prototype.__link__' + relation});
        relationMethods.push({name: 'prototype.__get__' + relation});
        relationMethods.push({name: 'prototype.__create__' + relation});
        relationMethods.push({name: 'prototype.__update__' + relation});
        relationMethods.push({name: 'prototype.__destroy__' + relation});
        relationMethods.push({name: 'prototype.__unlink__' + relation});
        relationMethods.push({name: 'prototype.__count__' + relation});
        relationMethods.push({name: 'prototype.__delete__' + relation});
      });
    } catch (err) {}

    methods.concat(relationMethods).forEach(method => {
      var methodName = method.name;
      if (methodsToExpose.indexOf(methodName) < 0) {
        hiddenMethods.push(methodName);
        model.disableRemoteMethodByName(methodName, method.isStatic);
      }
    });
    model.disableRemoteMethodByName('prototype.patchAttributes', true);

    if (hiddenMethods.length > 0) {
      console.log('\nRemote mehtods hidden for', modelName, ':', hiddenMethods.join(', '), '\n');
    }
  }
};

module.exports.setupOauth2Method = (model, arrThirdParties) => {
  arrThirdParties.forEach(thirdParty => {
    model.remoteMethod(thirdParty, {
      http: {path: `/${thirdParty}`, verb: 'get'},
      accepts: [
        {arg: 'code', type: 'string', 'http': {source: 'query'}},
        {arg: 'redirectUri', type: 'string', 'http': {source: 'query'}},
        {arg: 'req', type: 'object', 'http': {source: 'req'}},
        {arg: 'res', type: 'object', 'http': {source: 'res'}},
      ],
      returns: [
        {arg: 'token', type: 'object'},
      ],
    });
  });
};
