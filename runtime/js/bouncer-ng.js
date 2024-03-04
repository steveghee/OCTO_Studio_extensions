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
        startField    : '@',
        waveField     : '@',
        valueField    : '=',
        cycleField    : '=',
        delegateField : '='
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
                        start: 0,
                         wave:'sine',
                     interval: undefined 
                     };
                     
        var reset = function() {
          scope.data.value = setStart(scope.data.start);  
          scope.data.count = 0;
        };
                               
        var M2PI = 2.0 * Math.PI;
        
        var setStart = function(v) {
          return scope.data.start * M2PI;
        }
        
        var genWave = function(value) {
          var result = undefined;
          switch (scope.data.wave) {
            case 'saw':  
              result = value / M2PI;
              break;
            case 'triangle':  
              let A = 1;
              let P = Math.PI;
              result = (A/P) * (P - Math.abs( (value % 2*P) - P));
              break;
            case 'square':  
              result = (Math.sin(value)) >= 0.0 ? 1.0 : 0.0;
              break;
            case 'sine' : 
            default:  
              result = (1.0 - Math.cos(value)) / 2.0; // normalised
              break;
          }
          return result;
        }
                     
        var updateBouncer = function(){
          
          var rate = parseFloat(scope.rateField);
          var M2PI = 2.0 * Math.PI;
          
          if (rate != 0.0)
            scope.data.step = M2PI * rate / 100 ;

          if (rate > 0 && scope.data.interval === undefined) {
              
            // start at defined value    
            scope.data.value = setStart(scope.data.start);
            
            // and off we go...
            scope.data.interval = $interval(function () {
              var data = scope.data;
              
              if (data && scope.limitField != undefined && 
                          scope.limitField != '' && 
                          data.count > scope.limitField) {
                
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

                  data.bounce = genWave(data.value); //(1.0 - Math.cos(data.value)) / 2.0; // normalised
                  var output = data.min + data.bounce * (data.max - data.min); 

                  // output the output variables
                  scope.valueField = output;
                  scope.cycleField = data.count;
                  
                  data.value += data.step;
                  if (data.value > M2PI) {
                    data.value -= M2PI;
                    data.count += 1;

                    // we've complete 1 cycle
                    scope.$parent.fireEvent('bounce');
                  }
                
                }
              }
            }, 10); // this runs at 100Hz.  too fast?
          }

        };

        scope.$watch('bouncingField', function () {
          reset();
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

        scope.$watch('startField', function () {
          scope.data.start = parseFloat(scope.startField); // it changed
          reset();
          updateBouncer();
        });

        scope.$watch('limitField', function () {
          updateBouncer();
        });
            
        scope.$watch('waveField', function () {
          scope.data.wave = scope.waveField != undefined ? scope.waveField : 'sine';
          updateBouncer();
        });
            
        scope.$watch('delegateField', function (delegate) {
          if (delegate) {
              delegate.reset   = function () { 
                reset(); 
                updateBouncer();
              };
          }
        });

      }
    };
  }

}());
