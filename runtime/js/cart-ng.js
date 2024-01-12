if (typeof module !== 'undefined' && typeof exports !== 'undefined' && module.exports === exports) {
  module.exports = 'cart-ng';
}

(function () {
  'use strict';

  var cartModule = angular.module('cart-ng', []);
  cartModule.directive('ngCart', ['$timeout', '$http', '$window', '$injector', ngCart]);

  function ngCart($timeout, $http, $window, $injector) {

    return {
      restrict: 'EA',
      scope: {
        includeField      : '@',
        infoField         : '=',
        countField        : '=',
        contentField      : '=',
        delegateField     : '='
      },
      template: '<div></div>',
      link: function (scope, element, attr) {

        var lastUpdated = 'unknown';
          
        scope.data = { include: [],
                          data: undefined, 
                         items: {},
                       results: []
                     };
                  
        function toBool(v) {
          return v === 'true' || v === true;
        }
        
        var add = function() {
            
          if (scope.data.results == undefined || scope.data.results.length == 0)
            return; //we have nothing to do
            
          var mid = scope.data.results[0].model; // assumption = all the same model
          PTC.Metadata.fromId(mid)
                      .then( (meta) => {
                
            // add the results to the item list
            scope.data.results.forEach(function(inc) {
              var id = inc.model+'-'+inc.path;                         
              if (scope.data.items[id] === undefined) {
                  scope.data.items[id] = inc;
                  
                  // and if we are being asked to ADD any metadata, do it here
                  if (scope.data.include.length > 0) {
                    var ask  =scope.data.include;  
                    var res = meta.get(inc.path, ask);
                    if (ask.length == res.length) for (var p=0;p<ask.length;p++) {
                      // add each result as a new property in the return body  
                      scope.data.items[id][ask[p]] = res[p];
                    }
                  }
              }
              else {
                var count = scope.data.items[id].count;
                scope.data.items[id].count = count === undefined ? 2 : count + 1;
              }
            });
          })
          .finally( () => {
            var final=[];
            for(const key in scope.data.items) {
              var item = scope.data.items[key];  
              if (item.count === undefined || item.count > 0) final.push(item);
            }
            scope.contentField = final;
            scope.countField = scope.contentField.length; 
          
            // signal we are done
            scope.$parent.$applyAsync();
            $timeout(function() { 
              scope.$parent.fireEvent('changed'); 
            } , 10);
          });
              
        };

        var remove = function() {
            
          if (scope.data.results == undefined || scope.data.results.length == 0)
            return; //we have nothing to do
            
          // remove the result from the item list
          scope.data.results.forEach(function(inc) {
            var id = inc.model+'-'+inc.path;                         
            if (scope.data.items[id] != undefined) {
              var count = scope.data.items[id].count;
              scope.data.items[id].count = count === undefined ? 0 : count - 1;
            }
          });
          
          var final=[];
          for(const key in scope.data.items) {
            var item = scope.data.items[key];  
            if (item.count === undefined || item.count > 0) final.push(item);
          }
          scope.contentField = final;
          scope.countField = scope.contentField.length; 
          
          // signal we are done
          scope.$parent.fireEvent('changed');
          scope.$parent.$applyAsync();
        };
      
        var reset = function() {
            
          // empty the cart  
          scope.data.items = [];
          scope.contentField = [];
          scope.countField = 0;
          
          scope.$parent.fireEvent('changed');
          scope.$parent.$applyAsync();
        }

        scope.$watchGroup(['includeField'], function () {
          scope.data.include = (scope.includeField != undefined && scope.includeField.length>0) ? scope.includeField.split(',') : undefined;
          // TODO : if this changed, we may need to re-run over the cart to get new fields
        });
            
        // if there is a SUBSET of data defined, lets watch to see if that list changes    
        scope.$watch(
          function() { 
              return scope.infoField != undefined && scope.infoField.selectedRows != undefined ? JSON.stringify(scope.infoField.selectedRows) 
                                                                                               : JSON.stringify(scope.infoField) 
          },
          function(value) {
            scope.data.results = (Array.isArray(scope.infoField)) ? scope.infoField 
                               : scope.infoField.path != undefined ? [{model:scope.infoField.model,path:scope.infoField.path}]
                                                                   : [];
          
            // if the data item has 'selectedRows' then lets use the SUBSET of data to control the list
            if (scope.data.results != undefined && scope.infoField.selectedRows != undefined && scope.infoField.selectedRows.length > 0)
              scope.data.results = scope.infoField.selectedRows;
          }
        );
        
        scope.$watch('delegateField', function (delegate) {
          if (delegate) {
            delegate.reset = function () {
              reset();  
            };
            delegate.add = function () {
              add();  
            };
            delegate.remove = function () {
             remove();  
            };
          }
        });

      }
    };
  }

}());
