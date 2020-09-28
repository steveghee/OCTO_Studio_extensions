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
                     interval: undefined 
                     };
                     
        var reset = function() {
          scope.data.value = setStart(scope.data.start);                         
        };
                               
        var setStart = function(v) {
            
          var M2PI = 2.0 * Math.PI;
          /* 
              
          // this oscillator is a cosine wave, so if we set the start value
          // we must work out what the root driving value is to get to this
          // output = min + delta (max-min)
          // delta  = (1 - cos(driver))/2
          //
          //if we invert this (we need to find 'driver' given 'output') we get
          //
          //driver=acos( ((2*min + (max-min))-2*output)/(max-min) )
          
          let max = scope.data.max;
          let min = scope.data.min;
          let output = scope.data.start;  // this is what we need to get to
          
          var driver = Math.acos( ((min + max) - 2*output)/(max-min) );
          return driver;
          
          */
          
          return scope.data.start * M2PI;
          
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
                  scope.$parent.view.wdg[scope.$parent.widgetId]['cycleCount'] = data.count;
                }
              }
            }, 10);
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
            
        scope.$watch('delegateField', function (delegate) {
          if (delegate) {
            delegate.reset   = function () { reset();   };
          }
        });

      }
    };
  }

}());
