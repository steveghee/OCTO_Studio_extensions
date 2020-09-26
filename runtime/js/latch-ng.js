if (typeof module !== 'undefined' && typeof exports !== 'undefined' && module.exports === exports) {
  module.exports = 'latch-ng';
}

(function () {
  'use strict';

  var latchModule = angular.module('latch-ng', []);
  latchModule.directive('ngLatch', ['$timeout', ngLatch]);

  function ngLatch($timeout) {

    return {
      restrict: 'EA',
      scope: {
          autoField  : '@',
         inputField  : '@',
        delegateField: '='
      },
      template: '<div></div>',
      link: function (scope, element, attr) {

        var lastUpdated = 'unknown';
        scope.data = {    q: true, 
                       auto: true,
                     };
        
        var _setq = function() {
          scope.$parent.view.wdg[scope.$parent.widgetId]['q']    =  scope.data.q;
          scope.$parent.view.wdg[scope.$parent.widgetId]['qbar'] = !scope.data.q;
          scope.$parent.fireEvent('qclocked');
        }

        var clkq = function(){
          // propogate value & clock
          $timeout(function () {
            _setq();
          }, 1);

        };
          
        var setq = function(v) {
          scope.data.q = v;

          // set and then propogate clock  
          if (scope.data.auto === true) $timeout(function () {
            _setq(); 
          }, 1);
              
        }


        scope.$watch('inputField', function () {
          setq(scope.inputField);
        });

        scope.$watch('autoField', function () {
          scope.data.auto = (scope.autoField != undefined && scope.autoField === 'true') ? true :false ;
        });
            
        scope.$watch('delegateField', function (delegate) {
          if (delegate) {
            delegate.clkq   = function () { clkq();   };
          }
        });

      }
    };
  }

}());
