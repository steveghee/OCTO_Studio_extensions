if (typeof module !== 'undefined' && typeof exports !== 'undefined' && module.exports === exports) {
  module.exports = 'idresolution-ng';
}

(function () {
  'use strict';

  var irsModule = angular.module('idresolution-ng', []);
  irsModule.directive('ngIdresolution', ['$timeout', '$http', ngIDResolution]);

  function ngIDResolution($timeout, $http) {

    return {
      restrict: 'EA',
      scope: {
        urnField : '@',
    includeField : '@',
     resultField : '='
      },
      template: '<div></div>',
      link: function (scope, element, attr) {
          
        scope.data = {
            urn : undefined
        };
        scope.$watch('urnField', function () {
          if (scope.urnField != undefined && scope.urnField.length > 0) {
            scope.data.urn = scope.urnField;
            var src = `/ExperienceService/id-resolution/resolutions?key=${scope.data.urn}`;
      
            $http.get(src)
                 .success(function(data, status, headers, config) {
                          
                   //should we format this to be usable as a data table?
                   var resolved = {};
                   
                   // build an array that is indexed by resourcetype
                   if (data != undefined && data.resolutions != undefined) data.resolutions.forEach(function(r) {
                     var t = r.resourcetype;
                     if (scope.includeField == undefined || (scope.includeField != undefined && scope.includeField.length > 0 && scope.includeField.includes(t))) {
                       if (resolved[t] == undefined) resolved[t] = [];
                       resolved[t].push(r);
                     }
                   });
                          
                   scope.resultField = resolved;
                   var keys = Object.keys(resolved);
                   if (keys.length > 0) scope.$parent.fireEvent('resolved');
                   else                 scope.$parent.fireEvent('unresolved');
             
                 })
                 .error(function(data, status, headers, config) {
                   if (data.resolutions!=undefined && data.resolutions.length  >0) { //preview can fail due to cross origin issues, but still return a value resolution)
                     var resolved = {};
                   
                     // build an array that is indexed by resourcetype
                     data.resolutions.forEach(function(r) {
                       var t = r.resourcetype;
                       if (scope.includeField == undefined || (scope.includeField != undefined &&  scope.includeField.length > 0 && scope.includeField.includes(t))) {
                         if (resolved[t] == undefined) resolved[t] = [];
                         resolved[t].push(r);
                       }
                     });
                          
                     scope.resultField = resolved;
                     var keys = Object.keys(resolved);
                     if (keys.length > 0) scope.$parent.fireEvent('resolved');
                     else                 scope.$parent.fireEvent('unresolved');
                   } else {
                     console.log(status);           
                     scope.resultField = [];     
                     scope.$parent.fireEvent('failed');
                   }
                 });
          } else {
            scope.resultField = [];
          }
                   
        });
            
      } 
    };
  }

}());
