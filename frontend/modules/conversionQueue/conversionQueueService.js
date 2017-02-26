'use strict';

var conversionQueueService = angular.module('conversionQueue', []);

conversionQueueService.service('ConversionQueueService', [
    '$http', 'API_ADDR',
    function ($http, API_ADDR) {

        this.requestConversion = function (data) {
            return $http.post(API_ADDR + '/conversions', data);
        };

        this.getAllConversions = function () {
            return $http.get(API_ADDR + '/conversions');
        };
    }]);
