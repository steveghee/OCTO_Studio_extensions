if (typeof module !== 'undefined' && typeof exports !== 'undefined' && module.exports === exports) {
  module.exports = 'fieldgetter-ng';
}

(function () {
  'use strict';

  var fieldGetterModule = angular.module('fieldgetter-ng', []);
  fieldGetterModule.directive('ngFieldgetter', ['$timeout', '$http', ngFieldGetter]);

  function ngFieldGetter($timeout, $http) {

    return {
      restrict: 'EA',
      scope: {
        srcField : '@',
      fieldField : '@',
     resultField : '='
      },
      template: '<div></div>',
      link: function (scope, element, attr) {
          
        scope.data = {
              src   : undefined,
              field : undefined
        };
        
        function getData() {
            
          if (scope.data.src != undefined) $http.get(scope.data.src)
               .success(function(data, status, headers, config) {
                       
                  scope.resultField = (scope.data.field != undefined && scope.data.field.length > 0) ? data[scope.data.field] : data;
              
               })
               .error(function(data, status, headers, config) {
                 console.log(status);           
               });
        }
        
        scope.$watch('srcField', function () {
          scope.data.src = (scope.srcField != undefined) ? scope.srcField : '';
          getData();
      
        });
            
        scope.$watch('fieldField', function () {
          scope.data.field = (scope.fieldField != undefined) ? scope.fieldField : {};
          getData();
        });
            
      } 
    };
  }

}());
