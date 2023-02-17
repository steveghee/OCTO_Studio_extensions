if (typeof module !== 'undefined' && typeof exports !== 'undefined' && module.exports === exports) {
  module.exports = 'abswitch-ng';
}

function isbool(v) {
  return (v==='true')||v===true;
}

(function () {
  'use strict';

  var abswitchModule = angular.module('abswitch-ng', []);
  abswitchModule.directive('ngAbswitch', [ngAbswitch]);

  function ngAbswitch($timeout) {

    return {
      restrict: 'EA',
      scope: {
            inaField : '@',
            inbField : '@',
       polarityField : '@',
         resultField : '='
      },
      template: '<div></div>',
      link: function (scope, element, attr) {

        scope.data = { polarity: false };

        var executeAbswitch = function() {
          scope.resultField = scope.data.polarity ? scope.inaField : scope.inbField;
        };

        scope.$watchGroup(['inaField', 'inbField'], function () {
          executeAbswitch(scope.data.polarity);
        });
            
        scope.$watch('polarityField', function () {
          scope.data.polarity = (scope.polarityField != undefined)? isbool(scope.polarityField) : false ;
          executeAbswitch(scope.data.polarity);
        });

      }
    };
  }

}());
