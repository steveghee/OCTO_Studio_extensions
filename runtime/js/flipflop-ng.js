if (typeof module !== 'undefined' && typeof exports !== 'undefined' && module.exports === exports) {
  module.exports = 'flipflop-ng';
}

(function () {
  'use strict';

  var flipflopModule = angular.module('flipflop-ng', []);
  flipflopModule.directive('ngFlipflop', ['$timeout', ngFlipflop]);

  function ngFlipflop($timeout) {

    return {
      restrict: 'EA',
      scope: {
          autoField  : '@',
        toggleField  : '@',
        delegateField: '='
      },
      template: '<div></div>',
      link: function (scope, element, attr) {

        var lastUpdated = 'unknown';
        scope.data = {    q: true, 
                       qbar: false, 
                       auto: true,
                     toggle: true
                     };
        
        var _setq = function() {
          scope.$parent.view.wdg[scope.$parent.widgetId]['q']    = scope.data.q;
          scope.$parent.view.wdg[scope.$parent.widgetId]['qbar'] = scope.data.qbar;
          scope.$parent.fireEvent('qclocked');
        }

        var clkq = function(){
          // toggle, and then propogate clock
          $timeout(function () {
            if (scope.data.toggle) 
            {
              scope.data.q    = !scope.data.q;
              scope.data.qbar = !scope.data.q;
            }
            _setq();
          }, 1);

        };

        var setq = function() {
          scope.data.q    = true;
          scope.data.qbar = !scope.data.q;

          // set and then propogate clock  
          if (scope.data.auto === true) $timeout(function () {
            _setq(); 
          }, 1);
              
        }

        var resetq = function() {
          scope.data.q    = false;
          scope.data.qbar = !scope.data.q;
          
          // reset, and then propogate clock  
          if (scope.data.auto === true) $timeout(function () {
            _setq();
          }, 1);
                
        }

        scope.$watch('toggleField', function () {
          scope.data.toggle = (scope.toggleField != undefined && scope.toggleField === 'true') ? true :false ;
        });

        scope.$watch('autoField', function () {
          scope.data.auto = (scope.autoField != undefined && scope.autoField === 'true') ? true :false ;
        });
            
        scope.$watch('delegateField', function (delegate) {
          if (delegate) {
            delegate.clkq   = function () { clkq();   };
            delegate.setq   = function () { setq();   };
            delegate.resetq = function () { resetq(); };
          }
        });

      }
    };
  }

}());
