'use strict';

const config = require('./config');
const database = require('./database');

/**
 * Creates the url to connect to mlab.com.
 *
 * @return {String} - db url
 */
const getDbConnectionUrl = () => `mongodb://${database.USERNAME}:${database.PASSWORD}@${database.URL}`;

module.exports = {
    getDbConnectionUrl,
    PORT: config.PORT
};