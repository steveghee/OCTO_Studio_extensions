if (typeof module !== 'undefined' && typeof exports !== 'undefined' && module.exports === exports) {
  module.exports = 'turntable-ng';
}

(function () {
  'use strict';

  var turntableModule = angular.module('turntable-ng', []);
  turntableModule.directive('ngTurntable', ['$interval', ngTurntable]);

  function ngTurntable($interval) {

    return {
      restrict: 'EA',
      scope: {
        spinningField : '@',
        rateField     : '@',
        revsField     : '@',
        angleField    : '@',
        directionField: '@'
      },
      template: '<div></div>',
      link: function (scope, element, attr) {

        var lastUpdated = 'unknown';
        scope.data = { angle: 0, revCount: 0, direction: 1, interval : undefined };
        var updateSpinner = function(){

          if (scope.directionField != undefined)
            scope.data.direction = (scope.directionField != '2') ? 1 : -1;
          
          if (scope.data.interval === undefined) {
            scope.data.interval = $interval(function () {
              var data = scope.data;
              if (data && scope.revsField != undefined && scope.revsField != '' && data.revCount >= scope.revsField) {
                // stop spinning - we've topped out on revs
                $interval.cancel(scope.data.interval);
                scope.data.interval = undefined; // allow restart

                // fire 'stopped' event at this point
                scope.$parent.fireEvent('stopped');
              } 
              else if (data && scope.rateField && scope.spinningField) {
                if (scope.spinningField != undefined && scope.spinningField === 'true') {
                  data.angle += data.direction * parseFloat(scope.rateField)/10;

                  // handle cycling
                  if (data.angle > 360.0) {
                    data.angle    -= 360.0;
                    data.revCount += 1;
                  }
                  if (data.angle < 0) {
                    data.angle    += 360.0;
                    data.revCount += 1;
                  }

                  // output the output variables
                  scope.$parent.view.wdg[scope.$parent.widgetId]['angle']    = data.angle;
                  scope.$parent.view.wdg[scope.$parent.widgetId]['revCount'] = data.revCount;
                }
              }
            }, 100);

            // we've started, so fire event
            scope.$parent.fireEvent('started');
          }

        };

        scope.$watch('spinningField', function () {
          updateSpinner();
        });

        scope.$watch('rateField', function () {
          updateSpinner();
        });

        scope.$watch('directionField', function () {
          updateSpinner();
        });
        
        scope.$watch('revsField', function () {
          updateSpinner();
        });
      }
    };
  }

}());
