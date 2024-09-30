if (typeof module !== 'undefined' && typeof exports !== 'undefined' && module.exports === exports) {
  module.exports = 'pressuregauge-ng';
}

(function () {
  'use strict';

  var pressuregaugeModule = angular.module('pressuregauge-ng', []);
  pressuregaugeModule.directive('ngPressuregauge', ['$interval', ngPressuregauge]);

  function ngPressuregauge($interval) {

    return {
      restrict: 'EA',
      scope: {
        pressureField : '@',
        minField      : '@',
        maxField      : '@',
      },
      template: '<div></div>',
      link: function (scope, element, attr) {

        scope.data = { 
                      nominal: false, 
                          min: 20, 
                          max: 100, 
                     interval: undefined 
                   };
        var updatePressuregauge = function() {
            
            var pressure = parseFloat(scope.pressureField);
            if (pressure > scope.data.max) {
                if (scope.data.nominal) 
                    scope.$parent.fireEvent('over');
                scope.data.nominal = false;
                return;
            } 
            if (scope.data.nominal === true && pressure < scope.data.min) {
                if (scope.data.nominal) 
                    scope.$parent.fireEvent('under');
                scope.data.nominal = false;
                return;
            } 
            if (scope.data.nominal === false) {
                scope.$parent.fireEvent('nominal');
                scope.data.nominal = true;
            }

        };

        scope.$watch('pressureField', function () {
          updatePressuregauge();
        });
        scope.$watch('minField', function () {
          scope.data.min = parseFloat(scope.minField); // it changed
          updatePressuregauge();
        });
        scope.$watch('maxField', function () {
          scope.data.max = parseFloat(scope.maxField); // it changed
          updatePressuregauge();
        });

      }
    };
  }

}());
