'use strict';

// Dependencies
const socketio = require('socket.io');

// Module variables
let socket = null;

/**
 * Returns the web socket.
 * Should never go as null since it's created when the server starts.
 *
 * @return {Object|null} - the web socket object
 */
const getSocket = () => socket;

/**
 * Initializes the web socket.
 *
 * @param {Object} server - the server object
 */
const initialize = (server) => {

    // Left as comment because might be needed for XMLHTTPRequest problems when uploading the server
    // Passed as second param
    const options = {origins: "http://localhost:63342"};

    socket = socketio(server);
};

module.exports = {
    getSocket,
    initialize
};