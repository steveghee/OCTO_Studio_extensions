if (typeof module !== 'undefined' && typeof exports !== 'undefined' && module.exports === exports) {
  module.exports = 'incrementer-ng';
}

(function () {
  'use strict';

  var incrementerModule = angular.module('incrementer-ng', []);
  incrementerModule.directive('ngIncrementer', ['$timeout', ngIncrementer]);

  function ngIncrementer($timeout) {

    return {
      restrict: 'EA',
      scope: {
        baseField    : '@',
        quotientField: '@',
        delegateField: '='
      },
      template: '<div></div>',
      link: function (scope, element, attr) {

        var lastUpdated = 'unknown';
        scope.data = {    
                       value: 0, 
                       base : 0,
                       inc  : 0
                     };
        
        // set the value and make sure the widget is updated 
        // too (this triggers anyone watching this value)
        var _seti = function(v) {
          scope.data.value = v;
          scope.$parent.view.wdg[scope.$parent.widgetId]['sum']    = scope.data.value;
        }

        // iterate/increment the current value by the current step
        // and then fire the 'clocked' event to let anyone downstream
        // take action based on the new value
        var clki = function(){
          
          $timeout(function () {
            _seti(scope.data.value + scope.data.inc);
            scope.$parent.fireEvent('iclocked');
          }, 1);

        };

        // reset the value to the defined base/initial value.
        // this in turn will trigger anyone watching the value.
        var reseti = function() {
          _seti(scope.data.base);
        }

        // watch input parameters for any changes
        scope.$watch('quotientField', function () {
          scope.data.inc = (scope.quotientField != undefined) ? parseFloat(scope.quotientField) : 1 ;
        });
        scope.$watch('baseField', function () {
          scope.data.base = (scope.baseField != undefined) ? parseFloat(scope.baseField) : 0 ;
          reseti();
        });

        // if a delegate is assigned, add the widget services
        scope.$watch('delegateField', function (delegate) {
          if (delegate) {
            delegate.clki   = function () { clki();   };
            delegate.reseti = function () { reseti(); };
          }
        });

      }
    };
  }

}());
