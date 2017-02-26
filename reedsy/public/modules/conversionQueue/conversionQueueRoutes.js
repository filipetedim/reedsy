'use strict';

var reedsyApp = angular.module('reedsyApp');

reedsyApp.config(['$routeProvider', function ($routeProvider){
    $routeProvider
        .when('/', {
            controller: 'ConversionQueueController',
            templateUrl: 'modules/conversionQueue/conversionQueueView.html'
        })
        .otherwise({redirectTo: '/'});
}]);
