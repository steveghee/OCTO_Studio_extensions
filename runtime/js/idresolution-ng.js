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
     resultField : '='
      },
      template: '<div></div>',
      link: function (scope, element, attr) {
          
        scope.data = {
            urn : undefined
        };
        
        scope.$watch('urnField', function () {
          if (scope.urnField != undefined) {
            scope.data.urn = scope.urnField;
            var src = `/ExperienceService/id-resolution/resolutions?key=${scope.data.urn}`;
      
            $http.get(src)
                 .success(function(data, status, headers, config) {
                          
                   //should we format this to be usable as a data table?
                   var resolved = {};
                   
                   // build an array that is indexed by resourcetype
                   if (data != undefined && data.resolutions != undefined) data.resolutions.forEach(function(r) {
                     var t = r.resourcetype;
                     if (resolved[t] == undefined) resolved[t] = [];
                     resolved[t].push(r);
                   });
                          
                   scope.resultField = resolved;
                   var keys = Object.keys(resolved);
                   if (keys.length > 0) scope.$parent.fireEvent('resolved');
                   else                     scope.$parent.fireEvent('unresolved');
             
                 })
                 .error(function(data, status, headers, config) {
                   console.log(status);           
                   scope.rsultField = [];     
                   scope.$parent.fireEvent('failed');
                 });
          } else {
            scope.resultField = [];
          }
                   
        });
            
      } 
    };
  }

}());
