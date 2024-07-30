if (typeof module !== 'undefined' && typeof exports !== 'undefined' && module.exports === exports) {
  module.exports = 'quantizer-ng';
}

function isbool(v) {
  return (v==='true')||v===true;
}

(function () {
  'use strict';

  var quantizerModule = angular.module('quantizer-ng', []);
  quantizerModule.directive('ngQuantizer', [ngQuantizer]);

  function ngQuantizer($timeout) {

    return {
      restrict: 'EA',
      scope: {
        bucketsField : '@',
       propertyField : '@',
           infoField : '=',
         resultField : '='
      },
      template: '<div></div>',
      link: function (scope, element, attr) {

        // if there is a SUBSET of data defined, lets watch to see if that list changes    
        scope.$watch(
          function() { 
              return scope.infoField != undefined && scope.infoField.selectedRows != undefined ? JSON.stringify(scope.infoField.selectedRows) 
                                                                                               : JSON.stringify(scope.infoField) 
          },
          function(value) {
            if (value != undefined) {
              var buckets = parseFloat(scope.bucketsField);                    
              var name  = scope.propertyField;                    
              //process the list
              var data = JSON.parse(value);
              var result = [];
              
              //three passes required
              //1. find the range
              //2. divvy up into buckets and count
              //3. add bucket.count (quantized) property to each
              //note the final property is normalized
              
              //pass 1 - find the range
              var tc = 0;
              var lower = undefined, upper = undefined;
              data.forEach(function(row) {
                if (row[name] != undefined) {  // does the property exist
                  var inp = parseFloat(row[name]);
                  if (lower == undefined) lower = inp;
                  else if (inp < lower) lower = inp;
                  if (upper == undefined) upper = inp;
                  else if (inp > upper) upper = inp;
                  tc += 1;
                }
              })
              // we have range and count, build the buckets
              let range = upper - lower;
              let bdelta = range / buckets;    
              var quantities = Array(buckets).fill(0);
              var lgb = 0;
              data.forEach(function(row) {
                if (row[name] != undefined) {  // does the property exist
                  var inp = parseFloat(row[name]);
                  var bidx = Math.floor((inp - lower) / bdelta);
                  if (bidx >= buckets) bidx = buckets - 1;
                  quantities[bidx] += 1;
                  if (quantities[bidx] > lgb) 
                     lgb = quantities[bidx]; 
                }
              })
              // normalize the bucket counds based on the largest bucket
              data.forEach(function(row) {
                var nd = {};
                for(let key in row) {
                  nd[key] = row[key];
                }
                if (row[name] != undefined) {
                  var inp = row[name];
                  var bidx = Math.floor((inp - lower) / bdelta);
                  if (bidx >= buckets) bidx = buckets - 1;
                  nd.quantized = quantities[bidx] / lgb;
                }
                result.push(nd);
              })
              scope.resultField = result;      
            }
          });
      }
    };
  }

}());
