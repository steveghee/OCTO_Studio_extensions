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
        colorField    : '@',
        infoField     : '='
      },
      template: '<div></div>',
      link: function (scope, element, attr) {

          var lastUpdated = 'unknown';
          
        let defaultHiliteShader='mapper_coloredHilitegl;r f 1;g f 0.5;b f 0.25';
        let defaultUnliteShader='mapper_desaturatedgl';
        let defaultDotlitShader='mapper_screendoor';
  
        scope.data = { shader: undefined, 
                         data: undefined, 
                     polarity: undefined, 
                        model: undefined,
                      default: undefined,
                         undo: undefined,
                 hiliteShader: defaultHiliteShader,
                 unliteShader: defaultUnliteShader,
                 dotlitShader: defaultDotlitShader,
                         prev: [],
                      results: []
                     };
        scope.renderer = $window.cordova ? vuforia : $injector.get('threeJsTmlRenderer');
        
        var hilite = function(nodeId,rd) {
          rd.setProperties(nodeId,
            {
              shader:scope.data.hiliteShader, 
              hidden:false,
             opacity:1.0,
             phantom:false,
               decal:false
            });      
        };
        var unlite = function(nodeId,rd) {
          rd.setProperties(nodeId,
            {
              shader:scope.data.unliteShader,
              hidden:false,
             opacity:0.5,phantom:false,
               decal:false
            });      
        };
        var dotlite = function(nodeId,rd) {
          rd.setProperties(nodeId,
            {
              shader:scope.data.dotlitShader,
              hidden:false,
             opacity:0.8,phantom:true,
               decal:true
            });      
        };
        var tolist = function(ids,cb,rd) {
          if (ids != undefined && ids.length > 0) ids.forEach(function(id) {
            var nodeId = id.model+'-'+id.path;                                                    
            cb(nodeId,rd);
          });
        };

        var apply = function(re) {
          scope.data.prev = scope.data.results;
          scope.data.results = (Array.isArray(scope.infoField)) ? scope.infoField : [];
          
          if (scope.data.results === undefined || scope.data.results.length === 0) {
            scope.data.undo = (scope.data.undo != undefined) 
                            ? Enumerable.from(scope.data.undo).union([{model:scope.data.model, path:'/'}]).toArray()
                            : [];
          }
          
          // work out how many unique NEW items exist
          var left = (scope.data.results != undefined && scope.data.results.length > 0 &&
                      scope.data.prev    != undefined && scope.data.prev.length >0) 
                   ? Enumerable.from(scope.data.results)
                               .except(scope.data.prev,"$.path")
                               .toArray() 
                   : scope.data.results;
                   
          var mixin = (scope.data.undo != undefined) 
                    ? Enumerable.from(scope.data.undo)
                                .where(a=>Enumerable.from(scope.data.results)
                                                    .where(b=>a.path.startsWith(b.path))
                                                    .toArray()
                                                    .length > 0)
                                .toArray()
                   : []; // empty
          left = Enumerable.from(left)                
                           .union(mixin)
                           .toArray();
      

          // and work out how many unique OLD items need to be cleared out
          if (re === undefined && scope.data.undo != undefined && scope.data.undo.length > 0) {
            var diff = (left != undefined && left.length > 0) 
                     ? Enumerable.from(scope.data.undo)
                                 .except(left,"$.path")
                                 .toArray() 
                     : scope.data.undo;
                                 
            tolist(diff,(scope.data.polarity === 'true') ? dotlite : unlite, scope.renderer);
            
            //we need to keep a keep a running tally of ALL items we've undone
            scope.data.undo = (scope.data.undo != undefined && diff != undefined) 
                            ? Enumerable.from(scope.data.undo).union(diff).toArray()
                            : scope.data.undo != undefined ? scope.data.undo : diff;
          }
          
          tolist(left, hilite, scope.renderer);
          scope.data.undo = (scope.data.undo != undefined && left != undefined) 
                          ? Enumerable.from(scope.data.undo).union(left).toArray()
                          : scope.data.undo != undefined ? scope.data.undo : left;

          // signal we are done
          scope.$parent.fireEvent('complete');
        };

        var reapply = function() {
          apply(true);
        };

        var updateMapper = function(){
          scope.data.polarity = scope.polarityField;
          $timeout(function () {

            // what has changed?
            var changed = false;       
            
            if (scope.modelField != scope.data.model) {  
              if (scope.data.undo != undefined)
                tolist(scope.data.undo, (scope.data.polarity === 'true') ? dotlite : unlite, scope.renderer);
              scope.data.model    = scope.modelField;
              scope.data.undo = [];  
              changed = true;  
            }           
            
            if (scope.shaderField != scope.data.shader) {  
              scope.data.shader       = scope.shaderField;
              if (scope.data.shader != undefined && scope.data.shader != '') 
                scope.data.hiliteShader = scope.data.shader;  
              changed = true;  
            }           
            if (scope.defaultField != scope.data.default) {  
              scope.data.default = scope.defaultField;
              scope.data.unliteShader = (scope.data.default != undefined && scope.data.default != '') ? scope.data.default : defaultUnliteShader;  
              scope.data.dotlitShader = (scope.data.default != undefined && scope.data.default != '') ? scope.data.default : defaultDotlitShader;  
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

        scope.$watch('colorField', function () {
          //
          // do we support colored highlighting, or stick with orange only?
          var rgb = scope.colorField.split(',');
          scope.data.hiliteShader = `mapper_coloredHilitegl;r f ${rgb[0]};g f ${rgb[1]};b f ${rgb[2]}`;

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
