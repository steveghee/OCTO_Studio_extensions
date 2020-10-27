if (typeof module !== 'undefined' && typeof exports !== 'undefined' && module.exports === exports) {
  module.exports = 'mapper-ng';
}

(function () {
  'use strict';

  var mapperModule = angular.module('mapper-ng', []);
  mapperModule.directive('ngMapper', ['$timeout', '$http', '$window', '$injector', ngMapper]);

  function ngMapper($timeout, $http, $window, $injector) {

    return {
      restrict: 'EA',
      scope: {
        polarityField : '@',
        shaderField   : '@',
        defaultField  : '@',
        modelField    : '@',
        infoField     : '='
      },
      template: '<div></div>',
      link: function (scope, element, attr) {

        var lastUpdated = 'unknown';
        scope.data = { shader: undefined, 
                         data: undefined, 
                     polarity: undefined, 
                        model: undefined,
                      default: undefined,
                         prev: [],
                      results: []
                     };
        scope.renderer = $window.cordova ? vuforia : $injector.get('threeJsTmlRenderer');

        var hilite = function(id,rd) {
          var nodeId = scope.data.model + '-' + id;
          rd.setProperties(nodeId,
            {
              shader:scope.data.shader,
              hidden:false,
             opacity:0.9
            });      
        };
        var unlite = function(id,rd) {
          var nodeId = scope.data.model + '-' + id;
          rd.setProperties(nodeId,
            {
              shader:scope.data.default,
              hidden:true,
             opacity:1.0
            });      
        };
        var dotlite = function(id,rd) {
          var nodeId = scope.data.model + '-' + id;
          rd.setProperties(nodeId,
            {
              shader:scope.data.default,
              hidden:false,
             opacity:1.0
            });      
        };
        var tolist = function(ids,cb,rd) {
          if (ids != undefined && ids.length > 0) ids.forEach(function(id) {
            cb(id.path,rd);
          });
        };

        var apply = function(re) {
          scope.data.prev = scope.data.results;
          scope.data.results = (Array.isArray(scope.infoField)) ? scope.infoField : [];

          // work out how many unique NEW items exist
          var left = (scope.data.results != undefined && scope.data.results.length > 0 &&
                      scope.data.prev    != undefined && scope.data.prev.length >0) 
                   ? Enumerable.from(scope.data.results)
                               .except(scope.data.prev,"$.path")
                               .toArray() 
                   : scope.data.results;

          // and work out how many unique OLD items need to be cleared out
          if (re === undefined && scope.data.prev != undefined && scope.data.prev.length > 0) {
            var diff = (scope.data.results != undefined && scope.data.results.length > 0) 
                     ? Enumerable.from(scope.data.prev)
                                 .except(scope.data.results,"$.path")
                                 .toArray() 
                     : scope.data.prev;
            tolist(diff,(scope.data.polarity === 'true') ? unlite : dotlite, scope.renderer);
          }
          
          tolist(left, hilite, scope.renderer);

          // signal we are done
          scope.$parent.fireEvent('complete');
        };

        var reapply = function() {
          apply(true);
        };

        var updateMapper = function(){
          scope.data.model    = scope.modelField;
          scope.data.polarity = scope.polarityField;
          $timeout(function () {

            // what has changed?
            var changed = false;       
            if (scope.shaderField != scope.data.shader) {  
              scope.data.shader = scope.shaderField;
              changed = true;  
            }           
            if (scope.defaultField != scope.data.default) {  
              scope.data.default = scope.defaultField;
              changed = true;
            }           
            // if yes, re-apply the shaders. if not, run the query again
            if (changed === true)
              reapply();
            else
              apply();
          }, 1);

        };

        scope.$watch('polarityField', function () {
          updateMapper();
        });

        scope.$watch('shaderField', function () {
          updateMapper();
        });

        scope.$watch('defaultField', function () {
          updateMapper();
        });

        scope.$watch('modelField', function () {
          updateMapper();
        });

        scope.$watch('infoField', function () {
          updateMapper();
        });
      }
    };
  }

}());
