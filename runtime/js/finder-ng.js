if (typeof module !== 'undefined' && typeof exports !== 'undefined' && module.exports === exports) {
  module.exports = 'finder-ng';
}

var findcmds = {
    "starts": function (a, b) { return a.startsWith(b); },
    "not"   : function (a, b) { return a.not     (b); },
    "same"  : function (a, b) { return a.sameAs  (b); },
    "like"  : function (a, b) { return a.like    (b); },
    "unlike": function (a, b) { return a.unlike  (b)  },
    "eq"    : function (a, b) { return a.equal   (b); },
    "ne"    : function (a, b) { return a.notEqual(b); },
    "lt"    : function (a, b) { return a.lessThan     (parseFloat(b)); },
    "gt"    : function (a, b) { return a.greaterThan  (parseFloat(b)); },
    "le"    : function (a, b) { return a.lessThanEq   (parseFloat(b)); },
    "ge"    : function (a, b) { return a.greaterThanEq(parseFloat(b)); },
    "in"    : function (a,b,c){ return a.in (parseFloat(b), parseFloat(c)); },
    "out"   : function (a,b,c){ return a.out(parseFloat(b), parseFloat(c)); },
    "before": function (a,b)  { return a.before(Date.parse(b)); },
    "after" : function (a,b)  { return a.after (Date.parse(b)); },
};

(function () {
  'use strict';

  var finderModule = angular.module('finder-ng', []);
  finderModule.directive('ngFinder', ['$timeout', '$http', ngFinder]);

  function ngFinder($timeout, $http) {

    return {
      restrict: 'EA',
      scope: {
        nameField    : '@',
        valueField   : '@',
        opField      : '@',
        categoryField: '@',
        autoField    : '@',
        modelidField : '@',
        includeField : '@',
        resultsField : '=',
        selectedField: '=',
        countField   : '=',
        delegateField: '='
      },
      template: '<div></div>',
      link: function (scope, element, attr) {

        var lastUpdated = 'unknown';
        scope.data = { name: undefined, 
                      value: undefined, 
                         op: undefined, 
                        src: undefined, 
                         id: undefined, 
                       prev: undefined,
                    include: undefined,
                    promise: undefined,
                    results: [], 
                       auto: true
                     };

        var executeFinder = function() {
            
          
          scope.data.prev = scope.data.results;
          PTC.Metadata.fromId(scope.data.id)
                      .then( (meta) => {
                                                 
            try {
                
              var selectFunc = function(idpath) {
                    
                var retobj = { model: scope.data.id, 
                                path: idpath 
                             };
                                
                if (scope.includeField != undefined && scope.includeField != '') {
                                   
                  //now lets see if we can get the other properies that user is asking for 
                  var ask = scope.includeField.split(',');
                  var res = this.get(idpath, ask.trim());
                  if (res != undefined && res.length === ask.length) for (var p=0;p<ask.length;p++) {
                      
                    // add each result as a new property in the return body  
                    retobj[ask[p]] = res[p];
                  }
                }
              
                return retobj;
              }
  
              let cmd               = findcmds[scope.opField];
              let combined_results  = [];
              if (scope.valueField != undefined && scope.valueField.length > 0) {
                  
                  // scope.data.results = cmd(meta.find(scope.nameField.trim()),scope.valueField.trim()).getSelected(selectFunc);

                  // if the list is 
                  // space separated, this is an AND operation (e.g. we need a AND b to be true - not implemented yet)
                  // comma separated, this is an OR operation (a OR b is allowed - implemented below)                  
                  //
                  var reqs = scope.valueField.split(',');

                  for(var r=0;r<reqs.length;r++) {
                      
                      // process each request
                      var tres = cmd(meta.find(scope.nameField.trim()),reqs[r].trim()).getSelected(selectFunc);
                      
                      //and merge the values into the result
                      if (tres != undefined)
                        combined_results = [ ...combined_results, ...tres];
                  }
                  
                  // compile the final results
                  scope.data.results = [...new Set(combined_results)];
                  
              }
              else 
                scope.data.results = [];
            } catch(err) {
              scope.data.results = []; // results invalid
            }
        
          })
          .finally( () => {
            // and output results to other listeners
            scope.resultsField = scope.data.results != undefined ? scope.data.results : [];
            scope.selectedField= [];       
            scope.countField   = scope.data.results != undefined ?scope.data.results.length : 0;
            
            // fire event to say we're done
            scope.$parent.fireEvent('complete');
            scope.$parent.$applyAsync();
          });
        };

        var find = function(){
          if (scope.data.id != undefined) {
            executeFinder();
          }
        };

        var updateFinder = function(){
          find();
        };
        
        // watch for changes in the definition of what we need to find   
        //
        scope.$watchGroup(['nameField','valueField','categoryField','includeField'], function () {
          updateFinder();
        });
            
        // watch for changes in the definition of what we need to find    
        //
        scope.$watchGroup(['autoField','opField','modelidField'], function () {
          scope.data.auto = (scope.autoField    != undefined && scope.autoField === 'true') ? true :false ;
          scope.data.op   = (scope.opField      != undefined && scope.opField      != '') ? scope.opField : undefined;
          scope.data.id   = (scope.modelidField != undefined && scope.modelidField != '') ? scope.modelidField : undefined;
          updateFinder();
        });
            
        // if there is a SUBSET of data defined, lets watch to see if that list changes    
        //
        scope.$watch(
          function() { return scope.resultsField != undefined ? JSON.stringify(scope.resultsField.selectedRows) : ''},
          function(value) {
            if (value != undefined && scope.resultsField != undefined) 
              scope.selectedField = scope.resultsField.selectedRows;                 
        });

        // handle service (function) calls - find() will trigger a find operation
        // note that if 'auto' is turned on, you don't need to call this
        //
        scope.$watch('delegateField', function (delegate) {
          if (delegate) {
            delegate.find = function () {
              find();
            };
          }
        });

      }
    };
  }

}());
