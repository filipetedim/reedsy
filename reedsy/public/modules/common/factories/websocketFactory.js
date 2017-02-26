'use strict';

var websocketFactory = angular.module('common.factories', []);

websocketFactory.service('WebsocketFactory', [
    '$rootScope', 'SOCKET_ADDR',
    function ($rootScope, SOCKET_ADDR) {

        var socket = io.connect(SOCKET_ADDR);

        /**
         * The on trigger from websocket.io.
         *
         * @param {String} eventName - the event name
         * @param {Function} callback - the callback
         */
        var on = function (eventName, callback) {
            socket.on(eventName, function () {
                var args = arguments;

                $rootScope.$apply(function () {
                    callback.apply(socket, args);
                });
            })
        };

        /**
         * The emit trigger from websocket.io.
         *
         * @param {String} eventName - the event name
         * @param {Object} data - the data to pass
         * @param {Function} callback - the callback
         */
        var emit = function (eventName, data, callback) {
            socket.emit(eventName, data, function () {
                var args = arguments;

                $rootScope.$apply(function () {
                    if (callback) {
                        callback.apply(socket, args);
                    }
                });
            })
        };

        return {
            on: on,
            emit: emit
        };
    }]);
