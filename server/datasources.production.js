'use strict';

module.exports = {
  'db': {
    'name': 'db',
    'connector': 'memory',
  },
  'mongoDs': {
    'host': process.env.MONGO_HOST || 'mongo' || '0.0.0.0',
    'port': process.env.MONGO_PORT || 27017,
    'url': '',
    'database': process.env.MONGO_DATABASE || 'getwrkn',
    'password': process.env.MONGO_PASSWORD || '',
    'name': 'mongoDs',
    'user': process.env.MONGO_USER || '',
    'connector': 'mongodb',
  },
};
