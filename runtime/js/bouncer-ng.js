if (typeof module !== 'undefined' && typeof exports !== 'undefined' && module.exports === exports) {
  module.exports = 'bouncer-ng';
}

(function () {
  'use strict';

  var bouncerModule = angular.module('bouncer-ng', []);
  bouncerModule.directive('ngBouncer', ['$interval', ngBouncer]);

  function ngBouncer($interval) {

    return {
      restrict: 'EA',
      scope: {
        bouncingField : '@',
        rateField     : '@',
        minField      : '@',
        maxField      : '@',
        limitField    : '@',
      },
      template: '<div></div>',
      link: function (scope, element, attr) {

        var lastUpdated = 'unknown';
        scope.data = { bounce: 0, 
                        value: 0, 
                        count: 0, 
                         step: 0, 
                          min: 0, 
                          max: 1, 
                     interval: undefined 
                   };
        var updateBouncer = function(){
          
          var rate = parseFloat(scope.rateField);
          var M2PI = 2.0 * Math.PI;
          if (rate != 0.0)
            scope.data.step = M2PI * rate / 100 ;

          if (scope.data.interval === undefined) {
            scope.data.interval = $interval(function () {
              var data = scope.data;
              if (data && scope.limitField != undefined && 
                          scope.limitField != '' && 
                          data.count >= scope.limitField) {
                
                // stop bouncing
                $interval.cancel(scope.data.interval);
                scope.data.interval = undefined; // allow restart

                // fire 'stopped' event at this point
                scope.$parent.fireEvent('stopped');
              } 
              else if (data && scope.rateField && 
                               scope.bouncingField) {

                if (scope.bouncingField != undefined && 
                    scope.bouncingField === 'true') {

                  data.value += data.step;
                  if (data.value > M2PI) {
                    data.value -= M2PI;
                    data.count += 1;

                    // we've complete 1 cycle
                    scope.$parent.fireEvent('bounce');
                  }
                  data.bounce = (1.0 - Math.cos(data.value)) / 2.0; // normalised
                  var output = data.min + data.bounce * (data.max - data.min); 

                  // output the output variables
                  scope.$parent.view.wdg[scope.$parent.widgetId]['value']       = output;
                  scope.$parent.view.wdg[scope.$parent.widgetId]['bounceCount'] = data.count;
                }
              }
            }, 10);
          }

        };

        scope.$watch('bouncingField', function () {
          scope.data.value = 0.0;
          updateBouncer();
        });

        scope.$watch('rateField', function () {
          updateBouncer();
        });

        scope.$watch('minField', function () {
          scope.data.min = parseFloat(scope.minField); // it changed
          updateBouncer();
        });
        
        scope.$watch('maxField', function () {
          scope.data.max = parseFloat(scope.maxField); // it changed
          updateBouncer();
        });

        scope.$watch('limitField', function () {
          updateBouncer();
        });
      }
    };
  }

}());
