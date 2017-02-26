'use strict';

var conversionQueueController = angular.module('conversionQueue');

conversionQueueController.controller('ConversionQueueController', [
    '$scope', 'ConversionQueueService', 'WebsocketFactory',
    function ($scope, ConversionQueueService, WebsocketFactory) {

        /**
         * Controller variables
         */
        $scope.conversionQueue = [];

        /**
         * Initializes the controller
         */
        var init = function () {
            ConversionQueueService.getAllConversions().then(function (response) {
                $scope.conversionQueue = response.data;
            }, function () {
                console.error('Something went wrong and the server seems to have gone kaputs!');
            });

            // Connect to socket and listen for event 'conversion'
            WebsocketFactory.on('conversion', parseSocketData);
        };

        /**
         * When receiving data, checks if the id or the created_at properties match any existing item.
         * If it does, updates that item with its new _id and status.
         * Otherwise it creates a new item and pushes (used to sync multiple browsers open).
         * Alerts a message with iGrowl in the end.
         *
         * @param {Object} data - the socket data received
         */
        var parseSocketData = function (data) {
            var exists = false;

            $scope.conversionQueue.forEach(function (item) {
                if (item._id === data._id || item.created_at == moment(data.created_at).format('x')) {
                    item._id = data._id;
                    item.status = data.status;

                    exists = true;
                }
            });

            if (!exists) {
                $scope.conversionQueue.push(data);
            }

            alertStatus(data);
        };

        /**
         * Selects the appropriate font awesome icon and color according to the conversion object status.
         * If status doesn't exist or is undefined returns a question icon.
         *
         * @param {Object} conversionObject - the conversion object
         */
        $scope.selectStatusStyling = function (conversionObject) {
            if (!exists(conversionObject.status)) {
                return {icon: 'fa-question-circle-o', color: 'text-muted'};
            }

            switch (conversionObject.status) {
                case 'Processed':
                    return {icon: 'fa-check', color: 'text-success'};
                case 'Processing':
                    return {icon: 'fa-repeat', color: 'text-primary'};
                case 'In Queue':
                    return {icon: 'fa-clock-o', color: 'text-muted'};
                default:
                    return {icon: 'fa-question-circle-o', color: 'text-muted'};
            }
        };

        /**
         * Creates an item and adds it to the controller's conversion queue.
         * Its status is then changed through the web socket.
         *
         * @param {String} type - the type of item to be converted
         */
        $scope.convertItem = function (type) {
            var item = {
                name: type + ' #' + getNextFileNumber(type),
                created_at: parseInt(moment().format('x')),
                type: type,
                status: 'In Queue'
            };

            $scope.conversionQueue.push(item);

            ConversionQueueService.requestConversion(item).then(function (response) {
            }, function () {
                console.error('Something went wrong and the server seems to have gone kaputs!');
            });
        };

        /**
         * Requests the server to clear all the database.
         * Only works if the processing queue is empty.
         */
        $scope.clearDatabase = function () {
            ConversionQueueService.clearDatabase().then(function () {
                $scope.conversionQueue = [];
            }, function (err) {
                if (err.status === 409) {
                    $.iGrowl({
                        message: 'Please wait until all requests process!',
                        icon: 'feather-cross',
                        type: 'error',
                        small: true,
                        delay: 1000,
                        animShow: 'fadeInDown',
                        animHide: 'fadeOutUp'
                    });
                } else {
                    console.error('Something went wrong and the server seems to have gone kaputs!');
                }
            });
        };

        /**
         * Transforms a timestamp to readable date.
         *
         * @param {String} date - the date to parse
         * @return {String} - readabçe date
         */
        $scope.toReadableDate = function (date) {
            return moment(date).format('ddd, MMM D, h:mm a');
        };

        /**
         * Counts how many files of the given type exist and returns that number plus one.
         *
         * @param {String} type - the file type
         * @return {Number} - the next file number
         */
        var getNextFileNumber = function (type) {
            var nextFileNumber = 1;

            $scope.conversionQueue.forEach(function (item, index) {
                nextFileNumber = nextFileNumber + (item.type === type);
            });

            return nextFileNumber;
        };

        /**
         * Creates an iGrowl alert according to the status.
         * Only executes if the status is either 'Processing' or 'Processed'.
         *
         * @param {Object} item - the item to alert
         */
        var alertStatus = function (item) {
            if (item.status !== 'Processing' && item.status !== 'Processed') {
                return;
            }

            var iGrowlObject = {
                type: 'simple',
                delay: 500,
                small: true,
                animShow: 'fadeInDown',
                animHide: 'fadeOutUp'
            };

            if (item.status === 'Processing') {
                iGrowlObject.message = 'Request ' + item.name + ' started processing';
                iGrowlObject.icon = 'feather-reload';
            } else if (item.status === 'Processed') {
                iGrowlObject.message = 'Request ' + item.name + ' processed';
                iGrowlObject.icon = 'feather-check';
                iGrowlObject.type = 'success';
            }

            $.iGrowl(iGrowlObject);
        };

        /**
         * Checks if the given object is undefined or null.
         *
         * @param {Object} obj - the object to check on
         * @return {Boolean} - true if exists, false otherwise
         */
        var exists = function (obj) {
            return typeof obj !== 'undefined' && obj !== null;
        };

        init();
    }]);
