if (typeof module !== 'undefined' && typeof exports !== 'undefined' && module.exports === exports) {
  module.exports = 'amp-ng';
}

function isbool(v) {
  return (v==='true')||v===true;
}

(function () {
  'use strict';

  var ampModule = angular.module('amp-ng', []);
  ampModule.directive('ngAmp', [ngAmp]);

  function ngAmp($timeout) {

    return {
      restrict: 'EA',
      scope: {
          inputField : '@',
           gainField : '@',
         resultField : '='
      },
      template: '<div></div>',
      link: function (scope, element, attr) {

        scope.$watchGroup(['inputField', 'gainField'], function () {
          var inp  = parseFloat(scope.inputField);                    
          var gain = parseFloat(scope.gainField);                    
          scope.resultField = inp * gain;
        });
            
      }
    };
  }

}());
