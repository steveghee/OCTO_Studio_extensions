if (typeof module !== 'undefined' && typeof exports !== 'undefined' && module.exports === exports) {
  module.exports = 'compressor-ng';
}

function isbool(v) {
  return (v==='true')||v===true;
}

(function () {
  'use strict';

  var compressorModule = angular.module('compressor-ng', []);
  compressorModule.directive('ngCompressor', [ngCompressor]);

  function ngCompressor($timeout) {

    return {
      restrict: 'EA',
      scope: {
          inputField : '@',
          upperField : '@',
          lowerField : '@',
       propertyField : '@',
           infoField : '=',
          errorField : '=',
         resultField : '='
      },
      template: '<div></div>',
      link: function (scope, element, attr) {

        scope.$watchGroup(['inputField', 'upperField','lowerField'], function () {
          var inp   = parseFloat(scope.inputField);                    
          var upper = parseFloat(scope.upperField);                    
          var lower = parseFloat(scope.lowerField);                    
          //we assume upper  > lower
          let range = upper - lower;
          
          //calc normalised value
          if (inp > upper || inp < lower) {
            scope.errorField  = inp; //signal out of range
            scope.resultField = undefined;
          } else {
            scope.errorField  = undefined;
            scope.resultField = (inp - lower) / range;
          }
        });
            
        // if there is a SUBSET of data defined, lets watch to see if that list changes    
        scope.$watch(
          function() { 
              return scope.infoField != undefined && scope.infoField.selectedRows != undefined ? JSON.stringify(scope.infoField.selectedRows) 
                                                                                               : JSON.stringify(scope.infoField) 
          },
          function(value) {
            if (value != undefined) {
              var upper = parseFloat(scope.upperField);                    
              var lower = parseFloat(scope.lowerField);                    
              //we assume upper  > lower
              let range = upper - lower;
              var name  = scope.propertyField;                    
              //process the list
              var data = JSON.parse(value);
              var result = [];
              data.forEach(function(row) {
                if (row[name] != undefined) {
                  var inp = row[name];
                  
                  if (inp > upper || inp < lower) {
                    scope.errorField  = inp; //signal out of range
                    scope.resultField = undefined;
                  } else {
                    scope.errorField  = undefined;
                    let nd = { model: row.model, path:row.path };
                    nd[name] = row[name];
                    nd.normalised = (inp - lower) / range;
                    result.push(nd);
                  }
                }
              })
              scope.resultField = result;      
            }
          });

      }
    };
  }

}());
